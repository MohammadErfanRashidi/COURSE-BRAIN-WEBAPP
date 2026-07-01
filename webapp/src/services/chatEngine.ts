import { ChatMessage, ChatSource } from '../types';
import { ChatService } from './api';

const activeGenerations = new Map<string, AbortController>();

/** Tracks classIds whose conversation was intentionally cleared */
const clearedConversations = new Set<string>();

// ──────────────────────────────────────────────
// Key helpers — single source of truth for both
// chatEngine.ts and the rest of the app.
// ──────────────────────────────────────────────

export function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('cb_user_data');
    if (raw) {
      const user = JSON.parse(raw);
      return user?.id || null;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export function buildChatKey(classId: string): string {
  const userId = getCurrentUserId();
  return userId
    ? `cb_chat_messages_${userId}_${classId}`
    : `cb_chat_messages_preauth_${classId}`;
}

export function buildPreauthChatKey(classId: string): string {
  return `cb_chat_messages_preauth_${classId}`;
}

/**
 * Migrate any preauth conversation for this classId to the current
 * user's key.  Does nothing if:
 *  - The user is not authenticated
 *  - There is no preauth data to migrate
 *  - The user key already has data (never overwrite)
 */
export function migratePreauthToUser(classId: string): void {
  const userId = getCurrentUserId();
  if (!userId) return;

  const preauthKey = buildPreauthChatKey(classId);
  const userKey = buildChatKey(classId);

  // Don't overwrite existing user-specific data
  if (localStorage.getItem(userKey)) return;

  const preauthData = localStorage.getItem(preauthKey);
  if (preauthData) {
    localStorage.setItem(userKey, preauthData);
    localStorage.removeItem(preauthKey);
  }
}

/**
 * Migrate ALL preauth chats to the current user's keys at once.
 * Called when the user logs in to ensure no orphaned data.
 */
export function migrateAllPreauthChats(): void {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const keys = Object.keys(localStorage);
    const preauthPrefix = 'cb_chat_messages_preauth_';

    for (const key of keys) {
      if (key.startsWith(preauthPrefix)) {
        const classId = key.slice(preauthPrefix.length);
        if (classId) {
          migratePreauthToUser(classId);
        }
      }
    }
  } catch {
    // ignore errors during migration
  }
}

// ──────────────────────────────────────────────
// Internal persistence helpers
// ──────────────────────────────────────────────

function loadMessages(classId: string): ChatMessage[] {
  // First, migrate any preauth data for this class
  migratePreauthToUser(classId);

  try {
    const cached = localStorage.getItem(buildChatKey(classId));
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

function persistMessages(classId: string, messages: ChatMessage[]): void {
  localStorage.setItem(buildChatKey(classId), JSON.stringify(messages));
}

function notifyUpdated(classId: string): void {
  window.dispatchEvent(new CustomEvent('cb-chat-updated', { detail: classId }));
}

// ──────────────────────────────────────────────
// Public Engine API
// ──────────────────────────────────────────────

export const ChatEngine = {
  isGenerating(classId: string): boolean {
    return activeGenerations.has(classId);
  },

  getMessages(classId: string): ChatMessage[] {
    return loadMessages(classId);
  },

  saveMessages(classId: string, messages: ChatMessage[]): void {
    // A save after a clear means a new conversation has started
    clearedConversations.delete(classId);
    persistMessages(classId, messages);
    notifyUpdated(classId);
  },

  /**
   * Start a new AI generation for the given class.
   * The request continues in the background even if the UI unmounts.
   */
  startGeneration(
    classId: string,
    className: string,
    text: string,
    searchMode: 'lecture' | 'hybrid'
  ): void {
    if (activeGenerations.has(classId)) return;
    // Starting a new generation means any prior clear flag is stale
    clearedConversations.delete(classId);

    const messages = loadMessages(classId);

    const userMsg: ChatMessage = {
      id: `msg_u_${Math.random().toString(36).substring(2, 9)}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const assistantMsgId = `msg_a_${Math.random().toString(36).substring(2, 9)}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      searchMode,
      status: 'queued',
      isStreaming: true,
      sources: []
    };

    const newMessages = [...messages, userMsg, assistantMsg];
    persistMessages(classId, newMessages);
    notifyUpdated(classId);

    const controller = new AbortController();
    activeGenerations.set(classId, controller);
    let accumulatedSources: ChatSource[] = [];

    ChatService.sendMessageStream(
      classId,
      className,
      text,
      searchMode,
      (status) => {
        const msgs = loadMessages(classId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
          msgs[idx] = { ...msgs[idx], status };
        }
        persistMessages(classId, msgs);
        notifyUpdated(classId);
      },
      (chunk) => {
        const msgs = loadMessages(classId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
          msgs[idx] = { ...msgs[idx], content: msgs[idx].content + chunk };
        }
        persistMessages(classId, msgs);
        notifyUpdated(classId);
      },
      (sources) => {
        accumulatedSources = sources;
        const msgs = loadMessages(classId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
          msgs[idx] = { ...msgs[idx], sources };
        }
        persistMessages(classId, msgs);
        notifyUpdated(classId);
      },
      () => {},
      (fullText) => {
        const msgs = loadMessages(classId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
          msgs[idx] = {
            ...msgs[idx],
            content: fullText,
            isStreaming: false,
            status: 'completed',
            sources: accumulatedSources
          };
        }
        persistMessages(classId, msgs);
        notifyUpdated(classId);
        activeGenerations.delete(classId);
      },
      (err) => {
        const msgs = loadMessages(classId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
          msgs[idx] = {
            ...msgs[idx],
            isStreaming: false,
            status: 'failed',
            content: msgs[idx].content || 'متأسفانه ارتباط با دستیار قطع شد. لطفاً دوباره تلاش کنید.'
          };
        }
        persistMessages(classId, msgs);
        notifyUpdated(classId);
        activeGenerations.delete(classId);
      },
      controller.signal
    ).catch(() => {
      const msgs = loadMessages(classId);
      const idx = msgs.findIndex(m => m.id === assistantMsgId);
      if (idx !== -1) {
        msgs[idx] = { ...msgs[idx], isStreaming: false, status: 'failed' };
      }
      persistMessages(classId, msgs);
      notifyUpdated(classId);
      activeGenerations.delete(classId);
    });
  },

  stopGeneration(classId: string): void {
    const controller = activeGenerations.get(classId);
    if (controller) {
      controller.abort();
      activeGenerations.delete(classId);
    }
    const msgs = loadMessages(classId);
    const last = msgs[msgs.length - 1];
    if (last && last.role === 'assistant' && last.isStreaming) {
      const updated = [...msgs.slice(0, msgs.length - 1), { ...last, isStreaming: false, status: 'completed' as const }];
      persistMessages(classId, updated);
      notifyUpdated(classId);
    }
  },

  wasCleared(classId: string): boolean {
    return clearedConversations.has(classId);
  },

  clearConversation(classId: string): void {
    clearedConversations.add(classId);
    if (activeGenerations.has(classId)) {
      activeGenerations.get(classId)!.abort();
      activeGenerations.delete(classId);
    }
    localStorage.removeItem(buildChatKey(classId));
    notifyUpdated(classId);
  }
};

export type { ChatMessage };
