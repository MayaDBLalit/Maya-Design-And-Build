-- ==============================================================================
-- MAYA DESIGN & BUILD — LOCAL DATABASE & DEDICATED USER PROVISIONING SCRIPT
-- ==============================================================================
-- Target Engine: MySQL Server 8.4
-- Instructions:
-- 1. Open MySQL Workbench (connected with your administrative account).
-- 2. Execute the queries below (choose your own secure password for 'YOUR_PASSWORD_HERE').
-- 3. Copy .env.example to .env and place that same password in the DB_PASSWORD field.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `maya_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'maya_user'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD_HERE';

GRANT ALL PRIVILEGES ON `maya_db`.* TO 'maya_user'@'localhost';

FLUSH PRIVILEGES;
