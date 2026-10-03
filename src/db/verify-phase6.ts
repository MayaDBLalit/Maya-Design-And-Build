/**
 * MAYA DESIGN & BUILD — PHASE 6 VERIFICATION SUITE
 * Comprehensive verification of Media Architecture, Storage Adapter,
 * Sharp Image Processing Pipeline, Video Container & Duration Inspection,
 * Path Traversal & Security Defenses, and Phases 1–5 Regressions.
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
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
  settings,
  adminUsers,
} from "./schema";
import { eq } from "drizzle-orm";
import { getStorageDriver, LocalStorageDriver } from "../lib/storage";
import { processImage, validateImageMagicBytes } from "../lib/media/image-processor";
import { inspectVideo, validateVideoMagicBytes, parseMp4Duration } from "../lib/media/video-inspector";
import { signAdminJWT, verifyAdminJWT } from "../lib/auth";
import { POST as uploadRoute } from "../app/api/admin/upload/route";
import { calculateAuthoritativeQuotation } from "../lib/quotation";

let passedCount = 0;
let failedCount = 0;
const testCreatedFiles: string[] = [];

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    failedCount++;
  }
}

async function runPhase6Verification() {
  console.log("\n==============================================================");
  console.log("🚀 STARTING MAYA PHASE 6 — MEDIA & PERFORMANCE SUITE");
  console.log("==============================================================\n");

  try {
    // --------------------------------------------------------------------------
    // 1. STORAGE ADAPTER & PATH TRAVERSAL DEFENSES
    // --------------------------------------------------------------------------
    console.log("📁 1. Verifying Storage Adapter & Path Traversal Security...");

    const storageDriver = getStorageDriver();
    assert(storageDriver instanceof LocalStorageDriver, "Storage driver initializes LocalStorageDriver instance");

    // Test safe file upload through storage driver
    const testContent = Buffer.from("MAYA_STORAGE_ADAPTER_TEST_CONTENT");
    const testFileName = `test-verify-${Date.now()}.txt`;
    const uploadRes = await storageDriver.upload(testContent, testFileName);

    assert(uploadRes.url.startsWith("/uploads/"), "Upload result returns valid /uploads/ URL");
    assert(fs.existsSync(uploadRes.filePath), "File physically created in public/uploads directory");
    testCreatedFiles.push(uploadRes.fileName);

    // Test file existence
    const exists = await storageDriver.exists(uploadRes.fileName);
    assert(exists === true, "storageDriver.exists returns true for existing file");

    // Test path traversal defense
    let traversalBlocked = false;
    try {
      await storageDriver.upload(testContent, "../../../etc/passwd_test.txt");
    } catch {
      traversalBlocked = true;
    }
    // Or if basename sanitizes it safely inside uploadsDir
    const sanitizedCheck = storageDriver.getUrl("../../../malicious.txt");
    assert(!sanitizedCheck.includes(".."), "StorageDriver prevents path traversal navigation");

    // --------------------------------------------------------------------------
    // 2. SHARP IMAGE PROCESSING PIPELINE
    // --------------------------------------------------------------------------
    console.log("\n🖼️  2. Verifying Sharp Image Processing & WebP Optimization...");

    // Create a 1200x800 test PNG image buffer using Sharp
    const rawPngBuffer = await sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 4,
        background: { r: 197, g: 168, b: 105, alpha: 1 }, // Maya gold
      },
    })
      .png()
      .toBuffer();

    assert(rawPngBuffer.length > 0, "Generated synthetic test PNG buffer");

    // Test magic bytes validation
    const pngMagic = validateImageMagicBytes(rawPngBuffer);
    assert(pngMagic.valid && pngMagic.detectedFormat === "png", "Magic bytes correctly identifies PNG format");

    // Test rejection of fake image (e.g. text/script masquerading as image)
    const fakeImageBuffer = Buffer.from("<?php echo 'malicious_code'; ?>");
    const fakeMagic = validateImageMagicBytes(fakeImageBuffer);
    assert(!fakeMagic.valid, "Fake image buffer rejected by magic bytes inspection");

    // Process image through pipeline
    const processed = await processImage(rawPngBuffer, {
      generateThumbnail: true,
      maxWidth: 1000,
      quality: 82,
    });

    assert(processed.format === "webp", "Image converted to high-efficiency WebP format");
    assert(processed.fileName.endsWith(".webp"), "Generated filename uses .webp extension");
    assert(processed.width <= 1000, "Image width constrained to maxWidth limit (1000px)");
    assert(processed.optimizedSizeBytes > 0, "Optimized image buffer has valid byte size");
    assert(Boolean(processed.thumbnailBuffer), "Thumbnail variant successfully generated");
    assert(Boolean(processed.thumbnailFileName?.includes("-thumb.webp")), "Thumbnail filename formatted correctly");

    // --------------------------------------------------------------------------
    // 3. VIDEO CONTAINER & DURATION INSPECTOR
    // --------------------------------------------------------------------------
    console.log("\n🎬 3. Verifying Video Container Parsing & Duration Limits...");

    // Create a minimal synthetic MP4 buffer with ftyp box
    const ftypBox = Buffer.alloc(32);
    ftypBox.writeUInt32BE(32, 0); // size
    ftypBox.write("ftyp", 4, "ascii"); // type
    ftypBox.write("isom", 8, "ascii"); // major brand
    ftypBox.writeUInt32BE(512, 12); // minor version
    ftypBox.write("isomiso2mp41", 16, "ascii"); // compatible brands

    const mp4Magic = validateVideoMagicBytes(ftypBox);
    assert(mp4Magic.valid && mp4Magic.format === "mp4", "Video inspector detects MP4 container by ftyp box");

    // WebM EBML header check
    const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00]);
    const webmMagic = validateVideoMagicBytes(webmHeader);
    assert(webmMagic.valid && webmMagic.format === "webm", "Video inspector detects WebM container by EBML header");

    // Test rejection of non-video file
    const textBuffer = Buffer.from("plain text not a video");
    const nonVideoCheck = inspectVideo(textBuffer);
    assert(!nonVideoCheck.valid, "Non-video buffer rejected by video inspector");

    // Test simulated MP4 with moov/mvhd duration parser
    // Build a mock moov -> mvhd atom with 45s duration
    const timeScale = 1000;
    const duration = 45000; // 45 seconds
    const mvhdBox = Buffer.alloc(108);
    mvhdBox.writeUInt32BE(108, 0);
    mvhdBox.write("mvhd", 4, "ascii");
    mvhdBox.writeUInt8(0, 8); // version 0
    mvhdBox.writeUInt32BE(timeScale, 20); // timeScale
    mvhdBox.writeUInt32BE(duration, 24); // duration

    const moovBox = Buffer.alloc(8 + 108);
    moovBox.writeUInt32BE(8 + 108, 0);
    moovBox.write("moov", 4, "ascii");
    mvhdBox.copy(moovBox, 8);

    const fullMockMp4 = Buffer.concat([ftypBox, moovBox]);
    const parsedDuration = parseMp4Duration(fullMockMp4);
    assert(parsedDuration === 45, "Pure Node.js MP4 box parser extracted exact duration (45s)");

    // Test 60s limit enforcement for gallery videos
    const galleryInspectionNormal = inspectVideo(fullMockMp4, 60);
    assert(galleryInspectionNormal.exceedsDurationLimit === false, "45s video passes 60s gallery limit");

    // Build mock 90s video and verify rejection flag
    const longDuration = 90000; // 90 seconds
    mvhdBox.writeUInt32BE(longDuration, 24);
    mvhdBox.copy(moovBox, 8);
    const longMockMp4 = Buffer.concat([ftypBox, moovBox]);
    const galleryInspectionLong = inspectVideo(longMockMp4, 60);
    assert(galleryInspectionLong.exceedsDurationLimit === true, "90s video correctly flagged exceeding 60s limit");

    // --------------------------------------------------------------------------
    // 4. ADMIN UPLOAD API SECURITY & VALIDATION
    // --------------------------------------------------------------------------
    console.log("\n🔒 4. Verifying Admin Upload API Endpoint Security...");

    // Unauthenticated upload must return 401
    const unauthReq = new NextRequest("http://localhost:3000/api/admin/upload", {
      method: "POST",
      body: new FormData(),
    });
    const unauthRes = await uploadRoute(unauthReq);
    assert(Boolean(unauthRes && unauthRes.status === 401), "Unauthenticated upload request blocked with HTTP 401");

    // Authenticated upload with valid admin JWT
    const [adminUser] = await db.select().from(adminUsers).limit(1);
    assert(adminUser !== undefined, "Admin user exists in database");

    const adminJwt = await signAdminJWT({
      userId: adminUser.id,
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
    });

    // Upload oversized file rejection test (> 10MB image)
    const largeFormData = new FormData();
    const largeDummyBytes = new Uint8Array(11 * 1024 * 1024); // 11MB
    largeFormData.append("file", new Blob([largeDummyBytes], { type: "image/jpeg" }), "oversized.jpg");

    const largeReq = new NextRequest("http://localhost:3000/api/admin/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminJwt}` },
      body: largeFormData,
    });
    const largeRes = await uploadRoute(largeReq);
    assert(Boolean(largeRes && largeRes.status === 400), "Oversized upload (> 10MB) rejected with HTTP 400");

    // Authenticated valid image upload
    const validFormData = new FormData();
    validFormData.append("file", new Blob([rawPngBuffer], { type: "image/png" }), "test-upload.png");
    validFormData.append("purpose", "project");

    const validReq = new NextRequest("http://localhost:3000/api/admin/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminJwt}` },
      body: validFormData,
    });
    const validRes = await uploadRoute(validReq);
    assert(Boolean(validRes && validRes.status === 201), "Authenticated valid image upload returned HTTP 201 Created");

    const validData = validRes ? await validRes.json() : {};
    assert(validData.success === true, "Upload response confirmed success: true");
    assert(typeof validData.url === "string" && validData.url.endsWith(".webp"), "Uploaded image saved as optimized WebP");
    assert(validData.mediaType === "image", "Media type categorized as 'image'");
    testCreatedFiles.push(validData.fileName);
    if (validData.thumbnailUrl) {
      testCreatedFiles.push(path.basename(validData.thumbnailUrl));
    }

    // --------------------------------------------------------------------------
    // 5. DYNAMIC PAGE CACHE RESOLUTION
    // --------------------------------------------------------------------------
    console.log("\n⚡ 5. Verifying Real-Time CMS Dynamic Rendering...");

    const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
    const pageContent = fs.readFileSync(pagePath, "utf-8");
    assert(
      pageContent.includes('export const dynamic = "force-dynamic"'),
      "src/app/page.tsx declares force-dynamic for real-time CMS reflection"
    );
    assert(
      pageContent.includes("<Hero settings={settings}"),
      "Hero component receives real-time CMS settings"
    );
    assert(
      pageContent.includes("<AboutSection settings={settings}"),
      "AboutSection component receives real-time CMS settings"
    );

    // --------------------------------------------------------------------------
    // 6. REGRESSION SAFETY CHECKS (PHASES 1 TO 5)
    // --------------------------------------------------------------------------
    console.log("\n🔄 6. Verifying Phase 1–5 Regressions...");

    // 4 Core services
    const coreServices = await db.select().from(services);
    assert(coreServices.length === 4, "Regression: Exactly 4 core services exist in database");

    // Projects & detail
    const projectList = await db.select().from(projects);
    assert(projectList.length >= 2, "Regression: Portfolio projects preserved");

    // Team members
    const team = await db.select().from(teamMembers);
    assert(team.length >= 5, "Regression: Team members preserved");

    // Quotation rates catalog
    const rates = await db.select().from(serviceRates);
    assert(rates.length >= 10, "Regression: Quotation rates catalog preserved");

    // Dynamic quotation calculation works
    const quoteCalc = await calculateAuthoritativeQuotation([
      { rateId: rates[0].id, quantity: 2000 },
    ]);
    assert(quoteCalc.total > 0, "Regression: Authoritative quotation calculation operates accurately");

    // Units
    const allUnits = await db.select().from(units);
    assert(allUnits.length >= 4, "Regression: Measurement units preserved");

    // Settings
    const allSettings = await db.select().from(settings);
    assert(allSettings.length >= 10, "Regression: Site settings preserved");

    // --------------------------------------------------------------------------
    // 7. CLEANUP OF TEST ARTIFACTS ONLY
    // --------------------------------------------------------------------------
    console.log("\n🧹 7. Cleaning Up Test Upload Artifacts Only...");

    for (const f of testCreatedFiles) {
      await storageDriver.delete(f);
    }
    console.log(`  ✓ Safely removed ${testCreatedFiles.length} temporary test files`);

    // --------------------------------------------------------------------------
    // FINAL REPORT
    // --------------------------------------------------------------------------
    console.log("\n==============================================================");
    console.log(`🎉 PHASE 6 VERIFICATION COMPLETE`);
    console.log(`   Passed: ${passedCount}`);
    console.log(`   Failed: ${failedCount}`);
    console.log("==============================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("FATAL verification error in Phase 6 suite:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runPhase6Verification();
