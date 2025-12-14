import { auth } from "./config";
import { headers } from "next/headers";

export async function getSession() {
  try {
    const headersList = await headers();
    return await auth.api.getSession({
      headers: headersList,
    });
  } catch (error) {
    return null;
  }
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}
