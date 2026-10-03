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
