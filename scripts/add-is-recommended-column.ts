import { db } from "@/db";
import { sql } from "drizzle-orm";

async function addIsRecommendedColumn() {
  console.log("Checking if is_recommended column exists in packages table...");
  const [cols]: any = await db.execute(sql`DESCRIBE packages`);
  const hasCol = cols.some((c: any) => c.Field === "is_recommended");

  if (!hasCol) {
    console.log("Adding is_recommended column to packages table...");
    await db.execute(sql`ALTER TABLE packages ADD COLUMN is_recommended TINYINT(1) NOT NULL DEFAULT 0`);
    console.log("Successfully added is_recommended column!");
  } else {
    console.log("Column is_recommended already exists.");
  }

  process.exit(0);
}

addIsRecommendedColumn().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
