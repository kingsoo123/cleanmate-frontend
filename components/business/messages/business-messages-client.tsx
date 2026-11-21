"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BusinessBulkBroadcastPanel } from "@/components/business/messages/business-bulk-broadcast-panel";
import { ChatThreadPanel } from "@/components/messages/chat-thread-panel";
import { AuthApiError } from "@/lib/auth/api-client";
import { formatUpdatedAt } from "@/lib/business-dashboard/format";
import { loadBusinessMessageDirectory } from "@/lib/business-dashboard/load-message-directory";
import {
  fetchBusinessChatThread,
  fetchBusinessStaffChatThread,
  pingBusinessTyping,
  sendBusinessChatMessage,
  sendBusinessStaffChatMessage,
} from "@/lib/business-dashboard/messages-api";
import type {
  BusinessChatThread,
  BusinessStaffChatThread,
  MessageDirectoryRecipient,
} from "@/lib/messages/types";

type SelectedRecipient = {
  kind: MessageDirectoryRecipient["kind"];
  id: string;
};

export function BusinessMessagesClient() {
  const [directory, setDirectory] = useState<MessageDirectoryRecipient[]>([]);
  const [selected, setSelected] = useState<SelectedRecipient | null>(null);
  const [customerThread, setCustomerThread] =
    useState<BusinessChatThread | null>(null);
  const [staffThread, setStaffThread] = useState<BusinessStaffChatThread | null>(
    null,
  );
  const [listLoading, setListLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadDirectory = useCallback(async () => {
    try {
      const { recipients } = await loadBusinessMessageDirectory();
      setDirectory(recipients);
      setListError(
        recipients.length === 0
          ? "Add customers under Customers to start messaging."
          : null,
      );
      return recipients;
    } catch (err) {
      setListError(
        err instanceof AuthApiError
          ? err.message
          : "Could not load contacts.",
      );
      setDirectory([]);
      return [];
    }
  }, []);

  const loadCustomerThread = useCallback(async (customerId: string) => {
    setThreadLoading(true);
    try {
      const data = await fetchBusinessChatThread(customerId);
      setCustomerThread(data);
      setStaffThread(null);
      setThreadError(null);
    } catch (err) {
      setThreadError(
        err instanceof AuthApiError
          ? err.message
          : "Could not load conversation.",
      );
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const loadStaffThread = useCallback(async (staffUserId: string) => {
    setThreadLoading(true);
    try {
      const data = await fetchBusinessStaffChatThread(staffUserId);
      setStaffThread(data);
      setCustomerThread(null);
      setThreadError(null);
    } catch (err) {
      setThreadError(
        err instanceof AuthApiError
          ? err.message
          : "Could not load staff conversation.",
      );
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setListLoading(true);
      const list = await loadDirectory();
      if (cancelled) return;
      const initial =
        list.find((row) => row.lastMessageAt) ?? list[0] ?? null;
      setSelected(
        initial ? { kind: initial.kind, id: initial.id } : null,
      );
      setListLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDirectory]);

  useEffect(() => {
    if (!selected) {
      setCustomerThread(null);
      setStaffThread(null);
      return;
    }
    if (selected.kind === "customer") {
      void loadCustomerThread(selected.id);
    } else {
      void loadStaffThread(selected.id);
    }
  }, [selected, loadCustomerThread, loadStaffThread]);

  const sortedDirectory = useMemo(() => {
    return [...directory].sort((a, b) => {
      const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
      const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
      if (bTime !== aTime) return bTime - aTime;
      return a.name.localeCompare(b.name);
    });
  }, [directory]);

  const sidebarRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedDirectory;
    return sortedDirectory.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.phone.includes(q) ||
        row.roleLabel.toLowerCase().includes(q),
    );
  }, [sortedDirectory, searchQuery]);

  const showPickerList = pickerOpen || searchQuery.trim().length > 0;

  const selectedRow = selected
    ? directory.find((row) => row.kind === selected.kind && row.id === selected.id)
    : undefined;

  async function handleSend(body: string) {
    if (!selected) return;
    setSending(true);
    try {
      if (selected.kind === "customer") {
        await sendBusinessChatMessage(selected.id, body);
        await Promise.all([
          loadCustomerThread(selected.id),
          loadDirectory(),
        ]);
      } else {
        await sendBusinessStaffChatMessage(selected.id, body);
        await Promise.all([loadStaffThread(selected.id), loadDirectory()]);
      }
    } finally {
      setSending(false);
    }
  }

  async function refreshThread() {
    if (!selected) return;
    if (selected.kind === "customer") {
      await Promise.all([
        loadCustomerThread(selected.id),
        loadDirectory(),
      ]);
    } else {
      await Promise.all([loadStaffThread(selected.id), loadDirectory()]);
    }
  }

  const partnerName =
    selected?.kind === "customer"
      ? (customerThread?.customerName ?? selectedRow?.name ?? "Customer")
      : (staffThread?.staffName ?? selectedRow?.name ?? "Staff");

  const partnerSubtitle =
    selected?.kind === "customer"
      ? (customerThread?.customerPhone ?? selectedRow?.phone)
      : selectedRow
        ? `${selectedRow.roleLabel} · ${selectedRow.phone}`
        : undefined;

  const messages =
    selected?.kind === "customer"
      ? (customerThread?.messages ?? [])
      : (staffThread?.messages ?? []);

  const partnerIsTyping =
    selected?.kind === "customer"
      ? (customerThread?.partnerIsTyping ?? false)
      : false;

  const emptyHint =
    selected?.kind === "staff"
      ? "Staff receive this as a push alert. They cannot reply in chat yet."
      : "Say hello — your customer will see this in their portal.";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Inbox</p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Messages
        </h2>
        <p className="mt-1 text-sm text-muted">
          Chat with customers and send updates to branch managers and riders.
        </p>
      </div>

      <BusinessBulkBroadcastPanel
        onSent={() => {
          void loadDirectory();
        }}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface shadow-sm">
            <div className="relative border-b border-border p-3">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setPickerOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setPickerOpen(false), 150);
                }}
                placeholder="Search customers and staff…"
                aria-expanded={showPickerList}
                aria-controls="message-directory-list"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              {showPickerList && !listLoading ? (
                <ContactPickerList
                  id="message-directory-list"
                  rows={sidebarRows}
                  emptyQuery={searchQuery.trim().length > 0}
                  listError={listError}
                  directoryEmpty={directory.length === 0}
                  selected={selected}
                  onPick={(row) => {
                    setSelected({ kind: row.kind, id: row.id });
                    setSearchQuery("");
                    setPickerOpen(false);
                  }}
                  className="absolute left-3 right-3 top-full z-20 mt-1 max-h-[min(50vh,420px)] overflow-y-auto rounded-xl border border-border bg-surface shadow-lg lg:static lg:mt-3 lg:max-h-[min(70vh,640px)] lg:rounded-none lg:border-0 lg:shadow-none"
                />
              ) : null}
            </div>
            {listLoading ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Loading…
              </p>
            ) : (
              <div className="hidden lg:block">
                <ContactPickerList
                  rows={sortedDirectory}
                  emptyQuery={false}
                  listError={listError}
                  directoryEmpty={directory.length === 0}
                  selected={selected}
                  onPick={(row) =>
                    setSelected({ kind: row.kind, id: row.id })
                  }
                  className="max-h-[min(70vh,640px)] overflow-y-auto"
                />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <ChatThreadPanel
              partnerName={partnerName}
              partnerSubtitle={partnerSubtitle}
              messages={messages}
              partnerIsTyping={partnerIsTyping}
              loading={threadLoading}
              error={threadError}
              sending={sending}
              onSend={handleSend}
              onRefresh={refreshThread}
              onTypingPing={() => {
                if (selected.kind === "customer") {
                  void pingBusinessTyping(selected.id);
                }
              }}
              emptyHint={emptyHint}
            />
          ) : (
            <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary-surface/20 px-6 text-center text-sm text-muted">
              Select a customer or staff member to open the conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactPickerList({
  id,
  rows,
  emptyQuery,
  listError,
  directoryEmpty,
  selected,
  onPick,
  className = "",
}: {
  id?: string;
  rows: MessageDirectoryRecipient[];
  emptyQuery: boolean;
  listError: string | null;
  directoryEmpty: boolean;
  selected: SelectedRecipient | null;
  onPick: (row: MessageDirectoryRecipient) => void;
  className?: string;
}) {
  if (listError && directoryEmpty) {
    return (
      <p className={`px-4 py-6 text-center text-sm text-muted ${className}`}>
        {listError}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className={`px-4 py-6 text-center text-sm text-muted ${className}`}>
        {emptyQuery
          ? "No contacts match your search."
          : "No customers or staff yet."}
      </p>
    );
  }

  return (
    <ul
      id={id}
      className={`divide-y divide-border ${className}`}
      role="listbox"
    >
      {rows.map((row) => {
        const active = selected?.kind === row.kind && selected.id === row.id;
        return (
          <li key={`${row.kind}-${row.id}`} role="option" aria-selected={active}>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPick(row)}
              className={`w-full px-4 py-3 text-left transition-colors ${
                active
                  ? "bg-brand-light/40"
                  : "hover:bg-secondary-surface/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                  {row.name}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    row.kind === "staff"
                      ? "bg-secondary-surface text-muted"
                      : "bg-brand-light/80 text-brand"
                  }`}
                >
                  {row.roleLabel}
                </span>
              </div>
              <p className="truncate text-xs text-muted">{row.phone}</p>
              {row.lastMessagePreview ? (
                <p className="mt-1 truncate text-xs text-foreground/80">
                  {row.lastMessagePreview}
                </p>
              ) : (
                <p className="mt-1 text-xs italic text-muted">No messages yet</p>
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
  );
}