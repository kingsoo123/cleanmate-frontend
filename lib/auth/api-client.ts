import type { OnboardingRole } from "@/lib/auth/onboarding";
import type { AuthUserPayload } from "@/lib/auth/types";

import { apiUrl, resolveApiBaseUrl } from "@/lib/api/base-url";

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
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    const base = resolveApiBaseUrl();
    const hint =
      typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost") &&
      /localhost|127\.0\.0\.1/.test(base)
        ? " This deploy is still pointing at localhost—set NEXT_PUBLIC_API_URL on Netlify to your Render API URL (https://…) and redeploy."
        : " The API may be waking on Render (first request can take ~1 min), or a VPN/firewall/ad blocker may be blocking the request. Try turning VPN off, wait a moment, then retry.";
    throw new AuthApiError(
      `Could not reach the sign-in API at ${base}.${hint}`,
      0,
    );
  }

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
  branches?: { name: string; address?: string }[];
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
