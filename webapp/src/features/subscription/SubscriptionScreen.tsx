/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Award,
  AlertCircle,
  History,
  TrendingUp,
  Receipt,
  RotateCw
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { SubscriptionService, PLANS_CONFIG, UNIVERSITY_PLAN_ID } from '../../services/api';
import { SubscriptionStatus } from '../../types';
import { formatPersianDuration } from '../../utils/timeFormatter';

interface PaymentLog {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed';
  refId: string;
  description: string;
}

export const SubscriptionScreen: React.FC = () => {
  const { subscriptionStatus, syncSubscription } = useAuthStore();
  const [history, setHistory] = useState<PaymentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatPrice = (amount: number) => {
    return toPersianDigits(amount.toLocaleString('fa-IR'));
  };

  const activePlan = PLANS_CONFIG[UNIVERSITY_PLAN_ID];

  const loadHistoryAndStatus = async () => {
    setIsLoading(true);
    try {
      await syncSubscription();
      const fetchedHistory = await SubscriptionService.getPaymentHistory();
      setHistory(fetchedHistory);
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری تاریخچه مالی');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryAndStatus();
  }, []);

  const handleRenew = async () => {
    setIsActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await SubscriptionService.renewSubscription();
      await syncSubscription();
      setSuccessMsg('اشتراک شما با موفقیت تمدید شد. سهمیههای ضبط صوتی بازنشانی شدند و اعتبار حساب ۳۰ روز تمدید گردید.');
      const updatedHistory = await SubscriptionService.getPaymentHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || 'خطا در تمدید اشتراک');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading || !subscriptionStatus) {
    return (
      <div className="space-y-6 font-sans text-right p-1">
        {/* Page Header Title Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-6 w-52 bg-slate-200 animate-pulse rounded-lg self-start" />
          <div className="h-4 w-72 bg-slate-100 animate-pulse rounded-md self-start" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Active Subscription Details */}
          <div className="border border-slate-100/80 rounded-3xl p-6 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="space-y-2 text-right">
                  <div className="h-4 w-36 bg-slate-250 animate-pulse rounded-md" />
                  <div className="h-3 w-20 bg-slate-100 animate-pulse rounded-md" />
                </div>
                <div className="w-10 h-10 bg-slate-100 animate-pulse rounded-xl" />
              </div>

              {/* Progress rows */}
              <div className="space-y-5 mt-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="h-3 w-16 bg-slate-150 animate-pulse rounded-md" />
                      <div className="h-3.5 w-24 bg-slate-200 animate-pulse rounded-md" />
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden" />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-10 bg-slate-100 animate-pulse rounded-xl mt-6" />
          </div>

          {/* Card 2: Subscription Tier Plan Details */}
          <div className="border border-slate-100/80 rounded-3xl p-6 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="space-y-2 text-right">
                  <div className="h-4 w-28 bg-slate-250 animate-pulse rounded-md" />
                  <div className="h-3 w-36 bg-slate-100 animate-pulse rounded-md" />
                </div>
                <div className="w-10 h-10 bg-slate-100 animate-pulse rounded-xl" />
              </div>

              {/* Premium Plan layout placeholders */}
              <div className="mt-5 space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 bg-slate-100 rounded-full animate-pulse shrink-0" />
                    <div className="h-3 w-48 bg-slate-150 animate-pulse rounded-md" />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-10 bg-indigo-50/50 border border-indigo-100/40 text-indigo-600 rounded-xl mt-6 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const remainingHours = subscriptionStatus.usage.maxRecordingHours - subscriptionStatus.usage.recordingHoursUsed;
  const remainingClasses = Math.max(subscriptionStatus.usage.maxClasses - subscriptionStatus.usage.classesCount, 0);

  return (
    <div className="space-y-8 font-sans text-right animate-in fade-in duration-300">

      {/* Page Header */}
      <div className="border-b border-slate-100/50 pb-5">
        <h1 className="text-xl font-black text-slate-900">اشتراک و لایسنس</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          وضعیت اشتراک ماهانه، سهمیههای مصرفی و تاریخچه تراکنشهای خود را مشاهده کنید.
        </p>
      </div>

      {/* FEEDBACK TOASTS */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100/60 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold shadow-xs animate-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100/60 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold shadow-xs animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAIN COLUMN: LICENSE DETAILS */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main License Card */}
          <Card className="border border-slate-100/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative">
            <div className="bg-indigo-600 px-6 py-5 text-white flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black">اشتراک ماهانه زیوای</h2>
                  <span className="text-[10px] text-indigo-150 font-medium block mt-0.5">دسترسی کامل به قابلیتهای پردازش صوتی و هوش مصنوعی</span>
                </div>
              </div>
              <span className="bg-white/20 text-[10px] font-bold px-3 py-1 rounded-full text-white">
                {subscriptionStatus.active ? 'فعال' : 'بدون اشتراک فعال'}
              </span>
            </div>

            <div className="p-6 space-y-6">

              {/* Price */}
              <div className="text-center border-b border-slate-100/50 pb-5">
                <span className="text-2xl font-black text-slate-900">{formatPrice(activePlan.price)}</span>
                <span className="text-xs text-slate-400 font-bold mr-1">تومان / ماه</span>
              </div>

              {/* Usage Gauges */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>مصرف سهمیه این ماه</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                    <span className="text-[10px] font-bold text-slate-400 block">زمان ضبط باقیمانده</span>
                    <span className="text-sm font-black text-indigo-600 block">
                      {formatPersianDuration(remainingHours)}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-bold">از {toPersianDigits(subscriptionStatus.usage.maxRecordingHours)} ساعت سهمیه ماهانه</span>
                  </div>

                  <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                    <span className="text-[10px] font-bold text-slate-400 block">ظرفیت هوش مصنوعی امروز</span>
                    <span className="text-sm font-black text-slate-800 block">
                      {toPersianDigits(Math.max(0, Math.min(100, Math.round(((subscriptionStatus.usage.maxDailyTokens - subscriptionStatus.usage.dailyTokensUsed) / subscriptionStatus.usage.maxDailyTokens) * 100))))}٪ در دسترس
                    </span>
                    <span className="text-[9px] text-slate-400 block font-bold">از {toPersianDigits(subscriptionStatus.usage.maxDailyTokens)} سهمیه ورودی روزانه</span>
                  </div>

                  <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                    <span className="text-[10px] font-bold text-slate-400 block">کلاس‌های باقی‌مانده</span>
                    <span className="text-sm font-black text-slate-800 block">
                      {toPersianDigits(remainingClasses)} / {toPersianDigits(subscriptionStatus.usage.maxClasses)} کلاس
                    </span>
                    <span className="text-[9px] text-slate-400 block font-bold">از {toPersianDigits(subscriptionStatus.usage.maxClasses)} کلاس سهمیه ماهانه</span>
                  </div>

                </div>
              </div>

              {/* Subscription Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2.5 bg-slate-50/30 border border-slate-100/60 rounded-xl px-3.5 py-2.5">
                  <div className="w-5 h-5 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-md flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{toPersianDigits(subscriptionStatus.usage.maxClasses)} کلاس درسی در ماه</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50/30 border border-slate-100/60 rounded-xl px-3.5 py-2.5">
                  <div className="w-5 h-5 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-md flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{toPersianDigits(subscriptionStatus.usage.maxRecordingHours)} ساعت ضبط صدا در ماه</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50/30 border border-slate-100/60 rounded-xl px-3.5 py-2.5">
                  <div className="w-5 h-5 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-md flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{toPersianDigits(subscriptionStatus.usage.maxDailyTokens)} پاسخ هوش مصنوعی در روز</span>
                </div>
              </div>

              {/* License Expiry & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100/50 pt-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>اعتبار تا:</span>
                    <span className="text-slate-800 font-bold">
                      {subscriptionStatus.expiresAt ? toPersianDigits(new Date(subscriptionStatus.expiresAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })) : 'نامحدود'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleRenew}
                  isLoading={isActionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>تمدید اشتراک زیوای</span>
                </Button>
              </div>

            </div>
          </Card>

        </div>

        {/* SIDEBAR: PAYMENT HISTORY */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>تاریخچه تراکنشها</span>
          </h3>

          <Card className="border border-slate-100/80 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] divide-y divide-slate-100/50">
            {history.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <History className="w-8 h-8 text-slate-300 mx-auto" />
                <span className="text-xs font-bold text-slate-400 block">هیچ تراکنشی یافت نشد.</span>
              </div>
            ) : (
              history.map((log) => (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 text-right space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{log.description}</span>
                    <span className="text-emerald-700 font-black">{toPersianDigits(log.amount.toLocaleString('fa-IR'))} تومان</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>کد پیگیری: {toPersianDigits(log.refId)}</span>
                    <span>{toPersianDigits(new Date(log.date).toLocaleDateString('fa-IR'))}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-md border border-emerald-100/60">تراکنش موفق</span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

      </div>

    </div>
  );
};