import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  bigint,
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
// 3. SERVICE RATES TABLE (Dynamic Quotation Catalog)
// ==============================================================================
export const serviceRates = mysqlTable("service_rates", {
  id: int("id").primaryKey().autoincrement(),
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
// 4. SERVICES TABLE (Core 4 Services + Extensible)
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
// 5. PROJECTS TABLE (Completed, Ongoing, Upcoming + Before/After Elevation)
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
// 6. PROJECT MEDIA TABLE (Multi-image & video gallery per project)
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
// 7. TEAM MEMBERS TABLE (Engineers & Project Managers)
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
// 8. GALLERY TABLE (Images & Videos <= 1 min, <= 50 MB)
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
// 9. INQUIRIES TABLE (Leads & Consultation Requests)
// ==============================================================================
export const inquiries = mysqlTable("inquiries", {
  id: int("id").primaryKey().autoincrement(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  interestedService: varchar("interested_service", { length: 150 }),
  message: text("message"),
  tentativeBudget: decimal("tentative_budget", { precision: 14, scale: 2 }),
  status: varchar("status", { length: 30 }).notNull().default("new"), // 'new', 'contacted', 'in_progress', 'closed'
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// 10. INQUIRY ITEMS TABLE (Quotation Line-item breakdown with snapshots)
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
// 11. SETTINGS TABLE (Key-value site settings, social, contact, legal)
// ==============================================================================
export const settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(),
  keyName: varchar("key_name", { length: 100 }).notNull().unique(),
  valueContent: text("value_content"),
  groupName: varchar("group_name", { length: 50 }).notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// DRIZZLE RELATIONS DEFINITIONS
// ==============================================================================
export const unitsRelations = relations(units, ({ many }) => ({
  serviceRates: many(serviceRates),
}));

export const serviceRatesRelations = relations(serviceRates, ({ one, many }) => ({
  unit: one(units, {
    fields: [serviceRates.unitId],
    references: [units.id],
  }),
  inquiryItems: many(inquiryItems),
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

export const inquiriesRelations = relations(inquiries, ({ many }) => ({
  items: many(inquiryItems),
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
