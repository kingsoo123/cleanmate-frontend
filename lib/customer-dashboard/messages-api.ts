import { apiFetch } from "@/lib/api/http";
import type { ChatMessage, CustomerChatThread } from "@/lib/messages/types";

export function fetchCustomerChatThread() {
  return apiFetch<CustomerChatThread>("/customer/messages");
}

export function sendCustomerChatMessage(body: string) {
  return apiFetch<ChatMessage>("/customer/messages", {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function pingCustomerTyping() {
  return apiFetch<{ ok: true }>("/customer/messages/typing", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
