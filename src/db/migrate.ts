import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

async function runMigration() {
  console.log("🔄 Connecting to MySQL 8.4 to apply migrations...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "maya_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "maya_db",
    multipleStatements: true,
  });

  const db = drizzle(connection);

  try {
    console.log("-> Applying migration files from ./src/db/migrations...");
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("✅ All migrations applied successfully!");
  } finally {
    await connection.end();
  }
}

runMigration().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
