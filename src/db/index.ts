import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: mysql.Pool | undefined;
};

const poolConnection =
  globalForDb.conn ??
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "maya_user",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "maya_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") globalForDb.conn = poolConnection;

export const db = drizzle(poolConnection, { schema, mode: "default" });
export { schema };
