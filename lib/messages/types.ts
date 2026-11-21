export type ChatMessage = {
  id: string;
  body: string;
  senderRole: "customer" | "business";
  isMine: boolean;
  createdAt: string;
};

export type CustomerChatThread = {
  conversationId: string;
  partnerName: string;
  partnerIsTyping?: boolean;
  messages: ChatMessage[];
};

export type BusinessChatConversation = {
  conversationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
};

export type BusinessChatThread = {
  conversationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  partnerIsTyping?: boolean;
  messages: ChatMessage[];
};

export type MessageDirectoryRecipient = {
  kind: "customer" | "staff";
  id: string;
  name: string;
  phone: string;
  roleLabel: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
};

export type BusinessStaffChatThread = {
  staffUserId: string;
  staffName: string;
  staffPhone: string;
  staffRole: "branch_manager" | "rider";
  messages: ChatMessage[];
};
