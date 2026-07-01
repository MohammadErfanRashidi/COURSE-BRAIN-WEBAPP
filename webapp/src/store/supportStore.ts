/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { SupportConversation } from '../types';
import { SupportEngine } from '../services/supportEngine';

interface SupportState {
  isOpen: boolean;
  conversation: SupportConversation | null;
  unreadCount: number;
  input: string;
  inputError: string | null;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setInput: (val: string) => void;
  refreshConversation: () => void;
  sendMessage: () => void;
  refreshUnread: () => void;
  clearInputError: () => void;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  isOpen: false,
  conversation: null,
  unreadCount: 0,
  input: '',
  inputError: null,

  open: () => {
    const conv = SupportEngine.getOrCreateConversation();
    const userInfo = (() => {
      try {
        const raw = localStorage.getItem('cb_user_data');
        if (raw) {
          const u = JSON.parse(raw);
          return u?.id || null;
        }
      } catch {}
      return null;
    })();
    if (userInfo) {
      SupportEngine.markAsRead(userInfo);
    }
    set({ isOpen: true, conversation: conv, unreadCount: 0, inputError: null });
  },

  close: () => {
    set({ isOpen: false });
  },

  toggle: () => {
    const s = get();
    if (s.isOpen) {
      s.close();
    } else {
      s.open();
    }
  },

  setInput: (val: string) => {
    // Client-side: prevent typing beyond the limit
    const maxLen = SupportEngine.MAX_MESSAGE_LENGTH;
    if (val.length > maxLen) {
      set({ inputError: `پیام شما از حداکثر ${maxLen.toLocaleString('fa-IR')} کاراکتر بیشتر است.` });
      return;
    }
    set({ input: val, inputError: null });
  },

  refreshConversation: () => {
    const conv = SupportEngine.getOrCreateConversation();
    const unreadCount = SupportEngine.getUnreadCount();
    set({ conversation: conv, unreadCount });
  },

  sendMessage: () => {
    const { input } = get();
    if (!input.trim()) return;

    const result = SupportEngine.sendUserMessage(input.trim());
    if (result.success) {
      set({ input: '', inputError: null });
      // Re-read the conversation to reflect the new message
      const conv = SupportEngine.getOrCreateConversation();
      set({ conversation: conv });
    } else if (result.error) {
      set({ inputError: result.error });
    }
  },

  refreshUnread: () => {
    const unreadCount = SupportEngine.getUnreadCount();
    set({ unreadCount });
  },

  clearInputError: () => {
    set({ inputError: null });
  },
}));