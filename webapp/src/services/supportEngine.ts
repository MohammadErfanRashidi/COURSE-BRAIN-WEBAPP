/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Support Chat Engine — persistent support conversations per user.
 * Uses localStorage as the single source of truth, with custom events
 * for real-time delivery (same-tab and cross-tab via storage events).
 *
 * Key conventions:
 *   cb_support_conversation_{userId}   → the user's single conversation
 *   cb_support_conversations           → admin's aggregated list of all conversations
 */

import { SupportMessage, SupportConversation, ConversationStatus, SupportCategory } from '../types';
import { getCurrentUserId as getChatUserId } from './chatEngine';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

export const MAX_SUPPORT_MESSAGE_LENGTH = 2000;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function nowISO(): string {
  return new Date().toISOString();
}

function msgId(): string {
  return `sup_msg_${Math.random().toString(36).substring(2, 9)}`;
}

function convId(): string {
  return `conv_${Math.random().toString(36).substring(2, 9)}`;
}

// Re-export so consumers don't need to know which service provides it
// (logic lives in chatEngine.ts to avoid duplication).
export const getCurrentUserId = getChatUserId;

export function getCurrentUserInfo(): { id: string; name: string; phone: string } | null {
  try {
    const raw = localStorage.getItem('cb_user_data');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) {
        return { id: user.id, name: user.fullName || 'کاربر', phone: user.phoneNumber || '' };
      }
    }
  } catch {}
  return null;
}

function userKey(userId: string): string {
  return `cb_support_conversation_${userId}`;
}

const ADMIN_INDEX_KEY = 'cb_support_conversations';

// ──────────────────────────────────────────────
// Events
// ──────────────────────────────────────────────

function notifyMessage(conversationId: string): void {
  window.dispatchEvent(new CustomEvent('cb-support-message', { detail: conversationId }));
}

function notifyStatus(conversationId: string): void {
  window.dispatchEvent(new CustomEvent('cb-support-status', { detail: conversationId }));
}

function notifyAdminList(): void {
  window.dispatchEvent(new CustomEvent('cb-support-admin-list'));
}

// ──────────────────────────────────────────────
// Conversation CRUD
// ──────────────────────────────────────────────

function loadConversationRaw(userId: string): SupportConversation | null {
  try {
    const raw = localStorage.getItem(userKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConversationRaw(conv: SupportConversation): void {
  localStorage.setItem(userKey(conv.userId), JSON.stringify(conv));
}

/** Build an initial conversation for a user who hasn't started one yet. */
function createConversation(userId: string, userName: string, userPhone: string): SupportConversation {
  const conv: SupportConversation = {
    id: convId(),
    userId,
    userName,
    userPhone,
    status: 'open',
    category: 'TECHNICAL',
    subject: 'سوال پشتیبانی',
    lastMessageAt: nowISO(),
    lastMessagePreview: 'گفتگو آغاز شد...',
    unreadCount: 0,
    createdAt: nowISO(),
    messages: [],
  };
  saveConversationRaw(conv);
  updateAdminIndex(conv);
  return conv;
}

// ──────────────────────────────────────────────
// Admin index — a lightweight list of all conversations
// ──────────────────────────────────────────────

function loadAdminIndex(): SupportConversation[] {
  try {
    const raw = localStorage.getItem(ADMIN_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAdminIndex(list: SupportConversation[]): void {
  localStorage.setItem(ADMIN_INDEX_KEY, JSON.stringify(list));
}

function updateAdminIndex(conv: SupportConversation): void {
  const list = loadAdminIndex();
  const idx = list.findIndex(c => c.userId === conv.userId);
  const summary: SupportConversation = {
    ...conv,
    messages: [], // never store full messages in the index
  };
  if (idx >= 0) {
    list[idx] = summary;
  } else {
    list.unshift(summary);
  }
  // Keep sorted by lastMessageAt descending
  list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  saveAdminIndex(list);
  notifyAdminList();
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export const SupportEngine = {
  /**
   * Maximum character length for a single support message.
   */
  MAX_MESSAGE_LENGTH: MAX_SUPPORT_MESSAGE_LENGTH,

  /**
   * Get or create the current user's support conversation.
   */
  getOrCreateConversation(): SupportConversation | null {
    const userInfo = getCurrentUserInfo();
    if (!userInfo) return null;

    const existing = loadConversationRaw(userInfo.id);
    if (existing) return existing;

    return createConversation(userInfo.id, userInfo.name, userInfo.phone);
  },

  /**
   * Load the full conversation for a given userId (admin use).
   */
  getConversationForUser(userId: string): SupportConversation | null {
    return loadConversationRaw(userId);
  },

  /**
   * Get the admin's aggregated list of all conversations (lightweight).
   */
  getAdminConversationList(): SupportConversation[] {
    return loadAdminIndex();
  },

  /**
   * Send a message as the current authenticated user.
   * Returns an object with success status and optional error message.
   */
  sendUserMessage(content: string): { success: boolean; conversation?: SupportConversation | null; error?: string } {
    const userInfo = getCurrentUserInfo();
    if (!userInfo || !content.trim()) {
      return { success: false, conversation: null };
    }

    // Server-side validation: enforce max length
    if (content.length > MAX_SUPPORT_MESSAGE_LENGTH) {
      return {
        success: false,
        conversation: null,
        error: `پیام شما از حداکثر ${MAX_SUPPORT_MESSAGE_LENGTH.toLocaleString('fa-IR')} کاراکتر بیشتر است.`,
      };
    }

    let conv = loadConversationRaw(userInfo.id);
    if (!conv) {
      conv = createConversation(userInfo.id, userInfo.name, userInfo.phone);
    }

    const msg: SupportMessage = {
      id: msgId(),
      conversationId: conv.id,
      senderId: userInfo.id,
      senderRole: 'user',
      senderName: userInfo.name,
      content: content.trim(),
      timestamp: nowISO(),
      read: false,
    };

    conv.messages = [...conv.messages, msg];
    conv.lastMessageAt = msg.timestamp;
    conv.lastMessagePreview = msg.content;
    conv.status = 'waiting_support';

    saveConversationRaw(conv);
    updateAdminIndex(conv);
    notifyMessage(conv.id);
    return { success: true, conversation: conv };
  },

  /**
   * Send a message as an admin (from the admin panel).
   */
  sendAdminMessage(userId: string, adminName: string, content: string): SupportConversation | null {
    if (!content.trim()) return null;

    // Server-side validation: enforce max length
    if (content.length > MAX_SUPPORT_MESSAGE_LENGTH) return null;

    const conv = loadConversationRaw(userId);
    if (!conv) return null;

    const msg: SupportMessage = {
      id: msgId(),
      conversationId: conv.id,
      senderId: 'admin',
      senderRole: 'admin',
      senderName: adminName,
      content: content.trim(),
      timestamp: nowISO(),
      read: false,
    };

    conv.messages = [...conv.messages, msg];
    conv.lastMessageAt = msg.timestamp;
    conv.lastMessagePreview = msg.content;
    conv.status = 'waiting_user';
    conv.unreadCount = (conv.unreadCount || 0) + 1;

    saveConversationRaw(conv);
    updateAdminIndex(conv);
    notifyMessage(conv.id);
    return conv;
  },

  /**
   * Mark all messages in a conversation as read (for the current user).
   */
  markAsRead(userId: string): void {
    const conv = loadConversationRaw(userId);
    if (!conv) return;

    let changed = false;
    conv.messages = conv.messages.map(m => {
      if (!m.read) {
        changed = true;
        return { ...m, read: true };
      }
      return m;
    });

    if (changed) {
      conv.unreadCount = 0;
      saveConversationRaw(conv);
      updateAdminIndex(conv);
    }
  },

  /**
   * Update the category of a conversation.
   */
  updateCategory(userId: string, category: SupportCategory): void {
    const conv = loadConversationRaw(userId);
    if (!conv) return;
    conv.category = category;
    saveConversationRaw(conv);
    updateAdminIndex(conv);
  },

  /**
   * Update the subject of a conversation.
   */
  updateSubject(userId: string, subject: string): void {
    const conv = loadConversationRaw(userId);
    if (!conv) return;
    conv.subject = subject;
    saveConversationRaw(conv);
    updateAdminIndex(conv);
  },

  /**
   * Update conversation status.
   */
  updateStatus(userId: string, status: ConversationStatus, assignedTo?: string, assignedToName?: string): void {
    const conv = loadConversationRaw(userId);
    if (!conv) return;
    conv.status = status;
    if (assignedTo !== undefined) conv.assignedTo = assignedTo;
    if (assignedToName !== undefined) conv.assignedToName = assignedToName;
    saveConversationRaw(conv);
    updateAdminIndex(conv);
    notifyStatus(conv.id);
  },

  /**
   * Get unread count for the current user.
   */
  getUnreadCount(): number {
    const userInfo = getCurrentUserInfo();
    if (!userInfo) return 0;
    const conv = loadConversationRaw(userInfo.id);
    if (!conv) return 0;
    return conv.messages.filter(m => m.senderRole === 'admin' && !m.read).length;
  },

  /**
   * Reset a conversation — clears all messages and resets state.
   * Only administrators should call this.
   */
  resetConversation(userId: string): SupportConversation | null {
    const conv = loadConversationRaw(userId);
    if (!conv) return null;

    // Clear all messages and reset the conversation
    conv.messages = [];
    conv.lastMessageAt = nowISO();
    conv.lastMessagePreview = 'گفتگو بازنشانی شد...';
    conv.status = 'open';
    conv.unreadCount = 0;
    conv.subject = 'سوال پشتیبانی';
    conv.category = 'TECHNICAL';

    saveConversationRaw(conv);
    updateAdminIndex(conv);
    notifyStatus(conv.id);
    notifyMessage(conv.id);
    return conv;
  },
};

export type { SupportMessage, SupportConversation };