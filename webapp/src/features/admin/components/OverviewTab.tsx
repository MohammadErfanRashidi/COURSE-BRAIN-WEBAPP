/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  Activity, 
  Database, 
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { SystemMetrics } from '../types';

export const OverviewTab: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    fastApiStatus: 'HEALTHY',
    aiLatency: 280,
    sonioxQueueSize: 0,
    postgresDbSize: '۱۸.۴ مگابایت',
    chromaCollectionCount: 6,
    cpuUsage: 14,
    memoryUsage: 38,
    diskUsage: 22
  });

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  // Simulate real-time fluctuating server stats
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 15) + 10,
        memoryUsage: Math.floor(Math.random() * 5) + 36,
        aiLatency: Math.floor(Math.random() * 60) + 250
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* 1. TOP KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">کل کاربران پلتفرم</span>
            <span className="text-xl font-black text-slate-800">{toPersianDigits(1240)} نفر</span>
            <span className="text-[9px] text-emerald-600 font-bold block">▲ ۱۲٪ نسبت به هفته گذشته</span>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">کاربران فعال امروز (DAU)</span>
            <span className="text-xl font-black text-slate-800">{toPersianDigits(342)} کاربر</span>
            <span className="text-[9px] text-indigo-600 font-bold block">۹۴٪ نرخ تعامل تحصیلی</span>
          </div>
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">درآمد ناخالص این ماه</span>
            <span className="text-xl font-black text-slate-800">{toPersianDigits('۷۸,۹۰۰,۰۰۰')} تومان</span>
            <span className="text-[9px] text-emerald-600 font-bold block">▲ ۱۸٪ رشد حق اشتراک‌ها</span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">سرعت پردازش هوش مصنوعی</span>
            <span className="text-xl font-black text-slate-800">{toPersianDigits(metrics.aiLatency)} میلی‌ثانیه</span>
            <span className="text-[9px] text-slate-400 font-bold block">تاخیر استریم عاری از خطا</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 border border-amber-100/60 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </Card>

      </div>

      {/* 2. System Server Health Status banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-black">وضعیت کلی سرورها و پایگاه داده</h4>
            <p className="text-[9px] text-slate-400 font-bold mt-0.5">تمامی اتصالات به ChromaDB، پایگاه داده PostgreSQL و FastAPI با موفقیت برقرار است.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-slate-300 font-bold font-sans">هسته اصلی: فعال</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <span className="text-[10px] text-slate-300 font-bold font-sans">بخش استریم: سالم</span>
          </div>
        </div>
      </div>

      {/* 3. CHART AND RESOURCE METERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Sales & Ingestion Graph (Left, spanning 2 columns) */}
        <Card className="lg:col-span-2 p-5 border border-slate-200/50 bg-white rounded-2xl text-right space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
            <div>
              <h4 className="text-xs font-black text-slate-800">روند خرید اشتراک و عضویت‌های جدید</h4>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">آمار ثبت‌نام و خرید لایسنس در ۷ روز اخیر</span>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-bold">
              <span className="flex items-center gap-1 text-indigo-600">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs"></span>
                عضویت‌های جدید
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span>
                خرید اشتراک (تومان)
              </span>
            </div>
          </div>

          {/* SVG Trendline chart */}
          <div className="w-full h-48 relative pt-2">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeWidth="1" />
              
              {/* Subscription Line (Emerald) */}
              <path
                d="M 10,130 Q 80,100 150,110 T 300,50 T 420,40 T 490,20"
                fill="none"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              
              {/* User Signups Line (Indigo) */}
              <path
                d="M 10,140 Q 80,120 150,90 T 300,85 T 420,55 T 490,45"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1 1"
              />

              {/* Interaction Circles */}
              <circle cx="300" cy="50" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="490" cy="45" r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
            
            {/* Days label row */}
            <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1.5 pt-1 border-t border-slate-100/50">
              <span>شنبه</span>
              <span>یک‌شنبه</span>
              <span>دوشنبه</span>
              <span>سه‌شنبه</span>
              <span>چهارشنبه</span>
              <span>پنج‌شنبه</span>
              <span>جمعه</span>
            </div>
          </div>
        </Card>

        {/* Server Performance Meters (Right) */}
        <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl text-right space-y-4">
          <div>
            <h4 className="text-xs font-black text-slate-800">منابع سخت‌افزاری سرور</h4>
            <span className="text-[9px] text-slate-400 font-bold block mt-0.5">میزان مصرف پردازنده، رم و فضای ذخیره‌سازی محلی</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* CPU */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-600">میزان مصرف پردازنده (CPU)</span>
                <span className="text-slate-800 font-mono">{toPersianDigits(metrics.cpuUsage)}٪</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-1000" 
                  style={{ width: `${metrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            {/* RAM */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-600">میزان مصرف حافظه (RAM)</span>
                <span className="text-slate-800 font-mono">{toPersianDigits(metrics.memoryUsage)}٪</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-1000" 
                  style={{ width: `${metrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Disk Storage */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-600">فضای ذخیره‌سازی هارد</span>
                <span className="text-slate-800 font-mono">{toPersianDigits(metrics.diskUsage)}٪</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-1000" 
                  style={{ width: `${metrics.diskUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Micro Details */}
            <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 font-bold border-t border-slate-100/50 pt-3">
              <div>پایگاه داده: <span className="text-slate-700 font-extrabold">{toPersianDigits(metrics.postgresDbSize)}</span></div>
              <div>مجموع کالکشن‌ها: <span className="text-slate-700 font-extrabold">{toPersianDigits(metrics.chromaCollectionCount)} مجموعه</span></div>
            </div>

          </div>
        </Card>

      </div>

      {/* 4. ACTIVITY & DEMOGRAPHICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Most Active Universities */}
        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl text-right space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100/50 pb-2">
            <GraduationCap className="w-4.5 h-4.5" />
            <span className="text-xs font-black text-slate-800">دانشگاه‌های برتر فعال</span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'دانشگاه تهران', count: 480, share: '۳۸.۷٪' },
              { name: 'دانشگاه صنعتی شریف', count: 320, share: '۲۵.۸٪' },
              { name: 'دانشگاه صنعتی امیرکبیر', count: 210, share: '۱۶.۹٪' },
              { name: 'دانشگاه شهید بهشتی', count: 140, share: '۱۱.۲٪' },
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">{u.name}</span>
                <span className="text-slate-500 font-black">{toPersianDigits(u.count)} دانشجو ({toPersianDigits(u.share)})</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Most Active Subjects */}
        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl text-right space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100/50 pb-2">
            <BookOpen className="w-4.5 h-4.5" />
            <span className="text-xs font-black text-slate-800">پرطرفدارترین دروس تخصصی</span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'مبانی کامپیوتر و برنامه‌نویسی', count: 540, hr: '۱۲۴ ساعت' },
              { name: 'آناتومی و فیزیولوژی عمومی', count: 310, hr: '۸۲ ساعت' },
              { name: 'ریاضی عمومی ۱ و ۲', count: 290, hr: '۷۹ ساعت' },
              { name: 'معادلات دیفرانسیل', count: 180, hr: '۴۴ ساعت' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">{s.name}</span>
                <span className="text-slate-500 font-black">{toPersianDigits(s.count)} جلسه ({toPersianDigits(s.hr)})</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Counters / System Speeds */}
        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl text-right space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100/50 pb-2">
            <Clock className="w-4.5 h-4.5" />
            <span className="text-xs font-black text-slate-800">سرعت پردازش فایل‌های صوتی</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-bold">
               <span className="text-slate-600">متوسط زمان تبدیل گفتار به متن:</span>
               <span className="text-slate-800 font-black">{toPersianDigits(1.2)} ثانیه در دقیقه</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
               <span className="text-slate-600">سرعت تولید امبدینگ و ثبت در بردار:</span>
               <span className="text-slate-800 font-black">{toPersianDigits(350)} میلی‌ثانیه بر قطعه</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600">نرخ موفقیت صف‌های پردازش:</span>
              <span className="text-slate-800 font-black text-emerald-600">۹۹.۸٪ موفقیت کل</span>
            </div>
          </div>
        </Card>

      </div>

    </div>
  );
};
