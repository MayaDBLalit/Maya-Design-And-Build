import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../lib/auth";

async function seedAdminUser() {
  console.log("🔐 Starting Admin User Provisioning...");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminName = process.env.ADMIN_NAME || "Administrator";
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminEmail || !initialPassword) {
    console.error(
      "❌ Error: ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must be configured in your local .env file."
    );
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "maya_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "maya_db",
  });

  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // Check if account already exists
    const [existing] = await db
      .select({ id: schema.adminUsers.id, email: schema.adminUsers.email })
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.email, adminEmail.toLowerCase().trim()))
      .limit(1);

    if (existing) {
      console.log(`ℹ️ Admin account for '${adminEmail}' already exists (ID: ${existing.id}). Skipping.`);
      return;
    }

    console.log("-> Hashing password using BCrypt (12 salt rounds)...");
    const passwordHash = await hashPassword(initialPassword);

    console.log("-> Inserting admin user record into admin_users...");
    await db.insert(schema.adminUsers).values({
      email: adminEmail.toLowerCase().trim(),
      fullName: adminName.trim(),
      passwordHash: passwordHash,
      role: "admin",
    });

    console.log("✅ Admin account provisioned successfully!");
  } finally {
    await connection.end();
  }
}

seedAdminUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Admin provisioning failed:", err);
    process.exit(1);
  });
