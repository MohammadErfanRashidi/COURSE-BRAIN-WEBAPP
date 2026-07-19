/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Phone, ArrowLeft, Info, HelpCircle, ChevronLeft } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { AuthService } from '../../services/api';

interface LoginScreenProps {
  onCodeSent: (phoneNumber: string, code: string) => void;
  onBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onCodeSent, onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const validatePhone = (num: string): boolean => {
    // Iranian mobile pattern: starting with 09 followed by 9 digits
    const pattern = /^09\d{9}$/;
    return pattern.test(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDemoCode(null);

    if (!phoneNumber) {
      setError('شماره موبایل را وارد کنید');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setError('شماره موبایل وارد شده معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.sendOtp(phoneNumber);
      if (result.success) {
        if (result.simulatedCode) {
          setDemoCode(result.simulatedCode);
          // Auto transition to OTP screen after a brief delay so the user sees the simulated SMS popup
          setTimeout(() => {
            onCodeSent(phoneNumber, result.simulatedCode!);
          }, 3000);
        } else {
          // Real backend transition
          onCodeSent(phoneNumber, '');
        }
      } else {
        setError('خطا در ارسال پیامک تأیید. مجددا تلاش کنید.');
      }
    } catch (err: any) {
      setError(err.message || 'مشکلی در برقراری ارتباط با سرور رخ داد');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert English digits to Persian for authentic localization display
  const toPersianDigits = (str: string) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 flex flex-col justify-center min-h-[85vh] font-sans">
      {/* Brand Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <img
            src="/final-fr.png"
            alt="ZivAI"
            className="w-16 h-16 object-contain mb-4"
          />
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">ZivAI</h1>
      </div>

      <Card>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </button>
        )}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">ورود یا ثبت‌نام</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            جهت دسترسی به پنل درسی، تحلیل هوشمند کلاس‌ها و پرسش‌و‌پاسخ از متون درسی، شماره موبایل خود را وارد کنید.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="شماره تلفن همراه"
            placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
            type="tel"
            inputMode="numeric"
            maxLength={11}
            value={phoneNumber}
            onChange={(e) => {
              // Only allow digits
              const cleanVal = e.target.value.replace(/[^0-9]/g, '');
              setPhoneNumber(cleanVal);
              if (error) setError('');
            }}
            error={error}
            icon={<Phone className="w-4 h-4 text-slate-400" />}
            helperText="کد تأیید ۶ رقمی از طریق پیامک به این شماره ارسال خواهد شد."
            disabled={isLoading || !!demoCode}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading || !!demoCode}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            {demoCode ? 'در حال هدایت به بخش تایید...' : 'دریافت کد تأیید'}
          </Button>
        </form>

        {/* Demo Assistant Mode Toast */}
        {demoCode && (
          <div className="mt-5 p-4 bg-indigo-50/70 border border-indigo-100/60 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-900 block">شبیه‌ساز هوشمند پیامک فعال شد</span>
              <span className="text-[11px] text-indigo-800 mt-1 block leading-relaxed">
                در حالت پیش‌نمایش، کد تأیید ۶ رقمی برای شماره {toPersianDigits(phoneNumber)} شبیه‌سازی شد: 
                    <strong className="text-sm text-indigo-700 mx-1 bg-white px-2 py-0.5 rounded border border-indigo-200/50 font-mono font-bold">
                  {toPersianDigits(demoCode)}
                </strong>
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Operations Portal Link */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            const event = new CustomEvent('toggle-admin-mode', { detail: true });
            window.dispatchEvent(event);
          }}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-black hover:underline transition-all cursor-pointer"
        >
          ورود به کارتابل عملیات و مدیریت سیستم (ادمین)
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center flex items-center justify-center gap-1.5 text-slate-400 text-xs">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>پشتیبانی دانشجویی ۲۴ ساعته زیوای</span>
      </div>
    </div>
  );
};
