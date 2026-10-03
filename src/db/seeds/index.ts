import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../schema";
import { eq } from "drizzle-orm";

async function runSeed() {
  console.log("🌱 Starting MAYA Design & Build Database Seed...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "maya_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "maya_db",
  });

  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // --------------------------------------------------------------------------
    // 1. SEED UNITS
    // --------------------------------------------------------------------------
    console.log("-> Seeding units...");
    const initialUnits = [
      { unitName: "lumpsum", unitSymbol: "LS", description: "Fixed lumpsum charge per deliverable" },
      { unitName: "sqft", unitSymbol: "sq.ft", description: "Per square foot of built-up area" },
      { unitName: "view", unitSymbol: "view", description: "Per 3D architectural perspective view" },
      { unitName: "visit", unitSymbol: "visit", description: "Per on-site civil engineering inspection visit" },
    ];

    const unitMap: Record<string, number> = {};

    for (const u of initialUnits) {
      const existing = await db
        .select()
        .from(schema.units)
        .where(eq(schema.units.unitName, u.unitName))
        .limit(1);

      if (existing.length === 0) {
        const [inserted] = await db.insert(schema.units).values(u).$returningId();
        unitMap[u.unitName] = inserted.id;
      } else {
        unitMap[u.unitName] = existing[0].id;
      }
    }

    // --------------------------------------------------------------------------
    // 2. SEED INITIAL QUOTATION RATES (Derived from Service Charge.png)
    // --------------------------------------------------------------------------
    console.log("-> Seeding initial quotation rates (Initial seed only; fully dynamic in Admin)...");
    const initialRates = [
      {
        serviceName: "First Visit Charge",
        unitId: unitMap["lumpsum"],
        baseRate: "3000.00",
        rateType: "fixed",
        defaultQty: "1.00",
        displayOrder: 1,
      },
      {
        serviceName: "Architectural",
        unitId: unitMap["sqft"],
        baseRate: "20.00",
        rateType: "per_sqft",
        defaultQty: "2000.00",
        displayOrder: 2,
      },
      {
        serviceName: "Structural",
        unitId: unitMap["sqft"],
        baseRate: "20.00",
        rateType: "per_sqft",
        defaultQty: "2000.00",
        displayOrder: 3,
      },
      {
        serviceName: "Electrical",
        unitId: unitMap["sqft"],
        baseRate: "10.00",
        rateType: "per_sqft",
        defaultQty: "2000.00",
        displayOrder: 4,
      },
      {
        serviceName: "Plumbing",
        unitId: unitMap["sqft"],
        baseRate: "10.00",
        rateType: "per_sqft",
        defaultQty: "2000.00",
        displayOrder: 5,
      },
      {
        serviceName: "Interior",
        unitId: unitMap["sqft"],
        baseRate: "50.00",
        rateType: "per_sqft",
        defaultQty: "2000.00",
        displayOrder: 6,
      },
      {
        serviceName: "Working Details",
        unitId: unitMap["sqft"],
        baseRate: "20.00",
        rateType: "per_sqft",
        defaultQty: "2000.00",
        displayOrder: 7,
      },
      {
        serviceName: "3D & Presentation",
        unitId: unitMap["view"],
        baseRate: "4500.00",
        rateType: "per_view",
        defaultQty: "5.00",
        displayOrder: 8,
      },
      {
        serviceName: "BOQ & Costing",
        unitId: unitMap["lumpsum"],
        baseRate: "15000.00",
        rateType: "fixed",
        defaultQty: "1.00",
        displayOrder: 9,
      },
      {
        serviceName: "Site Execution",
        unitId: unitMap["visit"],
        baseRate: "3500.00",
        rateType: "per_visit",
        defaultQty: "5.00",
        displayOrder: 10,
      },
    ];

    for (const r of initialRates) {
      const existing = await db
        .select()
        .from(schema.serviceRates)
        .where(eq(schema.serviceRates.serviceName, r.serviceName))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.serviceRates).values(r);
      }
    }

    // --------------------------------------------------------------------------
    // 3. SEED 4 CORE SERVICES
    // --------------------------------------------------------------------------
    console.log("-> Seeding the 4 Core Pillar Services...");
    const coreServices = [
      {
        title: "Interior Design",
        slug: "interior-design",
        shortDescription:
          "Bespoke, functional, and aesthetically harmonious interior environments tailored to elevate living and commercial spaces.",
        detailedContent:
          "From conceptual floor layouts, material palettes, and lighting design to custom furniture detailing and turnkey fit-outs, our interior design methodology integrates spatial harmony with tactile comfort.",
        displayOrder: 1,
      },
      {
        title: "Architectural Visualization",
        slug: "architectural-visualization",
        shortDescription:
          "High-definition 3D renderings, elevations, and spatial walk-throughs bringing blueprints into photorealistic clarity.",
        detailedContent:
          "We craft detailed architectural drawings, 2D working layouts, and photorealistic 3D perspectives to help clients visualize light, geometry, and textures long before foundation casting begins.",
        displayOrder: 2,
      },
      {
        title: "Project Management Services (PMS)",
        slug: "project-management-services",
        shortDescription:
          "Scientific site supervision, daily progress reporting, rigorous material checks, and timeline management.",
        detailedContent:
          "Our engineering PMS eliminates the four major industry hazards: cost overruns, delays, poor workmanship, and low productivity through full-day site supervision, BOQ audits, and 3-stage casting checklists.",
        displayOrder: 3,
      },
      {
        title: "Turnkey Construction",
        slug: "turnkey-construction",
        shortDescription:
          "Complete end-to-end building execution from excavation and structural casting to final handover.",
        detailedContent:
          "Total construction peace of mind. We handle material procurement, structural engineering, contractor orchestration, and quality assurance under one accountable contract.",
        displayOrder: 4,
      },
    ];

    for (const s of coreServices) {
      const existing = await db
        .select()
        .from(schema.services)
        .where(eq(schema.services.slug, s.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.services).values(s);
      }
    }

    // --------------------------------------------------------------------------
    // 4. SEED CORE TEAM PROFILES
    // --------------------------------------------------------------------------
    console.log("-> Seeding initial team profiles...");
    const initialTeam = [
      {
        fullName: "Er. Lalit Choudhary",
        roleTitle: "Founder & Project Manager",
        education: "B.Tech Civil Engineering",
        experienceYears: "5+ Years Exp.",
        bio: "Project management specialist leading MAYA Design & Build since 2021 with comprehensive expertise in high-precision structural execution and project controls.",
        displayOrder: 1,
      },
      {
        fullName: "Er. Mitesh Patel",
        roleTitle: "Senior Civil / Execution Engineer",
        education: "Diploma Civil Engineering",
        experienceYears: "36 Years Exp.",
        bio: "Senior construction veteran with nearly four decades of hands-on structural casting, site leadership, and field execution mastery.",
        displayOrder: 2,
      },
      {
        fullName: "Er. Mahan Jadav",
        roleTitle: "Structural Engineer",
        education: "M.Tech Structural Engineering",
        experienceYears: "4 Years Exp.",
        bio: "Specialist in structural load computations, seismic resilience, foundation design, and technical drawing audits.",
        displayOrder: 3,
      },
      {
        fullName: "Ar. Ayush Parmar",
        roleTitle: "Architectural Designer",
        education: "Diploma Architecture",
        experienceYears: "1+ Year Exp.",
        bio: "Focuses on modern spatial aesthetics, 3D visualization, elevation drafting, and functional layout optimization.",
        displayOrder: 4,
      },
      {
        fullName: "Er. Tejas Gamit",
        roleTitle: "Civil Engineer",
        education: "B.Tech Civil Engineering",
        experienceYears: "5 Years Exp.",
        bio: "Civil engineering professional specializing in site supervision, casting checklists, and daily progress reporting.",
        displayOrder: 5,
      },
    ];

    for (const t of initialTeam) {
      const existing = await db
        .select()
        .from(schema.teamMembers)
        .where(eq(schema.teamMembers.fullName, t.fullName))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.teamMembers).values(t);
      }
    }

    // --------------------------------------------------------------------------
    // 5. SEED WEBSITE SETTINGS
    // --------------------------------------------------------------------------
    console.log("-> Seeding default website settings...");
    const initialSettings = [
      { keyName: "site_name", valueContent: "MAYA Design & Build", groupName: "general" },
      { keyName: "tagline", valueContent: "Designing Elegance, Building Legacy", groupName: "general" },
      { keyName: "contact_phone", valueContent: "+91 8980703374", groupName: "contact" },
      { keyName: "contact_email", valueContent: "mayadb01@gmail.com", groupName: "contact" },
      {
        keyName: "contact_address",
        valueContent: "Shop 5, Seven leaf arcade, Dhamdod-Lumbha Road, Bardoli, Dis. Surat",
        groupName: "contact",
      },
      {
        keyName: "google_maps_url",
        valueContent: "https://maps.app.goo.gl/gq8gfLLBnNVpSShk9",
        groupName: "contact",
      },
      {
        keyName: "instagram_url",
        valueContent: "https://www.instagram.com/er.lalit108?stkn=Y29mdmZuc3Q5Njd5",
        groupName: "social",
      },
      {
        keyName: "facebook_url",
        valueContent: "https://www.facebook.com/share/1DcTRnXJky/?mibextid=wwXIfr",
        groupName: "social",
      },
      {
        keyName: "terms_and_conditions",
        valueContent:
          "## Terms & Conditions\n\nWelcome to MAYA Design & Build. All estimations, drawings, and consultation proposals provided through this platform represent indicative commercial terms subject to physical site inspection and executed engineering contracts.",
        groupName: "legal",
      },
      {
        keyName: "privacy_policy",
        valueContent:
          "## Privacy Policy\n\nMAYA Design & Build respects your privacy. Any personal information (name, contact number, email, and project location) submitted through our consultation or quotation forms is used solely for project communication and estimation.",
        groupName: "legal",
      },
    ];

    for (const st of initialSettings) {
      const existing = await db
        .select()
        .from(schema.settings)
        .where(eq(schema.settings.keyName, st.keyName))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.settings).values(st);
      }
    }

    console.log("✅ Seed completed successfully!");
  } finally {
    await connection.end();
  }
}

runSeed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
