/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  Copy, 
  Check, 
  StopCircle, 
  Activity, 
  Coins, 
  MessageSquare, 
  AlertTriangle,
  Loader2,
  Bookmark,
  Share2,
  CornerDownLeft,
  BookMarked,
  ArrowDown,
  FileText,
  Layers
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatEngine } from '../../services/chatEngine';
import { ConversationEngine, truncateTitle } from '../../services/conversationEngine';
import { ChatMessage, ChatSource, AIStatus } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessageSources } from './ChatMessageSources';
import { BookmarkService } from '../../services/bookmarks';

interface ClassChatProps {
  classId: string;
  className: string;
  conversationId?: string;
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onTitleChange?: (title: string) => void;
}

export const ClassChat: React.FC<ClassChatProps> = ({ classId, className, conversationId, onMessagesChange, onTitleChange }) => {
  const { user, subscriptionStatus, syncSubscription } = useAuthStore();
  const hasGeneratedTitle = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchMode, setSearchMode] = useState<'lecture' | 'hybrid'>('hybrid');
  const [aiStatus, setAiStatus] = useState<AIStatus>('completed');
  const currentSourcesRef = useRef<ChatSource[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [composerHeight, setComposerHeight] = useState(80);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);

  // Notify parent component when messages list updates
  const onMessagesChangeRef = useRef(onMessagesChange);
  useEffect(() => {
    onMessagesChangeRef.current = onMessagesChange;
  }, [onMessagesChange]);

  useEffect(() => {
    onMessagesChangeRef.current?.(messages);
  }, [messages]);

  // Measure composer height dynamically to adjust chat margins and scroll button positioning
  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setComposerHeight(entry.target.clientHeight);
      }
    });
    
    observer.observe(composer);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Textarea auto-growing up to a cap of 160px
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const nextHeight = Math.min(textarea.scrollHeight, 160);
      textarea.style.height = `${nextHeight}px`;
    }
  }, [input]);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Track the latest messages so the cleanup effect never reads stale state
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  // Persist current messages to localStorage when leaving this conversation
  useEffect(() => {
    return () => {
      if (conversationId && messagesRef.current.length > 0 && !ChatEngine.wasCleared(conversationId)) {
        ChatEngine.saveMessages(conversationId, messagesRef.current);
      }
    };
  }, [conversationId]);

  // Sync aiStatus with the actual state of the message list.
  // This catches edge cases where the cb-chat-updated event
  // fires before React has re-rendered, ensuring the
  // Send/Stop button always reflects the real generation state.
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && last.isStreaming) {
        setAiStatus(last.status || 'generating');
      } else if (aiStatus !== 'completed' && !last.isStreaming) {
        setAiStatus('completed');
      }
    } else if (aiStatus !== 'completed') {
      setAiStatus('completed');
    }
  }, [messages]);

  // Subscribe to live updates from the background engine
  useEffect(() => {
    if (!conversationId) return;
    const handleChatUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === conversationId) {
        setMessages(ChatEngine.getMessages(conversationId));
        if (!ChatEngine.isGenerating(conversationId)) {
          setAiStatus('completed');
        }
      }
    };
    window.addEventListener('cb-chat-updated', handleChatUpdate);
    return () => window.removeEventListener('cb-chat-updated', handleChatUpdate);
  }, [conversationId]);

  // Load chat history on mount or when conversation changes
  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setError(null);
    currentSourcesRef.current = [];
    setShouldAutoScroll(true);
    hasGeneratedTitle.current = false;

    const history = ChatEngine.getMessages(conversationId);
    setMessages(history);
    if (history.length > 0) {
      const last = history[history.length - 1];
      if (last.role === 'assistant' && last.isStreaming) {
        setAiStatus(last.status || 'generating');
      } else {
        setAiStatus('completed');
      }
    } else {
      setAiStatus('completed');
    }
  }, [conversationId]);

  // Handle auto-scroll
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiStatus, shouldAutoScroll]);

  // Track recent chat activity in localStorage
  useEffect(() => {
    if (!classId || !className || !conversationId) return;

    const recentChatsKey = user?.id ? `cb_recent_chats_${user.id}` : 'cb_recent_chats_preauth';

    const updateRecentChats = () => {
      const stored = localStorage.getItem(recentChatsKey);
      let list: any[] = [];
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {
          list = [];
        }
      }

      let lastMsgText = 'گفتگو آغاز شد...';
      let lastMsgRole = undefined;
      
      if (messages && messages.length > 0) {
        const actualMessages = messages.filter(m => m.content && m.content.trim());
        if (actualMessages.length > 0) {
          const lastMsg = actualMessages[actualMessages.length - 1];
          lastMsgText = lastMsg.content;
          lastMsgRole = lastMsg.role;
        }
      }

      list = list.filter((item: any) => item.conversationId !== conversationId);

      list.unshift({
        conversationId,
        classId,
        className,
        lastInteractedAt: new Date().toISOString(),
        lastMessageText: lastMsgText,
        lastMessageRole: lastMsgRole
      });

      list = list.slice(0, 10);

      localStorage.setItem(recentChatsKey, JSON.stringify(list));
    };

    const timer = setTimeout(updateRecentChats, 150);
    return () => clearTimeout(timer);
  }, [conversationId, classId, className, messages]);

  // Monitor user scrolling to disable auto-scroll when they read old messages
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Check if user has scrolled up
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

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



  // Stop Generation
  const handleStopGeneration = () => {
    if (!conversationId) return;
    ChatEngine.stopGeneration(conversationId);
    setMessages(ChatEngine.getMessages(conversationId));
    setAiStatus('completed');
  };

  // Main Stream Sender
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : input;
    if (!textToSend.trim()) return;

    if (aiStatus !== 'completed') return;

    // Check if daily tokens exceeded
    if (isLimitReached) {
      setError('ظرفیت مجاز استفاده روزانه شما از هوش مصنوعی به پایان رسیده است. لطفاً فردا تلاش کرده یا اشتراک خود را ارتقا دهید.');
      return;
    }

    // Check if message exceeds the limit
    if (textToSend.length > 10000) {
      setError('پیام شما بسیار طولانی است. لطفاً قبل از ارسال آن را کوتاه‌تر کنید (حداکثر ۱۰,۰۰۰ کاراکتر).');
      return;
    }

    setError(null);
    if (customText === undefined) {
      setInput('');
    }

    // Auto-generate conversation title from first user message
    if (messages.length === 0 && !hasGeneratedTitle.current && onTitleChange) {
      hasGeneratedTitle.current = true;
      const title = ConversationEngine.generateTitle(
        [{ id: '', role: 'user', content: textToSend, timestamp: new Date().toISOString() }]
      );
      if (title !== 'گفتگوی جدید') {
        onTitleChange(title);
      }
    }

    // Delegate to the background engine
    if (!conversationId) return;
    ChatEngine.startGeneration(conversationId, classId, className, textToSend, searchMode);
    setMessages(ChatEngine.getMessages(conversationId));
    setAiStatus('generating');
    setShouldAutoScroll(true);
  };

  // Message Actions - Bookmark state initialized synchronously from storage
  const [bookmarkedMessageIds, setBookmarkedMessageIds] = useState<string[]>(() => {
    return BookmarkService.getBookmarks()
      .filter(b => b.type === 'response' && b.metadata.messageId)
      .map(b => b.metadata.messageId as string);
  });

  // Listen for bookmark changes from other tabs/components to stay in sync
  useEffect(() => {
    const handleBookmarksChanged = () => {
      const ids = BookmarkService.getBookmarks()
        .filter(b => b.type === 'response' && b.metadata.messageId)
        .map(b => b.metadata.messageId as string);
      setBookmarkedMessageIds(ids);
    };
    window.addEventListener('cb-bookmarks-changed', handleBookmarksChanged);
    return () => window.removeEventListener('cb-bookmarks-changed', handleBookmarksChanged);
  }, []);

  // Also refresh bookmark state when messages change (e.g., after sending a new message)
  useEffect(() => {
    const ids = BookmarkService.getBookmarks()
      .filter(b => b.type === 'response' && b.metadata.messageId)
      .map(b => b.metadata.messageId as string);
    setBookmarkedMessageIds(ids);
  }, [messages]);

  const handleToggleBookmarkMessage = (msg: ChatMessage) => {
    const isBookmarked = bookmarkedMessageIds.includes(msg.id);
    if (isBookmarked) {
      BookmarkService.removeBookmarkByMetadata('response', 'messageId', msg.id);
      setBookmarkedMessageIds(prev => prev.filter(id => id !== msg.id));
    } else {
      // Find the user prompt right before this assistant message
      const msgIndex = messages.findIndex(m => m.id === msg.id);
      let promptText = 'سوال کلاس ' + className;
      if (msgIndex > 0) {
        for (let i = msgIndex - 1; i >= 0; i--) {
          if (messages[i].role === 'user') {
            promptText = messages[i].content;
            break;
          }
        }
      }
      
      BookmarkService.addBookmark({
        type: 'response',
        title: truncateTitle(promptText) || `سوال کلاس ${className}`,
        description: msg.content,
        classId,
        className,
        metadata: {
          messageId: msg.id,
          content: msg.content,
          conversationId: conversationId || undefined,
          conversationTitle: undefined,
        }
      });
      setBookmarkedMessageIds(prev => [...prev, msg.id]);
    }
  };

  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  // Get localized status text
  const getStatusLabel = (status: AIStatus) => {
    switch (status) {
      case 'thinking':
        return 'در حال تفکر و پردازش پیام...';
      case 'searching_lecture':
        return 'در حال کاوش و فیلتر فایل‌های تدریس این کلاس...';
      case 'searching_textbook':
        return 'در حال جستجو و ترکیب منابع درسی و کتاب‌های مرجع...';
      case 'generating':
        return 'در حال تحلیل نهایی و تنظیم پاسخ...';
      default:
        return 'دستیار در حال نوشتن است...';
    }
  };

  // Daily token variables
  const tokensUsed = subscriptionStatus?.usage?.dailyTokensUsed ?? 0;
  const tokensMax = subscriptionStatus?.usage?.maxDailyTokens ?? 60000;
  const remainingTokens = Math.max(0, tokensMax - tokensUsed);
  const usagePercentage = tokensMax > 0 ? (tokensUsed / tokensMax) * 100 : 0;
  const isLimitReached = usagePercentage >= 100;
  const isApproachingLimit = usagePercentage >= 90 && usagePercentage < 100;

  return (
    <div className="flex flex-col flex-1 h-full relative min-h-[400px]">
      
      {/* 2. CHAT MESSAGES BODY */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 pt-[72px] scrollbar-thin scrollbar-thumb-slate-200 relative"
        style={{ paddingBottom: `${composerHeight + 16}px` }}
      >
        {/* Desktop: constrain message width and center */}
        <div className="md:max-w-4xl md:mx-auto space-y-6">

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-bold leading-relaxed shadow-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              {error.includes('ظرفیت مجاز') || error.includes('توکن') ? (
                <p className="text-[9px] text-rose-700 font-semibold mt-1">
                  سهمیه استفاده از هوش مصنوعی هر ۲۴ ساعت یکبار بازنشانی می‌شود. برای حذف محدودیت روزانه، از صفحه اشتراک پلن ویژه را تهیه کنید.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          /* Empty State Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto py-12 select-none">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100/60 rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-slate-800">
                گفتگوی علمی هوشمند کلاس «{className}»
              </h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">
                این گفتگو کاملاً ایزوله و متعلق به کلاس جاری است. هر سوالی در رابطه با جلسات صوتی تدریس شده یا کتاب‌های مرجع این حوزه درسی دارید، مستقیماً از من بپرسید!
              </p>
            </div>


          </div>
        ) : (
          /* Group messages by date and render them */
          messages.reduce<{ groups: { date: string; msgs: ChatMessage[] }[] }>((acc, msg, idx) => {
            const dateStr = formatDateGroup(msg.timestamp);
            const lastGroup = acc.groups[acc.groups.length - 1];

            if (lastGroup && lastGroup.date === dateStr) {
              lastGroup.msgs.push(msg);
            } else {
              acc.groups.push({ date: dateStr, msgs: [msg] });
            }

            return acc;
          }, { groups: [] }).groups.map((group, groupIdx) => (
            <div key={`group-${groupIdx}`} className="space-y-6">
              
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4 select-none">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] text-slate-400 font-black px-3.5 bg-slate-50 rounded-full">
                  {group.date}
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              {group.msgs.map((msg, msgIdx) => {
                const isUser = msg.role === 'user';
                const actualIndex = messages.findIndex(m => m.id === msg.id);

                return (
                  <div 
                    key={msg.id} 
                    className="w-full flex flex-col"
                  >
                    {/* Role Tag & Name above bubble */}
                    <div className={`flex items-center gap-1.5 mb-1 text-[9px] text-slate-400 font-bold px-1.5 ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                       <span>{isUser ? 'شما' : 'زیوای'}</span>
                    </div>

                    {/* Chat Bubble Container Wrapper */}
                    <div className={`flex flex-col max-w-[85%] md:max-w-[75%] w-fit min-w-0 ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'} group/msg relative animate-in fade-in duration-200 mb-4`}>
                      
                      {/* Chat Bubble Container */}
                      <div 
                        dir="auto"
                        className={`rounded-3xl p-4 shadow-3xs relative leading-relaxed flex flex-col gap-2.5 w-full break-words [word-break:break-word] [overflow-wrap:anywhere] min-w-0 ${
                          isUser 
                            ? 'bg-indigo-600 text-white rounded-tr-none text-start text-xs font-semibold' 
                            : 'bg-white border border-slate-200/50 text-slate-800 rounded-tl-none text-start text-xs'
                        }`}
                      >
                        
                        {/* Streaming status inside bubble if active */}
                          {!isUser && msg.status && msg.status !== 'completed' && msg.status !== 'failed' && (
                          <div className="mb-2.5 flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100/80 rounded-lg text-[9px] text-indigo-600 font-black self-start">
                            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                            <span>{getStatusLabel(msg.status)}</span>
                          </div>
                        )}

                        {/* Content Render */}
                        <div dir="auto" className="prose prose-slate max-w-none text-start leading-relaxed text-xs space-y-2 dark:prose-invert break-words [word-break:break-word] [overflow-wrap:anywhere] min-w-0">
                          {isUser ? (
                            <p className="whitespace-pre-wrap break-words [word-break:break-word] [overflow-wrap:anywhere]">{msg.content}</p>
                          ) : msg.content ? (
                            <Markdown
                              components={{
                                table: ({node, ...props}) => (
                                  <div className="overflow-x-auto my-2 border border-slate-100/80 rounded-xl">
                                    <table className="min-w-full divide-y divide-slate-100/50 text-[11px] text-slate-700 bg-slate-50/50" {...props} />
                                  </div>
                                ),
                                th: ({node, ...props}) => (
                                  <th dir="auto" className="px-3 py-2 bg-slate-100 text-slate-800 font-black border-l border-slate-200/50 last:border-0 text-start break-words [word-break:break-word] [overflow-wrap:anywhere]" {...props} />
                                ),
                                td: ({node, ...props}) => (
                                  <td dir="auto" className="px-3 py-2 border-t border-slate-100/50 border-l last:border-0 border-slate-150/40 text-slate-600 font-bold text-start break-words [word-break:break-word] [overflow-wrap:anywhere]" {...props} />
                                ),
                                ul: ({node, ...props}) => (
                                  <ul dir="auto" className="list-disc list-inside mr-2 my-1.5 space-y-1 text-slate-700 font-bold text-start break-words [word-break:break-word] [overflow-wrap:anywhere]" {...props} />
                                ),
                                ol: ({node, ...props}) => (
                                  <ol dir="auto" className="list-decimal list-inside mr-2 my-1.5 space-y-1 text-slate-700 font-bold text-start break-words [word-break:break-word] [overflow-wrap:anywhere]" {...props} />
                                ),
                                code: ({node, ...props}) => (
                                  <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono text-[10px] font-semibold break-words [word-break:break-word] [overflow-wrap:anywhere]" {...props} />
                                ),
                                p: ({node, ...props}) => (
                                  <p dir="auto" className="mb-1 text-slate-700 font-bold text-start break-words [word-break:break-word] [overflow-wrap:anywhere]" {...props} />
                                ),
                              }}
                            >
                              {msg.content}
                            </Markdown>
                          ) : (
                            /* Loading Stream typing indicator */
                            <div className="flex items-center gap-1 py-1 px-1 justify-start">
                              <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce delay-75"></span>
                              <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce delay-150"></span>
                              <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce delay-300"></span>
                            </div>
                          )}
                        </div>

                        {/* Sources attribution beneath assistant bubble */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <ChatMessageSources sources={msg.sources} />
                        )}

                      </div>

                      {/* Visual Action & Time Bar attached BELOW the bubble */}
                      <div className={`flex items-center gap-2 mt-1.5 px-1 text-[10px] text-slate-400 select-none w-full ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}>
                        
                        {/* Time display */}
                        <span className="font-bold">{formatTime(msg.timestamp)}</span>

                        <span className="text-slate-300">•</span>

                        {/* Separate Grey Buttons Row */}
                        <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200/50 rounded-full px-1.5 py-0.5 shadow-3xs">
                          {/* Copy message */}
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1 rounded-full transition-all cursor-pointer text-slate-500 hover:bg-slate-200 hover:text-slate-850"
                            title="کپی کردن متن پیام"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Bookmark message if Assistant */}
                          {!isUser && (
                            <button
                              onClick={() => handleToggleBookmarkMessage(msg)}
                              className={`p-1 rounded-full transition-all cursor-pointer ${
                                bookmarkedMessageIds.includes(msg.id)
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'text-slate-500 hover:bg-slate-200 hover:text-amber-600'
                              }`}
                              title={bookmarkedMessageIds.includes(msg.id) ? "حذف از نشان‌شده‌ها" : "نشانه‌گذاری پاسخ دستیار"}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedMessageIds.includes(msg.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                            </button>
                          )}


                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          ))
        )}

        {/* Streaming / Typing Indicator */}
        {aiStatus !== 'completed' && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="w-full flex flex-col select-none animate-in fade-in duration-200 mb-5">
            <div className="flex items-center gap-1.5 mb-1 text-[9px] text-slate-400 font-bold px-1.5 mr-auto">
               <span>زیوای</span>
              <span>•</span>
              <span>در حال تفکر</span>
            </div>
            <div className="flex flex-col max-w-[85%] md:max-w-[75%] mr-auto items-start w-fit min-w-0">
              <div dir="auto" className="rounded-3xl p-4 bg-white border border-slate-200/50 rounded-tl-none text-start text-xs flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100/80 rounded-lg text-[9px] text-indigo-600 font-black self-start">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  <span>{getStatusLabel(aiStatus)}</span>
                </div>
                <div className="flex items-center gap-1 py-1 justify-start">
                  <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-slate-450 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Scroll to Latest Button */}
      {!shouldAutoScroll && messages.length > 0 && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{ bottom: `${composerHeight + 36}px` }}
          className="absolute left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-[0_12px_32px_rgba(43,89,234,0.35)] border border-indigo-400/50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-30 cursor-pointer active:scale-95 hover:scale-105 transition-all opacity-100"
        >
          <ArrowDown className="w-4 h-4 shrink-0" />
          <span>آخرین پیام</span>
        </button>
      )}

      {/* 3. INPUT CHAT CONTROLS PANEL - Floating Glass Aesthetic */}
      <div 
        ref={composerRef}
        className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-4 md:right-4 z-20 flex flex-col gap-2 max-w-5xl mx-auto left-2 right-2 md:left-4 md:right-4"
      >
        
        {/* 90% Warning Banner */}
        {isApproachingLimit && (
          <div className="p-3 bg-amber-50/80 border border-amber-200/40 rounded-xl flex items-center gap-2.5 text-[10px] font-bold text-amber-800 leading-relaxed shadow-3xs animate-in fade-in slide-in-from-bottom-2 duration-200 text-right" dir="rtl">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              ⚠️ شما در حال نزدیک شدن به سقف مجاز روزانه هوش مصنوعی خود هستید. کمتر از ۱۰٪ از ظرفیت امروز شما باقی مانده است.
            </span>
          </div>
        )}

        {/* 100% Limit Reached Banner */}
        {isLimitReached && (
          <div className="p-3.5 bg-rose-50/60 border border-rose-200/40 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-rose-800 text-xs font-bold leading-relaxed shadow-3xs animate-in fade-in slide-in-from-bottom-2 duration-200 text-right" dir="rtl">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-black text-rose-900">سقف مجاز هوش مصنوعی به پایان رسیده است</p>
                <p className="text-[10px] font-medium text-rose-700/95 mt-0.5">
                   شما به سقف استفاده خود از هوش مصنوعی زیوای در دوره فعلی رسیده‌اید. این سقف با شروع دوره جدید یا روز بعد به صورت خودکار بازنشانی خواهد شد.
                </p>
              </div>
            </div>
            {subscriptionStatus?.expiresAt && (
              <span className="text-[10px] bg-rose-100/60 border border-rose-200/60 text-rose-800 px-2.5 py-1 rounded-lg whitespace-nowrap font-black self-end sm:self-center">
                تاریخ بازنشانی: {toPersianDigits(new Date(subscriptionStatus.expiresAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }))}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_rgba(15,23,42,0.06)] rounded-[20px] md:rounded-[26px] p-2 md:p-3 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40 focus-within:bg-white/95 transition-all duration-300">
          
          {/* Main Input Text Field */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              if (val.length > 10000) {
                setError('پیام شما بسیار طولانی است. لطفاً قبل از ارسال آن را کوتاه‌تر کنید (حداکثر ۱۰,۰۰۰ کاراکتر).');
              } else if (error && error.includes('پیام شما بسیار طولانی است')) {
                setError(null);
              }
            }}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              const currentText = input;
              const selectionStart = textareaRef.current?.selectionStart || 0;
              const selectionEnd = textareaRef.current?.selectionEnd || 0;
              
              const beforeSelection = currentText.substring(0, selectionStart);
              const afterSelection = currentText.substring(selectionEnd);
              
              const allowedPasteLength = 10000 - (beforeSelection.length + afterSelection.length);
              
              if (allowedPasteLength <= 0) {
                e.preventDefault();
                setError('پیام شما بسیار طولانی است. لطفاً قبل از ارسال آن را کوتاه‌تر کنید (حداکثر ۱۰,۰۰۰ کاراکتر).');
                return;
              }
              
              if (pastedText.length > allowedPasteLength) {
                e.preventDefault();
                const truncatedPaste = pastedText.substring(0, allowedPasteLength);
                const newValue = beforeSelection + truncatedPaste + afterSelection;
                setInput(newValue);
                setError('پیام شما بسیار طولانی است. لطفاً قبل از ارسال آن را کوتاه‌تر کنید (حداکثر ۱۰,۰۰۰ کاراکتر).');
                
                // Set cursor position after the pasted text
                setTimeout(() => {
                  if (textareaRef.current) {
                    const newCursorPos = selectionStart + truncatedPaste.length;
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                  }
                }, 0);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLimitReached && input.trim()) {
                  handleSendMessage();
                }
              }
            }}
            placeholder={isLimitReached ? "سقف استفاده روزانه شما به پایان رسیده است" : "بنویسید..."}
            disabled={aiStatus !== 'completed' || isLimitReached}
            maxLength={10000}
            className="w-full bg-transparent border-0 px-2 py-1 md:py-1.5 text-slate-850 text-xs font-semibold placeholder-slate-400 focus:outline-none resize-none min-h-[36px] max-h-[160px] leading-relaxed text-right min-w-0 font-medium overflow-y-auto"
            dir="rtl"
            rows={1}
          />

          {/* Controls Bar (Compact Toggle + Send Button) */}
          <div className="flex items-center justify-between gap-3 shrink-0 pt-2.5 px-1 md:px-1.5 pb-0.5" dir="rtl">
            
            {/* Segmented Knowledge Source Selector */}
            <div className="flex items-center gap-1 border border-slate-200/50 bg-slate-100/80 rounded-full p-1 h-8 md:h-9 select-none shrink-0 shadow-3xs">
              <button
                type="button"
                onClick={() => {
                  if (aiStatus === 'completed' && !isLimitReached) setSearchMode('lecture');
                }}
                disabled={aiStatus !== 'completed' || isLimitReached}
                className={`px-3 md:px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 text-[10px] md:text-[11px] font-bold flex items-center gap-1 ${
                  searchMode === 'lecture' 
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/40 font-black' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <FileText className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>تدریس کلاسی</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (aiStatus === 'completed' && !isLimitReached) setSearchMode('hybrid');
                }}
                disabled={aiStatus !== 'completed' || isLimitReached}
                className={`px-3 md:px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 text-[10px] md:text-[11px] font-bold flex items-center gap-1 ${
                  searchMode === 'hybrid' 
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/40 font-black' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>ترکیبی</span>
              </button>
            </div>

            {/* Action Button: Send or Stop */}
            <div className="shrink-0">
              <AnimatePresence mode="wait">
                {aiStatus !== 'completed' ? (
                  <motion.button
                    key="stop"
                    onClick={handleStopGeneration}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className="w-7.5 h-7.5 md:w-8.5 md:h-8.5 rounded-[10px] md:rounded-xl flex items-center justify-center cursor-pointer bg-white/80 backdrop-blur-sm border border-slate-200/50 text-rose-500 hover:bg-rose-50 hover:border-rose-200/60 hover:text-rose-600 shadow-xs active:scale-90 focus-visible:ring-2 focus-visible:ring-rose-500/20 transition-colors duration-200"
                    title="توقف تولید پاسخ دستیار"
                    aria-label="توقف تولید پاسخ"
                  >
                    <StopCircle className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="send"
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isLimitReached}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className={`w-7.5 h-7.5 md:w-8.5 md:h-8.5 rounded-[10px] md:rounded-xl flex items-center justify-center shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500/20 ${
                      input.trim() && !isLimitReached
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:scale-105' 
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                    title="ارسال سوال به دستیار"
                    aria-label="ارسال پیام"
                  >
                    <Send className="w-3.5 h-3.5 md:w-4 md:h-4 transform rotate-180" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>



    </div>
  );
};
