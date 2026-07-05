/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Copy, 
  Check, 
  FileText, 
  MessageSquare,
  Search,
  ChevronLeft
} from 'lucide-react';
import { Card } from '../../components/Card';
import { BookmarkService, BookmarkItem } from '../../services/bookmarks';
import Markdown from 'react-markdown';

interface BookmarksScreenProps {
  onNavigate: (tab: string, args?: any) => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ onNavigate }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => BookmarkService.getBookmarks());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleRemoveBookmark = (id: string) => {
    BookmarkService.removeBookmark(id);
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

  // Filter bookmarks
  const filtered = bookmarks.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getTypeNameInPersian = (type: string) => {
    switch (type) {
      case 'response': return 'پاسخ هوش مصنوعی';
      case 'lecture': return 'جلسه تدریس کلاسی';
      case 'transcript': return 'رونوشت زمانی';
      case 'conversation': return 'گفتگو علمی';
      default: return 'نشان شده';
    }
  };

  return (
    <div className="space-y-6 text-right font-sans animate-in fade-in duration-300">
      
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
                      نوع نشان‌گذاری: {getTypeNameInPersian(item.type)} • ذخیره شده در: {toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR'))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Action Navigation */}
                  <button
                    onClick={() => {
                      if (item.classId) {
                        onNavigate('classes', { openClassId: item.classId });
                      } else {
                        onNavigate('classes');
                      }
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100/80 hover:border-indigo-100/60 text-slate-600 hover:text-indigo-600 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>مشاهده منبع اصلی</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

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
                    onClick={() => handleRemoveBookmark(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-100/80 hover:border-rose-100/60 rounded-lg transition-colors cursor-pointer"
                    title="حذف نشان"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

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

    </div>
  );
};
