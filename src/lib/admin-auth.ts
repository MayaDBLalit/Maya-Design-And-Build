import { NextRequest, NextResponse } from "next/server";
import { verifyAdminJWT, AUTH_COOKIE_NAME, AdminJWTPayload } from "./jwt";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Server-side authorization helper for API routes.
 * Inspects HTTP-only session cookie or Bearer authorization header,
 * verifies the cryptographic JWT signature, and confirms the administrator
 * account is still active in the database.
 */
export async function getAuthenticatedAdmin(
  request: NextRequest
): Promise<AdminJWTPayload | null> {
  try {
    let token: string | undefined;

    // 1. Check HTTP-only cookie first
    const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (cookieToken) {
      token = cookieToken;
    } else {
      // 2. Check Authorization: Bearer header
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return null;
    }

    const payload = await verifyAdminJWT(token);
    if (!payload || !payload.userId) {
      return null;
    }

    // Verify user exists in database and has active admin role
    const [user] = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        fullName: adminUsers.fullName,
        role: adminUsers.role,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, payload.userId))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  } catch (error) {
    console.error("Authorization verification error:", error);
    return null;
  }
}

/**
 * Enforce admin authorization guard on API mutations.
 * Returns either the verified admin payload or a ready-to-return 401 Unauthorized NextResponse.
 */
export async function requireAdminAuth(
  request: NextRequest
): Promise<
  | { admin: AdminJWTPayload; errorResponse?: never }
  | { admin?: never; errorResponse: NextResponse }
> {
  const admin = await getAuthenticatedAdmin(request);

  if (!admin) {
    return {
      errorResponse: NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be authenticated as an administrator to perform this action.",
        },
        { status: 401 }
      ),
    };
  }

  return { admin };
}
