import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  inquiries,
  inquiryItems,
  settings,
  calculators,
  bhkConfigurations,
  packages,
  services,
  serviceRates,
  units,
} from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { inquirySubmissionSchema } from "@/lib/validations";
import { calculateAuthoritativeQuotation, AuthoritativeLineItem } from "@/lib/quotation";
import { sendInquiryNotification } from "@/lib/email";
import { formatINR } from "@/lib/formatters";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Anti-spam honeypot defense: reject automated bots populating hidden trap fields
    if (body.website || body.honeypot) {
      return NextResponse.json(
        {
          success: false,
          error: "Spam submission rejected",
        },
        { status: 400 }
      );
    }

    const validation = inquirySubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      inquirySource,
      fullName,
      phone,
      email,
      interestedService,
      message,
      tentativeBudget: rawBudget,
      calculatorId,
      bhkId,
      builtUpArea: rawArea,
      subServiceIds,
      subServiceQuantities,
      subServices: rawSubServices,
      quotationItems: rawQuotationItems,
      packageId,
    } = validation.data;

    const numericArea = rawArea !== undefined && rawArea !== null
      ? (typeof rawArea === "string" ? parseFloat(rawArea) : rawArea)
      : null;

    let calculatedLineItems: AuthoritativeLineItem[] = [];
    let calculatedTotal: number | null = null;
    let formattedTotal: string | null = null;

    // Snapshot variables
    let calculatorTitleSnapshot: string | null = null;
    let bhkValueSnapshot: string | null = null;
    let packageNameSnapshot: string | null = null;
    let packageRateSnapshot: string | null = null;
    let finalizedInterestedService: string | null = interestedService?.trim() || null;

    // =========================================================================
    // FLOW A: PACKAGE ESTIMATE INQUIRY
    // =========================================================================
    if (inquirySource === "package" || (packageId && !calculatorId)) {
      if (!packageId) {
        return NextResponse.json(
          { success: false, error: "Package selection is required for Package Estimate inquiry" },
          { status: 400 }
        );
      }
      if (!numericArea || numericArea <= 0) {
        return NextResponse.json(
          { success: false, error: "Valid positive built-up area in sq.ft is required" },
          { status: 400 }
        );
      }

      // Authoritative database check for package
      const [pkg] = await db
        .select({
          id: packages.id,
          packageName: packages.packageName,
          mainServiceId: packages.mainServiceId,
          packageRatePerSqFt: packages.packageRatePerSqFt,
          isActive: packages.isActive,
          mainServiceTitle: services.title,
        })
        .from(packages)
        .leftJoin(services, eq(packages.mainServiceId, services.id))
        .where(and(eq(packages.id, packageId), eq(packages.isActive, true)))
        .limit(1);

      if (!pkg) {
        return NextResponse.json(
          { success: false, error: "The selected package is inactive or not found" },
          { status: 400 }
        );
      }

      const ratePerSqFt = parseFloat(pkg.packageRatePerSqFt);
      calculatedTotal = ratePerSqFt * numericArea;
      formattedTotal = formatINR(calculatedTotal);

      packageNameSnapshot = pkg.packageName;
      packageRateSnapshot = pkg.packageRatePerSqFt;
      finalizedInterestedService = pkg.mainServiceTitle || "Turnkey Construction";
    }

    // =========================================================================
    // FLOW B: CALCULATOR INQUIRY
    // =========================================================================
    else if (inquirySource === "calculator" || calculatorId) {
      if (!calculatorId) {
        return NextResponse.json(
          { success: false, error: "Valid calculator selection is required" },
          { status: 400 }
        );
      }
      if (!numericArea || numericArea <= 0) {
        return NextResponse.json(
          { success: false, error: "Valid positive built-up area in sq.ft is required" },
          { status: 400 }
        );
      }

      // Verify calculator
      const [calc] = await db
        .select()
        .from(calculators)
        .where(and(eq(calculators.id, calculatorId), eq(calculators.isActive, true)))
        .limit(1);

      if (!calc) {
        return NextResponse.json(
          { success: false, error: "Selected calculator is inactive or not found" },
          { status: 400 }
        );
      }
      calculatorTitleSnapshot = calc.title;
      finalizedInterestedService = calc.title;

      // Verify BHK if selected
      if (bhkId) {
        const [bhk] = await db
          .select()
          .from(bhkConfigurations)
          .where(eq(bhkConfigurations.id, bhkId))
          .limit(1);
        if (bhk) {
          bhkValueSnapshot = `${bhk.bhkNumber} BHK`;
        }
      }

      // Determine subservices to calculate
      let targetSubServiceIds: number[] = [];
      const userQtyMap: Record<number, number> = {};

      if (subServiceQuantities) {
        for (const [k, v] of Object.entries(subServiceQuantities)) {
          userQtyMap[Number(k)] = Number(v);
        }
      }

      if (rawSubServices && rawSubServices.length > 0) {
        for (const item of rawSubServices) {
          if (!targetSubServiceIds.includes(item.id)) {
            targetSubServiceIds.push(item.id);
          }
          if (item.quantity !== undefined && item.quantity !== null) {
            userQtyMap[item.id] = Number(item.quantity);
          }
        }
      }

      if (subServiceIds && subServiceIds.length > 0) {
        for (const id of subServiceIds) {
          if (!targetSubServiceIds.includes(id)) {
            targetSubServiceIds.push(id);
          }
        }
      } else if (rawQuotationItems && rawQuotationItems.length > 0) {
        for (const q of rawQuotationItems) {
          if (!targetSubServiceIds.includes(q.rateId)) {
            targetSubServiceIds.push(q.rateId);
          }
          userQtyMap[q.rateId] = q.quantity;
        }
      }

      if (targetSubServiceIds.length > 0) {
        // Query active subservices directly from MySQL
        const dbSubServices = await db
          .select({
            id: serviceRates.id,
            serviceName: serviceRates.serviceName,
            baseRate: serviceRates.baseRate,
            rateType: serviceRates.rateType,
            defaultQty: serviceRates.defaultQty,
            unitName: units.unitName,
            unitSymbol: units.unitSymbol,
          })
          .from(serviceRates)
          .leftJoin(units, eq(serviceRates.unitId, units.id))
          .where(and(inArray(serviceRates.id, targetSubServiceIds), eq(serviceRates.isActive, true)));

        let calcSum = 0;
        calculatedLineItems = [];

        for (const sub of dbSubServices) {
          const numericRate = parseFloat(sub.baseRate);
          let qty = 1;

          if (sub.rateType === "per_sqft") {
            qty = numericArea;
          } else if (sub.rateType === "fixed") {
            qty = 1;
          } else {
            // Variable rate types: per_view, per_visit, etc.
            const customQty = userQtyMap[sub.id];
            if (typeof customQty === "number" && !isNaN(customQty) && customQty >= 0) {
              qty = customQty;
            } else {
              qty = parseFloat(sub.defaultQty) || 1;
            }
          }

          const lineTotal = numericRate * qty;
          calcSum += lineTotal;

          calculatedLineItems.push({
            rateId: sub.id,
            serviceName: sub.serviceName,
            rateType: sub.rateType,
            unitName: sub.unitName || "unit",
            unitSymbol: sub.unitSymbol || "unit",
            baseRate: numericRate,
            quantity: qty,
            lineTotal,
            formattedLineTotal: formatINR(lineTotal),
          });
        }

        calculatedTotal = calcSum;
        formattedTotal = formatINR(calcSum);
      } else {
        // If calculator has zero subservices configured, estimate defaults to 0
        calculatedTotal = 0;
        formattedTotal = formatINR(0);
      }
    }

    // =========================================================================
    // FLOW C: LEGACY QUOTATION OR CONTACT INQUIRY
    // =========================================================================
    else {
      if (rawQuotationItems && rawQuotationItems.length > 0) {
        const calculation = await calculateAuthoritativeQuotation(rawQuotationItems);
        calculatedLineItems = calculation.lineItems;
        calculatedTotal = calculation.total;
        formattedTotal = calculation.formattedTotal;
      } else if (rawBudget !== undefined && rawBudget !== null) {
        const num = typeof rawBudget === "string" ? parseFloat(rawBudget) : rawBudget;
        if (!isNaN(num) && num >= 0) {
          calculatedTotal = num;
          formattedTotal = formatINR(num);
        }
      }
    }

    // Determine finalized tentative budget string for MySQL decimal(14,2)
    const finalizedBudget =
      calculatedTotal !== null ? calculatedTotal.toFixed(2) : null;

    // Database Persistence (Atomic Transaction)
    // CRITICAL: Inquiry and its line-items must save to MySQL BEFORE revealing the estimate
    const insertResult = await db.transaction(async (tx) => {
      const [newInquiry] = await tx.insert(inquiries).values({
        inquirySource: inquirySource || "contact",
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email && email.trim().length > 0 ? email.trim().toLowerCase() : null,
        interestedService: finalizedInterestedService,
        message: message?.trim() || null,
        tentativeBudget: finalizedBudget,
        status: "new",

        // Snapshots
        calculatorId: calculatorId || null,
        calculatorTitleSnapshot,
        bhkId: bhkId || null,
        bhkValueSnapshot,
        packageId: packageId || null,
        packageNameSnapshot,
        packageRateSnapshot,
        builtUpArea: numericArea ? numericArea.toFixed(2) : null,
      });

      const inquiryId = newInquiry.insertId;

      if (calculatedLineItems.length > 0) {
        await tx.insert(inquiryItems).values(
          calculatedLineItems.map((item) => ({
            inquiryId,
            serviceRateId: item.rateId,
            serviceNameSnapshot: item.serviceName,
            unitNameSnapshot: item.unitSymbol || item.unitName || "unit",
            unitRateSnapshot: item.baseRate.toFixed(2),
            userQuantity: item.quantity.toFixed(2),
            calculatedAmount: item.lineTotal.toFixed(2),
          }))
        );
      }

      return inquiryId;
    });

    const inquiryId = insertResult;
    const reference = `INQ-${inquiryId}`;

    // Query studio phone setting for WhatsApp continuation URL
    let studioPhone = "918980703374";
    try {
      const [phoneSetting] = await db
        .select({ valueContent: settings.valueContent })
        .from(settings)
        .where(eq(settings.keyName, "contact_phone"))
        .limit(1);

      if (phoneSetting?.valueContent) {
        const cleaned = phoneSetting.valueContent.replace(/\D/g, "");
        if (cleaned.length >= 10) {
          studioPhone = cleaned.startsWith("91") ? cleaned : `91${cleaned.slice(-10)}`;
        }
      }
    } catch (e) {
      // Fallback to default Maya phone
    }

    // Prepare manual Click-to-WhatsApp Continuation Link
    let waMessage = `Hello MAYA Design & Build,\n\nI have submitted an inquiry through your website.\n*Reference ID:* ${reference}\n*Name:* ${fullName.trim()}\n*Phone:* ${phone.trim()}`;
    if (finalizedInterestedService) {
      waMessage += `\n*Service / Scope:* ${finalizedInterestedService}`;
    }
    if (packageNameSnapshot) {
      waMessage += `\n*Package:* ${packageNameSnapshot}`;
    }
    if (bhkValueSnapshot) {
      waMessage += `\n*Configuration:* ${bhkValueSnapshot}`;
    }
    if (numericArea) {
      waMessage += `\n*Built-Up Area:* ${numericArea.toLocaleString("en-IN")} sq.ft`;
    }
    if (formattedTotal) {
      waMessage += `\n*Estimated Commercial Value:* ${formattedTotal}`;
    }
    waMessage += `\n\nPlease review my submission. Thank you!`;

    const whatsappUrl = `https://wa.me/${studioPhone}?text=${encodeURIComponent(waMessage)}`;

    // Attempt Email Notification asynchronously (does not block inquiry completion)
    try {
      await sendInquiryNotification({
        inquiryId,
        reference,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email || null,
        interestedService: finalizedInterestedService,
        message: message || null,
        tentativeBudget: finalizedBudget,
        formattedTotal,
        quotationItems: calculatedLineItems,
        createdAt: new Date(),
      });
    } catch (emailErr: any) {
      console.error("[Inquiry API] Notification caught error:", emailErr?.message || emailErr);
    }

    // STRICT RATE PRIVACY ENFORCEMENT:
    // User receives ONLY the authoritative final total estimate and reference.
    // Individual SubService unit rates and item line amounts are NEVER included in response payload.
    return NextResponse.json(
      {
        success: true,
        inquiryId,
        reference,
        totalEstimate: calculatedTotal,
        formattedTotal,
        whatsappUrl,
        message: "Your inquiry has been successfully recorded. Here is your authoritative project estimate.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Public inquiry submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to process inquiry. Please try again or reach out to our office directly.",
      },
      { status: 500 }
    );
  }
}
