/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Admin Support Inbox — real conversation list with live status management.
 * Integrates with SupportEngine for persistence and real-time delivery.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageSquare, 
  Check, 
  Send,
  Clock,
  CheckCircle2,
  User,
  Phone,
  X,
  Trash2
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { SupportEngine } from '../../../services/supportEngine';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { SupportConversation, ConversationStatus, SupportCategory } from '../../../types';

const toPersianDigits = (str: string | number) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
};

const formatTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'هم‌اکنون';
    if (diffMin < 60) return `${toPersianDigits(diffMin)} دقیقه پیش`;
    if (diffHour < 24) return `${toPersianDigits(diffHour)} ساعت پیش`;
    if (diffDay < 7) return `${toPersianDigits(diffDay)} روز پیش`;
    return toPersianDigits(date.toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric' }));
  } catch {
    return '';
  }
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'باز', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100/60' },
  waiting_user: { label: 'منتظر کاربر', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100/60' },
  waiting_support: { label: 'منتظر پشتیبانی', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100/60' },
  resolved: { label: 'حل شده', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/60' },
  closed: { label: 'بسته شده', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200/40' },
};

const categoryOptions = [
  { value: 'TECHNICAL', label: 'فنی' },
  { value: 'BILLING', label: 'مالی' },
  { value: 'ACADEMIC', label: 'آموزشی' },
  { value: 'GENERAL', label: 'عمومی' },
];

export const SupportTab: React.FC = () => {
  const { activeAdmin } = useAdminAuthStore();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<SupportConversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation list
  const loadConversations = () => {
    const list = SupportEngine.getAdminConversationList();
    setConversations(list);
  };

  // Load a specific conversation's full data
  const loadFullConversation = (userId: string) => {
    const conv = SupportEngine.getConversationForUser(userId);
    if (conv) {
      setActiveConversation(conv);
    }
  };

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    const handleAdminList = () => loadConversations();
    const handleMessage = (e: Event) => {
      const convId = (e as CustomEvent).detail;
      loadConversations();
      // If the active conversation was updated, reload it
      if (activeConversation && activeConversation.id === convId) {
        loadFullConversation(activeConversation.userId);
      }
    };
    const handleStatusChange = () => {
      loadConversations();
      if (activeUserId) loadFullConversation(activeUserId);
    };

    window.addEventListener('cb-support-admin-list', handleAdminList);
    window.addEventListener('cb-support-message', handleMessage);
    window.addEventListener('cb-support-status', handleStatusChange);

    // Poll for cross-tab / storage changes
    const pollInterval = setInterval(handleStatusChange, 5000);

    return () => {
      window.removeEventListener('cb-support-admin-list', handleAdminList);
      window.removeEventListener('cb-support-message', handleMessage);
      window.removeEventListener('cb-support-status', handleStatusChange);
      clearInterval(pollInterval);
    };
  }, [activeUserId, activeConversation?.id, activeConversation?.userId]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Select a conversation
  const handleSelectConversation = (userId: string) => {
    setActiveUserId(userId);
    loadFullConversation(userId);
  };

  // Send admin reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeUserId || !activeAdmin) return;

    SupportEngine.sendAdminMessage(activeUserId, activeAdmin.fullName, replyText.trim());
    setReplyText('');
    loadFullConversation(activeUserId);
    loadConversations();
  };

  // Update status
  const handleUpdateStatus = (status: ConversationStatus) => {
    if (!activeUserId) return;
    SupportEngine.updateStatus(activeUserId, status, activeAdmin?.id, activeAdmin?.fullName);
    loadFullConversation(activeUserId);
    loadConversations();
  };

  // Update category
  const handleUpdateCategory = (category: SupportCategory) => {
    if (!activeUserId) return;
    SupportEngine.updateCategory(activeUserId, category);
    loadFullConversation(activeUserId);
    loadConversations();
  };

  // Update subject — commit on blur to avoid writing to localStorage on every keystroke
  const handleUpdateSubject = (subject: string) => {
    if (!activeUserId) return;
    SupportEngine.updateSubject(activeUserId, subject);
    loadFullConversation(activeUserId);
    loadConversations();
  };

  const handleSubjectBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleUpdateSubject(e.target.value);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        c.userName.toLowerCase().includes(q) ||
        c.userPhone.includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.lastMessagePreview.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeConvMessages = activeConversation?.messages || [];

  return (
    <div className="space-y-5 text-right font-sans">
      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در گفتگوها..."
            className="w-full text-right bg-white border border-slate-200/50 focus:border-indigo-500/50 rounded-xl pr-9 pl-3 py-2 text-xs font-bold outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold">فیلتر وضعیت:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200/50 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">همه</option>
            <option value="open">باز</option>
            <option value="waiting_user">منتظر کاربر</option>
            <option value="waiting_support">منتظر پشتیبانی</option>
            <option value="resolved">حل شده</option>
            <option value="closed">بسته شده</option>
          </select>
        </div>
      </div>

      {/* ── Two-column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* ── LEFT: Conversation List ── */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pl-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[11px] text-slate-400 font-bold">هیچ گفتگوی پشتیبانی یافت نشد</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const cfg = statusConfig[conv.status] || statusConfig.open;
              return (
                <div
                  key={conv.userId}
                  onClick={() => handleSelectConversation(conv.userId)}
                  className={`p-3.5 border rounded-2xl cursor-pointer text-right transition-all space-y-2 ${
                    activeUserId === conv.userId
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                      : 'bg-white border-slate-200/50 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0 text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-[11px] font-black truncate ${activeUserId === conv.userId ? 'text-white' : 'text-slate-800'}`}>
                          {conv.userName}
                        </h4>
                        <span className={`text-[9px] font-bold block truncate ${activeUserId === conv.userId ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {toPersianDigits(conv.userPhone)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      {conv.unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {toPersianDigits(conv.unreadCount)}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold ${activeUserId === conv.userId ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                  </div>

                  <p className={`text-[10px] font-bold leading-relaxed line-clamp-1 ${activeUserId === conv.userId ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {conv.lastMessagePreview}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${activeUserId === conv.userId ? 'bg-white/15 text-indigo-200' : cfg.bg + ' ' + cfg.color}`}>
                      {cfg.label}
                    </span>
                    {conv.assignedToName && (
                      <span className={`text-[8px] font-bold ${activeUserId === conv.userId ? 'text-indigo-200' : 'text-slate-400'}`}>
                        👤 {conv.assignedToName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── RIGHT: Active Conversation Thread ── */}
        <Card className="lg:col-span-2 p-0 border border-slate-200/50 bg-white rounded-2xl flex flex-col min-h-[520px] overflow-hidden">
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-14 h-14 bg-slate-50 border border-slate-200/40 rounded-2xl flex items-center justify-center mx-auto text-slate-350 mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-slate-600">یک گفتگو را انتخاب کنید</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">برای مشاهده جزئیات و پاسخ، روی یک گفتگو کلیک کنید</p>
            </div>
          ) : (
            <>
              {/* ── Thread Header ── */}
              <div className="shrink-0 px-5 py-3.5 border-b border-slate-100/50 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 truncate">{activeConversation.userName}</h4>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {toPersianDigits(activeConversation.userPhone)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Reset conversation - only administrators can do this */}
                    <button
                      onClick={() => {
                        if (window.confirm('آیا از بازنشانی این گفتگو اطمینان دارید؟ تمام پیام‌های این گفتگو برای شما و کاربر پاک خواهد شد.')) {
                          if (activeUserId) {
                            SupportEngine.resetConversation(activeUserId);
                            loadFullConversation(activeUserId);
                            loadConversations();
                          }
                        }
                      }}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100/60 text-rose-600 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="پاک کردن کامل تاریخچه گفتگو"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>پاک کردن</span>
                    </button>
                    {activeConversation.status !== 'resolved' && activeConversation.status !== 'closed' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus('resolved')}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/60 text-emerald-700 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>حل شد</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('closed')}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/40 text-slate-600 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>بستن</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus('open')}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/60 text-indigo-700 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>بازگشایی</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subject & Category row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={activeConversation.subject}
                    onBlur={handleSubjectBlur}
                    onChange={(e) => {
                      // Just update local state, don't persist until blur
                      setActiveConversation(prev => prev ? { ...prev, subject: e.target.value } : null);
                    }}
                    className="bg-slate-50 border border-slate-200/40 rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-700 outline-none focus:border-indigo-500/50 min-w-0 flex-1"
                    dir="rtl"
                  />
                  <select
                    value={activeConversation.category}
                    onChange={(e) => handleUpdateCategory(e.target.value as SupportCategory)}
                    className="bg-white border border-slate-200/40 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 outline-none cursor-pointer"
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className={`text-[9px] font-black px-2 py-1 rounded-md ${(statusConfig[activeConversation.status] || statusConfig.open).bg} ${(statusConfig[activeConversation.status] || statusConfig.open).color}`}>
                    {(statusConfig[activeConversation.status] || statusConfig.open).label}
                  </div>
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/40">
                {activeConvMessages.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 font-bold">
                    هنوز پیامی در این گفتگو ثبت نشده است.
                  </div>
                ) : (
                  activeConvMessages.map((msg) => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs max-w-[85%] space-y-1 ${
                          isAdmin
                            ? 'bg-indigo-600 text-white mr-auto text-right'
                            : 'bg-white text-slate-850 border border-slate-200/40 ml-auto text-right'
                        }`}
                      >
                        <div className={`flex items-center justify-between text-[9px] font-bold pb-1 border-b mb-1 ${
                          isAdmin ? 'border-white/15 text-indigo-200' : 'border-slate-100/50 text-slate-400'
                        }`}>
                          <span>{msg.senderName}</span>
                          <span>{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="leading-relaxed font-semibold whitespace-pre-wrap">{msg.content}</p>
                        {!isAdmin && (
                          <div className="flex items-center justify-end gap-1 mt-1 text-[8px] opacity-70">
                            {msg.read ? (
                              <>
                                <Check className="w-2.5 h-2.5" />
                                <span>خوانده شد</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-2.5 h-2.5" />
                                <span>تحویل داده شد</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Reply Form ── */}
              <div className="shrink-0 px-5 py-3 border-t border-slate-100/50 bg-white">
                {activeConversation.status !== 'resolved' && activeConversation.status !== 'closed' ? (
                  <form onSubmit={handleSendReply} className="flex items-center gap-2.5">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="پاسخ خود را بنویسید..."
                        className="w-full text-right bg-slate-50 border border-slate-200/50 focus:border-indigo-500 focus:bg-white rounded-xl pr-4 pl-11 py-2.5 text-xs font-bold outline-none transition-all placeholder:text-slate-400 text-slate-800"
                      />
                      <button
                        type="submit"
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!replyText.trim()}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-100/60 text-emerald-700 rounded-xl text-center text-xs font-black flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>این گفتگو مختومه شده است. برای پاسخ، گفتگو را بازگشایی کنید.</span>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

      </div>
    </div>
  );
};
