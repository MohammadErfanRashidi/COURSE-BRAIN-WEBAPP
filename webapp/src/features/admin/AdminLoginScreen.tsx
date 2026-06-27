/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  KeyRound, 
  ArrowRight, 
  Lock, 
  Check, 
  Sparkles, 
  HelpCircle,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { motion } from 'motion/react';

interface AdminLoginScreenProps {
  onBackToStudentApp: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onBackToStudentApp }) => {
  const { 
    loginAdmin, 
    verifyTwoFactor, 
    twoFactorStep, 
    tempAdmin, 
    isLoading, 
    error,
    logoutAdmin
  } = useAdminAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [showCredentialsHelp, setShowCredentialsHelp] = useState(true);

  const handleSubmitUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    await loginAdmin(username, password);
  };

  const handleSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length < 6) return;
    await verifyTwoFactor(pinCode);
  };

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center font-sans text-right px-4">
      <div className="w-full max-w-md bg-white border border-slate-200/50 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">سامانه مدیریت عملیات رایا</h2>
          <p className="text-[11px] text-slate-400 font-bold">بخش اختصاصی کارکنان و مدیران ارشد RAYA</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100/60 p-3.5 rounded-2xl text-[11px] text-rose-600 font-bold leading-relaxed flex items-start gap-2 text-right">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 2FA Step */}
        {twoFactorStep && tempAdmin ? (
          <form onSubmit={handleSubmitPin} className="space-y-4">
            <div className="bg-indigo-50/60 border border-indigo-100/60 p-3.5 rounded-2xl text-[11px] text-slate-600 leading-relaxed text-right space-y-1.5">
              <span className="font-black text-indigo-700 block">🔒 تأیید هویت دو مرحله‌ای (2FA) فعال است</span>
              <p className="font-bold text-slate-500">
                یک رمز پویای یک‌بارمصرف برای ورود به حساب <strong className="text-slate-800">{tempAdmin.fullName}</strong> تولید شد.
              </p>
              <div className="flex items-center gap-1 mt-2 text-indigo-600 font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>کد تایید شبیه‌سازی شده: <code className="bg-indigo-100/80 px-1.5 py-0.5 rounded-md text-xs font-mono select-all">
                  {tempAdmin.username === 'superadmin' ? '123456' : tempAdmin.username === 'admin' ? '111111' : tempAdmin.username === 'support' ? '222222' : '333333'}
                </code></span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 block">رمز تایید ۶ رقمی را وارد کنید:</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full text-center tracking-[0.5em] bg-slate-50 border border-slate-200/50 focus:border-slate-900 rounded-xl py-3 text-sm font-black outline-none transition-all placeholder:text-slate-300 text-slate-800"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || pinCode.length < 6}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? 'درحال ورود...' : 'تأیید رمز و ورود به پنل'}
            </button>

            <button
              type="button"
              onClick={() => logoutAdmin()}
              className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 font-bold transition-all pt-2 cursor-pointer"
            >
              انصراف و تغییر کاربر
            </button>
          </form>
        ) : (
          /* Normal Username/Password login */
          <form onSubmit={handleSubmitUsername} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 block">نام کاربری ادمین:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: superadmin"
                className="w-full text-right bg-slate-50 border border-slate-200/50 focus:border-slate-900 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all placeholder:text-slate-300 text-slate-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 block">رمز عبور امنیتی:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-right bg-slate-50 border border-slate-200/50 focus:border-slate-900 focus:bg-white rounded-xl pr-4 pl-10 py-2.5 text-xs font-bold outline-none transition-all placeholder:text-slate-300 text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              {isLoading ? 'درحال احراز...' : 'ورود و مرحله دوم تأیید'}
            </button>

            {/* Quick credentials Helper list */}
            {showCredentialsHelp && (
              <div className="bg-slate-50 border border-slate-200/40 p-3.5 rounded-2xl text-[10px] text-slate-500 leading-relaxed space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100/50">
                  <span className="font-extrabold text-slate-700">💡 راهنمای حساب‌های کارمندان (جهت تست)</span>
                  <button 
                    type="button" 
                    onClick={() => setShowCredentialsHelp(false)}
                    className="text-slate-400 hover:text-slate-600 text-[9px]"
                  >
                    بستن
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-right">
                  <span>نام کاربری: <code className="font-black text-indigo-600">superadmin</code></span>
                  <span>نام کاربری: <code className="font-black text-indigo-600">admin</code></span>
                  <span>نام کاربری: <code className="font-black text-indigo-600">support</code></span>
                  <span>نام کاربری: <code className="font-black text-indigo-600">content</code></span>
                </div>
                <p className="text-[9px] text-slate-400 text-center font-bold">
                  رمز عبور دلخواه (مثلا <code className="font-semibold">۱۲۳۴۵۶</code>) به عنوان کلید پیش‌فرض پذیرفته می‌شود.
                </p>
              </div>
            )}

            <div className="border-t border-slate-100/50 pt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={onBackToStudentApp}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>بازگشت به پنل دانشجویی</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
