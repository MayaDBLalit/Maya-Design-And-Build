import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mysql from "mysql2/promise";

async function verifyDatabase() {
  console.log("🔍 Checking MySQL 8.4 Database State for maya_db...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "maya_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "maya_db",
  });

  try {
    // 1. Check Tables
    const [tableRows] = await connection.query("SHOW TABLES;");
    const tables = (tableRows as any[]).map((r) => Object.values(r)[0]);
    console.log(`\n📋 Tables Found (${tables.length}):`);
    tables.forEach((t) => console.log(`   - ${t}`));

    // 2. Check Services
    const [services] = await connection.query(
      "SELECT id, title, slug, display_order, is_active FROM services ORDER BY display_order;"
    );
    console.log(`\n🏗️ 4 Core Services (${(services as any[]).length}):`);
    (services as any[]).forEach((s) =>
      console.log(`   [${s.display_order}] ${s.title} (${s.slug}) - Active: ${Boolean(s.is_active)}`)
    );

    // 3. Check Units
    const [units] = await connection.query("SELECT id, unit_name, unit_symbol FROM units;");
    console.log(`\n📐 Measurement Units (${(units as any[]).length}):`);
    (units as any[]).forEach((u) => console.log(`   - ${u.unit_name} (${u.unit_symbol})`));

    // 4. Check Quotation Rates
    const [rates] = await connection.query(`
      SELECT sr.display_order, sr.service_name, u.unit_name, sr.base_rate, sr.rate_type, sr.default_qty
      FROM service_rates sr
      JOIN units u ON sr.unit_id = u.id
      ORDER BY sr.display_order;
    `);
    console.log(`\n💰 Quotation Catalog Disciplines (${(rates as any[]).length}):`);
    (rates as any[]).forEach((r) =>
      console.log(
        `   [${r.display_order}] ${r.service_name} | Unit: ${r.unit_name} | Rate: ₹${r.base_rate} | Type: ${r.rate_type} | Default Qty: ${r.default_qty}`
      )
    );

    // 5. Check Team Members
    const [team] = await connection.query(
      "SELECT display_order, full_name, role_title, experience_years FROM team_members ORDER BY display_order;"
    );
    console.log(`\n👥 Team Members (${(team as any[]).length}):`);
    (team as any[]).forEach((tm) =>
      console.log(`   [${tm.display_order}] ${tm.full_name} — ${tm.role_title} (${tm.experience_years})`)
    );

    // 6. Check Settings
    const [settings] = await connection.query("SELECT key_name, group_name FROM settings;");
    console.log(`\n⚙️ Website Settings Entries (${(settings as any[]).length}):`);
    (settings as any[]).forEach((st) => console.log(`   - ${st.key_name} [${st.group_name}]`));

    console.log("\n✅ Database verification completed successfully!");
  } finally {
    await connection.end();
  }
}

verifyDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Verification failed:", err.message);
    process.exit(1);
  });
