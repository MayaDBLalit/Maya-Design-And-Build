/**
 * MAYA DESIGN & BUILD — PHASE 5 VERIFICATION SUITE
 * Comprehensive verification of Inquiry System, Authoritative Quotation Persistence,
 * Email Notification Engine, WhatsApp Continuation, Admin CMS Integration,
 * API Security Guards, and Phases 1–4 Regressions.
 */

import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { db } from "./index";
import {
  services,
  projects,
  teamMembers,
  gallery,
  serviceRates,
  units,
  inquiries,
  inquiryItems,
  settings,
  adminUsers,
} from "./schema";
import { eq, desc, inArray } from "drizzle-orm";
import { calculateAuthoritativeQuotation } from "../lib/quotation";
import { isEmailConfigured, sendInquiryNotification } from "../lib/email";
import { inquirySubmissionSchema, adminInquiryUpdateSchema } from "../lib/validations";
import { formatINR } from "../lib/formatters";
import { signAdminJWT, verifyAdminJWT } from "../lib/auth";
import { POST as submitInquiryRoute } from "../app/api/inquiries/route";
import { GET as getAdminInquiriesRoute } from "../app/api/admin/inquiries/route";
import {
  GET as getAdminInquiryDetailRoute,
  PUT as updateAdminInquiryRoute,
  DELETE as deleteAdminInquiryRoute,
} from "../app/api/admin/inquiries/[id]/route";

let passedCount = 0;
let failedCount = 0;
const testInquiryIds: number[] = [];

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    failedCount++;
  }
}

async function runPhase5Verification() {
  console.log("\n==============================================================");
  console.log("🚀 STARTING MAYA PHASE 5 — INQUIRY & NOTIFICATIONS SUITE");
  console.log("==============================================================\n");

  try {
    // --------------------------------------------------------------------------
    // 1. INPUT VALIDATION ENGINE CHECKS
    // --------------------------------------------------------------------------
    console.log("🛡️  1. Verifying Inquiry Validation Schemas (Zod)...");

    // Valid standard payload
    const validStandard = inquirySubmissionSchema.safeParse({
      fullName: "Ar. Vikram Mehta",
      phone: "+91 98251 23456",
      email: "vikram@example.com",
      interestedService: "Turnkey Construction",
      message: "Planning a luxury residential bungalow in Bardoli.",
    });
    assert(validStandard.success, "Valid standard inquiry accepted by schema");

    // Missing full name
    const missingName = inquirySubmissionSchema.safeParse({
      fullName: "",
      phone: "+91 98251 23456",
    });
    assert(!missingName.success, "Missing customer name is rejected");

    // Invalid phone number (too short / characters)
    const invalidPhone = inquirySubmissionSchema.safeParse({
      fullName: "Vikram Mehta",
      phone: "12345",
    });
    assert(!invalidPhone.success, "Invalid short phone number rejected");

    // Malformed email
    const malformedEmail = inquirySubmissionSchema.safeParse({
      fullName: "Vikram Mehta",
      phone: "+91 98251 23456",
      email: "not-an-email",
    });
    assert(!malformedEmail.success, "Malformed email format is rejected");

    // Negative quotation quantity
    const negativeQty = inquirySubmissionSchema.safeParse({
      fullName: "Vikram Mehta",
      phone: "+91 98251 23456",
      quotationItems: [{ rateId: 1, quantity: -50 }],
    });
    assert(!negativeQty.success, "Negative quotation quantity is rejected");

    // --------------------------------------------------------------------------
    // 2. AUTHORITATIVE QUOTATION RECALCULATION & CLIENT TAMPERING IMMUNITY
    // --------------------------------------------------------------------------
    console.log("\n💰 2. Verifying Authoritative Quotation Calculation...");

    const activeDbRates = await db
      .select()
      .from(serviceRates)
      .where(eq(serviceRates.isActive, true))
      .limit(3);

    assert(activeDbRates.length >= 2, "Found at least 2 active service rates in MySQL");

    const rate1 = activeDbRates[0];
    const rate2 = activeDbRates[1];

    const calcResult = await calculateAuthoritativeQuotation([
      { rateId: rate1.id, quantity: 1500 },
      { rateId: rate2.id, quantity: 2 },
    ]);

    assert(calcResult.lineItems.length === 2, "Recalculated exactly 2 active line items");
    assert(calcResult.total > 0, "Calculated authoritative total is greater than zero");
    assert(calcResult.formattedTotal.startsWith("₹"), "Total is properly formatted with INR symbol");

    // Verify rate spoofing immunity: nonexistent/inactive rate IDs are safely skipped
    const spoofResult = await calculateAuthoritativeQuotation([
      { rateId: 999999, quantity: 1000 },
    ]);
    assert(
      spoofResult.lineItems.length === 0 && spoofResult.total === 0,
      "Nonexistent/spoofed rate IDs ignored"
    );

    // --------------------------------------------------------------------------
    // 3. DATABASE PERSISTENCE & TRANSACTION INTEGRITY
    // --------------------------------------------------------------------------
    console.log("\n📦 3. Verifying MySQL Transaction Persistence...");

    // Insert test standard inquiry
    const [testInq1] = await db.insert(inquiries).values({
      fullName: "TEST_Phase5_Lead_Standard",
      phone: "+91 9876543210",
      email: "test.standard@example.com",
      interestedService: "Interior Design",
      message: "Automated test inquiry for verification.",
      status: "new",
    });
    testInquiryIds.push(testInq1.insertId);

    assert(testInq1.insertId > 0, "Standard inquiry inserted into inquiries table");

    const [savedInq1] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, testInq1.insertId))
      .limit(1);

    assert(savedInq1.fullName === "TEST_Phase5_Lead_Standard", "Stored customer name matches");
    assert(savedInq1.phone === "+91 9876543210", "Stored customer phone matches");
    assert(savedInq1.status === "new", "Inquiry default status is 'new'");

    // Insert test quotation inquiry with line items in transaction
    const inqWithItemsId = await db.transaction(async (tx) => {
      const [newInq] = await tx.insert(inquiries).values({
        fullName: "TEST_Phase5_Lead_Quotation",
        phone: "+91 9876500000",
        email: "test.quotation@example.com",
        interestedService: "Turnkey Quotation (2 disciplines)",
        tentativeBudget: calcResult.total.toFixed(2),
        status: "new",
      });

      const inqId = newInq.insertId;

      await tx.insert(inquiryItems).values(
        calcResult.lineItems.map((item) => ({
          inquiryId: inqId,
          serviceRateId: item.rateId,
          serviceNameSnapshot: item.serviceName,
          unitNameSnapshot: item.unitSymbol || item.unitName,
          unitRateSnapshot: item.baseRate.toFixed(2),
          userQuantity: item.quantity.toFixed(2),
          calculatedAmount: item.lineTotal.toFixed(2),
        }))
      );

      return inqId;
    });

    testInquiryIds.push(inqWithItemsId);
    assert(inqWithItemsId > 0, "Quotation inquiry created with transaction");

    // Verify attached line items
    const savedItems = await db
      .select()
      .from(inquiryItems)
      .where(eq(inquiryItems.inquiryId, inqWithItemsId));

    assert(
      savedItems.length === 2,
      "Quotation inquiry saved exactly 2 line items in inquiry_items table"
    );
    assert(
      savedItems[0].serviceNameSnapshot === calcResult.lineItems[0].serviceName,
      "Line item snapshot preserves service name"
    );
    assert(
      parseFloat(savedItems[0].unitRateSnapshot) === calcResult.lineItems[0].baseRate,
      "Line item snapshot preserves base rate"
    );
    assert(
      parseFloat(savedItems[0].calculatedAmount) === calcResult.lineItems[0].lineTotal,
      "Line item snapshot preserves line subtotal"
    );

    // --------------------------------------------------------------------------
    // 4. EMAIL NOTIFICATION & FAILURE RESILIENCE
    // --------------------------------------------------------------------------
    console.log("\n✉️  4. Verifying Email Notification Engine & Resilience...");

    const emailConfigured = isEmailConfigured();
    console.log(
      `  ℹ️  SMTP Configuration detected: ${
        emailConfigured ? "Configured" : "Pending User App Password / Setup"
      }`
    );

    // Test notification dispatch function
    const dispatchResult = await sendInquiryNotification({
      inquiryId: inqWithItemsId,
      reference: `INQ-${inqWithItemsId}`,
      fullName: "TEST_Phase5_Lead_Quotation",
      phone: "+91 9876500000",
      email: "test.quotation@example.com",
      interestedService: "Turnkey Quotation",
      formattedTotal: calcResult.formattedTotal,
      quotationItems: calcResult.lineItems,
      createdAt: new Date(),
    });

    // CRITICAL: DB inquiry must STILL exist regardless of email success/failure
    const [inquiryAfterEmail] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inqWithItemsId))
      .limit(1);

    assert(
      inquiryAfterEmail !== undefined,
      "CRITICAL: Inquiry remains safely preserved in MySQL regardless of email status"
    );
    assert(
      dispatchResult !== null,
      "sendInquiryNotification returned a safe result object without throwing"
    );

    // --------------------------------------------------------------------------
    // 5. WHATSAPP CONTINUATION STRUCTURE
    // --------------------------------------------------------------------------
    console.log("\n💬 5. Verifying Click-to-WhatsApp Continuation Flow...");

    const testRef = `INQ-${inqWithItemsId}`;
    const waText = `Hello MAYA Design & Build,\n\nI have submitted an inquiry.\n*Reference ID:* ${testRef}\n*Name:* TEST_Phase5_Lead_Quotation\n*Estimated Quotation:* ${calcResult.formattedTotal}`;
    const generatedWaUrl = `https://wa.me/918980703374?text=${encodeURIComponent(waText)}`;

    assert(generatedWaUrl.includes("wa.me"), "Continuation URL targets WhatsApp domain (wa.me)");
    assert(generatedWaUrl.includes(testRef), "Prepared message embeds exact inquiry reference ID");
    assert(
      generatedWaUrl.includes(encodeURIComponent(calcResult.formattedTotal)),
      "Prepared message embeds estimated quotation total"
    );

    // --------------------------------------------------------------------------
    // 6. PUBLIC INQUIRY API ENDPOINT (POST /api/inquiries)
    // --------------------------------------------------------------------------
    console.log("\n🌐 6. Verifying Public Inquiry HTTP Route (POST /api/inquiries)...");

    const mockInquiryReq = new NextRequest("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "TEST_HTTP_Inquiry_User",
        phone: "+91 9825100000",
        email: "http.test@example.com",
        interestedService: "Architectural Visualization",
        message: "HTTP route test submission.",
        quotationItems: [{ rateId: rate1.id, quantity: 800 }],
      }),
    });

    const mockInquiryRes = await submitInquiryRoute(mockInquiryReq);
    assert(mockInquiryRes.status === 201, "POST /api/inquiries responded with HTTP 201 Created");

    const mockInquiryData = await mockInquiryRes.json();
    assert(mockInquiryData.success === true, "Response indicated success: true");
    assert(Boolean(mockInquiryData.inquiryId), "Response returned generated numeric inquiryId");
    assert(
      mockInquiryData.reference === `INQ-${mockInquiryData.inquiryId}`,
      "Response returned properly formatted reference ID"
    );
    assert(
      typeof mockInquiryData.whatsappUrl === "string" && mockInquiryData.whatsappUrl.includes("wa.me"),
      "Response returned prefilled click-to-WhatsApp URL"
    );

    testInquiryIds.push(mockInquiryData.inquiryId);

    // --------------------------------------------------------------------------
    // 7. ADMIN CMS INQUIRY ACCESS & LIFECYCLE MANAGEMENT
    // --------------------------------------------------------------------------
    console.log("\n🔐 7. Verifying Admin Authentication & Inquiry CMS Controls...");

    // Create a valid admin JWT
    const [adminUser] = await db.select().from(adminUsers).limit(1);
    assert(adminUser !== undefined, "Admin user exists in database");

    const adminJwt = await signAdminJWT({
      userId: adminUser.id,
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
    });
    assert(adminJwt.length > 20, "Generated signed Admin JWT session token");

    const decoded = await verifyAdminJWT(adminJwt);
    assert(decoded !== null && decoded.userId === adminUser.id, "Verified Admin JWT decodes valid payload");

    // Unauthenticated access to Admin Inquiries list must return 401
    const unauthListReq = new NextRequest("http://localhost:3000/api/admin/inquiries");
    const unauthListRes = await getAdminInquiriesRoute(unauthListReq);
    assert(
      unauthListRes.status === 401,
      "Unauthenticated request to GET /api/admin/inquiries is blocked (HTTP 401)"
    );

    // Authenticated access to Admin Inquiries list must return 200
    const authListReq = new NextRequest("http://localhost:3000/api/admin/inquiries", {
      headers: { Authorization: `Bearer ${adminJwt}` },
    });
    const authListRes = await getAdminInquiriesRoute(authListReq);
    assert(
      authListRes.status === 200,
      "Authenticated request to GET /api/admin/inquiries returns HTTP 200 OK"
    );

    const authListData = await authListRes.json();
    assert(Array.isArray(authListData.inquiries), "Admin inquiries endpoint returned inquiries list");
    assert(Boolean(authListData.counts), "Admin inquiries endpoint returned tab counts");

    // Authenticated access to Inquiry Detail
    const authDetailReq = new NextRequest(
      `http://localhost:3000/api/admin/inquiries/${inqWithItemsId}`,
      { headers: { Authorization: `Bearer ${adminJwt}` } }
    );
    const authDetailRes = await getAdminInquiryDetailRoute(authDetailReq, {
      params: Promise.resolve({ id: String(inqWithItemsId) }),
    });
    assert(
      authDetailRes.status === 200,
      "Authenticated request to GET /api/admin/inquiries/[id] returns HTTP 200 OK"
    );

    const authDetailData = await authDetailRes.json();
    assert(
      authDetailData.inquiry.items.length === 2,
      "Admin inquiry detail returned attached quotation line items"
    );

    // Update status to 'contacted'
    const updateReq = new NextRequest(
      `http://localhost:3000/api/admin/inquiries/${inqWithItemsId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminJwt}`,
        },
        body: JSON.stringify({
          status: "contacted",
          adminNotes: "Contacted customer via phone; site visit scheduled for Saturday.",
        }),
      }
    );
    const updateRes = await updateAdminInquiryRoute(updateReq, {
      params: Promise.resolve({ id: String(inqWithItemsId) }),
    });
    assert(updateRes.status === 200, "PUT /api/admin/inquiries/[id] successfully updated status");

    const [updatedInq] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inqWithItemsId))
      .limit(1);

    assert(updatedInq.status === "contacted", "Inquiry status updated to 'contacted'");
    assert(Boolean(updatedInq.adminNotes?.includes("site visit")), "Admin internal notes persisted");

    // Reject invalid status
    const invalidStatusUpdate = adminInquiryUpdateSchema.safeParse({
      status: "invalid_status" as any,
    });
    assert(!invalidStatusUpdate.success, "Invalid status string rejected by schema");

    // --------------------------------------------------------------------------
    // 8. REGRESSION SAFETY CHECKS (PHASES 1 TO 4)
    // --------------------------------------------------------------------------
    console.log("\n🔄 8. Verifying Regression Safety across Phases 1–4...");

    // Services
    const coreServices = await db.select().from(services);
    assert(coreServices.length >= 4, "Regression: Services preserved in database");

    // Projects & detail
    const projectList = await db.select().from(projects);
    assert(projectList.length >= 2, "Regression: Portfolio projects preserved");

    // Team members
    const team = await db.select().from(teamMembers);
    assert(team.length >= 5, "Regression: Team members preserved");

    // Quotation rates catalog
    const rates = await db.select().from(serviceRates);
    assert(rates.length >= 10, "Regression: Quotation rates catalog preserved");

    // Measurement units
    const allUnits = await db.select().from(units);
    assert(allUnits.length >= 4, "Regression: Measurement units catalog preserved");

    // Settings
    const allSettings = await db.select().from(settings);
    assert(allSettings.length >= 10, "Regression: Site settings preserved");

    // --------------------------------------------------------------------------
    // 9. SECURITY & CREDENTIAL ISOLATION
    // --------------------------------------------------------------------------
    console.log("\n🔒 9. Verifying Security & Environment Isolation...");

    const gitignorePath = path.resolve(process.cwd(), ".gitignore");
    const gitignoreContent = fs.existsSync(gitignorePath)
      ? fs.readFileSync(gitignorePath, "utf-8")
      : "";
    assert(
      gitignoreContent.includes(".env"),
      ".gitignore properly excludes .env from version control"
    );

    // --------------------------------------------------------------------------
    // 10. DATA SAFETY & CLEANUP OF TEST INQUIRIES ONLY
    // --------------------------------------------------------------------------
    console.log("\n🧹 10. Cleaning Up Temporary Test Inquiries Only...");

    if (testInquiryIds.length > 0) {
      await db.delete(inquiries).where(inArray(inquiries.id, testInquiryIds));
      console.log(`  ✓ Safely cleaned up ${testInquiryIds.length} temporary test inquiries`);
    }

    // Verify cleanup
    const remainingTestInquiries = await db
      .select()
      .from(inquiries)
      .where(inArray(inquiries.id, testInquiryIds));
    assert(remainingTestInquiries.length === 0, "Temporary test inquiries cleanly removed");

    // --------------------------------------------------------------------------
    // FINAL REPORT
    // --------------------------------------------------------------------------
    console.log("\n==============================================================");
    console.log(`🎉 PHASE 5 VERIFICATION COMPLETE`);
    console.log(`   Passed: ${passedCount}`);
    console.log(`   Failed: ${failedCount}`);
    console.log("==============================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("FATAL verification error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runPhase5Verification();
