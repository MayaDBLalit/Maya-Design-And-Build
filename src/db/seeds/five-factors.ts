import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../schema";
import { eq } from "drizzle-orm";

export const INITIAL_FIVE_FACTORS = [
  {
    factorType: "space",
    titleEnglish: "Space",
    titleHindi: "आकाश",
    iconImage: "/images/factors/space.svg",
    tagline: "Volumetric harmony, daylight sightlines, and circulation.",
    detailsText:
      "Architecture begins with sculpting the void. At MAYA, we calculate human circulation vectors, ceiling proportion ratios, and open column-free expanses so interiors feel expansive, dignified, and intuitively connected to nature.",
    impactPoints: [
      "Daylight Penetration",
      "Sense of Infinite Openness",
      "Harmonious Ceiling Proportions",
      "Uncluttered Circulation",
    ],
  },
  {
    factorType: "air",
    titleEnglish: "Air",
    titleHindi: "वायु",
    iconImage: "/images/factors/air.svg",
    tagline: "Microclimate modeling, passive cross-ventilation, and thermal air buoyancy.",
    detailsText:
      "A healthy building breathes with its geography. We study seasonal wind patterns across South Gujarat to position fenestrations, double-glazed louvers, and vertical ventilation shafts for constant natural breeze.",
    impactPoints: [
      "Airflow",
      "Sense of Freedom",
      "Temperature Regulation",
      "Smooth Transitions",
    ],
  },
  {
    factorType: "fire",
    titleEnglish: "Fire",
    titleHindi: "अग्नि",
    iconImage: "/images/factors/fire.svg",
    tagline: "Sun-path trajectory mapping, glare-free daylighting, and energy balance.",
    detailsText:
      "Natural light defines emotional warmth and architectural depth. We map sun angles for each facade throughout the calendar year, engineering cantilevered overhangs and thermal glass that harvest soft ambient daylight.",
    impactPoints: [
      "Natural Illumination",
      "Thermal Comfort Balance",
      "Cantilevered Glare Shading",
      "Diurnal Rhythm Harmony",
    ],
  },
  {
    factorType: "water",
    titleEnglish: "Water",
    titleHindi: "जल",
    iconImage: "/images/factors/water.svg",
    tagline: "Calmness. Flow. Reflection.",
    detailsText:
      "Water sustains life, reflecting sky and light into the living realm. We engineer tranquil reflection pools, hydraulic circulation, and water features that ground the domestic space in serenity and cooling breezes.",
    impactPoints: [
      "Hydraulic Balance",
      "Microclimate Cooling",
      "Acoustic Tranquility",
      "Reflective Light Play",
    ],
  },
  {
    factorType: "earth",
    titleEnglish: "Earth",
    titleHindi: "पृथ्वी",
    iconImage: "/images/factors/earth.svg",
    tagline: "Geotechnical foundations, authentic textures, and tactile grounding.",
    detailsText:
      "Every lasting structure is rooted deep in the earth. We specify custom reinforced concrete footings and celebrate authentic textures: Indian granite, travertine, kiln-fired bricks, seasoned teak, and architectural stone.",
    impactPoints: [
      "Geotechnical Stability",
      "Tactile Material Honesty",
      "Seismic Resilience",
      "Thermal Mass Retention",
    ],
  },
];

export async function seedFiveFactors() {
  console.log("🌱 Setting up Five Factors table & seed data...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "maya_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "maya_db",
  });

  try {
    // 1. Ensure table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`five_factors\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`factor_type\` varchar(50) NOT NULL,
        \`title_english\` varchar(150) NOT NULL,
        \`title_hindi\` varchar(150) NOT NULL,
        \`icon_image\` varchar(500),
        \`tagline\` varchar(255),
        \`details_text\` text,
        \`impact_points\` json,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`five_factors_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`five_factors_factor_type_unique\` UNIQUE(\`factor_type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const db = drizzle(connection, { schema, mode: "default" });

    // 2. Check and insert records
    for (const factor of INITIAL_FIVE_FACTORS) {
      const existing = await db
        .select()
        .from(schema.fiveFactors)
        .where(eq(schema.fiveFactors.factorType, factor.factorType))
        .limit(1);

      if (existing.length === 0) {
        console.log(`-> Inserting initial factor: ${factor.factorType} (${factor.titleEnglish} / ${factor.titleHindi})`);
        await db.insert(schema.fiveFactors).values(factor);
      } else {
        console.log(`-> Factor exists: ${factor.factorType}`);
      }
    }

    console.log("✅ Five Factors table and seed records verified successfully.");
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  seedFiveFactors().catch((err) => {
    console.error("❌ Failed to seed Five Factors:", err);
    process.exit(1);
  });
}
