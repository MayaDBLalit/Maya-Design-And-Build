/**
 * Formats a number into Indian Rupee currency format (INR).
 * Example: 318000 -> "₹3,18,000"
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Safely normalizes a phone number into a valid tel: destination.
 * Preserves international country codes (e.g. +91) while stripping
 * spaces, hyphens, brackets, and non-dialable characters.
 *
 * Returns null if the input is empty or does not contain a valid telephone digit sequence.
 *
 * Examples:
 * - "+91 8980703374" -> "+918980703374"
 * - "+91 (898) 070-3374" -> "+918980703374"
 * - "8980703374" -> "8980703374"
 * - "invalid" -> null
 * - "" / null / undefined -> null
 */
export function normalizeTelHref(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== "string") return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;

  // Extract all digits
  const digitsOnly = trimmed.replace(/\D/g, "");

  // ITU-T E.164 recommends 7 to 15 digits for valid telephone numbers
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return null;
  }

  // Preserve leading '+' for international numbers
  if (trimmed.startsWith("+")) {
    return `+${digitsOnly}`;
  }

  return digitsOnly;
}

