import type { OnboardingRole } from "@/lib/auth/onboarding";
import type { AuthUserPayload } from "@/lib/auth/types";

import { apiUrl } from "@/lib/api/base-url";

export type AuthResponse = {
  accessToken: string;
  user: AuthUserPayload;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
    };
    if (Array.isArray(body.message)) {
      return body.message.join(" ");
    }
    if (typeof body.message === "string") {
      return body.message;
    }
  } catch {
    /* ignore */
  }
  return "Something went wrong. Please try again.";
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new AuthApiError(await parseErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

export function signUp(payload: {
  businessName: string;
  fullName: string;
  phone: string;
  email: string;
  pin: string;
}) {
  return postJson<AuthResponse>("/auth/sign-up", payload);
}

export function signIn(payload: {
  identifier: string;
  pin: string;
  role: OnboardingRole;
}) {
  return postJson<AuthResponse>("/auth/sign-in", payload);
}

export function forgotPin(payload: {
  identifier: string;
  role: OnboardingRole;
  newPin: string;
  confirmPin: string;
}) {
  return postJson<{ message: string }>("/auth/forgot-pin", payload);
}
