/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserX, 
  CheckCircle, 
  RotateCw, 
  ShieldAlert, 
  Award, 
  FileText, 
  Phone, 
  BookOpen, 
  Plus, 
  SlidersHorizontal,
  ChevronDown,
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { ManagedUser } from '../types';

export const UsersTab: React.FC = () => {
  // Pre-seed some mock students for the administrator to manage
  const [users, setUsers] = useState<ManagedUser[]>([
    {
      id: 'usr_1',
      phoneNumber: '09121234567',
      fullName: 'محمدرضا کریمی',
      university: 'دانشگاه تهران',
      major: 'مهندسی کامپیوتر',
      degree: 'کارشناسی',
      semester: 6,
      status: 'ACTIVE',
      subscriptionPlan: 'رایا استاندارد',
      subscriptionExpiresAt: '2026-09-24',
      recordingHoursUsed: 3.5,
      dailyTokensUsed: 12400,
      lastLogin: '۱ ساعت پیش',
      createdAt: '2026-01-10'
    },
    {
      id: 'usr_2',
      phoneNumber: '09199876543',
      fullName: 'فاطمه السادات علوی',
      university: 'دانشگاه صنعتی شریف',
      major: 'مهندسی برق',
      degree: 'کارشناسی ارشد',
      semester: 2,
      status: 'ACTIVE',
      subscriptionPlan: 'طرح ویژه نخبگان',
      subscriptionExpiresAt: '2026-12-15',
      recordingHoursUsed: 8.2,
      dailyTokensUsed: 45000,
      lastLogin: 'دیروز',
      createdAt: '2025-11-05'
    },
    {
      id: 'usr_3',
      phoneNumber: '09355554433',
      fullName: 'امیرحسین رضایی',
      university: 'دانشگاه شهید بهشتی',
      major: 'پزشکی عمومی',
      degree: 'دکتری حرفه‌ای',
      semester: 8,
      status: 'SUSPENDED',
      subscriptionPlan: 'پایه همگانی',
      subscriptionExpiresAt: '2026-07-01',
      recordingHoursUsed: 1.0,
      dailyTokensUsed: 60000,
      lastLogin: '۳ روز پیش',
      createdAt: '2026-03-22'
    },
    {
      id: 'usr_4',
      phoneNumber: '09125556677',
      fullName: 'سارا احمدی',
      university: 'دانشگاه صنعتی امیرکبیر',
      major: 'مهندسی عمران',
      degree: 'کارشناسی',
      semester: 4,
      status: 'ACTIVE',
      subscriptionPlan: 'رایا استاندارد',
      subscriptionExpiresAt: '2026-08-30',
      recordingHoursUsed: 2.1,
      dailyTokensUsed: 4200,
      lastLogin: 'آنلاین',
      createdAt: '2026-02-14'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Actions handler
  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus: 'ACTIVE' | 'SUSPENDED' = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        showNotification(`وضعیت کاربر ${u.fullName} به ${nextStatus === 'ACTIVE' ? 'فعال' : 'مسدود شده'} تغییر یافت.`);
        const updated: ManagedUser = { ...u, status: nextStatus };
        if (selectedUser?.id === userId) {
          setSelectedUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const handleResetTokens = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        showNotification(`سهمیه توکن روزانه ${u.fullName} با موفقیت صفر شد.`);
        const updated = { ...u, dailyTokensUsed: 0 };
        if (selectedUser?.id === userId) {
          setSelectedUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const handleResetHours = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        showNotification(`میزان ساعت ضبط استفاده شده برای ${u.fullName} با موفقیت ریست شد.`);
        const updated = { ...u, recordingHoursUsed: 0 };
        if (selectedUser?.id === userId) {
          setSelectedUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const handleExtendSubscription = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        showNotification(`اشتراک ${u.fullName} به مدت ۳ ماه تمدید گردید.`);
        const updated = { ...u, subscriptionExpiresAt: '2026-12-31', subscriptionPlan: 'رایا استاندارد (طلایی)' };
        if (selectedUser?.id === userId) {
          setSelectedUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.phoneNumber.includes(searchQuery) ||
                          u.university.includes(searchQuery);
    const matchesUniversity = filterUniversity === 'ALL' || u.university === filterUniversity;
    return matchesSearch && matchesUniversity;
  });

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 left-6 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 text-xs font-black flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800">مدیریت کاربران و دانشجویان</h3>
          <span className="text-[10px] text-slate-450 font-bold block mt-0.5">مشاهده مشخصات تحصیلی، تراکنش‌ها، سهمیه‌ها و تعلیق دسترسی کاربران</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl font-bold">
            کل دانشجویان پلتفرم: {toPersianDigits(users.length)} نفر
          </span>
        </div>
      </div>

      {/* Search and Filters Drawer */}
      <Card className="p-4 border border-slate-200 bg-white rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی دانشجو با نام، شماره همراه، یا نام دانشگاه..."
              className="w-full text-right bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pr-10 pl-4 py-2 text-xs font-bold outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>

          <div className="w-full md:w-56 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={filterUniversity}
              onChange={(e) => setFilterUniversity(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none w-full text-right"
            >
              <option value="ALL">همه دانشگاه‌ها</option>
              <option value="دانشگاه تهران">دانشگاه تهران</option>
              <option value="دانشگاه صنعتی شریف">دانشگاه صنعتی شریف</option>
              <option value="دانشگاه شهید بهشتی">دانشگاه شهید بهشتی</option>
              <option value="دانشگاه صنعتی امیرکبیر">دانشگاه امیرکبیر</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Data Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="p-3.5">نام دانشجو</th>
                <th className="p-3.5">تلفن همراه</th>
                <th className="p-3.5">دانشگاه و رشته</th>
                <th className="p-3.5">وضعیت اشتراک</th>
                <th className="p-3.5">مصرف صوتی (ساعت)</th>
                <th className="p-3.5">توکن امروز</th>
                <th className="p-3.5 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-black text-slate-900">{u.fullName}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">عضویت: {toPersianDigits(u.createdAt)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">{toPersianDigits(u.phoneNumber)}</td>
                  <td className="p-3.5">
                    <span className="block font-semibold text-slate-800">{u.university}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{u.major} - ترم {toPersianDigits(u.semester)}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black ${
                      u.status === 'SUSPENDED' 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {u.status === 'SUSPENDED' ? 'مسدود شده' : u.subscriptionPlan}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">پایان: {toPersianDigits(u.subscriptionExpiresAt)}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">{toPersianDigits(u.recordingHoursUsed)} / ۱۰ ساعت</td>
                  <td className="p-3.5 font-mono text-slate-600">{toPersianDigits(u.dailyTokensUsed.toLocaleString())}</td>
                  <td className="p-3.5 text-left">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                    >
                      مدیریت پرونده
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-10 text-xs text-slate-400 font-bold">
            دانشجویی منطبق بر فیلترهای جستجو یافت نشد.
          </div>
        )}
      </div>

      {/* USER DETAILS & OPERATIONS PANEL (MODAL MODAL) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">{selectedUser.fullName}</h3>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">پرونده مدیریتی دانشجو</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-7 h-7 text-slate-400 hover:bg-slate-100 rounded-lg flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Quick Profile fields */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-[11px] font-bold text-slate-600">
              <div>دانشگاه: <span className="text-slate-800 font-black">{selectedUser.university}</span></div>
              <div>رشته: <span className="text-slate-800 font-black">{selectedUser.major}</span></div>
              <div>مقطع: <span className="text-slate-800 font-black">{selectedUser.degree}</span></div>
              <div>ترم تحصیلی: <span className="text-slate-800 font-black">{toPersianDigits(selectedUser.semester)}</span></div>
              <div>آخرین فعالیت: <span className="text-slate-800 font-black">{selectedUser.lastLogin}</span></div>
              <div>تلفن همراه: <span className="text-slate-800 font-black font-mono">{toPersianDigits(selectedUser.phoneNumber)}</span></div>
            </div>

            {/* Actions Panel */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-black text-slate-400 block border-b border-slate-100 pb-1.5">⚙️ ابزارهای مدیریتی فوری</span>
              
              <div className="grid grid-cols-2 gap-2">
                
                <button
                  onClick={() => handleToggleStatus(selectedUser.id)}
                  className={`px-3 py-2.5 rounded-xl border text-[10px] font-black text-right flex items-center justify-between transition-all cursor-pointer ${
                    selectedUser.status === 'SUSPENDED'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  <span>{selectedUser.status === 'SUSPENDED' ? 'رفع تعلیق و فعال‌سازی' : 'تعلیق و انسداد کاربر'}</span>
                  {selectedUser.status === 'SUSPENDED' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleResetTokens(selectedUser.id)}
                  className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black rounded-xl text-right flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>صفر کردن توکن روزانه</span>
                  <RotateCw className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => handleResetHours(selectedUser.id)}
                  className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black rounded-xl text-right flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>ریست سهمیه ضبط صوتی</span>
                  <RotateCw className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => handleExtendSubscription(selectedUser.id)}
                  className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-xl text-right flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>اعطای لایسنس / تمدید ۳ ماهه</span>
                  <Award className="w-4 h-4" />
                </button>

              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg cursor-pointer"
              >
                بستن پنجره پرونده
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
