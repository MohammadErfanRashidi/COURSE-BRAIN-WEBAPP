/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Zap,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Mic,
  Sliders,
  AlertOctagon,
  RefreshCw,
  Play,
  Pause,
  ArrowUp,
  XCircle,
  Award
} from 'lucide-react';
import { Card } from '../../../components/Card';

export const AIUsageTab: React.FC = () => {
  // Pre-seed some active mock background queue jobs
  const [jobs, setJobs] = useState([
    { id: 'job_1', fileName: 'جلسه_اول_مهندسی_برنامه_نویسی.mp3', size: '۱۴.۲ مگابایت', step: 'TRANSCRIBING', progress: 45, university: 'دانشگاه تهران', priority: 'NORMAL' },
    { id: 'job_2', fileName: 'کلاس_آناتومی_بخش_قلب_عروق.mp3', size: '۳۲.۹ مگابایت', step: 'CHUNKING', progress: 100, university: 'دانشگاه شهید بهشتی', priority: 'HIGH' },
    { id: 'job_3', fileName: 'فیزیک_مکانیک_جلسه_دوم.mp3', size: '۸.۱ مگابایت', step: 'EMBEDDING', progress: 12, university: 'دانشگاه صنعتی شریف', priority: 'NORMAL' },
    { id: 'job_4', fileName: 'مبانی_برنامه_نویسی_پایتون.mp3', size: '۱۹.۴ مگابایت', step: 'FAILED', progress: 0, university: 'دانشگاه صنعتی امیرکبیر', priority: 'LOW' }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRetryJob = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        showNotification(`عملیات بازپردازش و تبدیل گفتار مجددا برای فایل آغاز گردید.`);
        return { ...j, step: 'TRANSCRIBING', progress: 10 };
      }
      return j;
    }));
  };

  const handleCancelJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    showNotification('وظیفه صوتی مشخص شده با موفقیت از صف حذف گردید.');
  };

  const handlePrioritizeJob = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        showNotification('اولویت پردازش وظیفه به سطح بحرانی (HIGH) ارتقا یافت.');
        return { ...j, priority: 'HIGH' };
      }
      return j;
    }));
  };

  return (
    <div className="space-y-6 text-right font-sans">

      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 left-6 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 text-xs font-black flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Model Analytics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">کل درخواستهای زیوای (XIVAI)</span>
            <span className="text-base font-black text-slate-800">{toPersianDigits('۱۲۴,۵۰۰')} کادر گفتگو</span>
            <span className="text-[9px] text-emerald-600 font-bold block">۹۹.۹٪ پاسخدهی استریم</span>
          </div>
          <div className="w-9 h-9 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Zap className="w-4.5 h-4.5" />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">هزینه حدودی سرور (ماهیانه)</span>
            <span className="text-base font-black text-slate-800">{toPersianDigits('$۴۲.۵')} دلار</span>
            <span className="text-[9px] text-slate-400 font-bold block">مجموع کل مصرف شده</span>
          </div>
          <div className="w-9 h-9 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">مدت گفتار تبدیل شده</span>
            <span className="text-base font-black text-slate-800">{toPersianDigits(340)} ساعت صوتی</span>
            <span className="text-[9px] text-indigo-600 font-bold block">دقت همگامسازی کلمات: ۹۸.۹٪</span>
          </div>
          <div className="w-9 h-9 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Mic className="w-4.5 h-4.5" />
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block">نرخ بروز مشکل در رندر</span>
            <span className="text-base font-black text-slate-800">کمتر از {toPersianDigits('۰.۰۲')}٪</span>
            <span className="text-[9px] text-rose-600 font-bold block">بدون ریست فریم یا خطای بافر</span>
          </div>
          <div className="w-9 h-9 bg-rose-50 border border-rose-100/60 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertOctagon className="w-4.5 h-4.5" />
          </div>
        </Card>

      </div>

      {/* Background Processing Queue */}
      <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl text-right space-y-4">
        <div>
          <h4 className="text-xs font-black text-slate-800">صف پردازش صوتی هوشمند</h4>
          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">مشاهده زنده وظایف پسزمینه، تکرار وظایف شکستخورده و مدیریت ظرفیت</span>
        </div>

        <div className="overflow-x-auto border border-slate-200/40 rounded-xl">
          <table className="w-full text-right border-collapse text-xs font-bold text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/50 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="p-3">نام فایل درس</th>
                <th className="p-3">دانشگاه فرستنده</th>
                <th className="p-3">مرحله فعلی</th>
                <th className="p-3">پیشرفت کار</th>
                <th className="p-3">سطح اولویت</th>
                <th className="p-3 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="p-3 font-semibold text-slate-800">{job.fileName}</td>
                  <td className="p-3 text-slate-500">{job.university}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black ${
                      job.step === 'FAILED'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100/60'
                        : job.step === 'CHUNKING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100/60'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100/60'
                    }`}>
                      {job.step === 'TRANSCRIBING' ? 'تبدیل گفتار به متن' : job.step === 'CHUNKING' ? 'قطعهبندی محتوا' : job.step === 'EMBEDDING' ? 'دستهبندی مفهومی اطلاعات' : 'پردازش ناموفق'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            job.step === 'FAILED' ? 'bg-rose-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{toPersianDigits(job.progress)}٪</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-black ${
                      job.priority === 'HIGH' ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm' : 'text-slate-400'
                    }`}>
                      {job.priority === 'HIGH' ? 'اولویت بالا' : 'عادی'}
                    </span>
                  </td>
                  <td className="p-3 text-left space-x-1">
                    {job.step === 'FAILED' ? (
                      <button
                        onClick={() => handleRetryJob(job.id)}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black rounded-md cursor-pointer transition-colors"
                      >
                        تلاش مجدد
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePrioritizeJob(job.id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-black rounded-md cursor-pointer transition-colors inline-flex items-center gap-0.5"
                      >
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                        <span>اولویت</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelJob(job.id)}
                      className="px-2 py-1 hover:bg-rose-50 text-rose-600 text-[9px] font-black rounded-md cursor-pointer transition-colors"
                    >
                      لغو کار
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};