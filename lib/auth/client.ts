"use client";

import { createAuthClient } from "better-auth/client";

const baseURL = typeof window !== "undefined"
  ? window.location.origin
  : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Debug logging
if (typeof window !== "undefined") {
  console.log("[Auth Client] Initialized with baseURL:", baseURL);
}

export const authClient = createAuthClient({
  baseURL,
});
