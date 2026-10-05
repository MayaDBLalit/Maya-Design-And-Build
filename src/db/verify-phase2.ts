import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mysql from "mysql2/promise";
import { NextRequest } from "next/server";
import { verifyPassword, signAdminJWT, verifyAdminJWT, AUTH_COOKIE_NAME } from "../lib/auth";
import { POST as loginHandler } from "../app/api/auth/login/route";
import { POST as logoutHandler } from "../app/api/auth/logout/route";
import { GET as meHandler } from "../app/api/auth/me/route";
import { GET as servicesHandler } from "../app/api/services/route";
import { GET as teamHandler } from "../app/api/team/route";
import { GET as quotationRatesHandler } from "../app/api/quotation/rates/route";
import { GET as settingsHandler } from "../app/api/settings/route";
import { middleware } from "../middleware";

async function runPhase2Verification() {
  console.log("==================================================");
  console.log("🚀 STARTING PHASE 2 COMPREHENSIVE VERIFICATION");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "maya_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "maya_db",
  });

  try {
    // --------------------------------------------------------------------------
    // TEST 1: Database Admin Record & BCrypt Hash Check
    // --------------------------------------------------------------------------
    const [adminRows] = await connection.query(
      "SELECT id, email, full_name, password_hash, role FROM admin_users LIMIT 1;"
    );
    const admin = (adminRows as any[])[0];

    assert(Boolean(admin), "Admin user exists in database");
    assert(
      typeof admin?.password_hash === "string" &&
        (admin.password_hash.startsWith("$2a$12$") || admin.password_hash.startsWith("$2b$12$")) &&
        admin.password_hash.length === 60,
      "Password is stored ONLY as a secure BCrypt hash (12 salt rounds, 60 chars)"
    );
    assert(
      admin?.password_hash !== process.env.ADMIN_INITIAL_PASSWORD,
      "Plaintext password is NEVER stored in database"
    );

    // --------------------------------------------------------------------------
    // TEST 2: BCrypt Password Verification Utilities
    // --------------------------------------------------------------------------
    const validMatch = await verifyPassword(
      process.env.ADMIN_INITIAL_PASSWORD || "",
      admin.password_hash
    );
    assert(validMatch, "verifyPassword succeeds with correct credentials");

    const invalidMatch = await verifyPassword("WrongPassword123!", admin.password_hash);
    assert(!invalidMatch, "verifyPassword rejects incorrect password safely");

    // --------------------------------------------------------------------------
    // TEST 3: JWT Signing & Verification (jose)
    // --------------------------------------------------------------------------
    const token = await signAdminJWT({
      userId: admin.id,
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role,
    });
    assert(Boolean(token) && token.split(".").length === 3, "signAdminJWT produces valid 3-segment JWT");

    const payload = await verifyAdminJWT(token);
    assert(
      payload?.email === admin.email && payload?.userId === admin.id,
      "verifyAdminJWT decodes payload correctly"
    );

    const tamperedPayload = await verifyAdminJWT(token + "tampered");
    assert(tamperedPayload === null, "verifyAdminJWT rejects tampered JWT signature");

    // --------------------------------------------------------------------------
    // TEST 4: POST /api/auth/login Endpoint (Correct Credentials)
    // --------------------------------------------------------------------------
    const loginReqValid = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: admin.email,
        password: process.env.ADMIN_INITIAL_PASSWORD,
      }),
    });
    const loginResValid = await loginHandler(loginReqValid);
    const loginDataValid = await loginResValid.json();

    assert(loginResValid.status === 200, "POST /api/auth/login returns HTTP 200 on success");
    assert(loginDataValid.success === true, "Login response body has success: true");
    assert(loginDataValid.user?.email === admin.email, "Login response contains safe user info");
    assert(
      !("password" in (loginDataValid.user || {})) && !("passwordHash" in (loginDataValid.user || {})),
      "Login response NEVER returns password or password hash"
    );

    const setCookieHeader = loginResValid.headers.get("set-cookie") || "";
    assert(
      setCookieHeader.includes(AUTH_COOKIE_NAME) &&
        setCookieHeader.toLowerCase().includes("httponly") &&
        setCookieHeader.toLowerCase().includes("samesite=strict"),
      "Login sets HttpOnly and SameSite=Strict session cookie"
    );

    // --------------------------------------------------------------------------
    // TEST 5: POST /api/auth/login Endpoint (Incorrect Credentials)
    // --------------------------------------------------------------------------
    const loginReqInvalid = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: admin.email,
        password: "IncorrectPasswordXYZ",
      }),
    });
    const loginResInvalid = await loginHandler(loginReqInvalid);
    const loginDataInvalid = await loginResInvalid.json();

    assert(loginResInvalid.status === 401, "POST /api/auth/login returns HTTP 401 on bad password");
    assert(
      loginDataInvalid.error === "Invalid email or password",
      "Login returns generic error message without leaking account existence"
    );

    // --------------------------------------------------------------------------
    // TEST 6: GET /api/auth/me (Authenticated vs Unauthenticated)
    // --------------------------------------------------------------------------
    const meReqAuth = new NextRequest("http://localhost:3000/api/auth/me", {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const meResAuth = await meHandler(meReqAuth);
    const meDataAuth = await meResAuth.json();

    assert(meResAuth.status === 200, "GET /api/auth/me returns HTTP 200 when authenticated");
    assert(meDataAuth.user?.email === admin.email, "GET /api/auth/me returns valid admin profile");

    const meReqUnauth = new NextRequest("http://localhost:3000/api/auth/me");
    const meResUnauth = await meHandler(meReqUnauth);
    assert(meResUnauth.status === 401, "GET /api/auth/me returns HTTP 401 when unauthenticated");

    // --------------------------------------------------------------------------
    // TEST 7: POST /api/auth/logout Endpoint
    // --------------------------------------------------------------------------
    const logoutRes = await logoutHandler();
    const logoutCookie = logoutRes.headers.get("set-cookie") || "";
    assert(logoutRes.status === 200, "POST /api/auth/logout returns HTTP 200");
    assert(
      logoutCookie.includes("Max-Age=0") || logoutCookie.includes("expires="),
      "POST /api/auth/logout invalidates session cookie (Max-Age=0)"
    );

    // --------------------------------------------------------------------------
    // TEST 8: Route Protection Middleware (/admin routes)
    // --------------------------------------------------------------------------
    const mwUnauthReq = new NextRequest("http://localhost:3000/admin/dashboard");
    const mwUnauthRes = await middleware(mwUnauthReq);
    const redirectLocation = mwUnauthRes.headers.get("location") || "";
    assert(
      mwUnauthRes.status === 307 && redirectLocation.includes("/admin/login"),
      "Middleware blocks unauthenticated /admin/dashboard and redirects to /admin/login"
    );

    const mwAuthReq = new NextRequest("http://localhost:3000/admin/dashboard", {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
    });
    const mwAuthRes = await middleware(mwAuthReq);
    assert(
      mwAuthRes.status === 200,
      "Middleware allows authenticated access to /admin/dashboard"
    );

    // --------------------------------------------------------------------------
    // TEST 9: Public Services API (GET /api/services)
    // --------------------------------------------------------------------------
    const servicesRes = await servicesHandler();
    const servicesData = await servicesRes.json();
    assert(servicesRes.status === 200, "GET /api/services returns HTTP 200");
    assert(
      servicesData.count >= 4 &&
        servicesData.data[0].slug === "interior-design" &&
        servicesData.data.some((s: any) => s.slug === "turnkey-construction"),
      "GET /api/services returns the services ordered by display_order"
    );

    // --------------------------------------------------------------------------
    // TEST 10: Public Team API (GET /api/team)
    // --------------------------------------------------------------------------
    const teamRes = await teamHandler();
    const teamData = await teamRes.json();
    assert(teamRes.status === 200, "GET /api/team returns HTTP 200");
    assert(
      teamData.count === 5 && teamData.data[0].fullName === "Er. Lalit Choudhary",
      "GET /api/team returns active team members with founder first"
    );

    // --------------------------------------------------------------------------
    // TEST 11: Public Quotation Rates API (GET /api/quotation/rates)
    // --------------------------------------------------------------------------
    const quoteRes = await quotationRatesHandler();
    const quoteData = await quoteRes.json();
    assert(quoteRes.status === 200, "GET /api/quotation/rates returns HTTP 200");
    assert(
      quoteData.count === 10 &&
        quoteData.data[0].serviceName === "First Visit Charge" &&
        Boolean(quoteData.data[0].unitName),
      "GET /api/quotation/rates returns dynamic rates joined with measurement units"
    );

    // --------------------------------------------------------------------------
    // TEST 12: Public Settings API & Strict Allowlist (GET /api/settings)
    // --------------------------------------------------------------------------
    const settingsRes = await settingsHandler();
    const settingsData = await settingsRes.json();
    assert(settingsRes.status === 200, "GET /api/settings returns HTTP 200");
    assert(
      Boolean(settingsData.data["site_name"]) &&
        Boolean(settingsData.data["contact_phone"]) &&
        Boolean(settingsData.data["terms_and_conditions"]),
      "GET /api/settings returns public settings map"
    );
    assert(
      !("ADMIN_INITIAL_PASSWORD" in settingsData.data) &&
        !("JWT_SECRET" in settingsData.data) &&
        !("DATABASE_URL" in settingsData.data),
      "GET /api/settings strictly excludes secrets, internal config, and credentials"
    );

    console.log("==================================================");
    console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await connection.end();
  }
}

runPhase2Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Verification exception:", err);
    process.exit(1);
  });
