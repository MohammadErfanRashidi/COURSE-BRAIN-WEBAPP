/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, Check, ShieldCheck, HelpCircle, Activity, Hourglass } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SubscriptionService, PLANS_CONFIG, UNIVERSITY_PLAN_ID } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface SubscriptionGateProps {
  onActivated: () => void;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ onActivated }) => {
  const { user, updateUser, syncSubscription } = useAuthStore();
  const [isActivating, setIsActivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDemoActivate = async () => {
    setIsActivating(true);
    setErrorMessage('');
    try {
      const result = await SubscriptionService.activateDemoSubscription();
      if (result.success) {
        updateUser(result.user);
        await syncSubscription();
        onActivated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در فعال‌سازی لایسنس تستی اشتراک.');
    } finally {
      setIsActivating(false);
    }
  };

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  // Human friendly pricing helper
  const formatPrice = (amount: number) => {
    return toPersianDigits(amount.toLocaleString('fa-IR'));
  };

  const activePlan = PLANS_CONFIG[UNIVERSITY_PLAN_ID];

  return (
    <div className="w-full max-w-xl mx-auto px-4 flex flex-col justify-center min-h-[90vh] font-sans">
      {/* Visual Header Banner */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3.5 border border-indigo-100/80 shadow-xs">
          <CreditCard className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-xl font-black text-slate-950">فعال‌سازی اشتراک</h1>
        <p className="text-xs text-slate-400 mt-2 font-medium max-w-xs leading-relaxed">
          با فعال‌سازی اشتراک، به تمامی قابلیت‌های هوش مصنوعی رایا دسترسی پیدا کنید.
        </p>
      </div>

      <div className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-100/60 rounded-2xl text-xs text-rose-600 font-semibold text-right">
            {errorMessage}
          </div>
        )}

        {/* Pricing Card Grid */}
        <Card className="border-2 border-indigo-500 bg-white shadow-[0_12px_40px_rgba(79,70,229,0.06)] relative overflow-hidden rounded-3xl p-8">
          {/* Top badge */}
          <div className="absolute left-0 top-0 bg-indigo-600 text-white font-bold text-[9px] px-4 py-1.5 rounded-br-2xl uppercase tracking-wider">
            طرح پیشنهادی مصوب
          </div>

          <div className="pb-5 border-b border-slate-100/50 text-right">
            <h2 className="text-base font-extrabold text-slate-800">{activePlan.planName}</h2>
            <p className="text-xs text-slate-400 mt-1">ویژه همگام‌سازی، ویس، جزوات و چت آزمون دانشگاهی</p>
            
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-600">{formatPrice(activePlan.price)}</span>
              <span className="text-xs text-slate-400 font-medium">تومان / ماهانه</span>
            </div>
          </div>

          {/* Premium Features List */}
          <div className="py-6 space-y-4 text-right">
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">امکانات طرح:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="text-xs">
                  <span className="text-slate-700 font-bold">حداکثر ۵ کلاس درسی</span>
                  <span className="text-slate-400 block text-[10px] mt-0.5">ثبت دروس این ترم در پنل</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="text-xs">
                  <span className="text-slate-700 font-bold">۱۰ ساعت ضبط صوتی</span>
                  <span className="text-slate-400 block text-[10px] mt-0.5">تبدیل ویس استاد به متون روان</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="text-xs">
                  <span className="text-slate-700 font-bold">ظرفیت کامل و روزانه هوش مصنوعی</span>
                  <span className="text-slate-400 block text-[10px] mt-0.5">ظرفیت بهینه پاسخ‌دهی و خلاصه‌سازی</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="text-xs">
                  <span className="text-slate-700 font-bold">سیستم چت هوشمند با ارجاع به منبع</span>
                  <span className="text-slate-400 block text-[10px] mt-0.5">پاسخ‌های دقیق مستند به مرجع</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100/50 space-y-3.5">
            {/* Real Checkout Portal Simulation */}
            <Button
              onClick={handleDemoActivate}
              fullWidth
              isLoading={isActivating}
              icon={<ShieldCheck className="w-5 h-5" />}
              iconPosition="left"
            >
              پرداخت شبیه‌سازی شده و فعال‌سازی فوری اشتراک
            </Button>
            
            <p className="text-[10px] text-slate-400 text-center leading-relaxed font-bold">
              تراکنش از طریق درگاه الکترونیکی شبیه‌سازی شده رایا انجام شده و هیچ‌گونه هزینه واقعی کسر نخواهد شد.
            </p>
          </div>
        </Card>

        {/* Security / Quality guarantee footer */}
        <div className="grid grid-cols-3 gap-3.5 text-center">
          <div className="bg-slate-50/30 border border-slate-100/80 p-3 rounded-2xl flex flex-col items-center shadow-xs">
            <Activity className="w-4 h-4 text-indigo-600 mb-1.5" />
            <span className="text-[9px] font-bold text-slate-700 block">پایداری سرور ۹۹.۹٪</span>
          </div>
          <div className="bg-slate-50/30 border border-slate-100/80 p-3 rounded-2xl flex flex-col items-center shadow-xs">
            <Hourglass className="w-4 h-4 text-indigo-600 mb-1.5" />
            <span className="text-[9px] font-bold text-slate-700 block">فعال‌سازی آنی لایسنس</span>
          </div>
          <div className="bg-slate-50/30 border border-slate-100/80 p-3 rounded-2xl flex flex-col items-center shadow-xs">
            <HelpCircle className="w-4 h-4 text-indigo-600 mb-1.5" />
            <span className="text-[9px] font-bold text-slate-700 block">پشتیبانی کامل ترمی</span>
          </div>
        </div>
      </div>
    </div>
  );
};
