import { z } from "zod";

// ==============================================================================
// 1. AUTH SCHEMAS
// ==============================================================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .email("Invalid email address format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ==============================================================================
// 2. SERVICES SCHEMAS
// ==============================================================================
export const serviceCreateSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional()
    .or(z.literal("")),
  shortDescription: z.string().max(500).nullable().optional(),
  detailedContent: z.string().nullable().optional(),
  thumbnailUrl: z.string().max(500).nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;

export const serviceUpdateSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional()
    .or(z.literal("")),
  shortDescription: z.string().max(500).nullable().optional(),
  detailedContent: z.string().nullable().optional(),
  thumbnailUrl: z.string().max(500).nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;

// ==============================================================================
// 3. PROJECTS SCHEMAS
// ==============================================================================
export const projectCategoryEnum = z.enum(["completed", "ongoing", "upcoming"]);

export const projectSchema = z.object({
  title: z.string().min(2, "Project title is required").max(200),
  slug: z
    .string()
    .min(2, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  category: projectCategoryEnum.default("completed"),
  location: z.string().max(200).nullable().optional(),
  clientName: z.string().max(150).nullable().optional(),
  clientNumber: z.string().max(50).nullable().optional(),
  costEstimate: z.union([z.number(), z.string()]).nullable().optional(),
  description: z.string().nullable().optional(),
  mainImageUrl: z.string().max(500).nullable().optional(),
  oldElevationUrl: z.string().max(500).nullable().optional(),
  newElevationUrl: z.string().max(500).nullable().optional(),
  displayOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ==============================================================================
// 4. PROJECT MEDIA SCHEMAS
// ==============================================================================
export const projectMediaSchema = z.object({
  projectId: z.number().int().positive("Valid project ID is required"),
  mediaUrl: z.string().min(1, "Media URL is required").max(500),
  mediaType: z.enum(["image", "video"]).default("image"),
  displayOrder: z.number().int().default(0),
});

export type ProjectMediaInput = z.infer<typeof projectMediaSchema>;

// ==============================================================================
// 5. TEAM MEMBERS SCHEMAS
// ==============================================================================
export const teamMemberSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(150),
  roleTitle: z.string().min(2, "Role title is required").max(150),
  education: z.string().max(150).nullable().optional(),
  experienceYears: z.string().max(50).nullable().optional(),
  bio: z.string().nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

// ==============================================================================
// 6. GALLERY SCHEMAS
// ==============================================================================
export const galleryItemSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  mediaType: z.enum(["image", "video"]).default("image"),
  mediaUrl: z.string().min(1, "Media URL is required").max(500),
  thumbnailUrl: z.string().max(500).nullable().optional(),
  durationSeconds: z.number().int().min(1).max(60).nullable().optional(), // videos <= 1 min
  fileSizeBytes: z.number().int().max(52428800).nullable().optional(), // <= 50MB
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

// ==============================================================================
// 7. SERVICE RATES (DYNAMIC QUOTATION) SCHEMAS
// ==============================================================================
export const rateTypeEnum = z.enum([
  "fixed",
  "per_sqft",
  "per_view",
  "per_visit",
  "percentage",
]);

export const serviceRateSchema = z.object({
  serviceName: z.string().min(2, "Discipline/Service name is required").max(150),
  unitId: z.number().int().positive("Valid unit must be selected"),
  baseRate: z.union([z.number().positive("Base rate must be greater than 0"), z.string()]),
  rateType: rateTypeEnum.default("per_sqft"),
  defaultQty: z.union([z.number().min(0), z.string()]).default("1.00"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export type ServiceRateInput = z.infer<typeof serviceRateSchema>;

// ==============================================================================
// 8. UNITS SCHEMAS
// ==============================================================================
export const unitSchema = z.object({
  unitName: z
    .string()
    .min(1, "Unit name is required")
    .max(50)
    .trim()
    .toLowerCase(),
  unitSymbol: z.string().min(1, "Unit symbol is required").max(20).trim(),
  description: z.string().nullable().optional(),
});

export type UnitInput = z.infer<typeof unitSchema>;

// ==============================================================================
// 9. WEBSITE SETTINGS SCHEMAS
// ==============================================================================
export const ALLOWED_SETTING_KEYS = [
  "site_name",
  "tagline",
  "contact_phone",
  "contact_email",
  "contact_address",
  "google_maps_url",
  "instagram_url",
  "facebook_url",
  "linkedin_url",
  "youtube_url",
  "office_hours",
  "hero_headline",
  "hero_subheadline",
  "about_summary",
  "terms_and_conditions",
  "privacy_policy",
] as const;

export const settingsUpdateSchema = z.array(
  z.object({
    keyName: z.string().refine((val) => ALLOWED_SETTING_KEYS.includes(val as any), {
      message: "Setting key is not permitted in public settings",
    }),
    valueContent: z.string().nullable(),
  })
);

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

// ==============================================================================
// 10. INQUIRIES & LEAD CAPTURE SCHEMAS
// ==============================================================================
export const inquiryStatusEnum = z.enum(["new", "contacted", "in_progress", "closed"]);

export const inquirySubmissionSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(150, "Full name cannot exceed 150 characters")
    .trim(),
  phone: z
    .string()
    .min(8, "Phone number is too short")
    .max(25, "Phone number is too long")
    .trim()
    .refine((val) => {
      // Must contain only digits, plus, hyphens, spaces, or brackets
      if (!/^[+0-9\s\-()]+$/.test(val)) return false;
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, {
      message: "Please enter a valid phone number (10 to 15 digits)",
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  interestedService: z.string().max(150).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
  tentativeBudget: z.union([z.number(), z.string()]).optional().nullable(),
  quotationItems: z
    .array(
      z.object({
        rateId: z.number().int().positive("Invalid rate ID"),
        quantity: z.number().min(0, "Quantity cannot be negative"),
      })
    )
    .optional(),
});

export type InquirySubmissionInput = z.infer<typeof inquirySubmissionSchema>;

export const adminInquiryUpdateSchema = z.object({
  status: inquiryStatusEnum.optional(),
  adminNotes: z.string().max(5000).optional().nullable(),
});

export type AdminInquiryUpdateInput = z.infer<typeof adminInquiryUpdateSchema>;

