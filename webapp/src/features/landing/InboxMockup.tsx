import {
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  CreditCard,
  Home,
  LogOut,
  MessageSquare,
  Mic,
  Plus,
  Search,
  Sparkles,
  Upload,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

export function InboxMockup() {
  return (
    <section className="px-4 md:px-0 w-full max-w-[1100px] mx-auto mb-20 relative z-10" dir="rtl">
      <div
        className="w-full h-[550px] md:h-auto flex flex-col md:flex-row overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-2xl shadow-2xl relative"
      >
        {/* Right Sidebar */}
        <div className="flex flex-col border-l-0 md:border-l border-[var(--border-color)] bg-[var(--icon-bg)] shrink-0 transition-all duration-500 ease-in-out overflow-hidden w-0 md:w-[240px] opacity-0 md:opacity-100 relative">
          <div className="w-[240px] p-4 flex flex-col h-full absolute inset-y-0 right-0">
            {/* User Profile Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--btn-bg)] border border-[var(--border-color)] shadow-[var(--btn-shadow)] mb-6 transition-transform hover:-translate-y-0.5 cursor-pointer">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#285BE8] to-[#313B59] flex items-center justify-center text-white font-bold shrink-0">
                 A
               </div>
               <div className="flex flex-col overflow-hidden">
                 <span className="text-sm font-semibold text-[var(--text-primary)] truncate">امین مسلمی</span>
                 <span className="text-xs text-[var(--text-muted)] truncate">دانشجوی پزشکی</span>
               </div>
             </div>

            {/* Nav Items */}
            <div className="flex flex-col gap-1 flex-1">
              <NavItem icon={<Home className="w-4 h-4"/>} label="خانه" active />
              <NavItem icon={<BookOpen className="w-4 h-4"/>} label="کلاس‌ها" />
              <NavItem icon={<Mic className="w-4 h-4"/>} label="ضبط و بارگذاری" />
              <NavItem icon={<Bookmark className="w-4 h-4"/>} label="نشان‌شده‌ها" />
              <NavItem icon={<CreditCard className="w-4 h-4"/>} label="اشتراک" />
              <NavItem icon={<User className="w-4 h-4"/>} label="پروفایل" />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-[var(--border-color)] shrink-0">
              <NavItem icon={<LogOut className="w-4 h-4 text-red-500"/>} label="خروج" textClass="text-red-500" hoverBg="hover:bg-red-500/10" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden">

          {/* Top Header */}
          <div
            className="relative w-full h-12 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--border-color)] shrink-0 z-20"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--glass-bg) 85%, #285BE8 8%), color-mix(in srgb, var(--glass-bg) 95%, transparent))',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 8px 32px color-mix(in srgb, #285BE8 10%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-lg">
              <img src="/final-fr.png" alt="ZivAI" className="w-6 h-6 object-contain" />
              ZivAI
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] font-medium">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">۱۸ مهر ۱۴۰۳</span>
            </div>
          </div>

          {/* Scrolling Content Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar md:overflow-visible w-full h-full relative z-10">
            {/* 2-Column Desktop Layout (Center and Left) */}
            <div className="flex flex-col lg:flex-row p-4 sm:p-6 pb-6 gap-6 min-h-full">

              {/* Center Column */}
              <div className="flex-1 flex flex-col gap-5">

                {/* Welcome & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">شب بخیر، امین عزیز</h1>
                  </div>
                  <div className="relative w-full sm:w-64 group shrink-0">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-[#285BE8] transition-colors" />
                    <input
                      type="text"
                      placeholder="جستجو..."
                      className="w-full h-10 bg-[var(--icon-bg)] border border-[var(--border-color)] rounded-xl pr-9 pl-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#285BE8] focus:bg-[var(--bg-secondary)] transition-all shadow-sm"
                      readOnly
                    />
                  </div>
                </div>

                {/* Stats Cards - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <StatCard title="ساعات ضبط باقیمانده" value="۱۸ ساعت" progress={85} icon={<Clock className="w-5 h-5 text-[#285BE8]"/>} />
                  <StatCard title="مصرف روزانه هوش مصنوعی" value="۴۰٪" progress={40} icon={<Sparkles className="w-5 h-5 text-[#285BE8]"/>} />
                  <StatCard title="کلاس‌های باقیمانده" value="۳ کلاس" progress={60} icon={<BookOpen className="w-5 h-5 text-[#285BE8]"/>} />
                  <StatCard title="روزهای اشتراک" value="۲۲ روز" progress={70} icon={<Calendar className="w-5 h-5 text-[#285BE8]"/>} />
                </div>

                {/* Conversation Panel Placeholder */}
                <div className="flex-1 border border-[var(--border-color)] bg-[var(--icon-bg)] rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm transition-colors cursor-pointer group min-h-[160px] relative overflow-hidden hover:bg-[var(--glass-bg)]">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-[var(--bg-primary)] opacity-10 pointer-events-none"></div>
                  <h2 className="absolute top-4 right-5 text-sm font-bold text-[var(--text-primary)]">مکالمات اخیر</h2>

                  <div className="w-12 h-12 mt-6 rounded-full bg-[var(--btn-bg)] border border-[var(--border-color)] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-3 max-w-sm mx-auto leading-relaxed">
                    شما می‌توانید با زیوای درباره کلاس‌های خود گفتگو کنید، کوئیز بسازید یا سوال بپرسید.
                  </p>
                </div>

              </div>

              {/* Left Column - Quick Access */}
              <div className="w-full lg:w-[220px] shrink-0 flex flex-col gap-3">
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1 hidden lg:block">دسترسی سریع</h2>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  <QuickCard title="ثبت کلاس جدید" icon={<Plus className="w-5 h-5"/>} />
                  <QuickCard title="ضبط صدای کلاس" icon={<Mic className="w-5 h-5"/>} />
                  <QuickCard title="بارگذاری فایل صوتی" icon={<Upload className="w-5 h-5"/>} />
                  <QuickCard title="مدیریت اشتراک" icon={<CreditCard className="w-5 h-5"/>} />
                </div>
              </div>

            </div>
          </div>

          {/* Mobile Bottom Navigation Container */}
          <div className="md:hidden shrink-0 w-full px-4 pb-2 pt-0.5 z-40 transition-all duration-500 ease-in-out">
            <div className="relative w-full rounded-3xl border border-[var(--border-color)] px-1 py-1 flex justify-between items-center"
              style={{
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--glass-bg) 85%, #285BE8 8%), color-mix(in srgb, var(--glass-bg) 95%, transparent))',
                boxShadow: '0 4px 16px color-mix(in srgb, #285BE8 5%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Right Items */}
              <div className="flex flex-1 justify-around items-center">
                <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 rounded-xl bg-[#285BE8]/15 text-[#4A78F2] border border-[#285BE8]/25 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all">
                  <Compass className="w-4 h-4" />
                  <span className="text-[9px] font-bold">خانه</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-all">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[9px] font-medium">کلاس‌ها</span>
                </div>
              </div>

              {/* Center Record Button */}
              <div className="flex-shrink-0 relative -top-3.5 mx-1">
                <div className="absolute inset-0 bg-[#285BE8] rounded-full blur-[8px] opacity-65"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#285BE8] to-[#4A78F2] flex items-center justify-center shadow-[0_6px_16px_rgba(40,91,232,0.45)] border border-white/10 cursor-pointer transform hover:scale-110 active:scale-95 transition-all relative z-10">
                  <Mic className="w-[18px] h-[18px] text-white" />
                </div>
              </div>

              {/* Left Items */}
              <div className="flex flex-1 justify-around items-center">
                <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-all">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-[9px] font-medium">نشان‌ها</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-all">
                  <User className="w-4 h-4" />
                  <span className="text-[9px] font-medium">پروفایل</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function NavItem({ icon, label, active, textClass = "text-[var(--text-muted)]", hoverBg = "hover:bg-[var(--icon-bg)]" }: { icon: React.ReactNode, label: string, active?: boolean, textClass?: string, hoverBg?: string }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-[var(--btn-bg)] shadow-sm border border-[var(--border-color)] text-[var(--text-primary)]' : `${textClass} ${hoverBg} border border-transparent`}`}>
      <div className={`transition-transform duration-200 ${!active && 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-[var(--text-primary)]' : ''}`}>{label}</span>
    </div>
  );
}

function StatCard({ title, value, icon, progress }: { title: string, value: string, icon: React.ReactNode, progress: number }) {
  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden h-28">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col gap-1 justify-center h-8">
          <div className="text-sm sm:text-lg font-bold text-[var(--text-primary)]">{value}</div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[var(--icon-bg)] flex items-center justify-center border border-[var(--border-color)] group-hover:scale-110 transition-transform duration-300 shrink-0">
          {icon}
        </div>
      </div>

      <div className="mt-2 relative z-10">
        <div className="w-full h-1.5 bg-[var(--icon-bg)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-green-400 to-green-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-green-400 blur-[2px] opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickCard({ title, icon, colorClass = "bg-[var(--icon-bg)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--glass-bg)]" }: { title: string, icon: React.ReactNode, colorClass?: string }) {
  return (
    <div className={`border rounded-xl p-3 flex items-center justify-center lg:justify-start gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md ${colorClass}`}>
      <div className="transform transition-transform duration-300 hover:scale-110 shrink-0">
        {icon}
      </div>
      <span className="text-[11px] sm:text-xs font-semibold">{title}</span>
    </div>
  );
}
