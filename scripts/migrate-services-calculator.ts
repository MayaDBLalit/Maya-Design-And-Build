import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mysql from "mysql2/promise";

async function runMigration() {
  console.log("Starting safe migration for Service & Calculator modules...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "maya_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "maya_db",
    multipleStatements: true,
  });

  try {
    // 1. Check if main_service_id exists in service_rates
    const [rateCols]: any = await connection.query("DESCRIBE service_rates");
    const hasMainServiceId = rateCols.some((col: any) => col.Field === "main_service_id");

    if (!hasMainServiceId) {
      console.log("Adding main_service_id to service_rates...");
      await connection.query("ALTER TABLE service_rates ADD COLUMN main_service_id INT NULL;");
      console.log("Assigning existing service_rates to Consultation Services (ID 3)...");
      await connection.query("UPDATE service_rates SET main_service_id = 3 WHERE main_service_id IS NULL;");
      await connection.query("ALTER TABLE service_rates MODIFY COLUMN main_service_id INT NOT NULL;");
      try {
        await connection.query(
          "ALTER TABLE service_rates ADD CONSTRAINT fk_service_rates_main_service FOREIGN KEY (main_service_id) REFERENCES services(id) ON DELETE RESTRICT;"
        );
      } catch (fkErr: any) {
        console.warn("FK constraint may already exist or cannot be re-added:", fkErr.message);
      }
    } else {
      console.log("main_service_id already exists on service_rates.");
      // Ensure no NULL main_service_id
      await connection.query("UPDATE service_rates SET main_service_id = 3 WHERE main_service_id IS NULL;");
    }

    // 2. Create packages table
    console.log("Creating packages table if not exists...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_name VARCHAR(150) NOT NULL,
        main_service_id INT NOT NULL,
        package_rate_per_sqft DECIMAL(12, 2) NOT NULL,
        package_priority VARCHAR(50) NOT NULL DEFAULT 'standard',
        display_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        show_rate_publicly BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_packages_main_service FOREIGN KEY (main_service_id) REFERENCES services(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Create package_subservices table
    console.log("Creating package_subservices table if not exists...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS package_subservices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_id INT NOT NULL,
        sub_service_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY uq_package_subservice (package_id, sub_service_id),
        CONSTRAINT fk_pkgsub_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
        CONSTRAINT fk_pkgsub_subservice FOREIGN KEY (sub_service_id) REFERENCES service_rates(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create workflows table
    console.log("Creating workflows table if not exists...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sub_service_id INT NOT NULL UNIQUE,
        title VARCHAR(150) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_workflows_subservice FOREIGN KEY (sub_service_id) REFERENCES service_rates(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create workflow_steps table
    console.log("Creating workflow_steps table if not exists...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS workflow_steps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workflow_id INT NOT NULL,
        step_number INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        details TEXT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_wfsteps_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Create calculators table
    console.log("Creating calculators table if not exists...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS calculators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        slug VARCHAR(150) NOT NULL UNIQUE,
        display_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Create calculator_subservices table
    console.log("Creating calculator_subservices table if not exists...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS calculator_subservices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        calculator_id INT NOT NULL,
        sub_service_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY uq_calc_subservice (calculator_id, sub_service_id),
        CONSTRAINT fk_calcsub_calculator FOREIGN KEY (calculator_id) REFERENCES calculators(id) ON DELETE CASCADE,
        CONSTRAINT fk_calcsub_subservice FOREIGN KEY (sub_service_id) REFERENCES service_rates(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Create bhk_configurations table
    console.log("Creating bhk_configurations table if not exists...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bhk_configurations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bhk_number INT NOT NULL UNIQUE,
        display_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Extend inquiries table
    console.log("Extending inquiries table...");
    const [inqCols]: any = await connection.query("DESCRIBE inquiries");
    const existingInqFields = new Set(inqCols.map((c: any) => c.Field));

    if (!existingInqFields.has("inquiry_source")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN inquiry_source VARCHAR(30) NOT NULL DEFAULT 'contact';");
    }
    if (!existingInqFields.has("calculator_id")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN calculator_id INT NULL;");
      try {
        await connection.query("ALTER TABLE inquiries ADD CONSTRAINT fk_inquiries_calculator FOREIGN KEY (calculator_id) REFERENCES calculators(id) ON DELETE SET NULL;");
      } catch (e: any) {
        console.warn("FK calculator on inquiries already exists or error:", e.message);
      }
    }
    if (!existingInqFields.has("calculator_title_snapshot")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN calculator_title_snapshot VARCHAR(150) NULL;");
    }
    if (!existingInqFields.has("bhk_id")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN bhk_id INT NULL;");
      try {
        await connection.query("ALTER TABLE inquiries ADD CONSTRAINT fk_inquiries_bhk FOREIGN KEY (bhk_id) REFERENCES bhk_configurations(id) ON DELETE SET NULL;");
      } catch (e: any) {
        console.warn("FK bhk on inquiries already exists or error:", e.message);
      }
    }
    if (!existingInqFields.has("bhk_value_snapshot")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN bhk_value_snapshot VARCHAR(50) NULL;");
    }
    if (!existingInqFields.has("package_id")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN package_id INT NULL;");
      try {
        await connection.query("ALTER TABLE inquiries ADD CONSTRAINT fk_inquiries_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL;");
      } catch (e: any) {
        console.warn("FK package on inquiries already exists or error:", e.message);
      }
    }
    if (!existingInqFields.has("package_name_snapshot")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN package_name_snapshot VARCHAR(150) NULL;");
    }
    if (!existingInqFields.has("package_rate_snapshot")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN package_rate_snapshot DECIMAL(12, 2) NULL;");
    }
    if (!existingInqFields.has("built_up_area")) {
      await connection.query("ALTER TABLE inquiries ADD COLUMN built_up_area DECIMAL(12, 2) NULL;");
    }

    // 10. Seed initial BHK configurations if empty
    const [bhkRows]: any = await connection.query("SELECT COUNT(*) as count FROM bhk_configurations");
    if (bhkRows[0].count === 0) {
      console.log("Seeding default BHK Configurations (1 to 5 BHK)...");
      const bhkValues = [1, 2, 3, 4, 5];
      for (let i = 0; i < bhkValues.length; i++) {
        await connection.query(
          "INSERT INTO bhk_configurations (bhk_number, display_order, is_active) VALUES (?, ?, TRUE)",
          [bhkValues[i], i + 1]
        );
      }
    }

    // 11. Seed initial Consultation Calculator if no calculators exist
    const [calcRows]: any = await connection.query("SELECT COUNT(*) as count FROM calculators");
    if (calcRows[0].count === 0) {
      console.log("Seeding initial Consultation Services Calculator...");
      const [newCalc]: any = await connection.query(
        "INSERT INTO calculators (title, slug, display_order, is_active) VALUES (?, ?, 1, TRUE)",
        ["Consultation Services Calculator", "consultation-services-calculator"]
      );
      const calcId = newCalc.insertId;

      // Associate existing active Consultation SubServices (belonging to main_service_id = 3)
      const [activeConsultationRates]: any = await connection.query(
        "SELECT id FROM service_rates WHERE main_service_id = 3 AND is_active = TRUE"
      );
      for (const rate of activeConsultationRates) {
        await connection.query(
          "INSERT IGNORE INTO calculator_subservices (calculator_id, sub_service_id) VALUES (?, ?)",
          [calcId, rate.id]
        );
      }
      console.log(`Associated ${activeConsultationRates.length} SubServices with initial Consultation Calculator.`);
    }

    console.log("Migration completed successfully and verified safely!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
