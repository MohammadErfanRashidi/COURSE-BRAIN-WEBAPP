import { ChatConversation, ChatMessage } from '../types';
import { getCurrentUserId, buildChatKey } from './chatEngine';

function getConversationsKey(classId: string): string {
  const userId = getCurrentUserId();
  return userId
    ? `cb_conversations_${userId}_${classId}`
    : `cb_conversations_preauth_${classId}`;
}

function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function loadConversations(classId: string): ChatConversation[] {
  try {
    const cached = localStorage.getItem(getConversationsKey(classId));
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

function saveConversations(classId: string, conversations: ChatConversation[]): void {
  localStorage.setItem(getConversationsKey(classId), JSON.stringify(conversations));
  window.dispatchEvent(new CustomEvent('cb-conversations-changed', { detail: classId }));
}

export function migrateOldChatToConversation(classId: string): string | null {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const oldKey = `cb_chat_messages_${userId}_${classId}`;
  const oldData = localStorage.getItem(oldKey);
  if (!oldData) return null;

  try {
    const messages: ChatMessage[] = JSON.parse(oldData);
    if (!Array.isArray(messages) || messages.length === 0) return null;

    const conversations = loadConversations(classId);
    const alreadyMigrated = conversations.find(c => c.title === 'گفتگو قبل');
    if (alreadyMigrated) return alreadyMigrated.id;

    const conv: ChatConversation = {
      id: generateId(),
      classId,
      title: 'گفتگو قبل',
      messages,
      pinned: false,
      createdAt: messages[0]?.timestamp || new Date().toISOString(),
      updatedAt: messages[messages.length - 1]?.timestamp || new Date().toISOString()
    };

    // Migrate messages to the new conversationId key
    localStorage.setItem(buildChatKey(conv.id), oldData);

    conversations.push(conv);
    saveConversations(classId, conversations);
    localStorage.removeItem(oldKey);
    return conv.id;
  } catch {
    return null;
  }
}

export function truncateTitle(text: string, maxLen: number = 20): string {
  if (!text) return '';

  const normalized = text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ');

  if (!normalized) return '';
  if (normalized.length <= maxLen) return normalized;

  const truncated = normalized.substring(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLen / 2) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

export const ConversationEngine = {
  listConversations(classId: string): ChatConversation[] {
    return loadConversations(classId);
  },

  createConversation(classId: string): ChatConversation {
    const conversations = loadConversations(classId);
    const now = new Date().toISOString();
    const conv: ChatConversation = {
      id: generateId(),
      classId,
      title: 'گفتگوی جدید',
      messages: [],
      pinned: false,
      createdAt: now,
      updatedAt: now
    };
    conversations.push(conv);
    saveConversations(classId, conversations);
    return conv;
  },

  deleteConversation(classId: string, conversationId: string): void {
    const conversations = loadConversations(classId);
    const updated = conversations.filter(c => c.id !== conversationId);
    saveConversations(classId, updated);
    // Also remove the message data
    localStorage.removeItem(buildChatKey(conversationId));
  },

  updateTitle(classId: string, conversationId: string, title: string): void {
    const conversations = loadConversations(classId);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.title = title;
      conv.updatedAt = new Date().toISOString();
      saveConversations(classId, conversations);
    }
  },

  updateMessages(classId: string, conversationId: string, messages: ChatMessage[]): void {
    const conversations = loadConversations(classId);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.messages = messages;
      conv.updatedAt = new Date().toISOString();
      saveConversations(classId, conversations);
    }
  },

  generateTitle(messages: ChatMessage[]): string {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (!firstUserMsg) return 'گفتگوی جدید';
    const title = truncateTitle(firstUserMsg.content);
    return title || 'گفتگوی جدید';
  },

  togglePin(classId: string, conversationId: string): { success: boolean; message?: string } {
    const conversations = loadConversations(classId);
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return { success: false };

    if (conv.pinned) {
      conv.pinned = false;
      conv.updatedAt = new Date().toISOString();
      saveConversations(classId, conversations);
      return { success: true };
    }

    const pinnedCount = conversations.filter(c => c.pinned).length;
    if (pinnedCount >= 5) {
      return { success: false, message: 'حداکثر ۵ گفتگو می‌توانند نشان شوند.' };
    }

    conv.pinned = true;
    conv.updatedAt = new Date().toISOString();
    saveConversations(classId, conversations);
    return { success: true };
  },

  getSortedConversations(classId: string): ChatConversation[] {
    const conversations = loadConversations(classId);
    return conversations.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },

  /**
   * Promote a draft to a real conversation. The draft messages must already
   * be stored under the draftId key. This saves the conversation metadata.
   */
  promoteDraft(classId: string, draftId: string, title: string, messages: import('../types').ChatMessage[]): ChatConversation {
    const conversations = loadConversations(classId);
    const now = new Date().toISOString();
    const conv: ChatConversation = {
      id: draftId,
      classId,
      title,
      messages,
      pinned: false,
      createdAt: now,
      updatedAt: now
    };
    conversations.push(conv);
    saveConversations(classId, conversations);
    return conv;
  }
};
