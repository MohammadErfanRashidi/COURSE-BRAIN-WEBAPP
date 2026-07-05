/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from './store/authStore';
import { LoginScreen } from './features/auth/LoginScreen';
import { OtpScreen } from './features/auth/OtpScreen';
import { WelcomeScreen } from './features/onboarding/WelcomeScreen';
import { AcademicScreen } from './features/onboarding/AcademicScreen';
import { SubscriptionGate } from './features/subscription/SubscriptionGate';

// Core Tab views
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { ClassesScreen } from './features/classes/ClassesScreen';
import { RecordScreen } from './features/record/RecordScreen';
import { SubscriptionScreen } from './features/subscription/SubscriptionScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { BookmarksScreen } from './features/bookmarks/BookmarksScreen';

// Admin Operations Dashboard
import { useAdminAuthStore } from './store/adminAuthStore';
import { AdminLoginScreen } from './features/admin/AdminLoginScreen';
import { AdminDashboardScreen } from './features/admin/AdminDashboardScreen';

// UI components
import { SupportChat } from './components/SupportChat';
import HamburgerButton from './components/HamburgerButton';
import MobileMenu from './components/MobileMenu';
import { useMobileMenuStore } from './store/mobileMenuStore';

import { 
  GraduationCap, 
  User as UserIcon, 
  CreditCard, 
  LogOut, 
  BookOpen, 
  Clock,
  Compass,
  Mic,
  ChevronLeft,
  Menu,
  X,
  Bookmark
} from 'lucide-react';
import { Recording } from './types';

type ScreenState = 
  | 'SPLASH' 
  | 'LOGIN' 
  | 'OTP' 
  | 'WELCOME_TOUR' 
  | 'ACADEMIC_SETUP' 
  | 'SUBSCRIPTION_GATE' 
  | 'APP_DASHBOARD_PREVIEW';

type ActiveTab = 
  | 'dashboard' 
  | 'classes' 
  | 'record' 
  | 'bookmarks'
  | 'subscription' 
  | 'profile';

export default function App() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    subscriptionStatus, 
    checkSession, 
    logout 
  } = useAuthStore();

  const [currentScreen, setCurrentScreen] = useState<ScreenState>('SPLASH');
  const [phoneForOtp, setPhoneForOtp] = useState('');
  const [simulatedOtpCode, setSimulatedOtpCode] = useState('');

  // Admin Mode states
  const { isAdminAuthenticated } = useAdminAuthStore();
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const handleToggleAdmin = () => {
      setIsAdminMode(true);
    };
    window.addEventListener('toggle-admin-mode', handleToggleAdmin);
    return () => {
      window.removeEventListener('toggle-admin-mode', handleToggleAdmin);
    };
  }, []);

  // Main App Navigation States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Dynamic Date tracking for the Header display
  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Cross-screen contextual arguments
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const isInsideClassChat = activeTab === 'classes' && openClassId !== null;
  const [focusRecord, setFocusRecord] = useState(false);
  const [focusUpload, setFocusUpload] = useState(false);
  const [preselectClassId, setPreselectClassId] = useState<string | null>(null);

  // Boolean flag to trigger class creation modal from the dashboard
  const [shouldOpenCreateModal, setShouldOpenCreateModal] = useState(false);

  // Logout Confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Recording navigation guard
  const [showRecordingGuard, setShowRecordingGuard] = useState(false);
  const pendingNavigationRef = useRef<{ tab: string; args?: any } | null>(null);

  // Premium gestures: swipe-to-open from right edge and swipe-to-close toward the right edge
  // Reads state from Zustand store directly to avoid re-creating listeners
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isAuthenticated || currentScreen !== 'APP_DASHBOARD_PREVIEW') return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaY) < Math.abs(deltaX)) {
        if (!useMobileMenuStore.getState().isOpen) {
          if (touchStartX > window.innerWidth - 45 && deltaX < -50) {
            useMobileMenuStore.getState().open();
          }
        } else {
          if (deltaX > 50) {
            useMobileMenuStore.getState().close();
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAuthenticated, currentScreen]);

  // Hydrate session on startup
  useEffect(() => {
    async function initSession() {
      await checkSession();
    }
    initSession();
  }, [checkSession]);

  const contentSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      requestAnimationFrame(() => {
        const el = contentSectionRef.current;
        if (el) el.scrollTop = 0;
      });
    }
  }, [activeTab]);

  // Handle screen routing based on auth state changes
  useEffect(() => {
    if (isLoading) {
      setCurrentScreen('SPLASH');
      return;
    }

    if (!isAuthenticated) {
      setCurrentScreen('LOGIN');
      setPhoneForOtp('');
      setSimulatedOtpCode('');
      return;
    }

    if (user) {
      if (!user.onboardingCompleted) {
        setCurrentScreen('WELCOME_TOUR');
      } else if (!user.hasActiveSubscription) {
        setCurrentScreen('SUBSCRIPTION_GATE');
      } else {
        setActiveTab('dashboard');
        setCurrentScreen('APP_DASHBOARD_PREVIEW');
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const handlePhoneSubmitted = (phone: string, simCode: string) => {
    setPhoneForOtp(phone);
    setSimulatedOtpCode(simCode);
    setCurrentScreen('OTP');
  };

  const handleOtpVerified = () => {
    setActiveTab('dashboard');
  };

  const handleWelcomeTourComplete = () => {
    setCurrentScreen('ACADEMIC_SETUP');
  };

  const handleAcademicSetupComplete = () => {
    setActiveTab('dashboard');
    if (user?.hasActiveSubscription) {
      setCurrentScreen('APP_DASHBOARD_PREVIEW');
    } else {
      setCurrentScreen('SUBSCRIPTION_GATE');
    }
  };

  const handleSubscriptionActive = () => {
    setActiveTab('dashboard');
    setCurrentScreen('APP_DASHBOARD_PREVIEW');
  };

  const handleDashboardNavigate = useCallback((tab: string, args?: any) => {
    // Block navigation away from record if recording is active
    const recordingState = (window as any).__cbRecordingActive;
    if (activeTab === 'record' && recordingState && tab !== 'record') {
      pendingNavigationRef.current = { tab, args };
      setShowRecordingGuard(true);
      return;
    }

    // Reset secondary states
    setOpenClassId(null);
    setFocusRecord(false);
    setFocusUpload(false);
    setPreselectClassId(null);

    if (args) {
      if (args.openClassId) setOpenClassId(args.openClassId);
      if (args.focusRecord) setFocusRecord(args.focusRecord);
      if (args.focusUpload) setFocusUpload(args.focusUpload);
      if (args.preselectClassId) setPreselectClassId(args.preselectClassId);
    }

    setActiveTab(tab as ActiveTab);
    useMobileMenuStore.getState().close();
  }, [activeTab]);

  const handleLaunchCreateClassFromDashboard = useCallback(() => {
    setActiveTab('classes');
    setShouldOpenCreateModal(true);
  }, []);

  const handleClearClassId = useCallback(() => setOpenClassId(null), []);
  const handleCloseCreateModal = useCallback(() => setShouldOpenCreateModal(false), []);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  // Sidebar navigation options list
  const navItems = useMemo(() => [
    { id: 'dashboard', label: 'داشبورد خانه', icon: Compass },
    { id: 'classes', label: 'کلاس‌های من', icon: BookOpen },
    { id: 'record', label: 'ضبط و بارگذاری', icon: Mic },
    { id: 'bookmarks', label: 'نشان‌شده‌های من', icon: Bookmark },
    { id: 'subscription', label: 'اشتراک و لایسنس', icon: CreditCard },
    { id: 'profile', label: 'پروفایل دانشجویی', icon: UserIcon },
  ], []);

  if (isAdminMode) {
    return isAdminAuthenticated ? (
      <AdminDashboardScreen onBackToStudentApp={() => setIsAdminMode(false)} />
    ) : (
      <AdminLoginScreen onBackToStudentApp={() => setIsAdminMode(false)} />
    );
  }

  return (
    <div className={`bg-[#F8FAFC] text-slate-800 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-800 ${currentScreen === 'APP_DASHBOARD_PREVIEW' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      
      {/* Top Header */}
      {isAuthenticated && user && currentScreen === 'APP_DASHBOARD_PREVIEW' && (
        <header className={`fixed top-[8px] left-4 right-4 z-30 font-sans bg-white/60 backdrop-blur-2xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.06)] rounded-[2rem] px-5 py-3 items-center justify-between transition-all duration-300 ${isInsideClassChat ? 'hidden' : 'flex'}`}>
          <div className="flex items-center gap-3">
            <HamburgerButton />
            
            <div 
              onClick={() => {
                setActiveTab('dashboard');
                useMobileMenuStore.getState().close();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveTab('dashboard');
                  useMobileMenuStore.getState().close();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="صفحه اصلی داشبورد"
              className="flex items-center gap-3 group cursor-pointer select-none active:scale-98 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 rounded-2xl p-1 -m-1"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm tracking-tight shadow-[0_4px_12px_rgba(79,70,229,0.15)] group-hover:scale-105 transition-transform duration-300">
                XIV
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block leading-tight tracking-wide group-hover:text-indigo-600 transition-colors duration-300">XIVAI | زیوای</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 select-none">
            {/* Premium Date Display Badge (restored to top navigation) */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50/20 hover:bg-indigo-50/40 border border-indigo-100/15 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-extrabold text-slate-600 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.01)] hover:shadow-xs transition-all duration-300 cursor-default whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="whitespace-nowrap leading-none flex items-center">
                {(() => {
                  const formattedDate = currentDate.toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' });
                  const parts = formattedDate.split(' ');
                  if (parts.length >= 2 && !parts[0].includes('،')) {
                    parts[0] = parts[0] + '،';
                    return toPersianDigits(parts.join(' '));
                  }
                  return toPersianDigits(formattedDate);
                })()}
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main className={isInsideClassChat ? "flex-1 flex flex-col h-full w-full overflow-hidden" : currentScreen === 'APP_DASHBOARD_PREVIEW' ? "flex-1 flex flex-col overflow-hidden" : "flex-1 flex flex-col justify-center py-4 md:py-8"}>
        
        {currentScreen === 'SPLASH' && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] font-sans">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 border border-indigo-100/60 shadow-sm animate-pulse">
              <span className="text-indigo-600 font-black text-3xl">XIV</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight animate-pulse">XIVAI | زیوای</h1>
            <p className="text-xs text-slate-400 mt-2 font-semibold">درحال بررسی و برقراری ارتباط با پلتفرم...</p>
          </div>
        )}

        {currentScreen === 'LOGIN' && (
          <LoginScreen onCodeSent={handlePhoneSubmitted} />
        )}

        {currentScreen === 'OTP' && (
          <OtpScreen
            phoneNumber={phoneForOtp}
            initialCode={simulatedOtpCode}
            onBack={() => setCurrentScreen('LOGIN')}
            onSuccess={handleOtpVerified}
          />
        )}

        {currentScreen === 'WELCOME_TOUR' && (
          <WelcomeScreen onComplete={handleWelcomeTourComplete} />
        )}

        {currentScreen === 'ACADEMIC_SETUP' && (
          <AcademicScreen onComplete={handleAcademicSetupComplete} />
        )}

        {currentScreen === 'SUBSCRIPTION_GATE' && (
          <SubscriptionGate onActivated={handleSubscriptionActive} />
        )}

        {/* FULL AUTHENTICATED SaaS DASHBOARD WITH PERSISTENT LAYOUT AND AUDIO PLAYER */}
        {currentScreen === 'APP_DASHBOARD_PREVIEW' && user && (
          <div className={isInsideClassChat 
            ? "w-full h-full flex text-right font-sans relative p-0 overflow-hidden" 
            : `w-full px-4 md:px-6 flex gap-6 text-right font-sans relative flex-1 overflow-hidden`
          }>
            
            {/* 1. DESKTOP SIDEBAR (RTL: Sits on the right) */}
            <aside className={`w-64 shrink-0 mt-[104px] mb-[104px] bg-white border border-slate-100/80 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex-col justify-between overflow-y-auto ${isInsideClassChat ? 'hidden' : 'hidden md:flex'}`}>
              <div className="space-y-6">
                
                {/* User quick profile */}
                <div 
                  onClick={() => handleDashboardNavigate('profile')}
                  className="group flex items-center gap-3.5 p-3.5 bg-slate-50/40 hover:bg-slate-50/80 border border-slate-100/70 hover:border-indigo-100/40 rounded-2xl cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-sm"
                >
                  <div className="w-10 h-10 bg-indigo-50/60 border border-indigo-100/40 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-[0_2px_8px_-2px_rgba(79,70,229,0.04)]">
                    <UserIcon className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-right overflow-hidden flex-1">
                    <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600 block truncate transition-colors duration-300">{user.fullName || 'دانشجوی مهمان'}</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5 truncate">{user.academicProfile?.degree === 'md' ? 'دکترای پزشکی عمومی' : 'تکمیل پروفایل'}</span>
                  </div>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleDashboardNavigate(item.id)}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-xs' 
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

              {/* Bottom Section - Logout and active plan */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                                      className="w-full px-4 py-3 rounded-xl text-xs font-black text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100/80 hover:border-rose-100/50 transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 duration-200 select-none"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب</span>
                </button>
              </div>
            </aside>

            <MobileMenu
              navItems={navItems}
              activeTab={activeTab}
              onNavigate={handleDashboardNavigate}
              onLogout={() => setShowLogoutConfirm(true)}
            />

            {/* 3. CORE TAB PANEL VIEW ROUTER */}
            <section
              ref={contentSectionRef}
              className={isInsideClassChat ? "flex-1 min-h-0 flex flex-col h-full w-full overflow-hidden" : "flex-1 min-h-0 overflow-y-auto pb-32 md:pb-0"}
            >
              <div
                  key={activeTab}
                  className={isInsideClassChat ? "h-full w-full flex flex-col min-h-0" : "animate-page-enter pt-[104px]"}
                >
                  {activeTab === 'dashboard' && (
                    <DashboardScreen 
                      onNavigate={handleDashboardNavigate} 
                      onCreateClassTrigger={handleLaunchCreateClassFromDashboard}
                    />
                  )}

                  {activeTab === 'classes' && (
                    <ClassesScreen 
                      onNavigate={handleDashboardNavigate} 
                      openClassId={openClassId}
                      onClearClassId={handleClearClassId}
                      shouldOpenCreateModal={shouldOpenCreateModal}
                      onCloseCreateModal={handleCloseCreateModal}
                    />
                  )}

                  {activeTab === 'record' && (
                    <RecordScreen 
                      onNavigate={handleDashboardNavigate}
                      focusRecord={focusRecord}
                      focusUpload={focusUpload}
                      preselectClassId={preselectClassId}
                    />
                  )}

                  {activeTab === 'bookmarks' && (
                    <BookmarksScreen onNavigate={handleDashboardNavigate} />
                  )}

                  {activeTab === 'subscription' && (
                    <SubscriptionScreen />
                  )}

                  {activeTab === 'profile' && (
                    <ProfileScreen onNavigate={handleDashboardNavigate} />
                  )}
                </div>
            </section>

          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      {isAuthenticated && user && currentScreen === 'APP_DASHBOARD_PREVIEW' && !isInsideClassChat && (
        <nav className="md:hidden fixed bottom-5 left-0 right-0 z-40 mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-7xl bg-white/75 backdrop-blur-xl border border-slate-200/40 shadow-[0_12px_36px_rgba(0,0,0,0.06)] rounded-[2rem] px-4 py-2.5 flex items-center justify-between transition-all duration-300">
          {/* Dashboard Tab */}
          <motion.button 
            whileTap={{ scale: 0.9, y: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleDashboardNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3.5 transition-colors rounded-2xl relative cursor-pointer select-none ${
              activeTab === 'dashboard' ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {activeTab === 'dashboard' && (
              <motion.span 
                layoutId="activeTabMobileGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Compass className="w-5 h-5 animate-none" />
            <span className="text-[10px] font-black">خانه</span>
          </motion.button>

          {/* Classes Tab */}
          <motion.button 
            whileTap={{ scale: 0.9, y: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleDashboardNavigate('classes')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3.5 transition-colors rounded-2xl relative cursor-pointer select-none ${
              activeTab === 'classes' ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {activeTab === 'classes' && (
              <motion.span 
                layoutId="activeTabMobileGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-black">کلاس‌ها</span>
          </motion.button>

          {/* Record Floating FAB */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.92, y: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
              onClick={() => handleDashboardNavigate('record')}
              className={`flex items-center justify-center -mt-8 w-14 h-14 rounded-full border-4 border-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] cursor-pointer relative z-50 ${
                activeTab === 'record' 
                  ? 'bg-indigo-600 text-white shadow-indigo-600/40' 
                  : 'bg-indigo-500 text-white shadow-indigo-500/30'
              }`}
            >
              <Mic className="w-5 h-5 animate-pulse" />
            </motion.button>
          </div>

          {/* Bookmarks Tab */}
          <motion.button 
            whileTap={{ scale: 0.9, y: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleDashboardNavigate('bookmarks')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3.5 transition-colors rounded-2xl relative cursor-pointer select-none ${
              activeTab === 'bookmarks' ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {activeTab === 'bookmarks' && (
              <motion.span 
                layoutId="activeTabMobileGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-black">نشان‌ها</span>
          </motion.button>

          {/* Profile Tab */}
          <motion.button 
            whileTap={{ scale: 0.9, y: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleDashboardNavigate('profile')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3.5 transition-colors rounded-2xl relative cursor-pointer select-none ${
              activeTab === 'profile' ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {activeTab === 'profile' && (
              <motion.span 
                layoutId="activeTabMobileGlow"
                className="absolute inset-0 bg-indigo-50/80 rounded-2xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-black">پروفایل</span>
          </motion.button>
        </nav>
      )}

      {/* Global Floating Support Chat Widget - only visible on the
          authenticated Dashboard page (not during onboarding/auth). */}
      <SupportChat
        activeTab={activeTab}
        isFullAppDashboard={currentScreen === 'APP_DASHBOARD_PREVIEW' && activeTab === 'dashboard'}
      />



      {/* Recording Navigation Guard Modal */}
      {showRecordingGuard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200/40 shadow-2xl text-right font-sans animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-500" />
              <span>ضبط صدا در حال انجام است</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
              شما یک فایل ضبط ناتمام دارید.
              <br /><br />
              خروج از این صفحه باعث حذف دائمی فایل ضبط شده قبل از انتساب به کلاس درسی می‌شود.
              <br /><br />
              آیا مطمئن هستید که می‌خواهید خارج شوید؟
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  pendingNavigationRef.current = null;
                  setShowRecordingGuard(false);
                }}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/40 font-black py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer text-center"
              >
                ادامه ضبط (توصیه می‌شود)
              </button>
              <button
                onClick={() => {
                  (window as any).__cbDiscardRecording?.();
                  const pending = pendingNavigationRef.current;
                  pendingNavigationRef.current = null;
                  setShowRecordingGuard(false);
                  if (pending) {
                    handleDashboardNavigate(pending.tab, pending.args);
                  }
                }}
                className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/40 font-black py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer text-center"
              >
                حذف و خروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200/40 shadow-2xl text-right font-sans animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-extrabold text-slate-900 mb-2">خروج از حساب کاربری</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
              آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/40 font-black py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer text-center"
              >
                خروج
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40 font-black py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer text-center"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}