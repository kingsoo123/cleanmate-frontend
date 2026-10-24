"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { formatMessageTime } from "@/lib/business-dashboard/format";
import type { ChatMessage } from "@/lib/messages/types";

type ChatThreadPanelProps = {
  partnerName: string;
  partnerSubtitle?: string;
  messages: ChatMessage[];
  loading?: boolean;
  error?: string | null;
  sending?: boolean;
  partnerIsTyping?: boolean;
  onSend: (body: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  onTypingPing?: () => void | Promise<void>;
  pollIntervalMs?: number;
  emptyHint?: string;
};

export function ChatThreadPanel({
  partnerName,
  partnerSubtitle,
  messages,
  loading = false,
  error = null,
  sending = false,
  partnerIsTyping = false,
  onSend,
  onRefresh,
  onTypingPing,
  pollIntervalMs = 2500,
  emptyHint = "Send a message to start the conversation.",
}: ChatThreadPanelProps) {
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingPingTimerRef = useRef<number | null>(null);

  const showPartnerTyping = partnerIsTyping && !sending;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, sending, showPartnerTyping, scrollToBottom]);

  useEffect(() => {
    if (!onRefresh || pollIntervalMs <= 0) return;
    const id = window.setInterval(() => {
      void onRefresh();
    }, pollIntervalMs);
    return () => window.clearInterval(id);
  }, [onRefresh, pollIntervalMs]);

  useEffect(() => {
    return () => {
      if (typingPingTimerRef.current !== null) {
        window.clearTimeout(typingPingTimerRef.current);
      }
    };
  }, []);

  function scheduleTypingPing() {
    if (!onTypingPing) return;
    if (typingPingTimerRef.current !== null) {
      window.clearTimeout(typingPingTimerRef.current);
    }
    typingPingTimerRef.current = window.setTimeout(() => {
      void onTypingPing();
    }, 350);
  }

  function handleDraftChange(next: string) {
    setDraft(next);
    if (next.trim().length > 0) {
      scheduleTypingPing();
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSendError(null);
    try {
      await onSend(text);
      setDraft("");
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : "Could not send message.",
      );
    }
  }

  return (
    <div className="flex h-[min(70vh,640px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <header className="border-b border-border px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-foreground">{partnerName}</p>
        {partnerSubtitle ? (
          <p className="text-xs text-muted">{partnerSubtitle}</p>
        ) : null}
      </header>

      {error ? (
        <p
          className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5"
      >
        {loading && messages.length === 0 ? (
          <p className="text-center text-sm text-muted">Loading messages…</p>
        ) : null}

        {!loading && messages.length === 0 && !showPartnerTyping ? (
          <p className="text-center text-sm text-muted">{emptyHint}</p>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[70%] ${
                message.isMine
                  ? "rounded-br-md bg-brand text-white"
                  : "rounded-bl-md border border-border bg-secondary-surface/80 text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
              <p
                className={`mt-1 text-[10px] ${
                  message.isMine ? "text-white/80" : "text-muted"
                }`}
              >
                {formatMessageTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {showPartnerTyping ? (
          <ChatTypingDotsIndicator
            side="theirs"
            label={`${partnerName} is typing`}
          />
        ) : null}

        {sending ? (
          <ChatTypingDotsIndicator side="mine" label="Sending message" />
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-secondary-surface/30 p-3 sm:p-4"
      >
        {sendError ? (
          <p className="mb-2 text-xs text-red-700" role="alert">
            {sendError}
          </p>
        ) : null}
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            rows={2}
            placeholder="Type your message…"
            className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="shrink-0 self-end rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatTypingDotsIndicator({
  side,
  label,
}: {
  side: "mine" | "theirs";
  label: string;
}) {
  const mine = side === "mine";

  return (
    <div
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <div
        className={
          mine
            ? "rounded-2xl rounded-br-md bg-brand px-4 py-3.5 shadow-sm"
            : "rounded-2xl rounded-bl-md border border-border bg-secondary-surface/80 px-4 py-3.5 shadow-sm"
        }
      >
        <span className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 150, 300].map((delayMs) => (
            <span
              key={delayMs}
              className={`chat-sending-dot h-2 w-2 rounded-full ${
                mine ? "bg-white" : "bg-muted"
              }`}
              style={{ animationDelay: `${delayMs}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
