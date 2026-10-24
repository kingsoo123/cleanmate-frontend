"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatThreadPanel } from "@/components/messages/chat-thread-panel";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchBusinessCustomers } from "@/lib/business-dashboard/customers-api";
import { formatUpdatedAt } from "@/lib/business-dashboard/format";
import {
  fetchBusinessChatConversations,
  fetchBusinessChatThread,
  pingBusinessTyping,
  sendBusinessChatMessage,
} from "@/lib/business-dashboard/messages-api";
import type { BusinessCustomer } from "@/lib/business-dashboard/customers-types";
import type {
  BusinessChatConversation,
  BusinessChatThread,
} from "@/lib/messages/types";

export function BusinessMessagesClient() {
  const [conversations, setConversations] = useState<
    BusinessChatConversation[]
  >([]);
  const [customers, setCustomers] = useState<BusinessCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [thread, setThread] = useState<BusinessChatThread | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");

  const loadConversations = useCallback(async () => {
    try {
      const list = await fetchBusinessChatConversations();
      setConversations(list);
      setError(null);
      return list;
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Could not load conversations.",
      );
      return [];
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const list = await fetchBusinessCustomers();
      setCustomers(list);
      return list;
    } catch {
      return [];
    }
  }, []);

  const loadThread = useCallback(async (customerId: string) => {
    setThreadLoading(true);
    try {
      const data = await fetchBusinessChatThread(customerId);
      setThread(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Could not load conversation.",
      );
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setListLoading(true);
      const [convList, customerList] = await Promise.all([
        loadConversations(),
        loadCustomers(),
      ]);
      if (cancelled) return;
      const initialId =
        convList[0]?.customerId ?? customerList[0]?.id ?? null;
      setSelectedCustomerId(initialId);
      setListLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadConversations, loadCustomers]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setThread(null);
      return;
    }
    void loadThread(selectedCustomerId);
  }, [selectedCustomerId, loadThread]);

  const sidebarRows = useMemo(() => {
    const byId = new Map<string, BusinessChatConversation>();
    for (const row of conversations) {
      byId.set(row.customerId, row);
    }

    const merged = customers.map((customer) => {
      const existing = byId.get(customer.id);
      return {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        lastMessagePreview: existing?.lastMessagePreview ?? "",
        lastMessageAt: existing?.lastMessageAt ?? null,
      };
    });

    const q = customerQuery.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter(
      (row) =>
        row.customerName.toLowerCase().includes(q) ||
        row.customerPhone.includes(q),
    );
  }, [conversations, customers, customerQuery]);

  async function handleSend(body: string) {
    if (!selectedCustomerId) return;
    setSending(true);
    try {
      const message = await sendBusinessChatMessage(selectedCustomerId, body);
      setThread((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, message] }
          : prev,
      );
      await loadConversations();
    } finally {
      setSending(false);
    }
  }

  async function refreshThread() {
    if (!selectedCustomerId) return;
    await Promise.all([
      loadThread(selectedCustomerId),
      loadConversations(),
    ]);
  }

  const selectedRow = sidebarRows.find(
    (row) => row.customerId === selectedCustomerId,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Inbox</p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Messages
        </h2>
        <p className="mt-1 text-sm text-muted">
          Reply to customers in real time about their orders and pickups.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border p-3">
              <input
                type="search"
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                placeholder="Search customers…"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            {listLoading ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Loading…
              </p>
            ) : sidebarRows.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Add a customer to start messaging.
              </p>
            ) : (
              <ul className="max-h-[min(70vh,640px)] divide-y divide-border overflow-y-auto">
                {sidebarRows.map((row) => {
                  const active = row.customerId === selectedCustomerId;
                  return (
                    <li key={row.customerId}>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerId(row.customerId)}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          active
                            ? "bg-brand-light/40"
                            : "hover:bg-secondary-surface/50"
                        }`}
                      >
                        <p className="truncate text-sm font-semibold text-foreground">
                          {row.customerName}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {row.customerPhone}
                        </p>
                        {row.lastMessagePreview ? (
                          <p className="mt-1 truncate text-xs text-foreground/80">
                            {row.lastMessagePreview}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs italic text-muted">
                            No messages yet
                          </p>
                        )}
                        {row.lastMessageAt ? (
                          <p className="mt-0.5 text-[10px] text-muted">
                            {formatUpdatedAt(row.lastMessageAt)}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedCustomerId ? (
            <ChatThreadPanel
              partnerName={
                thread?.customerName ??
                selectedRow?.customerName ??
                "Customer"
              }
              partnerSubtitle={
                thread?.customerPhone ?? selectedRow?.customerPhone
              }
              messages={thread?.messages ?? []}
              partnerIsTyping={thread?.partnerIsTyping ?? false}
              loading={threadLoading}
              error={error}
              sending={sending}
              onSend={handleSend}
              onRefresh={refreshThread}
              onTypingPing={() => {
                if (selectedCustomerId) {
                  void pingBusinessTyping(selectedCustomerId);
                }
              }}
              emptyHint="Say hello — your customer will see this in their portal."
            />
          ) : (
            <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary-surface/20 px-6 text-center text-sm text-muted">
              Select a customer to open the conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
