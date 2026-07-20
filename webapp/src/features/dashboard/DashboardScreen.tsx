/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Info,
  Loader2,
  MessageSquare,
  Mic,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../components/Card';
import { ClassService, RecordingService } from '../../services/api';
import { getCurrentUserId } from '../../services/chatEngine';
import { ConversationEngine } from '../../services/conversationEngine';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { Class, Recording } from '../../types';
import { formatPersianDuration } from '../../utils/timeFormatter';

interface DashboardScreenProps {
  onNavigate: (tab: string, arg?: any) => void;
  onCreateClassTrigger: () => void;
}

const getStatusConfig = (status: Recording['status']) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-emerald-50/60 border-emerald-100/60 text-emerald-700',
        label: 'آماده تحلیل',
        dotColor: 'bg-emerald-500',
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />,
      };
    case 'failed':
      return {
        bg: 'bg-rose-50/60 border-rose-100/60 text-rose-700',
        label: 'تحلیل ناموفق',
        dotColor: 'bg-rose-500',
        icon: <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />,
      };
    default:
      return {
        bg: 'bg-amber-50/60 border-amber-100/60 text-amber-700',
        label: 'تحلیل هوش مصنوعی...',
        dotColor: 'bg-amber-400',
        icon: <Loader2 className="w-3 h-3 text-amber-600 animate-spin shrink-0" />,
      };
  }
};

export interface RecentChatActivity {
  classId: string;
  className: string;
  conversationId?: string;
  conversationTitle?: string;
  lastInteractedAt: string;
  lastMessageText: string;
  lastMessageRole?: 'user' | 'assistant';
}

let _cachedDashboardClasses: Class[] = [];
let _cachedDashboardRecordings: Recording[] = [];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, onCreateClassTrigger }) => {
  const { user, subscriptionStatus, syncSubscription } = useAuthStore();
  const [allRecordings, setAllRecordings] = useState<Recording[]>(_cachedDashboardRecordings);
  const [classes, setClasses] = useState<Class[]>(_cachedDashboardClasses);
  const [isLoading, setIsLoading] = useState(() => !subscriptionStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedSourceMessage, setDeletedSourceMessage] = useState<string | null>(null);

  function loadCachedRecentChats(): RecentChatActivity[] {
    try {
      const userId = user?.id || getCurrentUserId() || '';
      const key = userId ? `cb_recent_chats_${userId}` : 'cb_recent_chats_preauth';
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return list.slice(0, 3).map((chat: any) => {
        const lastConv = localStorage.getItem(`cb_last_conv_${chat.classId}`);
        return lastConv ? { ...chat, conversationId: lastConv } : chat;
      });
    } catch {
      return [];
    }
  }

  const [recentChats, setRecentChats] = useState<RecentChatActivity[]>(loadCachedRecentChats);

  // Time-based greeting helper
  const getGreetingText = (fullName?: string) => {
    const firstName = fullName ? fullName.trim().split(/\s+/)[0] : '';
    const hour = new Date().getHours();

    let prefix = 'سلام';
    if (hour >= 5 && hour < 12) {
      prefix = 'صبح بخیر';
    } else if (hour >= 12 && hour < 17) {
      prefix = 'سلام';
    } else if (hour >= 17 && hour < 21) {
      prefix = 'عصر بخیر';
    } else {
      prefix = 'شب بخیر';
    }

    return firstName ? `${prefix}، ${firstName}` : 'سلام';
  };

  // Helper for Persian relative time
  const getRelativePersianTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      const toPersianDigitsLocal = (num: string | number) => {
        const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return String(num).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
      };

      if (diffSec < 60) {
        return 'لحظاتی پیش';
      } else if (diffMin < 60) {
        return `${toPersianDigitsLocal(diffMin)} دقیقه پیش`;
      } else if (diffHour < 24) {
        return `${toPersianDigitsLocal(diffHour)} ساعت پیش`;
      } else if (diffDay === 1) {
        return 'دیروز';
      } else if (diffDay < 7) {
        return `${toPersianDigitsLocal(diffDay)} روز پیش`;
      } else {
        return toPersianDigitsLocal(
          date.toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric' })
        );
      }
    } catch {
      return 'بهتازگی';
    }
  };

  // Debounced/Reactive global search filters
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return classes.filter(cls => cls.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [classes, searchQuery]);

  const filteredRecordings = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allRecordings.filter(rec => rec.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allRecordings, searchQuery]);

  const filteredTranscripts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const results: { recording: Recording; segment: any }[] = [];
    allRecordings.forEach(rec => {
      if (rec.segments) {
        rec.segments.forEach(seg => {
          if (seg.text.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({ recording: rec, segment: seg });
          }
        });
      }
    });
    return results;
  }, [allRecordings, searchQuery]);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatHours = (hours: number) => {
    return formatPersianDuration(hours);
  };

  const handleRecentChatClick = (chat: RecentChatActivity) => {
    setDeletedSourceMessage(null);
    if (!chat.classId) return;

    const classConversations = ConversationEngine.getSortedConversations(chat.classId);
    if (classConversations.length === 0) {
      setDeletedSourceMessage('این گفتگو حذف شده است و دیگر قابل مشاهده نیست.');
      return;
    }

    if (chat.conversationId) {
      const conv = classConversations.find(c => c.id === chat.conversationId);
      if (!conv) {
        setDeletedSourceMessage('این گفتگو حذف شده است و دیگر قابل مشاهده نیست.');
        return;
      }
      onNavigate('classes', { openClassId: chat.classId, conversationId: chat.conversationId });
      return;
    }

    onNavigate('classes', { openClassId: chat.classId });
  };

  const needsSkeletonRef = useRef(isLoading);

  useEffect(() => {
    let cancelled = false;
    const needsSkeleton = needsSkeletonRef.current;

    async function loadDashboardData() {
      if (needsSkeleton) setIsLoading(true);
      try {
        await syncSubscription();
        const [fetchedClasses, fetchedRecordings] = await Promise.all([
          ClassService.getClasses(),
          RecordingService.getRecordings()
        ]);
        if (cancelled) return;
        setClasses(fetchedClasses);
        setAllRecordings(fetchedRecordings);
        _cachedDashboardClasses = fetchedClasses;
        _cachedDashboardRecordings = fetchedRecordings;

        // Determine user-scoped key for recent chats
        // Use the same user ID resolution as ChatEngine for consistency
        const userId = user?.id || getCurrentUserId() || '';
        const recentChatsKey = userId ? `cb_recent_chats_${userId}` : 'cb_recent_chats_preauth';
        const chatPrefix = userId ? `cb_chat_messages_${userId}_` : 'cb_chat_messages_preauth_';

        // Load recent chats from localStorage
        const storedChatsRaw = localStorage.getItem(recentChatsKey);
        let parsedChats: RecentChatActivity[] = [];
        if (storedChatsRaw) {
          try {
            parsedChats = JSON.parse(storedChatsRaw);
          } catch (e) {
            parsedChats = [];
          }
        }

        // Fallback/Recovery: scan localStorage keys for existing chat histories if empty
        if (parsedChats.length === 0) {
          const keys = Object.keys(localStorage);
          const chatKeys = keys.filter(k => k.startsWith(chatPrefix));

          chatKeys.forEach(key => {
            const classId = key.replace(chatPrefix, '');
            const matchingClass = fetchedClasses.find(c => c.id === classId);
            if (matchingClass) {
              const rawMsgs = localStorage.getItem(key);
              if (rawMsgs) {
                try {
                  const msgs = JSON.parse(rawMsgs);
                  if (msgs && msgs.length > 0) {
                    const lastMsg = msgs[msgs.length - 1];
                    parsedChats.push({
                      classId,
                      className: matchingClass.name,
                      lastInteractedAt: lastMsg.timestamp || new Date().toISOString(),
                      lastMessageText: lastMsg.content,
                      lastMessageRole: lastMsg.role
                    });
                  }
                } catch (e) {
                  // ignore
                }
              }
            }
          });

          // Sort by lastInteractedAt descending
          parsedChats.sort((a, b) => new Date(b.lastInteractedAt).getTime() - new Date(a.lastInteractedAt).getTime());

          // Save back so it is persistent
          if (parsedChats.length > 0) {
            localStorage.setItem(recentChatsKey, JSON.stringify(parsedChats));
          }
        }

        setRecentChats(parsedChats.slice(0, 3).map(chat => {
          const lastConv = localStorage.getItem(`cb_last_conv_${chat.classId}`);
          return lastConv ? { ...chat, conversationId: lastConv } : chat;
        }));
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load dashboard data', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    loadDashboardData();
    return () => { cancelled = true; };
  }, [syncSubscription]);

  if (isLoading || !subscriptionStatus) {
    return (
      <div className="space-y-8 lg:space-y-4 font-sans text-right p-1">
        {/* Welcome Banner — always show real text */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {getGreetingText(user?.fullName || undefined)} عزیز
            </h1>
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="border border-slate-100/80 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="h-11.5 bg-slate-50 border border-slate-100/50 rounded-2xl flex items-center justify-end px-3.5">
            <div className="w-4.5 h-4.5 bg-slate-250 rounded-full" />
          </div>
        </div>

        {/* Card Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border border-slate-100/80 p-5 rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[115px]">
              <div className="flex items-center justify-between">
                {/* Text on right (start), Icon on left (end) */}
                <div className="h-3.5 w-24 bg-slate-150 rounded-md" />
                <div className="w-8 h-8 bg-slate-100 rounded-xl" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-5 w-16 bg-slate-200 rounded-md" />
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity (takes 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-slate-200 rounded-md" />
              <div className="h-3 w-24 bg-slate-150 rounded-md" />
            </div>

            <div className="space-y-3.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100/80 rounded-3xl shadow-[0_4px_12px_-4px_rgba(0,0,0,0.02)] gap-4">
                  {/* Right side info (RTL flow) */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-slate-100 border border-slate-100/50 rounded-2xl shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0 text-right">
                      <div className="h-3.5 w-48 bg-slate-200 rounded-md" />
                      <div className="flex gap-2">
                        <div className="h-5 w-20 bg-slate-50 border border-slate-100/80 rounded-xl" />
                        <div className="h-5 w-16 bg-slate-50 border border-slate-100/80 rounded-xl" />
                      </div>
                    </div>
                  </div>

                  {/* Left side actions (RTL flow) */}
                  <div className="flex items-center gap-3.5 shrink-0">
                    <div className="h-5 w-16 bg-slate-100 border border-slate-100/80 rounded-full" />
                    <div className="h-8 w-8 bg-slate-50 border border-slate-100/80 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel (takes 1 col) */}
          <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-200 rounded-md" />

            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100/80 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 border border-slate-100/50 rounded-xl shrink-0" />
                    <div className="space-y-1.5 text-right">
                      <div className="h-3 w-28 bg-slate-200 rounded-md" />
                      <div className="h-2 w-36 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const remainingHours = subscriptionStatus.usage.maxRecordingHours - subscriptionStatus.usage.recordingHoursUsed;
  const remainingTokens = subscriptionStatus.usage.maxDailyTokens - subscriptionStatus.usage.dailyTokensUsed;
  const activeClasses = classes;

  // AI Capacity remaining percentage
  const maxTokens = subscriptionStatus.usage.maxDailyTokens || 60000;
  const usedTokens = subscriptionStatus.usage.dailyTokensUsed || 0;
  const aiUsedPct = Math.max(0, Math.min(100, Math.round((usedTokens / maxTokens) * 100)));
  const aiRemainingPct = Math.max(0, Math.min(100, 100 - aiUsedPct));

  // Recording remaining percentage
  const recordingRemainingPct = Math.max(0, Math.min(100, Math.round((remainingHours / subscriptionStatus.usage.maxRecordingHours) * 100)));
  const isUnlimitedRecording = subscriptionStatus.usage.maxRecordingHours >= 999;

  // Classes remaining percentage
  const remainingClasses = Math.max(0, subscriptionStatus.usage.maxClasses - activeClasses.length);
  const classesRemainingPct = Math.max(0, Math.min(100, Math.round((remainingClasses / subscriptionStatus.usage.maxClasses) * 100)));
  const isUnlimitedClasses = subscriptionStatus.usage.maxClasses >= 100;

  // Daily messages remaining
  const remainingDailyMessages = Math.max(0, subscriptionStatus.usage.maxDailyMessages - subscriptionStatus.usage.dailyMessagesSentCount);
  const dailyMessagesRemainingPct = Math.max(0, Math.min(100, Math.round((remainingDailyMessages / subscriptionStatus.usage.maxDailyMessages) * 100)));
  const isUnlimitedMessages = subscriptionStatus.usage.maxDailyMessages >= 999;

  const dailyMessagesLabel = isUnlimitedMessages
    ? "نامحدود"
    : remainingDailyMessages <= 0
      ? "حد مجاز به پایان رسید"
      : `${toPersianDigits(remainingDailyMessages)} از ${toPersianDigits(subscriptionStatus.usage.maxDailyMessages)} پیام باقی‌مانده`;

  // Subscription validity period calculations
  const hasSubscription = !!subscriptionStatus && subscriptionStatus.active;
  const expiresAt = subscriptionStatus?.expiresAt ? new Date(subscriptionStatus.expiresAt) : null;
  const lastRenewalAt = subscriptionStatus?.lastRenewalAt
    ? new Date(subscriptionStatus.lastRenewalAt)
    : (expiresAt ? new Date(expiresAt.getTime() - 30 * 24 * 3600 * 1000) : null);
  const isFreeTier = hasSubscription && subscriptionStatus?.planTier === 'free';

  const now = new Date();
  let totalDurationMs = 0;
  let elapsedMs = 0;
  let remainingDays = 0;
  let subRemainingPct = 0;
  let elapsedDays = 0;
  let isExpired = false;

  if (expiresAt && lastRenewalAt) {
    totalDurationMs = expiresAt.getTime() - lastRenewalAt.getTime();
    elapsedMs = now.getTime() - lastRenewalAt.getTime();
    const remainingMs = expiresAt.getTime() - now.getTime();

    if (totalDurationMs > 0) {
      subRemainingPct = Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100));
    }

    remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 3600 * 1000)));
    elapsedDays = Math.max(0, Math.floor(elapsedMs / (24 * 3600 * 1000)));
    isExpired = now.getTime() > expiresAt.getTime();
    if (isExpired) {
      subRemainingPct = 0;
    }
  }

  // Unified color theme based on REMAINING percentage (high remaining = Green, medium remaining = Yellow, low remaining = Red)
  const getRemainingColor = (pct: number) => {
    if (pct >= 50) return 'bg-emerald-500';
    if (pct >= 20) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 lg:space-y-4 font-sans text-right animate-in fade-in duration-300">

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {getGreetingText(user?.fullName)} عزیز
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">          
          </p>
        </div>
      </div>

      {/* Deleted source notification */}
      {deletedSourceMessage && (
        <div className="p-4 bg-amber-50 border border-amber-100/60 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-bold leading-relaxed shadow-sm dark:bg-amber-950/20 dark:border-amber-800/20 dark:text-amber-400">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span>{deletedSourceMessage}</span>
            <button
              onClick={() => setDeletedSourceMessage(null)}
              className="block mt-1 text-[10px] text-amber-700 dark:text-amber-300 font-bold hover:text-amber-900 dark:hover:text-amber-200 underline cursor-pointer"
            >
              بستن پیام
            </button>
          </div>
        </div>
      )}

      {/* Global Search Bar */}
      <Card className="border border-slate-100/80 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-right space-y-4">
        <div className="group relative w-full transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] focus-within:shadow-[0_12px_24px_rgba(43,89,234,0.03)] focus-within:-translate-y-[2px] active:scale-[0.995] rounded-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو..."
            className="w-full text-right bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border border-slate-100/80 hover:border-indigo-100/30 focus:border-indigo-500/20 rounded-2xl pr-10 pl-4 py-3.5 text-xs font-black outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 text-slate-800 focus:ring-4 focus:ring-indigo-500/5 cursor-pointer focus:cursor-text"
          />
          <Search className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500 group-focus-within:text-indigo-600 absolute right-3.5 top-[15px] transition-colors duration-300 pointer-events-none" />
        </div>

        {/* Search Results Drawer */}
        {searchQuery.trim().length > 0 && (
          <div className="bg-slate-50/40 rounded-2xl p-4 space-y-4 border border-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] divide-y divide-slate-100/50 max-h-[350px] overflow-y-auto">
            {/* 1. Classes Results */}
            {filteredClasses.length > 0 && (
              <div className="pt-3 first:pt-0">
                <span className="text-[10px] font-black text-slate-400 block mb-2">کلاسهای درسی منطبق ({toPersianDigits(filteredClasses.length)})</span>
                <div className="space-y-1.5">
                  {filteredClasses.map(cls => (
                    <div
                      key={cls.id}
                      onClick={() => onNavigate('classes', { openClassId: cls.id })}
                      className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/40 border border-slate-100/85 hover:border-indigo-100/60 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(43,89,234,0.02)] transition-all duration-300 cursor-pointer text-xs font-bold text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>{cls.name}</span>
                      </div>
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-450" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Recordings Results */}
            {filteredRecordings.length > 0 && (
              <div className="pt-3 first:pt-0">
                <span className="text-[10px] font-black text-slate-400 block mb-2">جلسات ضبط شده منطبق ({toPersianDigits(filteredRecordings.length)})</span>
                <div className="space-y-1.5">
                  {filteredRecordings.map(rec => (
                    <div
                      key={rec.id}
                      onClick={() => onNavigate('classes', { openClassId: rec.classId })}
                      className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/40 border border-slate-100/85 hover:border-indigo-100/60 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(43,89,234,0.02)] transition-all duration-300 cursor-pointer text-xs font-bold text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span>{rec.name}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold">درس: {rec.className}</span>
                        </div>
                      </div>
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-450" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Transcript Results */}
            {filteredTranscripts.length > 0 && (
              <div className="pt-3 first:pt-0">
                <span className="text-[10px] font-black text-slate-400 block mb-2">کلمات یافتهشده در رونوشتها ({toPersianDigits(filteredTranscripts.length)})</span>
                <div className="space-y-1.5">
                  {filteredTranscripts.map((snippet, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        // Play the recording and jump to the specific start second!
                        onNavigate('classes', { openClassId: snippet.recording.classId });
                        // Wait for playback element to load
                        setTimeout(() => {
                          usePlayerStore.getState().play(snippet.recording);
                          usePlayerStore.getState().triggerSeek(snippet.segment.start);
                        }, 300);
                      }}
                      className="p-3.5 bg-white hover:bg-slate-50/40 border border-slate-100/85 hover:border-indigo-100/60 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(43,89,234,0.02)] transition-all duration-300 cursor-pointer text-xs text-slate-750 space-y-1.5 text-right"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-1 text-indigo-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>ثانیه {toPersianDigits(snippet.segment.start)}</span>
                        </div>
                        <span>جلسه: {snippet.recording.name}</span>
                      </div>
                      <p className="text-slate-650 leading-relaxed font-bold">
                        ... {snippet.segment.text} ...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredClasses.length === 0 && filteredRecordings.length === 0 && filteredTranscripts.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400 font-bold">
                هیچ موردی منطبق با عبارت جستجوی شما یافت نشد.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Subscription Usage Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Remaining Recording Hours */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border border-slate-100/80 p-5 rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:border-indigo-100/70 transition-all relative overflow-hidden flex flex-col justify-between min-h-[125px] select-none text-right cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">ظرفیت صوت ماه</span>
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <div className={`text-center font-black text-xs ${remainingHours <= 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {isUnlimitedRecording
                ? "نامحدود"
                : remainingHours <= 0
                  ? "حد مجاز به پایان رسید"
                  : formatPersianDuration(remainingHours)}
            </div>

            {!isUnlimitedRecording && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${remainingHours <= 0 ? 'bg-rose-500' : getRemainingColor(recordingRemainingPct)} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${remainingHours <= 0 ? 0 : recordingRemainingPct}%` }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Classes Remaining */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border border-slate-100/80 p-5 rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:border-indigo-100/70 transition-all relative overflow-hidden flex flex-col justify-between min-h-[125px] select-none text-right cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">کلاس‌های باقی‌مانده</span>
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <div className={`text-center font-black text-xs ${remainingClasses <= 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {isUnlimitedClasses
                ? "نامحدود"
                : remainingClasses <= 0
                  ? "حد مجاز به پایان رسید"
                  : `${toPersianDigits(remainingClasses)} کلاس باقی‌مانده`}
            </div>

            {!isUnlimitedClasses && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${remainingClasses <= 0 ? 'bg-rose-500' : getRemainingColor(classesRemainingPct)} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${remainingClasses <= 0 ? 0 : classesRemainingPct}%` }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Daily Messages Remaining */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border border-slate-100/80 p-5 rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:border-indigo-100/70 transition-all relative overflow-hidden flex flex-col justify-between min-h-[125px] select-none text-right cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">پیام‌های باقی‌مانده امروز</span>
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <div className={`text-center font-black text-xs ${remainingDailyMessages <= 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {dailyMessagesLabel}
            </div>

            {!isUnlimitedMessages && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${remainingDailyMessages <= 0 ? 'bg-rose-500' : getRemainingColor(dailyMessagesRemainingPct)} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${remainingDailyMessages <= 0 ? 0 : dailyMessagesRemainingPct}%` }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Subscription Expiry Card */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border border-slate-100/80 p-5 rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:border-indigo-100/70 transition-all relative overflow-hidden flex flex-col justify-between min-h-[125px] select-none text-right cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">اعتبار اشتراک</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              !hasSubscription
                ? 'bg-slate-50 border-slate-100/80 text-slate-400'
                : isFreeTier
                  ? 'bg-emerald-50 border-emerald-100/60 text-emerald-600'
                  : isExpired
                    ? 'bg-rose-50 border-rose-100/60 text-rose-600'
                    : 'bg-indigo-50 border-indigo-100/60 text-emerald-600'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <div className={`text-center font-black text-xs ${
              isFreeTier
                ? 'text-emerald-600'
                : !hasSubscription || isExpired
                  ? 'text-rose-600'
                  : 'text-slate-900'
            }`}>
              {isFreeTier
                ? "بدون انقضا"
                : !hasSubscription
                  ? "بدون اشتراک فعال"
                  : isExpired
                    ? "حد مجاز به پایان رسید"
                    : `${toPersianDigits(remainingDays)} روز باقی‌مانده`}
            </div>

            {hasSubscription && !isFreeTier && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${
                    isExpired
                      ? 'bg-rose-500'
                      : getRemainingColor(subRemainingPct)
                  } h-full rounded-full transition-all duration-500`}
                  style={{ width: `${isExpired ? 0 : subRemainingPct}%` }}
                />
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Main Grid: Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>آخرین گفتگوهای شما</span>
            </h3>
            {recentChats.length > 0 && (
              <button
                onClick={() => onNavigate('classes')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer select-none"
              >
                <span>مشاهده همه کلاس‌ها</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentChats.length === 0 ? (
            <Card className="border border-slate-100/80 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 text-center">
              <div className="py-10 space-y-4">
                <div className="w-14 h-14 bg-slate-50/50 border border-slate-100/80 rounded-2xl flex items-center justify-center mx-auto text-slate-400 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                  <MessageSquare className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-sm font-black text-slate-700">هنوز گفتگوی اخیری ندارید</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-semibold">
                  برای شروع، وارد یکی از کلاسهای خود شوید و گفتگو با دستیار علمی و هوشمند کلاس را آغاز کنید تا در اینجا نمایش داده شود.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3.5">
              {recentChats.map((chat) => {
                return (
                  <motion.div
                    key={chat.classId}
                    whileHover={{
                      y: -2,
                      scale: 1.005,
                      boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.04), 0 4px 12px -4px rgba(0, 0, 0, 0.02)"
                    }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleRecentChatClick(chat)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRecentChatClick(chat);
                      }
                    }}
                    tabIndex={0}
                    aria-label={`گفتگو در کلاس ${chat.className}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100/80 hover:border-indigo-100/70 rounded-3xl shadow-[0_4px_12px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300 cursor-pointer group text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/80 focus-visible:ring-offset-2 gap-4"
                  >
                    {/* Right side info (RTL flow) */}
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-[0_2px_8px_-2px_rgba(43,89,234,0.06)]">
                          <MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        </div>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0 text-right">
                        <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors duration-250 block truncate">
                          گفتگو در کلاس {chat.className}
                        </span>

                        <p className="text-[11px] text-slate-400 group-hover:text-slate-500 transition-colors duration-250 block truncate max-w-[280px] sm:max-w-[420px] font-bold leading-relaxed">
                          {chat.lastMessageRole === 'user' ? 'شما: ' : chat.lastMessageRole === 'assistant' ? 'زیوای: ' : ''}{chat.lastMessageText}
                        </p>
                      </div>
                    </div>

                    {/* Left side actions & metadata */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t border-slate-100/50 sm:border-0">
                      {/* Interaction Badge */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black border border-indigo-100/50 bg-indigo-50/30 text-indigo-600 transition-all duration-300 shadow-sm shadow-indigo-100/10">
                        <span>ادامه گفتگو</span>
                      </span>

                      {/* Last Interacted Time & Navigation Arrow */}
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-slate-400 font-black tracking-wide shrink-0">
                          {getRelativePersianTime(chat.lastInteractedAt)}
                        </span>

                        <div className="w-8 h-8 bg-slate-50/60 border border-slate-100/80 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50/80 group-hover:border-indigo-100/60 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xs">
                          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
            </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800">دسترسی سریع</h3>

          <div className="grid grid-cols-1 gap-3">

            {/* Create Class */}
            <button
              onClick={onCreateClassTrigger}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/40 border border-slate-100/80 rounded-2xl hover:border-indigo-100/60 hover:shadow-[0_8px_24px_rgba(43,89,234,0.03)] shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all duration-300 group text-right cursor-pointer active:scale-99"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 block">ثبت کلاس جدید</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-450 group-hover:translate-x-[-2px] transition-transform" />
            </button>

            {/* Record Lecture */}
            <button
              onClick={() => onNavigate('record', { focusRecord: true })}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/40 border border-slate-100/80 rounded-2xl hover:border-indigo-100/60 hover:shadow-[0_8px_24px_rgba(43,89,234,0.03)] shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all duration-300 group text-right cursor-pointer active:scale-99"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 block">ضبط صدای کلاس</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-450 group-hover:translate-x-[-2px] transition-transform" />
            </button>

            {/* Upload Audio */}
            <button
              onClick={() => onNavigate('record', { focusUpload: true })}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/40 border border-slate-100/80 rounded-2xl hover:border-indigo-100/60 hover:shadow-[0_8px_24px_rgba(43,89,234,0.03)] shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all duration-300 group text-right cursor-pointer active:scale-99"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 block">بارگذاری فایل صوتی</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-450 group-hover:translate-x-[-2px] transition-transform" />
            </button>

            {/* View Subscription */}
            <button
              onClick={() => onNavigate('subscription')}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/40 border border-slate-100/80 rounded-2xl hover:border-indigo-100/60 hover:shadow-[0_8px_24px_rgba(43,89,234,0.03)] shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all duration-300 group text-right cursor-pointer active:scale-99"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 block">مدیریت اشتراک</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-450 group-hover:translate-x-[-2px] transition-transform" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};