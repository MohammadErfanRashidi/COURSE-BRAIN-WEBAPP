import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  Award,
  AlertCircle,
  History,
  TrendingUp,
  RotateCw,
  Crown
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { SubscriptionService, PLANS_CONFIG, UNIVERSITY_PLAN_ID, getPurchaseHistory } from '../../services/api';
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

const PLAN_ORDER = ['plan_free_v1', 'plan_pro_v1', 'plan_power_v1'] as const;

export const SubscriptionScreen: React.FC = () => {
  const { subscriptionStatus, syncSubscription, user, updateUser } = useAuthStore();
  const [history, setHistory] = useState<PaymentLog[]>(() => {
    try {
      return [...getPurchaseHistory()].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(() => !subscriptionStatus);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const needsSkeletonRef = useRef(isLoading);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatPrice = (amount: number) => {
    return toPersianDigits(amount.toLocaleString('fa-IR'));
  };

  const activePlanId = subscriptionStatus?.planId || UNIVERSITY_PLAN_ID;
  const activePlan = PLANS_CONFIG[activePlanId] || PLANS_CONFIG.plan_pro_v1;

  const getDaysRemaining = (): number => {
    if (!subscriptionStatus?.expiresAt) return 0;
    const now = new Date();
    const expiry = new Date(subscriptionStatus.expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining();

  useEffect(() => {
    let cancelled = false;
    const needsSkeleton = needsSkeletonRef.current;

    async function load() {
      if (needsSkeleton) setIsLoading(true);
      try {
        await syncSubscription();
        const fetchedHistory = getPurchaseHistory().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (!cancelled) {
          setHistory(fetchedHistory);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'خطا در بارگذاری تاریخچه مالی');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [syncSubscription]);

  const handleRenew = async () => {
    setIsActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await SubscriptionService.renewSubscription();
      await syncSubscription();
      setSuccessMsg('اشتراک شما با موفقیت تمدید شد. سهمیه‌های ضبط صوتی بازنشانی شدند و اعتبار حساب ۳۰ روز تمدید گردید.');
      setHistory(getPurchaseHistory().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err: any) {
      setError(err.message || 'خطا در تمدید اشتراک');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePlanChange = async (planId: string) => {
    if (planId === activePlanId) return;
    setIsActionLoading(true);
    setChangingPlanId(planId);
    setError(null);
    setSuccessMsg(null);
    try {
      const updatedStatus = await SubscriptionService.changePlan(planId);
      await syncSubscription();
      if (user) {
        updateUser({
          ...user,
          subscriptionTier: updatedStatus.planTier,
          hasActiveSubscription: updatedStatus.active
        });
      }
      setSuccessMsg(`طرح شما با موفقیت به "${updatedStatus.planName}" تغییر یافت. سهمیه‌های جدید بلافاصله اعمال شدند.`);
      setHistory(getPurchaseHistory().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err: any) {
      setError(err.message || 'خطا در تغییر طرح اشتراک');
    } finally {
      setIsActionLoading(false);
      setChangingPlanId(null);
    }
  };

  const remainingHours = subscriptionStatus
    ? subscriptionStatus.usage.maxRecordingHours - subscriptionStatus.usage.recordingHoursUsed
    : 0;
  const remainingClasses = subscriptionStatus
    ? Math.max(subscriptionStatus.usage.maxClasses - subscriptionStatus.usage.classesCount, 0)
    : 0;

  if (isLoading || !subscriptionStatus) {
    return (
      <div className="space-y-6 font-sans text-right p-1">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-52 bg-slate-200 animate-pulse rounded-lg self-start" />
          <div className="h-4 w-72 bg-slate-100 animate-pulse rounded-md self-start" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-slate-100/80 rounded-3xl p-6 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="space-y-2 text-right">
                  <div className="h-4 w-36 bg-slate-250 animate-pulse rounded-md" />
                  <div className="h-3 w-20 bg-slate-100 animate-pulse rounded-md" />
                </div>
                <div className="w-10 h-10 bg-slate-100 animate-pulse rounded-xl" />
              </div>
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
          <div className="border border-slate-100/80 rounded-3xl p-6 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="space-y-2 text-right">
                  <div className="h-4 w-28 bg-slate-250 animate-pulse rounded-md" />
                  <div className="h-3 w-36 bg-slate-100 animate-pulse rounded-md" />
                </div>
                <div className="w-10 h-10 bg-slate-100 animate-pulse rounded-xl" />
              </div>
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

  const plans = PLAN_ORDER.map((planId) => {
    const plan = PLANS_CONFIG[planId];
    const isActive = planId === activePlanId;
    return { planId, plan, isActive };
  });

  return (
    <div className="space-y-8 font-sans text-right animate-in fade-in duration-300">
      <div className="pb-5">
        <h1 className="text-xl font-black text-slate-900">اشتراک</h1>
      </div>

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

      {/* Active Plan Badge */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-[0_8px_30px_rgba(43,89,234,0.15)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-indigo-150 mb-1">طرح فعال شما</div>
                <div className="text-lg font-black">{activePlan.planName}</div>
              </div>
            </div>
            {activePlan.tier !== 'free' && (
              <div className="flex items-center gap-3">
                <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                  <div className="text-[9px] font-bold text-indigo-150">اعتبار باقی‌مانده</div>
                  <div className="text-sm font-black">{toPersianDigits(daysRemaining)} روز</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                  <div className="text-[9px] font-bold text-indigo-150">اعتبار تا</div>
                  <div className="text-sm font-black">
                    {subscriptionStatus.expiresAt ? toPersianDigits(new Date(subscriptionStatus.expiresAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })) : 'نامحدود'}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                  <div className="text-[9px] font-bold text-indigo-150">قیمت ماهانه</div>
                  <div className="text-sm font-black">{formatPrice(activePlan.price)} تومان</div>
                </div>
              </div>
            )}
            {activePlan.tier === 'free' && (
              <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                <div className="text-[9px] font-bold text-indigo-150">قیمت ماهانه</div>
                <div className="text-sm font-black">رایگان</div>
              </div>
            )}
          </div>
          {activePlan.tier !== 'free' && (
            <div className="pt-3 border-t border-white/10">
              <Button
                onClick={handleRenew}
                isLoading={isActionLoading}
                className="w-full sm:w-auto px-5 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>تمدید اشتراک زیوای</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN COLUMN: LICENSE DETAILS */}
        <div className="lg:col-span-2 space-y-6">

          {/* Usage Gauges */}
          <Card className="border border-slate-100/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="p-6 space-y-5">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>مصرف سهمیه این ماه</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                  <span className="text-[10px] font-bold text-slate-400 block">زمان ضبط باقیمانده</span>
                  <span className="text-sm font-black text-indigo-600 block">
                    {formatPersianDuration(Math.max(0, remainingHours))}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-bold">از {toPersianDigits(subscriptionStatus.usage.maxRecordingHours)} ساعت سهمیه ماهانه</span>
                </div>

                <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                  <span className="text-[10px] font-bold text-slate-400 block">کلاس‌های باقی‌مانده</span>
                  <span className="text-sm font-black text-slate-800 block">
                    {toPersianDigits(remainingClasses)} / {toPersianDigits(subscriptionStatus.usage.maxClasses)}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-bold">از {toPersianDigits(subscriptionStatus.usage.maxClasses)} کلاس سهمیه ماهانه</span>
                </div>

                <div className="border border-slate-100/80 rounded-2xl p-4 text-right space-y-1.5 bg-slate-50/20">
                  <span className="text-[10px] font-bold text-slate-400 block">پیام‌های هوش مصنوعی امروز</span>
                  <span className="text-sm font-black text-slate-800 block">
                    {toPersianDigits(Math.max(0, subscriptionStatus.usage.maxDailyMessages - subscriptionStatus.usage.dailyMessagesSentCount))} / {toPersianDigits(subscriptionStatus.usage.maxDailyMessages)}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-bold">سهمیه روزانه</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Plan Comparison Grid */}
          <div>
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-4">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>طرح‌های اشتراک</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.map(({ planId, plan, isActive }) => (
                <div
                  key={planId}
                  className={`relative border-2 rounded-3xl p-5 flex flex-col transition-all ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/30 shadow-md'
                      : 'border-slate-100/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -top-2.5 left-4 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black">
                      طرح فعال
                    </span>
                  )}
                  {planId === 'plan_pro_v1' && !isActive && (
                    <span className="absolute -top-2.5 left-4 px-3 py-0.5 rounded-full bg-[#285BE8] text-white text-[9px] font-black">
                      محبوب‌ترین
                    </span>
                  )}

                  <div className="text-right mb-4">
                    <div className="text-sm font-black text-slate-800">{plan.planName}</div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl font-black text-indigo-600">
                        {plan.price === 0 ? '۰' : formatPrice(plan.price)}
                      </span>
                      {plan.price > 0 && <span className="text-[10px] text-slate-400 font-bold">تومان / ماه</span>}
                      {plan.price === 0 && <span className="text-[10px] text-slate-400 font-bold">تومان / ماه</span>}
                    </div>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-slate-600 leading-relaxed">امکان ساخت {toPersianDigits(plan.maxClasses)} کلاس</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-slate-600 leading-relaxed">سقف {toPersianDigits(plan.maxDailyMessages)} پیام در روز</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-slate-600 leading-relaxed">
                        {plan.monthlyTranscriptionMinutes >= 60
                          ? `${toPersianDigits(Math.floor(plan.monthlyTranscriptionMinutes / 60))} ساعت تبدیل گفتار در ماه`
                          : `${toPersianDigits(plan.monthlyTranscriptionMinutes)} دقیقه تبدیل گفتار در ماه`}
                      </span>
                    </li>
                    {planId === 'plan_pro_v1' && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-slate-600 leading-relaxed">دسترسی به پایگاه داده دانشگاه‌ها</span>
                      </li>
                    )}
                  </ul>

                  <Button
                    onClick={() => handlePlanChange(planId)}
                    disabled={isActive || isActionLoading}
                    isLoading={changingPlanId === planId && isActionLoading}
                    fullWidth
                    className={`py-2.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isActive ? 'طرح فعال شما' : planId === 'plan_free_v1' ? 'تغییر به طرح رایگان' : planId === 'plan_pro_v1' ? 'ارتقا به حرفه‌ای' : 'خرید کاربر پیشرفته'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SIDEBAR: PAYMENT HISTORY */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <span>تاریخچه تراکنش‌ها</span>
          </h3>

          <Card className="border border-slate-100/80 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            {history.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <History className="w-8 h-8 text-slate-300 mx-auto" />
                <span className="text-xs font-bold text-slate-400 block">هیچ تراکنشی یافت نشد.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/50 max-h-[320px] overflow-y-auto -mx-5 -my-5 px-5 py-5">
                {history.map((log) => (
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
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
};
