import { db } from "@/db";
import { packages, packageSubservices, workflows, workflowSteps } from "@/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding realistic sample packages and workflows for Consultation Services...");

  const existingPkgs = await db.select().from(packages);
  if (existingPkgs.length > 0) {
    console.log("Packages already exist in database. Skipping seed.");
    process.exit(0);
  }

  // 1. Create Package 1
  const [pkg1] = await db
    .insert(packages)
    .values({
      packageName: "Standard Architectural Consultation",
      mainServiceId: 3,
      packageRatePerSqFt: "45.00",
      packagePriority: "Standard",
      displayOrder: 1,
      isActive: true,
      showRatePublicly: true,
    })
    .$returningId();

  // Link SubServices 2, 3, 4
  await db.insert(packageSubservices).values([
    { packageId: pkg1.id, subServiceId: 2 },
    { packageId: pkg1.id, subServiceId: 3 },
    { packageId: pkg1.id, subServiceId: 4 },
  ]);

  // 2. Create Package 2
  const [pkg2] = await db
    .insert(packages)
    .values({
      packageName: "Executive Design & Engineering Package",
      mainServiceId: 3,
      packageRatePerSqFt: "85.00",
      packagePriority: "Executive",
      displayOrder: 2,
      isActive: true,
      showRatePublicly: true,
    })
    .$returningId();

  // Link SubServices 2, 3, 4, 5, 6, 7
  await db.insert(packageSubservices).values([
    { packageId: pkg2.id, subServiceId: 2 },
    { packageId: pkg2.id, subServiceId: 3 },
    { packageId: pkg2.id, subServiceId: 4 },
    { packageId: pkg2.id, subServiceId: 5 },
    { packageId: pkg2.id, subServiceId: 6 },
    { packageId: pkg2.id, subServiceId: 7 },
  ]);

  // 3. Create Workflows if none exist
  const existingWf = await db.select().from(workflows);
  if (existingWf.length === 0) {
    // Workflow for SubService 2
    const [wf1] = await db
      .insert(workflows)
      .values({
        subServiceId: 2,
        title: "2D Conceptual & Spatial Planning Workflow",
        isActive: true,
      })
      .$returningId();

    await db.insert(workflowSteps).values([
      {
        workflowId: wf1.id,
        stepNumber: 1,
        title: "Topographical Analysis & Site Orientation",
        details: "Analysis of sun path, wind dynamics, boundary offsets, and zoning bylaws.",
        displayOrder: 1,
      },
      {
        workflowId: wf1.id,
        stepNumber: 2,
        title: "Functional Spatial Adjacencies & Zoning",
        details: "Organizing social, private, and service areas for ergonomic circulation.",
        displayOrder: 2,
      },
      {
        workflowId: wf1.id,
        stepNumber: 3,
        title: "Architectural CAD Floor Plan Drafting",
        details: "Detailed dimensioned millimeter layouts, wall schedules, and opening positions.",
        displayOrder: 3,
      },
      {
        workflowId: wf1.id,
        stepNumber: 4,
        title: "Client Iteration & Municipal Approvals Preparation",
        details: "Refining draft per client feedback and preparing approval-ready blueprints.",
        displayOrder: 4,
      },
    ]);

    // Workflow for SubService 3
    const [wf2] = await db
      .insert(workflows)
      .values({
        subServiceId: 3,
        title: "Photorealistic 3D Elevation Modeling Workflow",
        isActive: true,
      })
      .$returningId();

    await db.insert(workflowSteps).values([
      {
        workflowId: wf2.id,
        stepNumber: 1,
        title: "3D Volumetric Massing",
        details: "Translating approved 2D architectural footprints into physical 3D mass.",
        displayOrder: 1,
      },
      {
        workflowId: wf2.id,
        stepNumber: 2,
        title: "Material Texturing & Environmental Lighting",
        details: "Application of tactile materials, stone claddings, metal louvers, and solar simulation.",
        displayOrder: 2,
      },
      {
        workflowId: wf2.id,
        stepNumber: 3,
        title: "4K High-Resolution Perspective Rendering",
        details: "Multi-angle photorealistic render generation showcasing the finished exterior.",
        displayOrder: 3,
      },
    ]);
  }

  console.log("Successfully seeded initial packages and workflows!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
