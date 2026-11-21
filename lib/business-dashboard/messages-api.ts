import { apiFetch } from "@/lib/api/http";
import type {
  BusinessChatConversation,
  BusinessChatThread,
  BusinessStaffChatThread,
  ChatMessage,
  MessageDirectoryRecipient,
} from "@/lib/messages/types";

export function fetchBusinessMessageDirectory() {
  return apiFetch<MessageDirectoryRecipient[]>("/business/messages/directory");
}

export function fetchBusinessChatConversations() {
  return apiFetch<BusinessChatConversation[]>("/business/messages/conversations");
}

export function fetchBusinessChatThread(customerId: string) {
  return apiFetch<BusinessChatThread>(
    `/business/messages/conversations/${customerId}`,
  );
}

export function fetchBusinessStaffChatThread(staffUserId: string) {
  return apiFetch<BusinessStaffChatThread>(
    `/business/messages/staff/${staffUserId}`,
  );
}

export function sendBusinessStaffChatMessage(staffUserId: string, body: string) {
  return apiFetch<ChatMessage>(`/business/messages/staff/${staffUserId}`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
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

export type BulkMessageResult = {
  customers: {
    attempted: number;
    sent: number;
    failed: Array<{ customerId: string; ok: false; error?: string }>;
  };
  staff: {
    notified: Array<{ userId: string; role: string }>;
    count: number;
  };
};

export function sendBulkBusinessMessages(input: {
  body: string;
  includeCustomers?: boolean;
  includeStaff?: boolean;
}) {
  return apiFetch<BulkMessageResult>("/business/messages/bulk", {
    method: "POST",
    body: JSON.stringify(input),
  });
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
