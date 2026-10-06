import { SignJWT, jwtVerify } from "jose";

export interface AdminJWTPayload {
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

export const AUTH_COOKIE_NAME = "maya_admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getJWTSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is not configured or is fewer than 32 characters. Check your local .env file."
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign a stateless JWT for authenticated administrators.
 */
export async function signAdminJWT(payload: AdminJWTPayload): Promise<string> {
  const secretKey = getJWTSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("maya-design-and-build")
    .setAudience("maya-admin")
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
}

/**
 * Verify and decode an incoming admin session JWT. Edge runtime compatible.
 */
export async function verifyAdminJWT(
  token: string
): Promise<AdminJWTPayload | null> {
  try {
    const secretKey = getJWTSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: "maya-design-and-build",
      audience: "maya-admin",
    });

    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      fullName: String(payload.fullName),
      role: String(payload.role || "admin"),
    };
  } catch {
    return null;
  }
}

/**
 * Security parameters for the HTTP-only session cookie.
 */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
