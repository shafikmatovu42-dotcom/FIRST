import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { getSql } from "@/lib/db";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

const SESSION_COOKIE_NAME = "toolhub_admin_session";

// Helper password hash function (SHA-256 for lightweight server compatibility)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "toolhub_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const getAdminSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUser | null> => {
    const token = getCookie(SESSION_COOKIE_NAME);
    if (!token) return null;

    try {
      const sql = await getSql();
      const rows = await sql.query<AdminUser>(
        `select id, username, email, name, role, created_at from admin_users where username = $1 limit 1`,
        [token],
      );
      return rows[0] ?? null;
    } catch {
      return null;
    }
  },
);

export const adminLogin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      username: z.string().min(1, "Username or email is required"),
      password: z.string().min(1, "Password is required"),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const hashedPassword = await hashPassword(data.password);

    // Support login by username or email
    const rows = await sql.query<AdminUser & { password_hash: string }>(
      `select id, username, email, password_hash, name, role, created_at 
       from admin_users 
       where (username = $1 or email = $1) limit 1`,
      [data.username],
    );

    const user = rows[0];
    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    // Allow default plain password 'password123' check or hash check
    const isDefaultPass = data.password === "password123" && user.password_hash.startsWith("ef92b778");
    const isMatchedPass = user.password_hash === hashedPassword;

    if (!isDefaultPass && !isMatchedPass) {
      return { success: false, error: "Invalid username or password" };
    }

    // Set session cookie
    setCookie(SESSION_COOKIE_NAME, user.username, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Log login activity
    await sql.query(
      `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
      [user.username, "Owner Login", `Admin ${user.name} logged into the dashboard.`, "auth"],
    );

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      },
    };
  });

export const adminRegister = createServerFn({ method: "POST" })
  .validator(
    z.object({
      username: z.string().min(3, "Username must be at least 3 characters"),
      email: z.string().email("Invalid email address"),
      name: z.string().min(2, "Full name is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const hashedPassword = await hashPassword(data.password);

    try {
      // Check if user already exists
      const existing = await sql.query<{ username: string }>(
        `select username from admin_users where username = $1 or email = $2 limit 1`,
        [data.username, data.email],
      );

      if (existing.length > 0) {
        return { success: false, error: "Username or email is already registered." };
      }

      const rows = await sql.query<AdminUser>(
        `insert into admin_users (username, email, password_hash, name, role) 
         values ($1, $2, $3, $4, 'owner') 
         returning id, username, email, name, role, created_at`,
        [data.username, data.email, hashedPassword, data.name],
      );

      const user = rows[0];

      // Auto login after registration
      setCookie(SESSION_COOKIE_NAME, user.username, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      // Log registration activity
      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [user.username, "Account Created", `New shop owner account registered for ${user.name}.`, "auth"],
      );

      return { success: true, user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register account";
      return { success: false, error: msg };
    }
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(SESSION_COOKIE_NAME, { path: "/" });
  return { success: true };
});
