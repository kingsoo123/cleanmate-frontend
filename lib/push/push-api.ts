import { apiFetch } from "@/lib/api/http";

export function registerPushToken(token: string) {
  return apiFetch<{ ok: true }>("/push-tokens", {
    method: "POST",
    body: JSON.stringify({ token, platform: "web" }),
  });
}

export function unregisterPushToken(token: string) {
  return apiFetch<void>("/push-tokens", {
    method: "DELETE",
    body: JSON.stringify({ token }),
  });
}
