/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Terminal, 
  Clock, 
  User, 
  Filter, 
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Select } from '../../../components/Select';
import { AdminAuditLog } from '../types';

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([
    {
      id: 'log_1',
      timestamp: '۱۴۰۵/۰۴/۰۳ ۱۰:۲۲',
      adminName: 'امیررضا علوی',
      adminRole: 'SUPER_ADMINISTRATOR',
      action: 'تمدید ۳ ماهه اشتراک طلایی کاربر محمدرضا کریمی',
      affectedUser: '09121234567',
      ipAddress: '192.168.1.120',
      status: 'SUCCESS'
    },
    {
      id: 'log_2',
      timestamp: '۱۴۰۵/۰۴/۰۳ ۱۰:۰۵',
      adminName: 'سارا رضایی',
      adminRole: 'ADMINISTRATOR',
      action: 'بازنشانی سهمیه مصرف شده امروز فاطمه علوی',
      affectedUser: '09199876543',
      ipAddress: '192.168.1.88',
      status: 'SUCCESS'
    },
    {
      id: 'log_3',
      timestamp: '۱۴۰۵/۰۴/۰۲ ۱۸:۳۰',
      adminName: 'زهرا احمدی',
      adminRole: 'CONTENT_MANAGER',
      action: 'آپلود و نمایه سازی کتاب فیزیک هالیدی جلد اول',
      affectedUser: 'halliday_physics.pdf',
      ipAddress: '10.0.4.15',
      status: 'SUCCESS'
    },
    {
      id: 'log_4',
      timestamp: '۱۴۰۵/۰۴/۰۲ ۱۵:۱۲',
      adminName: 'ناشناس (بات)',
      adminRole: 'ANALYTICS_VIEWER',
      action: 'تلاش ناموفق برای ورود به سیستم با نام کاربری نادرست',
      affectedUser: 'admin_test',
      ipAddress: '185.220.101.44',
      status: 'FAILED'
    },
    {
      id: 'log_5',
      timestamp: '۱۴۰۵/۰۴/۰۲ ۱۱:۰۰',
      adminName: 'امیررضا علوی',
      adminRole: 'SUPER_ADMINISTRATOR',
      action: 'تعلیق موقت دسترسی حساب کاربری امیرحسین رضایی',
      affectedUser: '09355554433',
      ipAddress: '192.168.1.120',
      status: 'SUCCESS'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const handleExportCSV = () => {
    alert('گزارش فایل اکسل (CSV) از لاگ‌های امنیتی سیستم با موفقیت تجمیع و در صف دانلود مرورگر قرار گرفت.');
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.adminName.includes(searchQuery) || 
                          l.action.includes(searchQuery) ||
                          (l.affectedUser && l.affectedUser.includes(searchQuery));
    const matchesRole = filterRole === 'ALL' || l.adminRole === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Header and export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800">تاریخچه ثبت وقایع و لاگ‌های امنیتی</h3>
          <span className="text-[10px] text-slate-450 font-bold block mt-0.5">آرشیو غیرقابل ویرایش تمامی تراکنش‌های مدیران و ارتقاء دسترسی‌ها</span>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>خروجی اکسل (CSV)</span>
        </button>
      </div>

      {/* Log Filters Bar */}
      <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در متن اقدام، نام ادمین یا آدرس IP..."
              className="w-full text-right bg-slate-50 border border-slate-200/50 focus:border-indigo-500 focus:bg-white rounded-xl pr-10 pl-4 py-2 text-xs font-bold outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>

          <div className="w-full md:w-56 flex items-center gap-2 bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <Select
              value={filterRole}
              onChange={setFilterRole}
              options={[
                { value: 'ALL', label: 'همه نقش‌ها' },
                { value: 'SUPER_ADMINISTRATOR', label: 'مدیر ارشد' },
                { value: 'ADMINISTRATOR', label: 'مدیر سیستم' },
                { value: 'CONTENT_MANAGER', label: 'مدیر محتوا' },
                { value: 'SUPPORT_STAFF', label: 'پشتیبان' },
              ]}
              inline
              searchable={false}
            />
          </div>
        </div>
      </Card>

      {/* Audit Log Table Grid */}
      <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs font-bold text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/50 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="p-3.5">زمان</th>
                <th className="p-3.5">اقدام ادمین</th>
                <th className="p-3.5">شناسه ادمین</th>
                <th className="p-3.5">نقش امنیتی</th>
                <th className="p-3.5">آی‌پی ادمین</th>
                <th className="p-3.5 text-left">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5 text-slate-500 font-semibold">{toPersianDigits(log.timestamp)}</td>
                  <td className="p-3.5">
                    <span className="block font-black text-slate-900 leading-normal">{log.action}</span>
                    {log.affectedUser && (
                      <span className="text-[9px] text-indigo-600 block mt-0.5">کاربر متأثر: <code className="font-mono">{toPersianDigits(log.affectedUser)}</code></span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-700">{log.adminName}</td>
                  <td className="p-3.5">
                    <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {log.adminRole === 'SUPER_ADMINISTRATOR' ? 'مدیر ارشد' : log.adminRole === 'ADMINISTRATOR' ? 'مدیر سیستم' : log.adminRole === 'CONTENT_MANAGER' ? 'مدیر محتوا' : 'کارشناس'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 text-[11px]" dir="ltr">{log.ipAddress}</td>
                  <td className="p-3.5 text-left">
                    <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[9px] font-black ${
                      log.status === 'SUCCESS' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                    }`}>
                      {log.status === 'SUCCESS' ? 'موفقیت‌آمیز' : 'رد صلاحیت'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-10 text-xs text-slate-400 font-bold">
            موردی در لاگ ثبت وقایع یافت نشد.
          </div>
        )}
      </div>

    </div>
  );
};
