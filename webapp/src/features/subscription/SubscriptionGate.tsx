import React, { useState } from 'react';
import { CreditCard, Check, ShieldCheck, HelpCircle, Activity, Hourglass, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/Button';
import { SubscriptionService, PLANS_CONFIG, UNIVERSITY_PLAN_ID } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface SubscriptionGateProps {
  onActivated: () => void;
  onBack: () => void;
}

interface PlanOption {
  id: string;
  title: string;
  price: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ onActivated, onBack }) => {
  const { user, updateUser, syncSubscription } = useAuthStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_pro_v1');
  const [isActivating, setIsActivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleActivate = async () => {
    setIsActivating(true);
    setErrorMessage('');
    try {
      const result = await SubscriptionService.activateDemoSubscription(selectedPlanId);
      if (result.success) {
        updateUser(result.user);
        await syncSubscription();
        onActivated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در فعالسازی اشتراک.');
    } finally {
      setIsActivating(false);
    }
  };

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const s = String(str);
    const result = s.replace(/[0-9]/g, (ch) => farsiDigits[parseInt(ch, 10)]);
    return result;
  };

  const formatPrice = (amount: number) => {
    return toPersianDigits(amount.toLocaleString('fa-IR'));
  };

  const plans: PlanOption[] = [
    {
      id: 'plan_free_v1',
      title: 'شروع رایگان',
      price: '۰ تومان / ماه',
      features: [
        '۱۵ دقیقه تبدیل گفتار به متن در ماه',
        'چت هوش مصنوعی با متن پیاده‌شده',
        'امکان ساخت تنها ۱ کلاس',
        'سقف ارسال ۵ پیام در روز',
      ],
    },
    {
      id: 'plan_pro_v1',
      title: 'حرفه‌ای',
      price: '۶۰۰,۰۰۰ تومان / ماه',
      features: [
        '۱۰ ساعت تبدیل گفتار به متن در ماه',
        'چت نامحدود هوش مصنوعی (RAG)',
        'امکان ساخت تا ۵ کلاس',
        'سقف ارسال ۳۰ پیام در روز',
        'دسترسی به پایگاه داده کلاس‌ها',
      ],
      highlight: true,
      badge: 'محبوب‌ترین',
    },
    {
      id: 'plan_power_v1',
      title: 'کاربر پیشرفته',
      price: '۱,۴۰۰,۰۰۰ تومان / ماه',
      features: [
        '۳۰ ساعت تبدیل گفتار به متن در ماه',
        'چت نامحدود هوش مصنوعی (RAG)',
        'امکان ساخت تا ۱۰ کلاس',
        'سقف ارسال ۱۰۰ پیام در روز',
      ],
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 flex flex-col justify-center min-h-[90vh] font-sans">
      {/* Visual Header Banner */}
      <div className="text-center mb-6 flex flex-col items-center">
        <button
          onClick={onBack}
          className="self-start px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-100/80 rounded-lg flex items-center gap-1 transition-all cursor-pointer mb-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>بازگشت</span>
        </button>
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3.5 border border-indigo-100/80 shadow-xs">
          <CreditCard className="w-6 h-6 text-indigo-600" />
        </div>
        <h1 className="text-xl font-black text-slate-900">انتخاب طرح اشتراک</h1>
        <p className="text-xs text-slate-400 mt-1.5">طرح مناسب خود را انتخاب کنید</p>
      </div>

      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-100/60 rounded-2xl text-xs text-rose-600 font-semibold text-right">
            {errorMessage}
          </div>
        )}

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const planConfig = PLANS_CONFIG[plan.id];
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative p-4 rounded-2xl border-2 text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md'
                    : 'border-slate-100/80 bg-white hover:border-indigo-100/60'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-[#285BE8] text-white text-[9px] font-black">
                    {plan.badge}
                  </span>
                )}
                <div className="text-sm font-black text-slate-800 mb-1">{plan.title}</div>
                <div className="text-lg font-black text-indigo-600 mb-3">{plan.price}</div>
                <ul className="space-y-1.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-slate-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isSelected && (
                  <div className="mt-3 pt-2 border-t border-indigo-100/60">
                    <div className="text-[10px] font-black text-indigo-600">انتخاب شده</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Activate Button */}
        <Button
          onClick={handleActivate}
          fullWidth
          isLoading={isActivating}
          icon={<ShieldCheck className="w-5 h-5" />}
          iconPosition="left"
        >
          ادامه و فعالسازی
        </Button>

        {/* Security / Quality guarantee footer */}
        <div className="grid grid-cols-3 gap-3.5 text-center">
          <div className="bg-slate-50/30 border border-slate-100/80 p-3 rounded-2xl flex flex-col items-center shadow-xs">
            <Activity className="w-4 h-4 text-indigo-600 mb-1.5" />
            <span className="text-[9px] font-bold text-slate-700 block">پایداری سرور ۹۹.۹٪</span>
          </div>
          <div className="bg-slate-50/30 border border-slate-100/80 p-3 rounded-2xl flex flex-col items-center shadow-xs">
            <Hourglass className="w-4 h-4 text-indigo-600 mb-1.5" />
            <span className="text-[9px] font-bold text-slate-700 block">فعالسازی آنی لایسنس</span>
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
