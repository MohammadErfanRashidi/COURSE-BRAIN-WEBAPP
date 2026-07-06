/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bookmark,
  Trash2,
  Copy,
  Check,
  FileText,
  MessageSquare,
  Search,
  ChevronLeft,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { BookmarkService, BookmarkItem } from '../../services/bookmarks';
import { ConversationEngine } from '../../services/conversationEngine';
import Markdown from 'react-markdown';

interface BookmarksScreenProps {
  onNavigate: (tab: string, args?: any) => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ onNavigate }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => BookmarkService.getBookmarks());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookmarkItem | null>(null);
  const [deletedSourceMessage, setDeletedSourceMessage] = useState<string | null>(null);

  const loadBookmarks = () => {
    setBookmarks(BookmarkService.getBookmarks());
  };

  useEffect(() => {
    const handleSync = () => loadBookmarks();
    window.addEventListener('cb-bookmarks-changed', handleSync);
    return () => {
      window.removeEventListener('cb-bookmarks-changed', handleSync);
    };
  }, []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    BookmarkService.removeBookmark(deleteTarget.id);
    setDeleteTarget(null);
    loadBookmarks();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const handleNavigateToSource = (item: BookmarkItem) => {
    setDeletedSourceMessage(null);

    if (!item.classId) {
      onNavigate('classes');
      return;
    }

    const classConversations = ConversationEngine.getSortedConversations(item.classId);

    if (classConversations.length === 0) {
      setDeletedSourceMessage('این گفتگو حذف شده است و دیگر قابل مشاهده نیست.');
      return;
    }

    if (item.type === 'response' && item.metadata.conversationId) {
      const conv = classConversations.find(c => c.id === item.metadata.conversationId);
      if (!conv) {
        setDeletedSourceMessage('این کلاس حذف شده است و دیگر قابل مشاهده نیست.');
        return;
      }
      onNavigate('classes', { openClassId: item.classId, conversationId: item.metadata.conversationId });
      return;
    }

    onNavigate('classes', { openClassId: item.classId });
  };

  // Filter and sort bookmarks (newest first)
  const filtered = useMemo(() => {
    return [...bookmarks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((item) => {
        const matchesType = filterType === 'all' || item.type === filterType;
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.className && item.className.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesType && matchesSearch;
      });
  }, [bookmarks, filterType, searchTerm]);

  const getTypeNameInPersian = (type: string) => {
    switch (type) {
      case 'response': return 'پاسخ هوش مصنوعی';
      case 'lecture': return 'جلسه تدریس کلاسی';
      case 'transcript': return 'رونوشت زمانی';
      case 'conversation': return 'گفتگو علمی';
      default: return 'نشان شده';
    }
  };

  const getSourceLabel = (item: BookmarkItem): string => {
    if (item.type === 'lecture') {
      const audioName = item.metadata.lectureName || item.title;
      return item.className ? `صوت: ${audioName} • کلاس: ${item.className}` : `صوت: ${audioName}`;
    }
    if (item.className) return `کلاس: ${item.className}`;
    if (item.metadata.conversationTitle) return `گفتگو: ${item.metadata.conversationTitle}`;
    return 'منبع نامشخص';
  };

  const getSourceContext = (item: BookmarkItem): string | null => {
    if (item.type === 'response') {
      const parts: string[] = [];
      if (item.className) parts.push(`کلاس: ${item.className}`);
      if (item.metadata.conversationId) {
        if (item.metadata.conversationTitle) {
          parts.push(`گفتگو: ${item.metadata.conversationTitle}`);
        } else {
          parts.push('گفتگوی نشان‌شده');
        }
      }
      return parts.join(' • ');
    }
    if (item.type === 'lecture') {
      if (item.className) return `کلاس: ${item.className} • صوت: ${item.metadata.lectureName || item.title}`;
      return null;
    }
    if (item.className) return `کلاس: ${item.className}`;
    return null;
  };

  return (
    <div className="space-y-6 text-right font-sans animate-in fade-in duration-300">

      {/* Deleted source notification */}
      {deletedSourceMessage && (
        <div className="p-4 bg-amber-50 border border-amber-100/60 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-bold leading-relaxed shadow-sm">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span>{deletedSourceMessage}</span>
            <button
              onClick={() => setDeletedSourceMessage(null)}
              className="block mt-1 text-[10px] text-amber-700 font-bold hover:text-amber-900 underline cursor-pointer"
            >
              بستن پیام
            </button>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Bookmark className="w-5.5 h-5.5 text-indigo-600 fill-indigo-100" />
          <span>مخزن نشان‌شده‌ها و علاقه‌مندی‌ها</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          تمامی جلسات تدریس، پیام‌های هوش مصنوعی و رونوشت‌های نشان‌شده خود را در این بخش یکپارچه مدیریت کنید.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Tab Filters */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-100/80 self-start md:self-auto text-xs font-bold text-slate-500">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-800 border border-slate-200/40 rounded-lg shadow-xs font-black'
                : 'hover:text-slate-700'
            }`}
          >
            همه نشان‌شده‌ها ({toPersianDigits(bookmarks.length)})
          </button>
          <button
            onClick={() => setFilterType('response')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'response'
                ? 'bg-white text-slate-800 border border-slate-200/40 rounded-lg shadow-xs font-black'
                : 'hover:text-slate-700'
            }`}
          >
            پاسخ‌های هوشمند ({toPersianDigits(bookmarks.filter(b => b.type === 'response').length)})
          </button>
          <button
            onClick={() => setFilterType('lecture')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'lecture'
                ? 'bg-white text-slate-800 border border-slate-200/40 rounded-lg shadow-xs font-black'
                : 'hover:text-slate-700'
            }`}
          >
            جلسات صوتی ({toPersianDigits(bookmarks.filter(b => b.type === 'lecture').length)})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در نشان‌شده‌ها..."
            className="w-full bg-white border border-slate-200/40 rounded-xl pr-9 pl-3.5 py-2 text-xs text-slate-750 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200 font-bold"
          />
        </div>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => {
          const isAi = item.type === 'response';
          const sourceContext = getSourceContext(item);

          return (
            <Card key={item.id} className="border border-slate-100/80 bg-white p-5 rounded-3xl space-y-4 hover:border-indigo-100/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isAi ? 'bg-indigo-50 border-indigo-100/60 text-indigo-600' : 'bg-emerald-50 border-emerald-100/60 text-emerald-600'
                  }`}>
                    {isAi ? <MessageSquare className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800 block truncate max-w-[280px] sm:max-w-md">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      {getSourceLabel(item)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold block">
                      نوع نشان‌گذاری: {getTypeNameInPersian(item.type)} • ذخیره شده در: {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Action Navigation — AI responses only */}
                  {isAi && (
                    <button
                      onClick={() => handleNavigateToSource(item)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100/80 hover:border-indigo-100/60 text-slate-600 hover:text-indigo-600 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>مشاهده منبع اصلی</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Copy description */}
                  {item.description && (
                    <button
                      onClick={() => handleCopy(item.id, item.description || '')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 bg-white border border-slate-100/80 hover:border-slate-200/60 rounded-lg transition-colors cursor-pointer"
                      title="کپی محتوا"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Delete Bookmark */}
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-100/80 hover:border-rose-100/60 rounded-lg transition-colors cursor-pointer"
                    title="حذف نشان"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Source context info */}
              {sourceContext && (
                <div className="text-[10px] font-bold text-slate-500 bg-slate-50/50 border border-slate-100/80 rounded-xl px-3 py-2 text-right">
                  {sourceContext}
                </div>
              )}

              {/* Snippet / Content excerpt */}
              {item.description && (
                <div className="bg-slate-50/50 border border-slate-100/80 rounded-2xl p-4 text-right">
                  {isAi ? (
                    <div className="prose prose-slate max-w-none text-right leading-relaxed text-xs text-slate-700 font-bold space-y-2">
                      <Markdown
                        components={{
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-2 border border-slate-100/80 rounded-xl">
                              <table className="min-w-full divide-y divide-slate-100 text-[10px] text-slate-700 bg-slate-50/50" {...props} />
                            </div>
                          ),
                          th: ({node, ...props}) => (
                            <th className="px-2.5 py-1.5 bg-slate-100 text-slate-800 font-black text-right" {...props} />
                          ),
                          td: ({node, ...props}) => (
                            <td className="px-2.5 py-1.5 border-t border-slate-100/50 text-slate-600 font-semibold" {...props} />
                          ),
                          ul: ({node, ...props}) => (
                            <ul className="list-disc list-inside mr-2 my-1 space-y-1 text-slate-700" {...props} />
                          ),
                          ol: ({node, ...props}) => (
                            <ol className="list-decimal list-inside mr-2 my-1 space-y-1 text-slate-700" {...props} />
                          ),
                          p: ({node, ...props}) => (
                            <p className="mb-1 text-slate-700 font-bold" {...props} />
                          ),
                        }}
                      >
                        {item.description}
                      </Markdown>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-600 font-semibold italic">
                      « {toPersianDigits(item.description)} »
                    </p>
                  )}
                </div>
              )}

            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-100/80 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
            <div className="w-14 h-14 bg-slate-50 border border-slate-200/40 rounded-2xl flex items-center justify-center mx-auto text-slate-350">
              <Bookmark className="w-6 h-6" />
            </div>
            <div className="text-xs font-black text-slate-800">هیچ نشان‌شده‌ای یافت نشد!</div>
            <p className="text-[10px] text-slate-450 max-w-sm mx-auto leading-relaxed">
              با کلیک روی آیکون نشانه‌گذاری در کنار پیام‌های دستیار یا صفحات رونوشت کلاس، مباحث کلیدی خود را در این گنجینه جمع‌آوری کنید.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
         MODAL: DELETE BOOKMARK CONFIRMATION
         ======================================================== */}
      {deleteTarget && createPortal(
        <div key="delete-bookmark-modal" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4" onClick={() => setDeleteTarget(null)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-rose-100/60 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-6 space-y-5 text-right font-sans"
          >
            <div className="flex items-center gap-2 text-rose-600 font-black text-sm border-b border-rose-50 pb-3">
              <AlertTriangle className="w-5 h-5" />
              <span>هشدار: حذف نشان‌شده</span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed font-bold">
                آیا واقعا مایل به حذف نشان‌شده <span className="text-indigo-600 font-black">«{deleteTarget.title}»</span> هستید؟
              </p>

              <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 text-[10px] text-rose-800 leading-relaxed font-semibold space-y-1 shadow-3xs">
                <div>⚠️ این عملیات قابل بازگشت نیست!</div>
                <p>
                  با تایید نهایی، این نشان‌شده برای همیشه از مخزن شما حذف خواهد شد و دیگر قابل بازیابی نیست.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-100/80 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer shadow-3xs"
              >
                انصراف
              </button>
              <Button
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer"
              >
                حذف نشان‌شده
              </Button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

    </div>
  );
};
