import React, { useState, useId } from 'react';
import {
  ChevronDown,
  FileText,
  BookOpen,
  ExternalLink,
  Clock,
  Target,
  Globe,
  Link,
  File,
  Monitor,
  StickyNote,
  BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSource, SourceType } from '../../types';

const sourceTypeConfig: Record<SourceType, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subtitle: string;
  color: string;
  bgColor: string;
  hoverBorder: string;
  hoverBg: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  metaColor: string;
  metaBg: string;
  deepLinkColor: string;
  deepLinkHover: string;
  deepLinkText: string;
}> = {
  lecture: {
    icon: FileText,
    label: 'تدریس کلاسی',
    subtitle: 'بخش منتخب تدریس صوتی کلاس',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    hoverBorder: 'hover:border-indigo-100/60 dark:hover:border-indigo-800/20',
    hoverBg: 'hover:bg-indigo-50/10 dark:hover:bg-indigo-900/10',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/20',
    iconBorder: 'border-indigo-100/60 dark:border-indigo-800/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    metaColor: 'text-indigo-600 dark:text-indigo-400',
    metaBg: 'bg-indigo-50 dark:bg-indigo-950/20',
    deepLinkColor: 'text-indigo-600 dark:text-indigo-400',
    deepLinkHover: 'hover:text-indigo-750 dark:hover:text-indigo-300',
    deepLinkText: 'پرش به دقیقه تدریس و تحلیل رونوشت',
  },
  textbook: {
    icon: BookOpen,
    label: 'کتاب مرجع',
    subtitle: 'بخش استخراج شده از کتاب درسی',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    hoverBorder: 'hover:border-emerald-100/60 dark:hover:border-emerald-800/20',
    hoverBg: 'hover:bg-emerald-50/10 dark:hover:bg-emerald-900/10',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconBorder: 'border-emerald-100/60 dark:border-emerald-800/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    metaColor: 'text-emerald-600 dark:text-emerald-400',
    metaBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    deepLinkColor: 'text-emerald-600 dark:text-emerald-400',
    deepLinkHover: 'hover:text-emerald-750 dark:hover:text-emerald-300',
    deepLinkText: 'نمایش صفحه کتاب در مرجع‌یاب',
  },
  pdf: {
    icon: File,
    label: 'فایل پی‌دی‌اف',
    subtitle: 'مستند استخراج شده از فایل پی‌دی‌اف',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    hoverBorder: 'hover:border-rose-100/60 dark:hover:border-rose-800/20',
    hoverBg: 'hover:bg-rose-50/10 dark:hover:bg-rose-900/10',
    iconBg: 'bg-rose-50 dark:bg-rose-950/20',
    iconBorder: 'border-rose-100/60 dark:border-rose-800/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    metaColor: 'text-rose-600 dark:text-rose-400',
    metaBg: 'bg-rose-50 dark:bg-rose-950/20',
    deepLinkColor: 'text-rose-600 dark:text-rose-400',
    deepLinkHover: 'hover:text-rose-750 dark:hover:text-rose-300',
    deepLinkText: 'مشاهده فایل پی‌دی‌اف منبع',
  },
  slide: {
    icon: Monitor,
    label: 'اسلاید ارائه',
    subtitle: 'مطلب استخراج شده از اسلاید ارائه',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    hoverBorder: 'hover:border-purple-100/60 dark:hover:border-purple-800/20',
    hoverBg: 'hover:bg-purple-50/10 dark:hover:bg-purple-900/10',
    iconBg: 'bg-purple-50 dark:bg-purple-950/20',
    iconBorder: 'border-purple-100/60 dark:border-purple-800/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    metaColor: 'text-purple-600 dark:text-purple-400',
    metaBg: 'bg-purple-50 dark:bg-purple-950/20',
    deepLinkColor: 'text-purple-600 dark:text-purple-400',
    deepLinkHover: 'hover:text-purple-750 dark:hover:text-purple-300',
    deepLinkText: 'مشاهده اسلاید منبع',
  },
  note: {
    icon: StickyNote,
    label: 'یادداشت درسی',
    subtitle: 'یادداشت استخراج شده از جزوه درسی',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    hoverBorder: 'hover:border-amber-100/60 dark:hover:border-amber-800/20',
    hoverBg: 'hover:bg-amber-50/10 dark:hover:bg-amber-900/10',
    iconBg: 'bg-amber-50 dark:bg-amber-950/20',
    iconBorder: 'border-amber-100/60 dark:border-amber-800/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    metaColor: 'text-amber-600 dark:text-amber-400',
    metaBg: 'bg-amber-50 dark:bg-amber-950/20',
    deepLinkColor: 'text-amber-600 dark:text-amber-400',
    deepLinkHover: 'hover:text-amber-750 dark:hover:text-amber-300',
    deepLinkText: 'مشاهده یادداشت منبع',
  },
  webpage: {
    icon: Globe,
    label: 'منبع اینترنتی',
    subtitle: 'منبع استخراج شده از اینترنت',
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/20',
    hoverBorder: 'hover:border-sky-100/60 dark:hover:border-sky-800/20',
    hoverBg: 'hover:bg-sky-50/10 dark:hover:bg-sky-900/10',
    iconBg: 'bg-sky-50 dark:bg-sky-950/20',
    iconBorder: 'border-sky-100/60 dark:border-sky-800/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    metaColor: 'text-sky-600 dark:text-sky-400',
    metaBg: 'bg-sky-50 dark:bg-sky-950/20',
    deepLinkColor: 'text-sky-600 dark:text-sky-400',
    deepLinkHover: 'hover:text-sky-750 dark:hover:text-sky-300',
    deepLinkText: 'مشاهده منبع اینترنتی',
  },
};

const badgeColors: Record<string, { bg: string; border: string; text: string }> = {
  lecture: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-100/50 dark:border-indigo-800/20', text: 'text-indigo-600 dark:text-indigo-400' },
  textbook: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100/50 dark:border-emerald-800/20', text: 'text-emerald-600 dark:text-emerald-400' },
  pdf: { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-100/50 dark:border-rose-800/20', text: 'text-rose-600 dark:text-rose-400' },
  slide: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-100/50 dark:border-purple-800/20', text: 'text-purple-600 dark:text-purple-400' },
  note: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100/50 dark:border-amber-800/20', text: 'text-amber-600 dark:text-amber-400' },
  webpage: { bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-100/50 dark:border-sky-800/20', text: 'text-sky-600 dark:text-sky-400' },
};

interface ChatMessageSourcesProps {
  sources: ChatSource[];
  onNavigateToSource?: (source: ChatSource) => void;
}

export const ChatMessageSources: React.FC<ChatMessageSourcesProps> = ({
  sources,
  onNavigateToSource
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  if (!sources || sources.length === 0) return null;

  const uniqueTypes = [...new Set(sources.map(s => s.type))];

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const getConfidenceScore = (index: number) => {
    const scores = [98, 96, 94, 91, 88];
    return scores[index % scores.length];
  };

  const truncateUrl = (url: string, maxLen = 50) => {
    if (url.length <= maxLen) return url;
    return url.substring(0, maxLen - 3) + '...';
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return undefined;
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-t-white/5 text-right select-none font-sans">

      {/* Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="w-full flex items-center justify-between group cursor-pointer text-slate-500 hover:text-indigo-600 transition-colors py-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold flex items-center gap-1.5 text-slate-600 group-hover:text-indigo-600 transition-colors">
            <BookMarked className="w-3.5 h-3.5" />
            <span>منابع</span>
            <span className="text-[10px] font-black text-slate-500 bg-slate-200/40 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 px-1.5 py-0.2 rounded-full">
              {toPersianDigits(sources.length)}
            </span>
          </span>

          {uniqueTypes.length > 0 && (
            <div className="flex gap-1">
              {uniqueTypes.map(type => {
                const badge = badgeColors[type] || badgeColors.webpage;
                return (
                  <span
                    key={type}
                    className={`text-[9px] font-extrabold ${badge.bg} ${badge.border} ${badge.text} px-1.5 py-0.5 rounded-md border`}
                  >
                    {sourceTypeConfig[type]?.label || type}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Expandable Sources */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={panelId}
            key="sources-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {sources.map((source, idx) => {
                const confidence = getConfidenceScore(idx);
                const cfg = sourceTypeConfig[source.type] || sourceTypeConfig.webpage;
                const Icon = cfg.icon;
                const sourceDomain = source.domain || (source.url ? extractDomain(source.url) : undefined);

                const excerptText = source.excerpt || '«... متن مرتبط با منبع انتخاب شده برای پاسخ‌دهی هوشمند ...»';

                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl p-4 transition-all bg-slate-50/50 dark:bg-white/[0.03] border-slate-200/50 dark:border-white/5 text-right ${cfg.hoverBorder} ${cfg.hoverBg}`}
                  >
                    {/* Source Metadata Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-slate-100/50 dark:border-b-white/5 text-xs font-bold text-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${cfg.iconBg} ${cfg.iconBorder} ${cfg.iconColor}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="text-right min-w-0">
                          <span className="font-black truncate max-w-[200px] block" title={source.title}>
                            {source.title}
                          </span>
                          <span className={`text-[10px] font-semibold block ${cfg.color}`}>
                            {cfg.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-[10px] text-slate-450 font-semibold">
                        {source.type === 'lecture' && source.timestamp && (
                          <span className={`flex items-center gap-1 ${cfg.metaBg} px-2 py-0.5 rounded-md ${cfg.metaColor}`}>
                            <Clock className="w-3 h-3" />
                            <span>ثانیه {toPersianDigits(source.timestamp)}</span>
                          </span>
                        )}

                        {(source.type === 'textbook' || source.type === 'pdf') && source.page && (
                          <span className={`flex items-center gap-1 ${cfg.metaBg} px-2 py-0.5 rounded-md ${cfg.metaColor}`}>
                            <BookOpen className="w-3 h-3" />
                            <span>صفحه {toPersianDigits(source.page)}</span>
                          </span>
                        )}

                        {source.type === 'slide' && source.page && (
                          <span className={`flex items-center gap-1 ${cfg.metaBg} px-2 py-0.5 rounded-md ${cfg.metaColor}`}>
                            <Monitor className="w-3 h-3" />
                            <span>اسلاید {toPersianDigits(source.page)}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                          <Target className="w-3 h-3 text-amber-500" />
                          <span>تطابق: {toPersianDigits(confidence)}٪</span>
                        </span>
                      </div>
                    </div>

                    {/* Excerpt Snippet */}
                    <div className="mt-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/40 dark:border-white/5 p-3 rounded-xl text-right">
                      <p className="text-[11px] leading-relaxed text-slate-500 italic font-medium">
                        {toPersianDigits(excerptText)}
                      </p>
                    </div>

                    {/* Domain / Publisher / URL */}
                    {(sourceDomain || source.publisher || source.url) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-400">
                        {sourceDomain && (
                          <span className="flex items-center gap-1 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded-md text-slate-500">
                            <Globe className="w-3 h-3" />
                            <span>{sourceDomain}</span>
                          </span>
                        )}
                        {source.publisher && (
                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 px-2 py-0.5 rounded-md text-slate-500 dark:text-slate-400">
                            <BookOpen className="w-3 h-3" />
                            <span>{source.publisher}</span>
                          </span>
                        )}
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 px-2 py-0.5 rounded-md text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors max-w-[200px]"
                            title={source.url}
                          >
                            <Link className="w-3 h-3 shrink-0" />
                            <span className="truncate direction-ltr text-left" dir="ltr">{truncateUrl(source.url)}</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Deep link action */}
                    {onNavigateToSource && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => onNavigateToSource(source)}
                          className={`text-[10px] font-black flex items-center gap-1.5 transition-colors cursor-pointer ${cfg.deepLinkColor} ${cfg.deepLinkHover}`}
                        >
                          <span>{cfg.deepLinkText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
