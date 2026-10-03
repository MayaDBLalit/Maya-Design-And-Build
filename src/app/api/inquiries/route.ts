import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries, inquiryItems, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { inquirySubmissionSchema } from "@/lib/validations";
import { calculateAuthoritativeQuotation, AuthoritativeLineItem } from "@/lib/quotation";
import { sendInquiryNotification } from "@/lib/email";
import { formatINR } from "@/lib/formatters";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      fullName,
      phone,
      email,
      interestedService,
      message,
      tentativeBudget: rawBudget,
      quotationItems: rawQuotationItems,
    } = validation.data;

    // Authoritative Server-Side Recalculation for Quotations
    let calculatedLineItems: AuthoritativeLineItem[] = [];
    let calculatedTotal: number | null = null;
    let formattedTotal: string | null = null;

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

    // Determine finalized tentative budget string for MySQL decimal(14,2)
    const finalizedBudget =
      calculatedTotal !== null ? calculatedTotal.toFixed(2) : null;

    // Database Persistence (Atomic Transaction)
    // CRITICAL: Inquiry and its line-items must save to MySQL BEFORE attempting notifications
    const insertResult = await db.transaction(async (tx) => {
      const [newInquiry] = await tx.insert(inquiries).values({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email && email.trim().length > 0 ? email.trim().toLowerCase() : null,
        interestedService: interestedService?.trim() || null,
        message: message?.trim() || null,
        tentativeBudget: finalizedBudget,
        status: "new",
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

    // Query office WhatsApp / phone setting for accurate continuation URL
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
    // CRITICAL: WhatsApp is NEVER sent automatically. Customer manually clicks it.
    let waMessage = `Hello MAYA Design & Build,\n\nI have submitted an inquiry through your website.\n*Reference ID:* ${reference}\n*Name:* ${fullName.trim()}\n*Phone:* ${phone.trim()}`;
    if (interestedService) {
      waMessage += `\n*Service:* ${interestedService.trim()}`;
    }
    if (formattedTotal) {
      waMessage += `\n*Estimated Quotation:* ${formattedTotal}`;
    }
    waMessage += `\n\nPlease review my inquiry. Thank you!`;

    const whatsappUrl = `https://wa.me/${studioPhone}?text=${encodeURIComponent(waMessage)}`;

    // Attempt Email Notification
    // CRITICAL: Notification failure must NEVER delete/rollback the stored inquiry
    let emailStatus: { success: boolean; error?: string } = { success: false };
    try {
      const emailResult = await sendInquiryNotification({
        inquiryId,
        reference,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email || null,
        interestedService: interestedService || null,
        message: message || null,
        tentativeBudget: finalizedBudget,
        formattedTotal,
        quotationItems: calculatedLineItems,
        createdAt: new Date(),
      });
      emailStatus = { success: emailResult.success, error: emailResult.error };
    } catch (emailErr: any) {
      console.error("[Inquiry API] Email dispatch caught error:", emailErr?.message || emailErr);
      emailStatus = { success: false, error: emailErr?.message || "Email dispatch failed" };
    }

    return NextResponse.json(
      {
        success: true,
        inquiryId,
        reference,
        formattedTotal,
        whatsappUrl,
        emailNotified: emailStatus.success,
        message: "Your inquiry has been successfully recorded. Our team will contact you shortly.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Public inquiry submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to record inquiry. Please try again or reach out to our office directly.",
      },
      { status: 500 }
    );
  }
}
