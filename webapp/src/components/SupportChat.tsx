/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Floating Support Chat Widget
 *
 * Renders a fixed-position floating button (bottom-right) and an animated
 * chat window.  Uses the application's existing design language.
 *
 * Visibility rules:
 *   - Only rendered when authenticated AND the user is viewing the full
 *     application Dashboard (not onboarding, login, etc.).
 *   - Pass isFullAppDashboard={true} only when the user has completed
 *     onboarding and is on the APP_DASHBOARD_PREVIEW screen with the
 *     'dashboard' tab active.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';import { MessageSquare, X, Send, Headphones, Sparkles, Check, Clock } from 'lucide-react';
import { useSupportStore } from '../store/supportStore';
import { SupportEngine } from '../services/supportEngine';
import { useAuthStore } from '../store/authStore';

const toPersianDigits = (str: string | number) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
};

const formatTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return toPersianDigits(
      date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return '';
  }
};

const formatDateGroup = (isoString: string) => {
  try {
    const msgDate = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'امروز';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'دیروز';
    } else {
      return toPersianDigits(
        msgDate.toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' })
      );
    }
  } catch {
    return '';
  }
};

interface SupportChatProps {
  activeTab?: string;
  /** Must be true to render the button — only set when the user is fully
   *  authenticated, has completed onboarding, and is on the native Dashboard
   *  tab (APP_DASHBOARD_PREVIEW + activeTab === 'dashboard'). */
  isFullAppDashboard?: boolean;
}

export const SupportChat: React.FC<SupportChatProps> = ({ activeTab, isFullAppDashboard = false }) => {
  const { isAuthenticated } = useAuthStore();
  const {
    isOpen,
    conversation,
    unreadCount,
    input,
    inputError,
    open,
    close,
    toggle,
    setInput,
    sendMessage,
    refreshConversation,
    refreshUnread,
    clearInputError,
  } = useSupportStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Maximum message length from the engine
  const maxLength = SupportEngine.MAX_MESSAGE_LENGTH;
  const charCount = input.length;
  const isNearLimit = charCount > maxLength * 0.9;
  const isOverLimit = charCount > maxLength;

  // Refresh unread count periodically and on focus
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshUnread();
    const interval = setInterval(refreshUnread, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnread]);

  // Listen for incoming support messages (real-time delivery)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleSupportMessage = () => {
      if (isOpen) {
        refreshConversation();
      } else {
        refreshUnread();
      }
    };

    const handleSupportStatus = () => {
      if (isOpen) {
        refreshConversation();
      }
    };

    window.addEventListener('cb-support-message', handleSupportMessage);
    window.addEventListener('cb-support-status', handleSupportStatus);
    return () => {
      window.removeEventListener('cb-support-message', handleSupportMessage);
      window.removeEventListener('cb-support-status', handleSupportStatus);
    };
  }, [isAuthenticated, isOpen, refreshConversation, refreshUnread]);

  // Re-hydrate on login
  useEffect(() => {
    if (isAuthenticated) {
      refreshConversation();
    }
  }, [isAuthenticated, refreshConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages, isOpen]);

  // Focus the input when the window opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Visibility guard ──────────────────────────────────────────────────
  // The button must only render when:
  //   1. The user is authenticated AND
  //   2. The user is on the real Dashboard (not onboarding / admin / etc.)
  if (!isAuthenticated || !isFullAppDashboard) {
    // Even if the chat window was previously open, close it and hide
    // everything when the user navigates away from the Dashboard.
    return null;
  }

  const messages = conversation?.messages || [];
  const statusLabel = conversation?.status || 'open';

  // Notification indicator: grey by default, green when unread admin replies exist
  const hasUnreadReplies = unreadCount > 0;

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: typeof messages }[]>((acc, msg) => {
    const dateStr = formatDateGroup(msg.timestamp);
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.msgs.push(msg);
    } else {
      acc.push({ date: dateStr, msgs: [msg] });
    }
    return acc;
  }, []);

  return (
    <>
      {/* Floating Support Button - only visible on Dashboard */}
      <div className="fixed bottom-[120px] md:bottom-6 right-6 z-50 flex flex-col items-center gap-2">
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -10 }}
              className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg"
            >
              {toPersianDigits(unreadCount)}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggle}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_28px_rgba(79,70,229,0.35)] border border-indigo-400/30 flex items-center justify-center cursor-pointer transition-colors duration-200 active:scale-90"
          aria-label="پشتیبانی"
          title="پشتیبانی"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}

          {/* Notification indicator - grey by default, green when unread admin replies */}
          {!isOpen && (
            <span
              className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${
                hasUnreadReplies ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          )}

          {/* Ripple ring */}
          <span className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping opacity-30" />
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30, x: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-180px)] bg-white border border-slate-200/50 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden font-sans"
            dir="rtl"
          >
            {/* ── Header ── */}
            <div className="shrink-0 bg-indigo-600 px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">تیم پشتیبانی رایا</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] text-indigo-200 font-bold">آنلاین</span>
                    {statusLabel === 'waiting_support' && (
                      <>
                        <span className="text-indigo-300">•</span>
                        <span className="text-[9px] text-amber-300 font-bold">منتظر پاسخ</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/40 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-8">
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-100/60 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">پشتیبانی رایا</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[220px] leading-relaxed">
                      سلام! چطور می‌توانم به شما کمک کنم؟ سوال خود را بپرسید.
                    </p>
                  </div>
                </div>
              ) : (
                groupedMessages.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-2">
                      <div className="h-px bg-slate-200 flex-1" />
                      <span className="text-[9px] text-slate-400 font-black px-3">{group.date}</span>
                      <div className="h-px bg-slate-200 flex-1" />
                    </div>

                    {group.msgs.map((msg) => {
                      const isAdmin = msg.senderRole === 'admin';
                      return (
                        <div
                          key={msg.id}
                          // In RTL: justify-start = right, justify-end = left
                          // User messages on the right, admin messages on the left
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] ${isAdmin ? 'mr-10' : 'ml-10'}`}>
                            {/* Sender name */}
                            <div className={`flex items-center gap-1 mb-0.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[8px] text-slate-400 font-bold">
                                {isAdmin ? msg.senderName : 'شما'}
                              </span>
                            </div>

                            {/* Bubble */}
                            <div
                              className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words ${
                                isAdmin
                                  ? 'bg-white border border-slate-200/50 text-slate-800 rounded-tl-none'
                                  : 'bg-indigo-600 text-white rounded-tr-none'
                              }`}
                            >
                              <p className="font-semibold whitespace-pre-wrap">{msg.content}</p>
                            </div>

                            {/* Time & read status */}
                            <div className={`flex items-center gap-1 mt-0.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[8px] text-slate-400 font-bold">{formatTime(msg.timestamp)}</span>
                              {!isAdmin && (
                                <span className="text-[8px] text-slate-400">
                                  {msg.read ? (
                                    <Check className="w-2.5 h-2.5 inline text-emerald-500" />
                                  ) : (
                                    <Clock className="w-2.5 h-2.5 inline" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <div className="shrink-0 border-t border-slate-100/80 px-4 py-3 bg-white">
              <div className="flex items-stretch gap-0 bg-slate-50 border border-slate-200/40 rounded-xl focus-within:border-indigo-500/40 focus-within:bg-white transition-all duration-200">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="پیام خود را بنویسید..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 rounded-r-xl rounded-l-none px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none resize-none min-h-[38px] max-h-[100px] leading-relaxed transition-all duration-200"
                  dir="rtl"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isOverLimit}
                  className={`shrink-0 w-10 rounded-l-xl rounded-r-none flex items-center justify-center transition-all duration-200 border-0 ${
                    input.trim() && !isOverLimit
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm'
                      : 'bg-transparent text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Character counter + error message */}
              <div className="flex items-center justify-between mt-1.5">
                {/* Character counter */}
                <span
                  className={`text-[8px] font-bold transition-colors duration-200 ${
                    isOverLimit
                      ? 'text-rose-500'
                      : isNearLimit
                        ? 'text-amber-500'
                        : 'text-slate-400'
                  }`}
                >
                  {toPersianDigits(charCount)} / {toPersianDigits(maxLength)}
                </span>

                {/* Error message */}
                {inputError && (
                  <span className="text-[8px] font-bold text-rose-500 leading-relaxed">
                    {inputError}
                  </span>
                )}

                {/* Hint text (only shown when no error) */}
                {!inputError && !isOverLimit && (
                  <span className="text-[8px] text-slate-400 font-bold text-center">
                    تیم پشتیبانی معمولاً در کمتر از ۳۰ دقیقه پاسخ می‌دهد
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChat;