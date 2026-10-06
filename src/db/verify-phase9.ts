/**
 * MAYA DESIGN & BUILD — PHASE 9 VERIFICATION SUITE
 * Project Details & Project-Specific Multi-Image Gallery
 *
 * Automated Assertions covering the 21 required validation points:
 * 1. Existing real projects preserved in MySQL.
 * 2. Temporary Project A creation via Admin API.
 * 3. Temporary Project B creation via Admin API.
 * 4. Add multiple media records to Project A.
 * 5. Add multiple media records to Project B.
 * 6. Project A returns ONLY Project A media.
 * 7. Project B returns ONLY Project B media.
 * 8. Strict cross-project media isolation (no cross leakage).
 * 9. Media display ordering respected (displayOrder ASC, id ASC).
 * 10. Individual sub-image deletion from Project A.
 * 11. Remaining Project A media preserved.
 * 12. Project B media completely unaffected.
 * 13. Cross-project media deletion attempt rejected with HTTP 403 Forbidden.
 * 14. Invalid project ID rejected safely (HTTP 400 / 404).
 * 15. Invalid media ID rejected safely (HTTP 404).
 * 16. Unauthenticated media mutations rejected with HTTP 401 Unauthorized.
 * 17. Public project detail slug retrieval includes joined media and hides sensitive data.
 * 18. Project without additional media renders safely with empty media array.
 * 19. Project cascade deletion automatically cascades associated project_media records.
 * 20. Zero orphan project_media records remain in database.
 * 21. Existing real projects and media remain completely untouched.
 */

import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { db } from "./index";
import { projects, projectMedia, adminUsers } from "./schema";
import { eq, sql, asc } from "drizzle-orm";
import { signAdminJWT, AUTH_COOKIE_NAME } from "../lib/auth";
import { getProjectBySlug } from "../lib/public-api";
import { getStorageDriver } from "../lib/storage";

// Routes under test
import {
  POST as createAdminProjectRoute,
  GET as getAdminProjectsRoute,
} from "../app/api/admin/projects/route";
import {
  GET as getAdminProjectDetailRoute,
  DELETE as deleteAdminProjectRoute,
} from "../app/api/admin/projects/[id]/route";
import {
  GET as getAdminProjectMediaRoute,
  POST as createAdminProjectMediaRoute,
} from "../app/api/admin/projects/[id]/media/route";
import {
  DELETE as deleteAdminProjectMediaRoute,
  PATCH as patchAdminProjectMediaRoute,
} from "../app/api/admin/projects/[id]/media/[mediaId]/route";
import { GET as getPublicProjectBySlugRoute } from "../app/api/projects/[slug]/route";

// Safety timeout: prevents process hanging
const safetyTimeout = setTimeout(() => {
  console.error("\n❌ [TIMEOUT] Phase 9 verification timed out after 30 seconds.");
  process.exit(1);
}, 30000);
safetyTimeout.unref();

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    failedCount++;
  }
}

async function runPhase9Verification() {
  console.log("\n==============================================================");
  console.log("🚀 STARTING MAYA PHASE 9 — PROJECT DETAILS & MULTI-MEDIA SUITE");
  console.log("==============================================================\n");

  const cleanupProjectIds: number[] = [];

  try {
    // --------------------------------------------------------------------------
    // 0. ADMIN AUTH SETUP
    // --------------------------------------------------------------------------
    console.log("🔑 0. Preparing Admin Authentication Session...");

    const [adminUser] = await db.select().from(adminUsers).limit(1);
    assert(adminUser !== undefined, "Admin user account exists for test authentication");

    const adminJwt = await signAdminJWT({
      userId: adminUser.id,
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
    });

    const createAuthRequest = (url: string, method = "GET", body?: any) => {
      return new NextRequest(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          cookie: `${AUTH_COOKIE_NAME}=${adminJwt}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    const createUnauthRequest = (url: string, method = "GET", body?: any) => {
      return new NextRequest(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    // --------------------------------------------------------------------------
    // 1. EXISTING REAL PROJECTS PRESERVED
    // --------------------------------------------------------------------------
    console.log("\n🏛️ 1. Verifying Existing Real Projects Baseline...");

    const baselineProjects = await db.select().from(projects);
    const baselineProjectCount = baselineProjects.length;
    assert(baselineProjectCount > 0, `Database contains ${baselineProjectCount} existing real projects`);

    const baselineMedia = await db.select().from(projectMedia);
    const baselineMediaCount = baselineMedia.length;
    console.log(`  ℹ️ Baseline existing media records: ${baselineMediaCount}`);

    // --------------------------------------------------------------------------
    // 2. TEMPORARY PROJECT A CREATION
    // --------------------------------------------------------------------------
    console.log("\n🏗️ 2. Creating Temporary Project A (Alpha)...");

    const projectAPayload = {
      title: "Temp Phase 9 Project Alpha",
      slug: "temp-phase9-project-alpha",
      category: "completed",
      location: "Bardoli West, Gujarat",
      clientName: "Private Client A",
      clientNumber: "+91 9876543210",
      costEstimate: 4500000,
      description: "Modern luxury residence test project for Phase 9 media isolation.",
      mainImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      displayOrder: 991,
      isFeatured: false,
    };

    const createProjectAReq = createAuthRequest("http://localhost:3000/api/admin/projects", "POST", projectAPayload);
    const createProjectARes = await createAdminProjectRoute(createProjectAReq);
    assert(createProjectARes.status === 201, "Temporary Project A created with HTTP 201");

    const projectAData = await createProjectARes.json();
    const projectAId: number = projectAData.project.id;
    cleanupProjectIds.push(projectAId);
    assert(projectAId > 0, `Project A assigned ID #${projectAId}`);

    // --------------------------------------------------------------------------
    // 3. TEMPORARY PROJECT B CREATION
    // --------------------------------------------------------------------------
    console.log("\n🏗️ 3. Creating Temporary Project B (Beta)...");

    const projectBPayload = {
      title: "Temp Phase 9 Project Beta",
      slug: "temp-phase9-project-beta",
      category: "ongoing",
      location: "Station Road, Bardoli",
      clientName: "Commercial Client B",
      clientNumber: "+91 9123456789",
      costEstimate: 8200000,
      description: "Commercial multi-story complex test project for Phase 9 media isolation.",
      mainImageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
      displayOrder: 992,
      isFeatured: false,
    };

    const createProjectBReq = createAuthRequest("http://localhost:3000/api/admin/projects", "POST", projectBPayload);
    const createProjectBRes = await createAdminProjectRoute(createProjectBReq);
    assert(createProjectBRes.status === 201, "Temporary Project B created with HTTP 201");

    const projectBData = await createProjectBRes.json();
    const projectBId: number = projectBData.project.id;
    cleanupProjectIds.push(projectBId);
    assert(projectBId > 0 && projectBId !== projectAId, `Project B assigned distinct ID #${projectBId}`);

    // --------------------------------------------------------------------------
    // 4. ADD MULTIPLE MEDIA RECORDS TO PROJECT A
    // --------------------------------------------------------------------------
    console.log("\n📸 4. Attaching Multiple Sub-Media Items to Project A...");

    // Create a local test upload file to verify safe file cleanup
    const testUploadDir = path.resolve(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(testUploadDir, { recursive: true });
    const tempFileName = `temp_phase9_test_upload_${Date.now()}.webp`;
    const tempFilePath = path.resolve(testUploadDir, tempFileName);
    await fs.promises.writeFile(tempFilePath, Buffer.from("RIFF....WEBPVP8 ..."));

    const projectAMediaPayloads = [
      {
        mediaUrl: `/uploads/${tempFileName}`, // Uploaded local file with order 1
        mediaType: "image" as const,
        displayOrder: 1,
      },
      {
        mediaUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9", // External with order 0
        mediaType: "image" as const,
        displayOrder: 0,
      },
      {
        mediaUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c", // External with order 2
        mediaType: "image" as const,
        displayOrder: 2,
      },
    ];

    // Test batch insertion endpoint
    const attachBatchReq = createAuthRequest(
      `http://localhost:3000/api/admin/projects/${projectAId}/media`,
      "POST",
      projectAMediaPayloads
    );
    const attachBatchRes = await createAdminProjectMediaRoute(attachBatchReq, {
      params: Promise.resolve({ id: String(projectAId) }),
    });
    assert(attachBatchRes.status === 201, "Batch attach media to Project A succeeded with HTTP 201");

    const batchData = await attachBatchRes.json();
    assert(Array.isArray(batchData.media) && batchData.media.length === 3, "Project A received all 3 attached media records");

    // --------------------------------------------------------------------------
    // 5. ADD MULTIPLE MEDIA RECORDS TO PROJECT B
    // --------------------------------------------------------------------------
    console.log("\n📸 5. Attaching Multiple Sub-Media Items to Project B...");

    const projectBMediaPayloads = [
      {
        mediaUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
        mediaType: "image" as const,
        displayOrder: 0,
      },
      {
        mediaUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        mediaType: "image" as const,
        displayOrder: 1,
      },
    ];

    const attachBReq = createAuthRequest(
      `http://localhost:3000/api/admin/projects/${projectBId}/media`,
      "POST",
      projectBMediaPayloads
    );
    const attachBRes = await createAdminProjectMediaRoute(attachBReq, {
      params: Promise.resolve({ id: String(projectBId) }),
    });
    assert(attachBRes.status === 201, "Attach media to Project B succeeded with HTTP 201");

    const bData = await attachBRes.json();
    assert(Array.isArray(bData.media) && bData.media.length === 2, "Project B received 2 attached media records");

    // --------------------------------------------------------------------------
    // 6. PROJECT A RETURNS ONLY PROJECT A MEDIA
    // --------------------------------------------------------------------------
    console.log("\n🔍 6. Verifying Project A Media Query Isolation...");

    const getMediaAReq = createAuthRequest(`http://localhost:3000/api/admin/projects/${projectAId}/media`);
    const getMediaARes = await getAdminProjectMediaRoute(getMediaAReq, {
      params: Promise.resolve({ id: String(projectAId) }),
    });
    assert(getMediaARes.status === 200, "Admin GET Project A media returns HTTP 200");

    const mediaAData = await getMediaARes.json();
    const projectAMediaList = mediaAData.media;
    assert(projectAMediaList.length === 3, "Project A returns exactly 3 media records");
    const allBelongToA = projectAMediaList.every((m: any) => m.projectId === projectAId);
    assert(allBelongToA, "All Project A media items have projectId matching Project A");

    // --------------------------------------------------------------------------
    // 7. PROJECT B RETURNS ONLY PROJECT B MEDIA
    // --------------------------------------------------------------------------
    console.log("\n🔍 7. Verifying Project B Media Query Isolation...");

    const getMediaBReq = createAuthRequest(`http://localhost:3000/api/admin/projects/${projectBId}/media`);
    const getMediaBRes = await getAdminProjectMediaRoute(getMediaBReq, {
      params: Promise.resolve({ id: String(projectBId) }),
    });
    assert(getMediaBRes.status === 200, "Admin GET Project B media returns HTTP 200");

    const mediaBData = await getMediaBRes.json();
    const projectBMediaList = mediaBData.media;
    assert(projectBMediaList.length === 2, "Project B returns exactly 2 media records");
    const allBelongToB = projectBMediaList.every((m: any) => m.projectId === projectBId);
    assert(allBelongToB, "All Project B media items have projectId matching Project B");

    // --------------------------------------------------------------------------
    // 8. STRICT CROSS-PROJECT MEDIA ISOLATION (ZERO LEAKAGE)
    // --------------------------------------------------------------------------
    console.log("\n🛡️ 8. Verifying Zero Cross-Project Media Leakage...");

    const aIds = new Set(projectAMediaList.map((m: any) => m.id));
    const bIds = new Set(projectBMediaList.map((m: any) => m.id));
    const idIntersection = [...aIds].filter((id) => bIds.has(id));
    assert(idIntersection.length === 0, "Zero ID overlap between Project A media and Project B media");

    const aUrls = new Set(projectAMediaList.map((m: any) => m.mediaUrl));
    const bUrls = new Set(projectBMediaList.map((m: any) => m.mediaUrl));
    const urlIntersection = [...aUrls].filter((url) => bUrls.has(url));
    assert(urlIntersection.length === 0, "Zero URL overlap between Project A and Project B media");

    // --------------------------------------------------------------------------
    // 9. MEDIA DISPLAY ORDERING
    // --------------------------------------------------------------------------
    console.log("\n🔢 9. Verifying Media Display Order Sorting...");

    // Project A items were inserted with displayOrders: 1, 0, 2
    // Sorted output must be: 0, 1, 2
    assert(projectAMediaList[0].displayOrder === 0, "First Project A media item has displayOrder 0");
    assert(projectAMediaList[1].displayOrder === 1, "Second Project A media item has displayOrder 1");
    assert(projectAMediaList[2].displayOrder === 2, "Third Project A media item has displayOrder 2");

    // --------------------------------------------------------------------------
    // 10. DELETE ONE PROJECT A MEDIA ITEM (WITH PHYSICAL STORAGE CLEANUP)
    // --------------------------------------------------------------------------
    console.log("\n🗑️ 10. Deleting One Project A Sub-Media Item (Item A1 / Local File)...");

    const itemA1 = projectAMediaList.find((m: any) => m.mediaUrl.includes(tempFileName));
    assert(itemA1 !== undefined, "Located target media item A1 with local upload file");

    const deleteMediaReq = createAuthRequest(
      `http://localhost:3000/api/admin/projects/${projectAId}/media/${itemA1.id}`,
      "DELETE"
    );
    const deleteMediaRes = await deleteAdminProjectMediaRoute(deleteMediaReq, {
      params: Promise.resolve({ id: String(projectAId), mediaId: String(itemA1.id) }),
    });
    assert(deleteMediaRes.status === 200, "DELETE media item A1 succeeded with HTTP 200");

    const deleteMediaData = await deleteMediaRes.json();
    assert(deleteMediaData.success === true, "Delete response indicated success: true");

    // Verify physical file was cleanly removed by storage driver
    const fileExistsAfterDelete = fs.existsSync(tempFilePath);
    assert(!fileExistsAfterDelete, "Storage Adapter deleted physical upload file safely upon record deletion");

    // --------------------------------------------------------------------------
    // 11. REMAINING PROJECT A MEDIA PRESERVED
    // --------------------------------------------------------------------------
    console.log("\n🛡️ 11. Verifying Remaining Project A Media Preserved...");

    const checkMediaAReq = createAuthRequest(`http://localhost:3000/api/admin/projects/${projectAId}/media`);
    const checkMediaARes = await getAdminProjectMediaRoute(checkMediaAReq, {
      params: Promise.resolve({ id: String(projectAId) }),
    });
    const checkMediaAData = await checkMediaARes.json();
    assert(checkMediaAData.media.length === 2, "Project A now contains exactly 2 remaining media records");
    const itemA1StillExists = checkMediaAData.media.some((m: any) => m.id === itemA1.id);
    assert(!itemA1StillExists, "Deleted item A1 is completely removed from Project A");

    // --------------------------------------------------------------------------
    // 12. PROJECT B MEDIA COMPLETELY UNAFFECTED
    // --------------------------------------------------------------------------
    console.log("\n🛡️ 12. Verifying Project B Media Completely Untouched...");

    const checkMediaBReq = createAuthRequest(`http://localhost:3000/api/admin/projects/${projectBId}/media`);
    const checkMediaBRes = await getAdminProjectMediaRoute(checkMediaBReq, {
      params: Promise.resolve({ id: String(projectBId) }),
    });
    const checkMediaBData = await checkMediaBRes.json();
    assert(checkMediaBData.media.length === 2, "Project B still contains both of its original 2 media records");

    // --------------------------------------------------------------------------
    // 13. CROSS-PROJECT MEDIA DELETION ATTEMPT REJECTED (HTTP 403)
    // --------------------------------------------------------------------------
    console.log("\n🚫 13. Verifying Cross-Project Media Deletion Rejection (HTTP 403)...");

    const itemB1 = projectBMediaList[0];
    // Malicious or mismatched request: Attempt to delete Project B's media under Project A route
    const crossDeleteReq = createAuthRequest(
      `http://localhost:3000/api/admin/projects/${projectAId}/media/${itemB1.id}`,
      "DELETE"
    );
    const crossDeleteRes = await deleteAdminProjectMediaRoute(crossDeleteReq, {
      params: Promise.resolve({ id: String(projectAId), mediaId: String(itemB1.id) }),
    });
    assert(crossDeleteRes.status === 403, "Cross-project media deletion rejected with HTTP 403 Forbidden");

    const crossDeleteData = await crossDeleteRes.json();
    assert(crossDeleteData.error === "Forbidden", "Error response clearly states 'Forbidden'");

    // Confirm Project B's media item was NOT deleted
    const [b1StillInDb] = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.id, itemB1.id));
    assert(b1StillInDb !== undefined, "Project B media item remained completely untouched in database");

    // --------------------------------------------------------------------------
    // 14. INVALID PROJECT ID REJECTED SAFELY
    // --------------------------------------------------------------------------
    console.log("\n⚠️ 14. Verifying Invalid Project ID Handling...");

    const invalidProjectReq = createAuthRequest(
      `http://localhost:3000/api/admin/projects/999999/media/${itemB1.id}`,
      "DELETE"
    );
    const invalidProjectRes = await deleteAdminProjectMediaRoute(invalidProjectReq, {
      params: Promise.resolve({ id: "999999", mediaId: String(itemB1.id) }),
    });
    assert(invalidProjectRes.status === 404, "Nonexistent project ID rejected with HTTP 404");

    const malformedProjectReq = createAuthRequest(
      `http://localhost:3000/api/admin/projects/invalid-id/media`,
      "POST",
      { mediaUrl: "https://example.com/test.jpg" }
    );
    const malformedProjectRes = await createAdminProjectMediaRoute(malformedProjectReq, {
      params: Promise.resolve({ id: "invalid-id" }),
    });
    assert(malformedProjectRes.status === 400, "Malformed non-numeric project ID rejected with HTTP 400");

    // --------------------------------------------------------------------------
    // 15. INVALID MEDIA ID REJECTED SAFELY
    // --------------------------------------------------------------------------
    console.log("\n⚠️ 15. Verifying Invalid Media ID Handling...");

    const invalidMediaReq = createAuthRequest(
      `http://localhost:3000/api/admin/projects/${projectAId}/media/999999`,
      "DELETE"
    );
    const invalidMediaRes = await deleteAdminProjectMediaRoute(invalidMediaReq, {
      params: Promise.resolve({ id: String(projectAId), mediaId: "999999" }),
    });
    assert(invalidMediaRes.status === 404, "Nonexistent media ID rejected with HTTP 404");

    // --------------------------------------------------------------------------
    // 16. UNAUTHENTICATED MEDIA MUTATION REJECTED (HTTP 401)
    // --------------------------------------------------------------------------
    console.log("\n🔒 16. Verifying Unauthenticated Media Mutation Protection (HTTP 401)...");

    const unauthPostReq = createUnauthRequest(
      `http://localhost:3000/api/admin/projects/${projectAId}/media`,
      "POST",
      { mediaUrl: "https://example.com/test.jpg", mediaType: "image" }
    );
    const unauthPostRes = await createAdminProjectMediaRoute(unauthPostReq, {
      params: Promise.resolve({ id: String(projectAId) }),
    });
    assert(unauthPostRes.status === 401, "Unauthenticated POST media rejected with HTTP 401 Unauthorized");

    const unauthDeleteReq = createUnauthRequest(
      `http://localhost:3000/api/admin/projects/${projectAId}/media/${itemB1.id}`,
      "DELETE"
    );
    const unauthDeleteRes = await deleteAdminProjectMediaRoute(unauthDeleteReq, {
      params: Promise.resolve({ id: String(projectAId), mediaId: String(itemB1.id) }),
    });
    assert(unauthDeleteRes.status === 401, "Unauthenticated DELETE media rejected with HTTP 401 Unauthorized");

    // --------------------------------------------------------------------------
    // 17. PUBLIC PROJECT DETAIL SLUG RETRIEVAL INCLUDES JOINED MEDIA
    // --------------------------------------------------------------------------
    console.log("\n🌐 17. Verifying Public Project Details Slug Route & Joined Media...");

    const publicSlugRes = await getPublicProjectBySlugRoute(
      new NextRequest("http://localhost:3000/api/projects/temp-phase9-project-alpha"),
      { params: Promise.resolve({ slug: "temp-phase9-project-alpha" }) }
    );
    assert(publicSlugRes.status === 200, "Public GET /api/projects/[slug] returns HTTP 200 OK");

    const publicSlugData = await publicSlugRes.json();
    assert(publicSlugData.success === true, "Public response indicated success: true");
    assert(publicSlugData.data.title === "Temp Phase 9 Project Alpha", "Returned project title matches Project A");
    assert(publicSlugData.data.clientNumber === undefined, "Internal private client phone number is excluded from public response");
    assert(Array.isArray(publicSlugData.data.media) && publicSlugData.data.media.length === 2, "Public response includes joined media array with exactly 2 items");

    // Public server helper test
    const helperResult = await getProjectBySlug("temp-phase9-project-alpha");
    assert(helperResult !== null, "Server helper getProjectBySlug returns project data");
    assert(helperResult?.media.length === 2, "Server helper joined media array matches Project A");

    // --------------------------------------------------------------------------
    // 18. PROJECT WITHOUT ADDITIONAL MEDIA WORKS SAFELY
    // --------------------------------------------------------------------------
    console.log("\n📄 18. Verifying Project Without Additional Media Works Gracefully...");

    const projectCPayload = {
      title: "Temp Phase 9 Project Gamma (No Media)",
      slug: "temp-phase9-project-gamma",
      category: "upcoming",
      location: "Bardoli, Gujarat",
      costEstimate: 2000000,
      description: "Upcoming minimalist project with no additional gallery media attached.",
      mainImageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
      displayOrder: 993,
      isFeatured: false,
    };

    const createProjectCReq = createAuthRequest("http://localhost:3000/api/admin/projects", "POST", projectCPayload);
    const createProjectCRes = await createAdminProjectRoute(createProjectCReq);
    assert(createProjectCRes.status === 201, "Temporary Project C created with HTTP 201");

    const projectCData = await createProjectCRes.json();
    const projectCId: number = projectCData.project.id;
    cleanupProjectIds.push(projectCId);

    const helperResultC = await getProjectBySlug("temp-phase9-project-gamma");
    assert(helperResultC !== null, "Project without additional media retrieved successfully");
    assert(Array.isArray(helperResultC?.media) && helperResultC?.media.length === 0, "Project without media returns empty media array [] without error");

    // --------------------------------------------------------------------------
    // 19. TEMPORARY PROJECT CASCADE DELETION
    // --------------------------------------------------------------------------
    console.log("\n⚡ 19. Verifying Database Foreign Key Cascade Deletion...");

    // Project B has 2 media items. Deleting Project B should cascade delete both items.
    const deleteProjectBReq = createAuthRequest(`http://localhost:3000/api/admin/projects/${projectBId}`, "DELETE");
    const deleteProjectBRes = await deleteAdminProjectRoute(deleteProjectBReq, {
      params: Promise.resolve({ id: String(projectBId) }),
    });
    assert(deleteProjectBRes.status === 200, "Project B deleted via admin endpoint with HTTP 200");

    // Verify all media belonging to Project B were automatically deleted by cascade
    const mediaBRemaining = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectBId));
    assert(mediaBRemaining.length === 0, "All Project B media cascaded and deleted automatically from database");

    // Clean up Project A and Project C
    for (const projId of [projectAId, projectCId]) {
      const delReq = createAuthRequest(`http://localhost:3000/api/admin/projects/${projId}`, "DELETE");
      await deleteAdminProjectRoute(delReq, { params: Promise.resolve({ id: String(projId) }) });
    }

    const mediaARemaining = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectAId));
    assert(mediaARemaining.length === 0, "All Project A media cascaded and deleted automatically");

    // --------------------------------------------------------------------------
    // 20. ZERO ORPHAN PROJECT_MEDIA RECORDS
    // --------------------------------------------------------------------------
    console.log("\n🧹 20. Verifying Database Integrity & Zero Orphan Media Records...");

    const orphanCheck = await db.execute(sql`
      SELECT count(*) as orphan_count 
      FROM project_media pm 
      LEFT JOIN projects p ON pm.project_id = p.id 
      WHERE p.id IS NULL
    `);
    const orphanCount = Number((orphanCheck[0] as any)[0]?.orphan_count || 0);
    assert(orphanCount === 0, `Database contains zero orphaned project_media records (count: ${orphanCount})`);

    // --------------------------------------------------------------------------
    // 21. EXISTING REAL PROJECTS & MEDIA REMAIN UNTOUCHED
    // --------------------------------------------------------------------------
    console.log("\n🏛️ 21. Verifying Existing Real Projects & Media Intact...");

    const postProjects = await db.select().from(projects);
    assert(postProjects.length === baselineProjectCount, `Real projects count matches baseline (${postProjects.length} projects preserved)`);

    const postMedia = await db.select().from(projectMedia);
    assert(postMedia.length === baselineMediaCount, `Real project media count matches baseline (${postMedia.length} media records preserved)`);

    console.log("\n==============================================================");
    console.log(`📊 PHASE 9 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==============================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Unexpected error in Phase 9 verification suite:", error);
    // Cleanup any temporary projects if error occurred midway
    for (const id of cleanupProjectIds) {
      try {
        await db.delete(projects).where(eq(projects.id, id));
      } catch {}
    }
    process.exit(1);
  } finally {
    clearTimeout(safetyTimeout);
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runPhase9Verification();
