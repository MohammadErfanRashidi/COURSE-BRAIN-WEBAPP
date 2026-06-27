/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  User as UserIcon, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Award, 
  Clock, 
  BookOpen, 
  ChevronLeft,
  Settings,
  Mail,
  Building
} from 'lucide-react';
import { Card } from '../../components/Card';
import { useAuthStore } from '../../store/authStore';
import { formatPersianDuration } from '../../utils/timeFormatter';

interface ProfileScreenProps {
  onNavigate: (tab: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { user, subscriptionStatus } = useAuthStore();

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  if (!user) return null;

  return (
    <div className="space-y-8 font-sans text-right animate-in fade-in duration-300">
      
      {/* Profile Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">پروفایل کاربری دانشجو</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            اطلاعات شناسایی دانشجویی، مقطع و تخصص‌های علمی ثبت شده خود را مرور فرمایید.
          </p>
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className="px-4 py-2 bg-white border border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Settings className="w-4 h-4" />
          <span>ویرایش اطلاعات تحصیلی</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right Details Card */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border border-slate-100 bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 shrink-0">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="text-right">
                <h2 className="text-base font-black text-slate-900">{user.fullName || 'دانشجوی رایا'}</h2>
                <p className="text-xs text-slate-400 font-bold mt-1">شناسه یکتا: {user.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-slate-50 text-right">
              
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>شماره تلفن همراه (تایید شده)</span>
                </span>
                <span className="text-xs font-black text-slate-800 block direction-ltr text-right">
                  {toPersianDigits(user.phoneNumber)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-slate-400" />
                  <span>مقطع تحصیلی</span>
                </span>
                <span className="text-xs font-black text-slate-800 block">
                  {user.academicProfile?.degree === 'associate' ? 'کاردانی' : 
                   user.academicProfile?.degree === 'bachelor' ? 'کارشناسی' : 
                   user.academicProfile?.degree === 'master' ? 'کارشناسی ارشد' : 'دکتری تخصصی'}
                </span>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span>دانشگاه محل تحصیل</span>
                </span>
                <span className="text-xs font-black text-slate-800 block">
                  {user.academicProfile?.universityName || 'ثبت نشده'}
                </span>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  <span>رشته تخصصی تحصیلی</span>
                </span>
                <span className="text-xs font-black text-slate-800 block">
                  {user.academicProfile?.majorName || 'ثبت نشده'}
                </span>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>ترم و نیمسال تحصیلی فعال</span>
                </span>
                <span className="text-xs font-black text-slate-800 block">
                  {user.academicProfile?.semesterName || 'ثبت نشده'}
                </span>
              </div>

            </div>
          </Card>

          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800">امنیت و میزبانی حساب کاربری</h3>
            <Card className="border border-slate-100 bg-white rounded-3xl p-6 text-right shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-3 gap-2">
                <div>
                  <span className="text-xs font-black text-slate-800 block">روش احراز هویت پیامکی (SMS OTP)</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-bold">ورود امن و بدون نیاز به کلمه عبور با استفاده از تایید هویت دو مرحله‌ای.</p>
                </div>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">فعال و ایمن</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-xs font-black text-slate-800 block">تاریخ ایجاد حساب</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-bold">زمان اولین ثبت‌نام و فعال‌سازی اکانت دانشجو در سامانه.</p>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {toPersianDigits(new Date(user.createdAt).toLocaleDateString('fa-IR'))}
                </span>
              </div>
            </Card>
          </div>

        </div>

        {/* Left Stats Sidebar */}
        <div className="space-y-6">
          
          {/* Subscription Tier badge */}
          <Card className="border border-slate-100 bg-white rounded-3xl p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">سطح عضویت کاربری</span>
              <span className="text-sm font-black text-slate-800 block mt-1">طرح دانشجویی استاندارد</span>
            </div>
            
            <div className="border-t border-slate-50 pt-3">
              <button
                onClick={() => onNavigate('subscription')}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 justify-center mx-auto cursor-pointer"
              >
                <span>مشاهده جزئیات مصرف و تمدید لایسنس</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </Card>

          {/* Academic Stats summary */}
          <Card className="border border-slate-100 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4 text-right">
            <span className="text-xs font-black text-slate-800 block pb-2 border-b border-slate-100">آمار خلاصه تحصیلی</span>
            
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">کلاس‌های ثبت‌شده</span>
              <span className="text-slate-800 font-black">
                {subscriptionStatus ? toPersianDigits(subscriptionStatus.usage.classesCount) : '۰'} کلاس
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">ضبط جلسات درسی</span>
              <span className="text-slate-800 font-black">
                {subscriptionStatus ? formatPersianDuration(subscriptionStatus.usage.recordingHoursUsed, { includeRemainingSuffix: false }) : '۰ دقیقه'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">سقف استفاده روزانه AI</span>
              <span className="text-emerald-700 font-black">
                سهمیه کامل روزانه (فعال)
              </span>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};