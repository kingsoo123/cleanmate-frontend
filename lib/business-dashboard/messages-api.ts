import { apiFetch } from "@/lib/api/http";
import type {
  BusinessChatConversation,
  BusinessChatThread,
  ChatMessage,
} from "@/lib/messages/types";

export function fetchBusinessChatConversations() {
  return apiFetch<BusinessChatConversation[]>("/business/messages/conversations");
}

export function fetchBusinessChatThread(customerId: string) {
  return apiFetch<BusinessChatThread>(
    `/business/messages/conversations/${customerId}`,
  );
}

export function sendBusinessChatMessage(customerId: string, body: string) {
  return apiFetch<ChatMessage>(
    `/business/messages/conversations/${customerId}`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
}

export function pingBusinessTyping(customerId: string) {
  return apiFetch<{ ok: true }>(
    `/business/messages/conversations/${customerId}/typing`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}
