"use server";

import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
  type SignInInput,
  type SignUpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type VerifyOTPInput,
} from "@/lib/validations/auth";

type ActionResult<T> = { error: string } | T;

const getBaseURL = () => {
  return process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
};

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return "An unexpected error occurred";
}

export async function signInAction(
  formData: FormData
): Promise<ActionResult<never>> {
  const rawData = {
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString(),
  };

  const validation = signInSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid input" };
  }

  const { email, password } = validation.data;

  try {
    const headersList = await headers();
    const result = await auth.api.signInEmail({
      headers: headersList,
      body: {
        email,
        password,
      },
    });

    if ("error" in result) {
      return { error: extractErrorMessage(result.error) || "Invalid credentials" };
    }

    redirect("/");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "An error occurred during sign in. Please try again." };
  }
}

export async function signUpAction(
  formData: FormData
): Promise<ActionResult<never>> {
  const rawData = {
    name: formData.get("name")?.toString().trim(),
    email: formData.get("email")?.toString().trim(),
    password: formData.get("password")?.toString(),
    confirmPassword: formData.get("confirmPassword")?.toString(),
  };

  const validation = signUpSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid input" };
  }

  const { email, password, name } = validation.data;

  try {
    const headersList = await headers();
    const result = await auth.api.signUpEmail({
      headers: headersList,
      body: {
        email,
        password,
        name,
      },
    });

    if ("error" in result) {
      const error = result.error;
      const errorMsg = (error && typeof error === "object" && "message" in error ? String(error.message) : null) || extractErrorMessage(error) || "Failed to create account";
      return { error: errorMsg };
    }

    redirect("/");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { error: errorMsg || "An error occurred during sign up. Please try again." };
  }
}

export async function signOutAction(): Promise<ActionResult<{ success: true }>> {
  try {
    const headersList = await headers();
    await auth.api.signOut({
      headers: headersList,
    });

    return { success: true };
  } catch (error) {
    return { error: "An error occurred during sign out. Please try again." };
  }
}

export async function forgotPasswordAction(
  formData: FormData
): Promise<ActionResult<{ success: true }>> {
  const rawData = {
    email: formData.get("email")?.toString().trim(),
  };

  const validation = forgotPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid input" };
  }

  const { email } = validation.data;

  try {
    const baseURL = getBaseURL();
    const response = await fetch(`${baseURL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok || "error" in result) {
      return { error: result.error?.message || "Failed to send reset email" };
    }

    return { success: true };
  } catch {
    return { error: "An error occurred. Please try again later." };
  }
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ActionResult<never>> {
  const rawData = {
    password: formData.get("password")?.toString(),
    confirmPassword: formData.get("confirmPassword")?.toString(),
    token: formData.get("token")?.toString(),
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid input" };
  }

  const { password, token } = validation.data;

  try {
    const baseURL = getBaseURL();
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, token }),
    });

    const result = await response.json();

    if (!response.ok || "error" in result) {
      return { error: result.error?.message || "Failed to reset password" };
    }

    redirect("/auth/login?reset=success");
    return { error: "Redirect failed" } as never;
  } catch {
    return { error: "An error occurred. Please try again." };
  }
}

export async function verifyOTPAction(
  formData: FormData
): Promise<ActionResult<never>> {
  const rawData = {
    code: formData.get("code")?.toString().trim(),
  };

  const validation = verifyOTPSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid input" };
  }

  const { code } = validation.data;

  try {
    const baseURL = getBaseURL();
    const headersList = await headers();
    const response = await fetch(`${baseURL}/api/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: headersList.get("cookie") || "",
      },
      body: JSON.stringify({ code }),
    });

    const result = await response.json();

    if (!response.ok || "error" in result) {
      return { error: result.error?.message || "Invalid verification code" };
    }

    redirect("/auth/verify-success");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Invalid verification code. Please try again." };
  }
}
