import bcrypt from "bcryptjs";

export * from "./jwt";

/**
 * Hash a password securely using BCrypt with 12 salt rounds.
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compare a plain password against a stored BCrypt hash.
 */
export async function verifyPassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}
