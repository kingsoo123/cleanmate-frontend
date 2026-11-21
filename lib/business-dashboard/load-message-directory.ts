import { fetchBusinessCustomers } from "@/lib/business-dashboard/customers-api";
import { fetchBranchManagers } from "@/lib/business-dashboard/branch-managers-api";
import {
  fetchBusinessChatConversations,
  fetchBusinessMessageDirectory,
} from "@/lib/business-dashboard/messages-api";
import type { MessageDirectoryRecipient } from "@/lib/messages/types";

async function buildMessageDirectoryFallback(): Promise<
  MessageDirectoryRecipient[]
> {
  const [conversations, customers, managers] = await Promise.all([
    fetchBusinessChatConversations().catch(() => []),
    fetchBusinessCustomers().catch(() => []),
    fetchBranchManagers().catch(() => []),
  ]);

  const convByCustomer = new Map(
    conversations.map((row) => [row.customerId, row]),
  );

  const customerRecipients: MessageDirectoryRecipient[] = customers.map(
    (customer) => {
      const conv = convByCustomer.get(customer.id);
      return {
        kind: "customer",
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        roleLabel: "Customer",
        lastMessagePreview: conv?.lastMessagePreview ?? "",
        lastMessageAt: conv?.lastMessageAt ?? null,
      };
    },
  );

  const staffRecipients: MessageDirectoryRecipient[] = managers.map(
    (manager) => ({
      kind: "staff",
      id: manager.id,
      name: manager.fullName,
      phone: manager.phone,
      roleLabel: "Branch manager",
      lastMessagePreview: "",
      lastMessageAt: null,
    }),
  );

  return [...customerRecipients, ...staffRecipients];
}

/** Directory with legacy API fallback when `/messages/directory` is unavailable. */
export async function loadBusinessMessageDirectory(): Promise<{
  recipients: MessageDirectoryRecipient[];
  usedFallback: boolean;
}> {
  try {
    const list = await fetchBusinessMessageDirectory();
    if (list.length > 0) {
      return { recipients: list, usedFallback: false };
    }
  } catch {
    // fall through to legacy merge
  }
  const recipients = await buildMessageDirectoryFallback();
  return { recipients, usedFallback: true };
}