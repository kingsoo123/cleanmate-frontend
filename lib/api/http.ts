import { apiUrl } from "@/lib/api/base-url";
import { AuthApiError } from "@/lib/auth/api-client";
import { getAccessToken } from "@/lib/auth/session";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string | string[];
    };
    if (Array.isArray(body.message)) return body.message.join(" ");
    if (typeof body.message === "string") return body.message;
  } catch {
    /* ignore */
  }
  return "Something went wrong. Please try again.";
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new AuthApiError("Sign in to continue.", 401);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not reach the API. Check that the backend is running.";
    throw new AuthApiError(message, 0);
  }

  if (!response.ok) {
    throw new AuthApiError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new AuthApiError(
      "Unexpected response from API. Confirm NEXT_PUBLIC_API_URL points at the backend (port 3001), not the Next app.",
      response.status,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new AuthApiError(
      "Could not parse API response. Confirm NEXT_PUBLIC_API_URL is set correctly.",
      response.status,
    );
  }
}
