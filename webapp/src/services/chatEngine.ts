import { ChatMessage, ChatSource } from '../types';
import { ChatService } from './api';

const activeGenerations = new Map<string, AbortController>();

function getChatKey(classId: string): string {
  try {
    const raw = localStorage.getItem('cb_user_data');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) return `cb_chat_messages_${user.id}_${classId}`;
    }
  } catch {}
  return `cb_chat_messages_preauth_${classId}`;
}

function loadMessages(classId: string): ChatMessage[] {
  try {
    const cached = localStorage.getItem(getChatKey(classId));
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

function persistMessages(classId: string, messages: ChatMessage[]): void {
  localStorage.setItem(getChatKey(classId), JSON.stringify(messages));
}

function notifyUpdated(classId: string): void {
  window.dispatchEvent(new CustomEvent('cb-chat-updated', { detail: classId }));
}

export const ChatEngine = {
  isGenerating(classId: string): boolean {
    return activeGenerations.has(classId);
  },

  getMessages(classId: string): ChatMessage[] {
    return loadMessages(classId);
  },

  saveMessages(classId: string, messages: ChatMessage[]): void {
    persistMessages(classId, messages);
    notifyUpdated(classId);
  },

  startGeneration(
    classId: string,
    className: string,
    text: string,
    searchMode: 'lecture' | 'hybrid'
  ): void {
    if (activeGenerations.has(classId)) return;

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

  clearConversation(classId: string): void {
    if (activeGenerations.has(classId)) {
      activeGenerations.get(classId)!.abort();
      activeGenerations.delete(classId);
    }
    localStorage.removeItem(getChatKey(classId));
    notifyUpdated(classId);
  }
};

export type { ChatMessage };
