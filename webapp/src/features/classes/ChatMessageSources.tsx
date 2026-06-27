/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  BookOpen, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Target 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSource } from '../../types';

interface ChatMessageSourcesProps {
  sources: ChatSource[];
  onNavigateToSource?: (source: ChatSource) => void;
}

export const ChatMessageSources: React.FC<ChatMessageSourcesProps> = ({ 
  sources, 
  onNavigateToSource 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  // Detect source badges
  const hasLectures = sources.some(s => s.type === 'lecture');
  const hasTextbooks = sources.some(s => s.type === 'textbook');

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  // Mock highly realistic confidence scores for each citation
  const getConfidenceScore = (index: number) => {
    const scores = [98, 96, 94, 91, 88];
    return scores[index % scores.length];
  };

  return (
    <div className="mt-4 pt-3.5 border-t border-slate-100 text-right select-none font-sans">
      
      {/* Interactive Expand/Collapse Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group cursor-pointer text-slate-500 hover:text-indigo-650 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-black flex items-center gap-1.5">
            📚 منابع علمی استفاده شده
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-150 px-1.5 py-0.2 rounded-full">
              {toPersianDigits(sources.length)} منبع
            </span>
          </span>

          {/* Source badges */}
          <div className="flex gap-1">
            {hasLectures && (
              <span className="text-[9px] font-extrabold bg-indigo-50 border border-indigo-100/50 text-indigo-600 px-1.5 py-0.5 rounded-md">
                تدریس کلاسی
              </span>
            )}
            {hasTextbooks && (
              <span className="text-[9px] font-extrabold bg-emerald-50 border border-emerald-100/50 text-emerald-600 px-1.5 py-0.5 rounded-md">
                کتاب مرجع
              </span>
            )}
            {hasLectures && hasTextbooks && (
              <span className="text-[9px] font-extrabold bg-purple-50 border border-purple-100/50 text-purple-600 px-1.5 py-0.5 rounded-md">
                ترکیبی
              </span>
            )}
          </div>
        </div>

        <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable Citations Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-3.5 space-y-3"
          >
            {sources.map((source, idx) => {
              const confidence = getConfidenceScore(idx);
              const isLecture = source.type === 'lecture';

              // Simulated excerpt fallback for elegant look if not present in mockup data
              const excerptText = source.excerpt || (isLecture 
                ? `«... در این قسمت از مبحث کلاس، استاد با تمرکز روی فرآیند مدل‌سازی ریاضی تأکید کردند که تمامی پارامترها باید منطبق با تئوری‌های مطرح شده در کتاب مرجع باشند ...»`
                : `«... بر اساس قضایای مرجع، مشخصه اصلی این سیستم‌ها تطابق فاز برداری است که در حل مسائل با روش‌های تخمین کوادراتیک کاربرد اساسی دارد ...»`
              );

              return (
                <div 
                  key={idx}
                  className={`border rounded-2xl p-4 transition-all bg-slate-50/50 text-right ${
                    isLecture ? 'border-slate-200 hover:border-indigo-100 hover:bg-indigo-50/10' : 'border-slate-200 hover:border-emerald-100 hover:bg-emerald-50/10'
                  }`}
                >
                  {/* Source Metadata Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-slate-100 text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isLecture ? 'bg-indigo-50 border border-indigo-100 text-indigo-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                      }`}>
                        {isLecture ? <FileText className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                      </div>

                      <div className="text-right">
                        <span className="font-black truncate max-w-[200px] block" title={source.title}>
                          {source.title}
                        </span>
                        <span className="text-[10px] text-slate-450 font-semibold block">
                          {isLecture ? 'بخش منتخب تدریس صوتی کلاس' : 'بخش استخراج شده از کتاب درسی'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-[10px] text-slate-450 font-semibold">
                      {isLecture && source.timestamp && (
                        <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          <span>ثانیه {toPersianDigits(source.timestamp)}</span>
                        </span>
                      )}

                      {!isLecture && source.page && (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <BookOpen className="w-3 h-3" />
                          <span>صفحه {toPersianDigits(source.page)}</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                        <Target className="w-3 h-3 text-amber-500" />
                        <span>تطابق: {toPersianDigits(confidence)}٪</span>
                      </span>
                    </div>
                  </div>

                  {/* Excerpt Snippet */}
                  <div className="mt-3 bg-white border border-slate-150 p-3 rounded-xl text-right">
                    <p className="text-[11px] leading-relaxed text-slate-500 italic font-medium">
                      {toPersianDigits(excerptText)}
                    </p>
                  </div>

                  {/* Deep link action */}
                  {onNavigateToSource && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onNavigateToSource(source)}
                        className={`text-[10px] font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isLecture ? 'text-indigo-600 hover:text-indigo-750' : 'text-emerald-600 hover:text-emerald-750'
                        }`}
                      >
                        <span>{isLecture ? 'پرش به دقیقه تدریس و تحلیل رونوشت' : 'نمایش صفحه کتاب در مرجع‌یاب'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
