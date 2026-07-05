/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { 
  Compass, 
  Users, 
  Database, 
  Zap, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  ChevronLeft, 
  Settings, 
  Activity,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  TrendingUp,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';

// Tabs
import { OverviewTab } from './components/OverviewTab';
import { UsersTab } from './components/UsersTab';
import { DatabaseTab } from './components/DatabaseTab';
import { AIUsageTab } from './components/AIUsageTab';
import { KnowledgeBaseTab } from './components/KnowledgeBaseTab';
import { SupportTab } from './components/SupportTab';
import { AuditLogsTab } from './components/AuditLogsTab';

interface AdminDashboardScreenProps {
  onBackToStudentApp: () => void;
}

type AdminTab = 
  | 'overview' 
  | 'users' 
  | 'database' 
  | 'ai_usage' 
  | 'knowledge_base' 
  | 'support' 
  | 'audit_logs';

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onBackToStudentApp }) => {
  const { activeAdmin, logoutAdmin } = useAdminAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on click outside or Escape key
  useClickOutside({
    isOpen: mobileMenuOpen,
    onClose: () => setMobileMenuOpen(false),
    menuRef: mobileMenuRef,
  });

  if (!activeAdmin) return null;

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const menuItems = useMemo(() => [
    { id: 'overview', label: 'داشبورد خانه ادمین', icon: Compass },
    { id: 'users', label: 'مدیریت دانشجویان', icon: Users },
    { id: 'database', label: 'وضعیت پایگاه‌های داده', icon: Database },
    { id: 'ai_usage', label: 'کنترل صف صوتی و هوش', icon: Zap },
    { id: 'knowledge_base', label: 'کتابخانه و رفرنس PDF', icon: FileText },
    { id: 'support', label: 'پشتیبانی و تیکت‌ها', icon: MessageSquare },
    { id: 'audit_logs', label: 'لاگ وقایع امنیتی ادمین', icon: ShieldCheck },
  ], []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between antialiased selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* Admin Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30 font-sans text-white">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
          
             <div className="w-9 h-9 bg-white text-slate-900 rounded-xl flex items-center justify-center font-extrabold text-sm tracking-tight shrink-0 shadow-sm">
               XIV
             </div>
          <div>
             <div className="flex items-center gap-1.5">
               <span className="text-xs font-black block leading-tight tracking-wider">XIVAI OPERATIONS</span>
               <span className="text-[8px] bg-red-600 px-1 py-0.5 rounded-sm font-black text-white shrink-0 tracking-wide">SECURE BOARD</span>
             </div>
             <span className="text-[9px] text-slate-400 font-bold block mt-0.5">کارتابل امنیتی و مدیریت منابع تحصیلی</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-black block text-slate-100">{activeAdmin.fullName}</span>
            <span className="text-[9px] text-indigo-400 font-bold block mt-0.5">
              نقش: {activeAdmin.role === 'SUPER_ADMINISTRATOR' ? 'مدیر ارشد کل پلتفرم' : activeAdmin.role === 'ADMINISTRATOR' ? 'مدیر سیستم' : activeAdmin.role === 'CONTENT_MANAGER' ? 'مدیر محتوا' : 'کارشناس فنی'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-r border-slate-800 pr-4">
            <button
              onClick={onBackToStudentApp}
              className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-700 hover:border-indigo-500 text-xs font-bold flex items-center gap-1"
              title="بازگشت به پنل دانشجویی"
            >
              <ArrowRight className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">پنل دانشجویی</span>
            </button>
            
            <button
              onClick={() => logoutAdmin()}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-slate-800 hover:border-red-500/20"
              title="خروج از کارتابل مدیریت"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col py-4 md:py-8">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex gap-6 text-right font-sans relative">
          
          {/* 1. DESKTOP SIDEBAR */}
          <aside className="w-64 shrink-0 bg-white border border-slate-200/50 rounded-3xl p-5 shadow-sm hidden md:flex flex-col justify-between min-h-[70vh] sticky top-24 self-start">
            <div className="space-y-6">
              
              {/* Admin profile box */}
              <div className="bg-slate-50 border border-slate-200/40 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-indigo-700" />
                </div>
                <div className="text-right overflow-hidden">
                  <span className="text-xs font-black text-slate-800 block truncate">{activeAdmin.fullName.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5 truncate">{activeAdmin.email}</span>
                </div>
              </div>

              {/* Sidebar Menu */}
              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as AdminTab)}
                      className={`w-full px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronLeft className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </nav>

            </div>

            {/* Sidebar Footer details */}
            <div className="border-t border-slate-100/50 pt-4 text-center">
              <span className="text-[8px] text-slate-400 font-extrabold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>اتصال با هسته FastAPI برقرار است</span>
              </span>
            </div>
          </aside>

          {/* 2. MOBILE RESPONSIVE SIDEBAR — PERFORMANCE OPTIMIZED */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                ref={mobileMenuRef}
                key="admin-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } }}
                exit={{ opacity: 0, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden cursor-pointer"
                style={{ willChange: 'opacity' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.aside 
                  key="admin-menu-sidebar"
                  initial={{ x: '100%' }}
                  animate={{ 
                    x: 0,
                    transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
                  }}
                  exit={{ 
                    x: '100%',
                    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] }
                  }}
                  layout={false}
                  className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 flex flex-col justify-between font-sans"
                  style={{ willChange: 'transform' }}
                  onClick={(e) => e.stopPropagation()}
                >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100/50">
                    <span className="text-xs font-black text-slate-800">ناوبر ادمین</span>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-7 h-7 text-slate-400 hover:bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200/40 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as AdminTab);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                            isActive 
                              ? 'bg-slate-900 text-white' 
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {isActive && <ChevronLeft className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="border-t border-slate-100/50 pt-4 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold block">XIVAI SECURE OPERATIONS</span>
                </div>
              </motion.aside>
            </motion.div>
          )}
          </AnimatePresence>

          {/* 3. ACTIVE TAB PANEL */}
          <section className="flex-1 min-h-[60vh]">
            
            {activeTab === 'overview' && (
              <OverviewTab />
            )}

            {activeTab === 'users' && (
              <UsersTab />
            )}

            {activeTab === 'database' && (
              <DatabaseTab />
            )}

            {activeTab === 'ai_usage' && (
              <AIUsageTab />
            )}

            {activeTab === 'knowledge_base' && (
              <KnowledgeBaseTab />
            )}

            {activeTab === 'support' && (
              <SupportTab />
            )}

            {activeTab === 'audit_logs' && (
              <AuditLogsTab />
            )}

          </section>

        </div>
      </main>

    </div>
  );
};
