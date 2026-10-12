import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  bigint,
  json,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ==============================================================================
// 1. ADMIN USERS TABLE
// ==============================================================================
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 2. UNITS TABLE (Dynamic rate units e.g. lumpsum, sqft, view, visit)
// ==============================================================================
export const units = mysqlTable("units", {
  id: int("id").primaryKey().autoincrement(),
  unitName: varchar("unit_name", { length: 50 }).notNull().unique(),
  unitSymbol: varchar("unit_symbol", { length: 20 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==============================================================================
// 3. MAIN SERVICES TABLE (Top-Level Services e.g. Consultation, Turnkey)
// ==============================================================================
export const services = mysqlTable("services", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  shortDescription: varchar("short_description", { length: 500 }),
  detailedContent: text("detailed_content"),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  displayOrder: int("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 4. SUBSERVICES TABLE (Previously service_rates, now linked to Main Service)
// ==============================================================================
export const serviceRates = mysqlTable("service_rates", {
  id: int("id").primaryKey().autoincrement(),
  mainServiceId: int("main_service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),
  serviceName: varchar("service_name", { length: 150 }).notNull(),
  unitId: int("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "restrict" }),
  baseRate: decimal("base_rate", { precision: 12, scale: 2 }).notNull(),
  rateType: varchar("rate_type", { length: 30 })
    .notNull()
    .default("per_sqft"), // 'fixed', 'per_sqft', 'per_view', 'per_visit', 'percentage'
  defaultQty: decimal("default_qty", { precision: 12, scale: 2 }).notNull().default("1.00"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: int("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 5. PACKAGES TABLE (Belongs to Main Service, contains multiple SubServices)
// ==============================================================================
export const packages = mysqlTable("packages", {
  id: int("id").primaryKey().autoincrement(),
  packageName: varchar("package_name", { length: 150 }).notNull(),
  mainServiceId: int("main_service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),
  packageRatePerSqFt: decimal("package_rate_per_sqft", { precision: 12, scale: 2 }).notNull(),
  packagePriority: varchar("package_priority", { length: 50 }).notNull().default("standard"),
  displayOrder: int("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  showRatePublicly: boolean("show_rate_publicly").notNull().default(false),
  isRecommended: boolean("is_recommended").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 6. PACKAGE SUBSERVICES JUNCTION TABLE (Many-to-Many)
// ==============================================================================
export const packageSubservices = mysqlTable("package_subservices", {
  id: int("id").primaryKey().autoincrement(),
  packageId: int("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  subServiceId: int("sub_service_id")
    .notNull()
    .references(() => serviceRates.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==============================================================================
// 7. WORKFLOWS TABLE (1 Workflow maximum per SubService)
// ==============================================================================
export const workflows = mysqlTable("workflows", {
  id: int("id").primaryKey().autoincrement(),
  subServiceId: int("sub_service_id")
    .notNull()
    .unique()
    .references(() => serviceRates.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 150 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 8. WORKFLOW STEPS TABLE (Dynamic steps per Workflow)
// ==============================================================================
export const workflowSteps = mysqlTable("workflow_steps", {
  id: int("id").primaryKey().autoincrement(),
  workflowId: int("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  stepNumber: int("step_number").notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  details: text("details"),
  displayOrder: int("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 9. CALCULATORS TABLE (Independent Module, not tied to Main Service)
// ==============================================================================
export const calculators = mysqlTable("calculators", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  displayOrder: int("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 10. CALCULATOR SUBSERVICES JUNCTION TABLE (Many-to-Many)
// ==============================================================================
export const calculatorSubservices = mysqlTable("calculator_subservices", {
  id: int("id").primaryKey().autoincrement(),
  calculatorId: int("calculator_id")
    .notNull()
    .references(() => calculators.id, { onDelete: "cascade" }),
  subServiceId: int("sub_service_id")
    .notNull()
    .references(() => serviceRates.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==============================================================================
// 11. BHK CONFIGURATIONS TABLE (Informational BHK Options)
// ==============================================================================
export const bhkConfigurations = mysqlTable("bhk_configurations", {
  id: int("id").primaryKey().autoincrement(),
  bhkNumber: int("bhk_number").notNull().unique(),
  displayOrder: int("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 12. PROJECTS TABLE (Completed, Ongoing, Upcoming + Before/After Elevation)
// ==============================================================================
export const projects = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  category: varchar("category", { length: 30 }).notNull().default("completed"), // 'completed', 'ongoing', 'upcoming'
  location: varchar("location", { length: 200 }),
  clientName: varchar("client_name", { length: 150 }),
  clientNumber: varchar("client_number", { length: 50 }),
  costEstimate: decimal("cost_estimate", { precision: 14, scale: 2 }),
  description: text("description"),
  mainImageUrl: varchar("main_image_url", { length: 500 }),
  oldElevationUrl: varchar("old_elevation_url", { length: 500 }),
  newElevationUrl: varchar("new_elevation_url", { length: 500 }),
  displayOrder: int("display_order").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 13. PROJECT MEDIA TABLE (Multi-image & video gallery per project)
// ==============================================================================
export const projectMedia = mysqlTable("project_media", {
  id: int("id").primaryKey().autoincrement(),
  projectId: int("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  mediaUrl: varchar("media_url", { length: 500 }).notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull().default("image"), // 'image', 'video'
  displayOrder: int("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==============================================================================
// 14. TEAM MEMBERS TABLE (Engineers & Project Managers)
// ==============================================================================
export const teamMembers = mysqlTable("team_members", {
  id: int("id").primaryKey().autoincrement(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  roleTitle: varchar("role_title", { length: 150 }).notNull(),
  education: varchar("education", { length: 150 }),
  experienceYears: varchar("experience_years", { length: 50 }),
  bio: text("bio"),
  imageUrl: varchar("image_url", { length: 500 }),
  displayOrder: int("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 15. GALLERY TABLE (Images & Videos <= 1 min, <= 50 MB)
// ==============================================================================
export const gallery = mysqlTable("gallery", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 200 }).notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull().default("image"), // 'image', 'video'
  mediaUrl: varchar("media_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  durationSeconds: int("duration_seconds"),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
  displayOrder: int("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==============================================================================
// 16. INQUIRIES TABLE (Leads & Consultation / Calculator / Package Requests)
// ==============================================================================
export const inquiries = mysqlTable("inquiries", {
  id: int("id").primaryKey().autoincrement(),
  inquirySource: varchar("inquiry_source", { length: 30 }).notNull().default("contact"), // 'contact', 'calculator', 'package'
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  interestedService: varchar("interested_service", { length: 150 }),
  message: text("message"),
  tentativeBudget: decimal("tentative_budget", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 30 }).notNull().default("new"), // 'new', 'contacted', 'in_progress', 'closed'
  adminNotes: text("admin_notes"),

  // Context snapshots for Calculator & Package inquiries
  calculatorId: int("calculator_id").references(() => calculators.id, { onDelete: "set null" }),
  calculatorTitleSnapshot: varchar("calculator_title_snapshot", { length: 150 }),
  bhkId: int("bhk_id").references(() => bhkConfigurations.id, { onDelete: "set null" }),
  bhkValueSnapshot: varchar("bhk_value_snapshot", { length: 50 }),
  packageId: int("package_id").references(() => packages.id, { onDelete: "set null" }),
  packageNameSnapshot: varchar("package_name_snapshot", { length: 150 }),
  packageRateSnapshot: decimal("package_rate_snapshot", { precision: 12, scale: 2 }),
  builtUpArea: decimal("built_up_area", { precision: 12, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 17. INQUIRY ITEMS TABLE (Line-item breakdown with snapshots)
// ==============================================================================
export const inquiryItems = mysqlTable("inquiry_items", {
  id: int("id").primaryKey().autoincrement(),
  inquiryId: int("inquiry_id")
    .notNull()
    .references(() => inquiries.id, { onDelete: "cascade" }),
  serviceRateId: int("service_rate_id")
    .references(() => serviceRates.id, { onDelete: "set null" }),
  serviceNameSnapshot: varchar("service_name_snapshot", { length: 150 }).notNull(),
  unitNameSnapshot: varchar("unit_name_snapshot", { length: 50 }).notNull(),
  unitRateSnapshot: decimal("unit_rate_snapshot", { precision: 12, scale: 2 }).notNull(),
  userQuantity: decimal("user_quantity", { precision: 12, scale: 2 }).notNull(),
  calculatedAmount: decimal("calculated_amount", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==============================================================================
// 18. SETTINGS TABLE (Key-value site settings, social, contact, legal)
// ==============================================================================
export const settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(),
  keyName: varchar("key_name", { length: 100 }).notNull().unique(),
  valueContent: text("value_content"),
  groupName: varchar("group_name", { length: 50 }).notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 19. FIVE FACTORS TABLE (Space, Air, Fire, Water, Earth)
// ==============================================================================
export const fiveFactors = mysqlTable("five_factors", {
  id: int("id").primaryKey().autoincrement(),
  factorType: varchar("factor_type", { length: 50 }).notNull().unique(), // 'space', 'air', 'fire', 'water', 'earth'
  titleEnglish: varchar("title_english", { length: 150 }).notNull(),
  titleHindi: varchar("title_hindi", { length: 150 }).notNull(),
  iconImage: varchar("icon_image", { length: 500 }),
  tagline: varchar("tagline", { length: 255 }),
  detailsText: text("details_text"),
  impactPoints: json("impact_points").$type<string[]>(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// DRIZZLE RELATIONS DEFINITIONS
// ==============================================================================
export const unitsRelations = relations(units, ({ many }) => ({
  serviceRates: many(serviceRates),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  subServices: many(serviceRates),
  packages: many(packages),
}));

export const serviceRatesRelations = relations(serviceRates, ({ one, many }) => ({
  mainService: one(services, {
    fields: [serviceRates.mainServiceId],
    references: [services.id],
  }),
  unit: one(units, {
    fields: [serviceRates.unitId],
    references: [units.id],
  }),
  workflow: one(workflows, {
    fields: [serviceRates.id],
    references: [workflows.subServiceId],
  }),
  packageSubservices: many(packageSubservices),
  calculatorSubservices: many(calculatorSubservices),
  inquiryItems: many(inquiryItems),
}));

export const packagesRelations = relations(packages, ({ one, many }) => ({
  mainService: one(services, {
    fields: [packages.mainServiceId],
    references: [services.id],
  }),
  packageSubservices: many(packageSubservices),
  inquiries: many(inquiries),
}));

export const packageSubservicesRelations = relations(packageSubservices, ({ one }) => ({
  package: one(packages, {
    fields: [packageSubservices.packageId],
    references: [packages.id],
  }),
  subService: one(serviceRates, {
    fields: [packageSubservices.subServiceId],
    references: [serviceRates.id],
  }),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  subService: one(serviceRates, {
    fields: [workflows.subServiceId],
    references: [serviceRates.id],
  }),
  steps: many(workflowSteps),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowSteps.workflowId],
    references: [workflows.id],
  }),
}));

export const calculatorsRelations = relations(calculators, ({ many }) => ({
  calculatorSubservices: many(calculatorSubservices),
  inquiries: many(inquiries),
}));

export const calculatorSubservicesRelations = relations(calculatorSubservices, ({ one }) => ({
  calculator: one(calculators, {
    fields: [calculatorSubservices.calculatorId],
    references: [calculators.id],
  }),
  subService: one(serviceRates, {
    fields: [calculatorSubservices.subServiceId],
    references: [serviceRates.id],
  }),
}));

export const bhkConfigurationsRelations = relations(bhkConfigurations, ({ many }) => ({
  inquiries: many(inquiries),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  media: many(projectMedia),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, {
    fields: [projectMedia.projectId],
    references: [projects.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one, many }) => ({
  items: many(inquiryItems),
  calculator: one(calculators, {
    fields: [inquiries.calculatorId],
    references: [calculators.id],
  }),
  bhk: one(bhkConfigurations, {
    fields: [inquiries.bhkId],
    references: [bhkConfigurations.id],
  }),
  package: one(packages, {
    fields: [inquiries.packageId],
    references: [packages.id],
  }),
}));

export const inquiryItemsRelations = relations(inquiryItems, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryItems.inquiryId],
    references: [inquiries.id],
  }),
  serviceRate: one(serviceRates, {
    fields: [inquiryItems.serviceRateId],
    references: [serviceRates.id],
  }),
}));
