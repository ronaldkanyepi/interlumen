import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

const baseURL = process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
  allowExitOnIdle: true,
  ssl: {
    rejectUnauthorized: false
  }
});

database.on('error', (err) => {
  // Suppress unhandled error
  console.error('Unexpected error on idle client', err);
});

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  database: database,
  baseURL,
  basePath: "/api/auth",
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  trustedOrigins: [
    baseURL,
    process.env.BETTER_AUTH_URL || "",
    "https://interlume.onrender.com"
  ].filter(Boolean),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    useSecureCookies: baseURL.startsWith("https://"),
    cookiePrefix: "better-auth",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: baseURL.startsWith("https://"),
      httpOnly: true,
      path: "/",
    },
  },
  trustHost: true,
  rateLimit: {
    window: 60,
    max: 10,
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
