/**
 * Generates a clean, lowercase, URL-safe slug from input text.
 * Strips special characters, converts spaces to hyphens, and trims leading/trailing hyphens.
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
