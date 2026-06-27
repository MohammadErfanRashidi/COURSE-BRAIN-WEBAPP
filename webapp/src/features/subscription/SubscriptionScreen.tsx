/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Award, 
  AlertCircle,
  History,
  TrendingUp,
  Receipt,
  RotateCw,
  Zap,
  Check,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { SubscriptionService } from '../../services/api';
import { SubscriptionStatus } from '../../types';
import { formatPersianDuration, toPersianDigits as farsiDigitsUtil } from '../../utils/timeFormatter';

interface PaymentLog {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed';
  refId: string;
  description: string;
}

const PLANS_DETAILS = [
  {
    id: 'plan_starter_v1',
    name: 'طرح آغازین (Starter)',
    hours: 10,
    classes: 5,
    tokens: '۶۰,۰۰۰',
    price: 39000,
    description: 'ویژه دانشجوهای پرشور و تک‌واحدی'
  },
  {
    id: 'plan_pro_v1',
    name: 'طرح پیشرفته (Pro)',
    hours: 30,
    classes: 15,
    tokens: '۱۵۰,۰۰۰',
    price: 79000,
    description: 'انتخاب بهینه اساتید و دانشجوهای همیار'
  },
  {
    id: 'plan_premium_v1',
    name: 'طرح ویژه (Premium)',
    hours: 100,
    classes: 100,
    tokens: '۵۰۰,۰۰۰',
    price: 149000,
    description: 'برای تحقیق و پردازش تدریس‌های متعدد سنگین'
  }
];

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
      setSuccessMsg('تمدید لایسنس اشتراک با موفقیت انجام شد. سهمیه‌های ضبط صوتی شما بازنشانی شدند و اعتبار شما ۳۰ روز تمدید گردید.');
      const updatedHistory = await SubscriptionService.getPaymentHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || 'خطا در تمدید اشتراک');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setIsActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await SubscriptionService.changePlan(planId);
      await syncSubscription();
      setSuccessMsg('طرح اشتراک شما با موفقیت تغییر یافت. محدودیت‌های جدید بلافاصله اعمال شدند و مصرف شما حفظ گردید.');
      const updatedHistory = await SubscriptionService.getPaymentHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || 'خطا در تغییر طرح');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await SubscriptionService.cancelSubscription();
      await syncSubscription();
      setSuccessMsg('تمدید خودکار اشتراک لغو شد. لایسنس شما تا مهلت انقضا همچنان معتبر و فعال باقی می‌ماند و محدودیتی در ضبط ایجاد نخواهد شد.');
    } catch (err: any) {
      setError(err.message || 'خطا در لغو تمدید خودکار');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await syncSubscription();
      setSuccessMsg('بازیابی اشتراک با موفقیت به پایان رسید. تراکنش‌های معتبر با موفقیت همگام‌سازی شدند.');
    } catch (err: any) {
      setError(err.message || 'خطا در بازیابی اشتراک');
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
  const remainingTokens = subscriptionStatus.usage.maxDailyTokens - subscriptionStatus.usage.dailyTokensUsed;

  return (
    <div className="space-y-8 font-sans text-right animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="border-b border-slate-100/50 pb-5">
        <h1 className="text-xl font-black text-slate-900">مدیریت لایسنس و اشتراک مالی</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          میزان استفاده از منابع پردازشی، سابقه تراکنش‌ها و جزئیات تمدید طرح دانشجویی خود را مشاهده کنید.
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
        
        {/* RIGHT COLUMN: ACTIVE LICENSE & ACTIONS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main License Detail Card */}
          <Card className="border border-slate-100/80 bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden relative">
            <div className="bg-indigo-600 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black">طرح فعال: {subscriptionStatus.planName || 'طرح آغازین'}</h2>
                  <span className="text-[10px] text-indigo-150 font-medium block mt-0.5">مخصوص دانشجویان و اساتید دانشگاهی رایا</span>
                </div>
              </div>
              <span className="bg-white/20 text-[10px] font-bold px-3 py-1 rounded-full text-white">
                {subscriptionStatus.active ? 'فعال و معتبر' : 'بدون اشتراک فعال'}
              </span>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Detailed Usage Gauges */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>آمار مصرف از سهمیه پردازش ابری (این ماه)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Gauge 1 */}
                  <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                    <span className="text-[10px] font-bold text-slate-400 block">زمان ضبط باقی‌مانده این ماه</span>
                    <span className="text-sm font-black text-indigo-600 block">
                      {formatPersianDuration(remainingHours)}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-bold">از کل {toPersianDigits(subscriptionStatus.usage.maxRecordingHours)} ساعت سهمیه مجاز دوره</span>
                  </div>

                  {/* Gauge 2 */}
                  <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                    <span className="text-[10px] font-bold text-slate-400 block">ظرفیت باقی‌مانده هوش مصنوعی امروز</span>
                    <span className="text-sm font-black text-slate-800 block">
                      {toPersianDigits(Math.max(0, Math.min(100, Math.round(((subscriptionStatus.usage.maxDailyTokens - subscriptionStatus.usage.dailyTokensUsed) / subscriptionStatus.usage.maxDailyTokens) * 100))))}٪ در دسترس
                    </span>
                    <span className="text-[9px] text-slate-400 block font-bold">سهمیه روزانه مجاز گفتگو و خلاصه هوشمند</span>
                  </div>

                  {/* Gauge 3 */}
                  <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                    <span className="text-[10px] font-bold text-slate-400 block">ظرفیت ایجاد کلاس فعال</span>
                    <span className="text-sm font-black text-slate-800 block">
                      {toPersianDigits(subscriptionStatus.usage.classesCount)} / {toPersianDigits(subscriptionStatus.usage.maxClasses)} کلاس
                    </span>
                    <span className="text-[9px] text-slate-400 block font-bold">محدودیت تعداد کلاس‌های فعال ترم جاری</span>
                  </div>

                </div>
              </div>

              {/* License Validity Dates & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100/50 pt-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>زمان انقضای لایسنس جاری:</span>
                    <span className="text-slate-800 font-bold">
                      {subscriptionStatus.expiresAt ? toPersianDigits(new Date(subscriptionStatus.expiresAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })) : 'نامحدود'}
                    </span>
                  </div>
                  {subscriptionStatus.isCancelled && (
                    <span className="text-[10px] text-rose-600 font-bold block bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-lg w-fit">
                      ⚠️ تمدید خودکار غیرفعال شده است. اشتراک تا پایان دوره در دسترس است.
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleRestore}
                    disabled={isActionLoading}
                    className="px-3.5 py-2 bg-white border border-slate-100/80 hover:border-slate-200/60 rounded-xl text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    بازیابی تراکنش‌ها
                  </button>
                  
                  {subscriptionStatus.active && !subscriptionStatus.isCancelled && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isActionLoading}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100/60 border border-rose-100/60 text-rose-750 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      لغو تمدید خودکار
                    </button>
                  )}

                  <Button
                    onClick={handleRenew}
                    isLoading={isActionLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>تمدید ۳۰ روزه اشتراک</span>
                  </Button>
                </div>
              </div>

            </div>
          </Card>

          {/* Plan Switcher Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>انتخاب و تغییر طرح اشتراک رایا (بر اساس نیاز ضبط ماهانه)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS_DETAILS.map((plan) => {
                const isActive = subscriptionStatus.planId === plan.id;
                return (
                  <Card 
                    key={plan.id} 
                    className={`border rounded-2xl p-5 text-right flex flex-col justify-between space-y-4 transition-all duration-300 relative ${
                      isActive 
                        ? 'border-2 border-indigo-500 bg-indigo-50/5/30 shadow-md' 
                        : 'border-slate-200/40 bg-white hover:border-indigo-200/60 hover:shadow-sm'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-3 left-3 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> طرح فعلی شما
                      </span>
                    )}

                    <div className="space-y-1.5">
                      <span className="text-xs font-black text-slate-900 block">{plan.name}</span>
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="border-t border-b border-slate-100/80 py-3 space-y-2 text-[11px] font-bold text-slate-650">
                      <div className="flex justify-between items-center">
                        <span>سهمیه ضبط:</span>
                        <span className="text-indigo-600 font-black">{toPersianDigits(plan.hours)} ساعت / ماه</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>ظرفیت کلاس:</span>
                        <span className="text-slate-800">{toPersianDigits(plan.classes === 100 ? 'نامحدود' : plan.classes)} کلاس</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>کپسیتی روزانه AI:</span>
                        <span className="text-slate-800">{toPersianDigits(plan.tokens)} توکن</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-center">
                        <span className="text-sm font-black text-slate-850">{toPersianDigits(plan.price.toLocaleString('fa-IR'))}</span>
                        <span className="text-[9px] text-slate-400 font-semibold mr-1">تومان / ماه</span>
                      </div>

                      <Button
                        fullWidth
                        disabled={isActive || isActionLoading}
                        onClick={() => handleChangePlan(plan.id)}
                        className={`text-[10px] py-1.5 rounded-xl font-bold cursor-pointer ${
                          isActive 
                            ? 'bg-slate-100 text-slate-400 border border-slate-200/50' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isActive ? 'طرح فعال شما' : 'تغییر به این طرح'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Plan Benefits Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800">جزئیات و مزایای لایسنس دانشجویی رایا</h3>
            
            <Card className="border border-slate-100/80 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800 block">ثبت کلاس‌های درسی فعال</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 font-bold">سازماندهی درختی برای تمامی واحدهای دانشگاهی این ترم شما بر اساس سقف کلاس طرح.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800 block">{toPersianDigits(subscriptionStatus.usage.maxRecordingHours)} ساعت سهمیه ضبط صدا</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 font-bold">امکان بارگذاری ویس ضبط شده با فرمت‌های مختلف یا ضبط مستقیم از میکروفون در این ماه.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800 block">ظرفیت کامل و بهینه روزانه AI</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 font-bold">بازه روزانه ایده آل جهت تحلیل، ساخت سوالات چندگزینه‌ای و چت پیشرفته با ویس تدریس.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800 block">چت هوشمند RAG و پاسخ مستند</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 font-bold">تولید خودکار خلاصه، فرمول‌ها و مفاهیم کلیدی هر درس جهت تسهیل امتحانات.</p>
                  </div>
                </div>

              </div>

              {/* Future benefits */}
              <div className="border-t border-slate-100/50 mt-5 pt-5 text-right space-y-3">
                <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full">ویژگی‌های در دست احداث (Coming Soon)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="text-right text-slate-400">
                    <span className="text-xs font-black block">📁 بارگذاری فایل PDF و تصاویر جزوات</span>
                    <p className="text-[9px] font-bold leading-normal mt-0.5">بارگذاری مستقیم کتاب‌ها و جزوه‌ها جهت هم‌افزایی با ویس تدریس استاد.</p>
                  </div>
                  <div className="text-right text-slate-400">
                    <span className="text-xs font-black block">🤖 دستیار پیشرفته هوشمند عمیق رایا (RAYA)</span>
                    <p className="text-[9px] font-bold leading-normal mt-0.5">تحلیل استدلال‌محور پیشرفته فرمول‌ها و مسائل فیزیک و مهندسی توسط هوش مصنوعی رایا.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>

        {/* LEFT COLUMN: PAYMENT HISTORY LOGS */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>تاریخچه فاکتورها و تراکنش‌ها</span>
          </h3>

          <Card className="border border-slate-100/80 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] divide-y divide-slate-100/50">
            {history.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <History className="w-8 h-8 text-slate-300 mx-auto" />
                <span className="text-xs font-bold text-slate-400 block">هیع تراکنشی یافت نشد.</span>
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
