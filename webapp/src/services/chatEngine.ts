import { ChatMessage, ChatSource } from '../types';
import { ChatService } from './api';

const activeGenerations = new Map<string, AbortController>();
const clearedConversations = new Set<string>();

export function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('cb_user_data');
    if (raw) {
      const user = JSON.parse(raw);
      return user?.id || null;
    }
  } catch {}
  return null;
}

export function buildChatKey(conversationId: string): string {
  const userId = getCurrentUserId();
  return userId
    ? `cb_chat_messages_${userId}_${conversationId}`
    : `cb_chat_messages_preauth_${conversationId}`;
}

export function migrateAllPreauthChats(): void {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const keys = Object.keys(localStorage);
    const prefix = 'cb_chat_messages_preauth_';
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        const convId = key.slice(prefix.length);
        if (convId) {
          const userKey = buildChatKey(convId);
          if (!localStorage.getItem(userKey)) {
            const data = localStorage.getItem(key);
            if (data) {
              localStorage.setItem(userKey, data);
              localStorage.removeItem(key);
            }
          }
        }
      }
    }
  } catch {}
}

function loadMessages(conversationId: string): ChatMessage[] {
  try {
    const cached = localStorage.getItem(buildChatKey(conversationId));
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

function persistMessages(conversationId: string, messages: ChatMessage[]): void {
  localStorage.setItem(buildChatKey(conversationId), JSON.stringify(messages));
}

function notifyUpdated(conversationId: string): void {
  window.dispatchEvent(new CustomEvent('cb-chat-updated', { detail: conversationId }));
}

export const ChatEngine = {
  isGenerating(conversationId: string): boolean {
    return activeGenerations.has(conversationId);
  },

  getMessages(conversationId: string): ChatMessage[] {
    return loadMessages(conversationId);
  },

  saveMessages(conversationId: string, messages: ChatMessage[]): void {
    clearedConversations.delete(conversationId);
    persistMessages(conversationId, messages);
    notifyUpdated(conversationId);
  },

  startGeneration(
    conversationId: string,
    classId: string,
    className: string,
    text: string,
    searchMode: 'lecture' | 'hybrid'
  ): void {
    if (activeGenerations.has(conversationId)) return;
    clearedConversations.delete(conversationId);

    const messages = loadMessages(conversationId);

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
    persistMessages(conversationId, newMessages);
    notifyUpdated(conversationId);

    const controller = new AbortController();
    activeGenerations.set(conversationId, controller);
    let accumulatedSources: ChatSource[] = [];

    ChatService.sendMessageStream(
      classId,
      className,
      text,
      searchMode,
      (status) => {
        const msgs = loadMessages(conversationId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) msgs[idx] = { ...msgs[idx], status };
        persistMessages(conversationId, msgs);
        notifyUpdated(conversationId);
      },
      (chunk) => {
        const msgs = loadMessages(conversationId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) msgs[idx] = { ...msgs[idx], content: msgs[idx].content + chunk };
        persistMessages(conversationId, msgs);
        notifyUpdated(conversationId);
      },
      (sources) => {
        accumulatedSources = sources;
        const msgs = loadMessages(conversationId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) msgs[idx] = { ...msgs[idx], sources };
        persistMessages(conversationId, msgs);
        notifyUpdated(conversationId);
      },
      () => {},
      (fullText) => {
        const msgs = loadMessages(conversationId);
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
        persistMessages(conversationId, msgs);
        notifyUpdated(conversationId);
        activeGenerations.delete(conversationId);
      },
      (err) => {
        const msgs = loadMessages(conversationId);
        const idx = msgs.findIndex(m => m.id === assistantMsgId);
        if (idx !== -1) {
          msgs[idx] = {
            ...msgs[idx],
            isStreaming: false,
            status: 'failed',
            content: msgs[idx].content || 'متأسفانه ارتباط با دستیار قطع شد. لطفاً دوباره تلاش کنید.'
          };
        }
        persistMessages(conversationId, msgs);
        notifyUpdated(conversationId);
        activeGenerations.delete(conversationId);
      },
      controller.signal
    ).catch(() => {
      const msgs = loadMessages(conversationId);
      const idx = msgs.findIndex(m => m.id === assistantMsgId);
      if (idx !== -1) msgs[idx] = { ...msgs[idx], isStreaming: false, status: 'failed' };
      persistMessages(conversationId, msgs);
      notifyUpdated(conversationId);
      activeGenerations.delete(conversationId);
    });
  },

  stopGeneration(conversationId: string): void {
    const controller = activeGenerations.get(conversationId);
    if (controller) {
      controller.abort();
      activeGenerations.delete(conversationId);
    }
    const msgs = loadMessages(conversationId);
    const last = msgs[msgs.length - 1];
    if (last && last.role === 'assistant' && last.isStreaming) {
      const updated = [...msgs.slice(0, msgs.length - 1), { ...last, isStreaming: false, status: 'completed' as const }];
      persistMessages(conversationId, updated);
      notifyUpdated(conversationId);
    }
  },

  wasCleared(conversationId: string): boolean {
    return clearedConversations.has(conversationId);
  },

  clearConversation(conversationId: string): void {
    clearedConversations.add(conversationId);
    if (activeGenerations.has(conversationId)) {
      activeGenerations.get(conversationId)!.abort();
      activeGenerations.delete(conversationId);
    }
    localStorage.removeItem(buildChatKey(conversationId));
    notifyUpdated(conversationId);
  }
};

export type { ChatMessage };
