/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowRight, RefreshCw, Edit2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuthStore } from '../../store/authStore';
import { AuthService } from '../../services/api';

interface OtpScreenProps {
  phoneNumber: string;
  initialCode?: string;
  onBack: () => void;
  onSuccess: (isNewUser: boolean) => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  phoneNumber,
  initialCode = '',
  onBack,
  onSuccess,
}) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { loginWithOtp, isLoading, error: storeError, setError: setStoreError } = useAuthStore();
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Pre-fill code if initialCode is provided (for easy developer flow)
  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      setCode(initialCode.split(''));
    }
  }, [initialCode]);

  // Countdown timer logic
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Clear any existing store errors when screen mounts
  useEffect(() => {
    setStoreError(null);
  }, [setStoreError]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) return;

    const newCode = [...code];
    newCode[index] = cleanVal.substring(cleanVal.length - 1);
    setCode(newCode);
    setLocalError('');
    setStoreError(null);

    // Auto-focus next input
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newCode = [...code];
      
      if (code[index]) {
        // Clear current index
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        // Move focus to previous and clear it
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').substring(0, 6);
    if (pastedData.length === 6) {
      setCode(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length < 6) {
      setLocalError('لطفاً تمام ۶ رقم کد تأیید را وارد کنید.');
      return;
    }

    setLocalError('');
    try {
      const user = await loginWithOtp(phoneNumber, fullCode);
      onSuccess(user.isNewUser);
    } catch (err) {
      // Handled by Zustand store error
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setIsResending(true);
    setResendMessage('');
    setLocalError('');
    setStoreError(null);

    try {
      const result = await AuthService.sendOtp(phoneNumber);
      if (result.success) {
        setTimer(120);
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        
        if (result.simulatedCode) {
          setResendMessage(`کد جدید پیامک شد: ${toPersianDigits(result.simulatedCode)}`);
          setCode(result.simulatedCode.split(''));
        } else {
          setResendMessage('کد تایید جدید برای شما ارسال گردید.');
        }
      }
    } catch (err: any) {
      setLocalError(err.message || 'خطا در ارسال مجدد کد تأیید.');
    } finally {
      setIsResending(false);
    }
  };

  // Convert English digits to Persian
  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${toPersianDigits(m)}:${s < 10 ? '۰' : ''}${toPersianDigits(s)}`;
  };

  const activeError = localError || storeError;

  return (
    <div className="w-full max-w-md mx-auto px-4 flex flex-col justify-center min-h-[85vh] font-sans">
      <Card>
        {/* Navigation back */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-6 hover:text-indigo-500 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تغییر شماره تلفن</span>
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">تأیید شماره تلفن</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed flex items-center flex-wrap gap-1.5">
            <span>کد تأیید به شماره همراه</span>
            <strong className="text-slate-700 dir-ltr font-bold font-sans">{toPersianDigits(phoneNumber)}</strong>
            <span>ارسال شد.</span>
            <button onClick={onBack} className="text-indigo-600 hover:underline p-0.5" title="ویرایش شماره">
              <Edit2 className="w-3 h-3 inline" />
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Digit Inputs */}
          <div dir="ltr" className="flex justify-between gap-2.5" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                dir="ltr"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`
                  w-12 h-13 text-center text-xl font-bold bg-slate-50 border rounded-2xl outline-none transition-all duration-150
                  ${digit ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/5 text-slate-900' : 'border-slate-200/50 text-slate-500'}
                  ${activeError ? 'border-rose-400 ring-2 ring-rose-500/5' : 'focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'}
                `}
              />
            ))}
          </div>

          {activeError && (
            <div className="text-xs text-rose-600 font-semibold text-right leading-relaxed animate-shake">
              {activeError}
            </div>
          )}

          {resendMessage && (
            <div className="text-xs text-indigo-600 font-semibold text-right leading-relaxed">
              {resendMessage}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={code.some((d) => !d) || isLoading}
            icon={<ShieldCheck className="w-5 h-5" />}
            iconPosition="left"
          >
            تأیید و ادامه
          </Button>
        </form>

        {/* Resend Action Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100/50 flex items-center justify-between text-xs">
          {timer > 0 ? (
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <span>ارسال مجدد کد پس از:</span>
              <span className="text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-xl font-mono">
                {formatTimer(timer)}
              </span>
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-indigo-600 hover:text-indigo-500 font-bold flex items-center gap-1.5 hover:underline cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>ارسال مجدد کد تأیید</span>
            </button>
          )}
          
          <span className="text-slate-400">کد دریافتی نداشتید؟</span>
        </div>
      </Card>
    </div>
  );
};
