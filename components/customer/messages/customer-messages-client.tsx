"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatThreadPanel } from "@/components/messages/chat-thread-panel";
import { AuthApiError } from "@/lib/auth/api-client";
import {
  fetchCustomerChatThread,
  pingCustomerTyping,
  sendCustomerChatMessage,
} from "@/lib/customer-dashboard/messages-api";
import type { CustomerChatThread } from "@/lib/messages/types";

export function CustomerMessagesClient() {
  const [thread, setThread] = useState<CustomerChatThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadThread = useCallback(async () => {
    try {
      const data = await fetchCustomerChatThread();
      setThread(data);
      setError(null);
      window.dispatchEvent(new Event("cleanmate-push-message"));
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Could not load messages.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  async function handleSend(body: string) {
    setSending(true);
    try {
      const message = await sendCustomerChatMessage(body);
      setThread((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, message] }
          : prev,
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <p className="text-sm font-medium text-muted">Support</p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Messages
        </h2>
        <p className="mt-1 text-sm text-muted">
          Chat with your laundry about orders, pickups, and payments.
        </p>
      </div>

      <ChatThreadPanel
        partnerName={thread?.partnerName ?? "Your laundry"}
        messages={thread?.messages ?? []}
        partnerIsTyping={thread?.partnerIsTyping ?? false}
        loading={loading}
        error={error}
        sending={sending}
        onSend={handleSend}
        onRefresh={loadThread}
        onTypingPing={() => {
          void pingCustomerTyping();
        }}
      />
    </div>
  );
}
