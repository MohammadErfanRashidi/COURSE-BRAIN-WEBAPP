/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, ChevronLeft, X } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  activeTab: string;
  navItems: Array<{ id: string; label: string; icon: React.ElementType }>;
}

/**
 * Mobile sidebar drawer with performant animation.
 *
 * Separates the backdrop blur element from the opacity animation to avoid
 * expensive backdrop-filter recalculations during every animation frame.
 * Only renders when isOpen is true (via AnimatePresence).
 */
export const MobileSidebar = React.memo(function MobileSidebar({
  isOpen,
  onClose,
  onNavigate,
  onLogout,
  activeTab,
  navItems,
}: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" key="mobile-sidebar-root">
          {/* 
            Static backdrop layer — backdrop-filter is applied here and does NOT
            animate opacity, so the GPU blur calculation happens once at mount
            and is reused by the compositor.
          */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs pointer-events-none" />

          {/* 
            Animated overlay layer — only opacity changes (GPU composited),
            no backdrop-filter recalculation.
          */}
          <motion.div
            key="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
            style={{ willChange: 'opacity' }}
          />

          {/* Sidebar panel */}
          <motion.aside
            key="mobile-menu-sidebar"
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
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 pb-12 flex flex-col justify-between font-sans rounded-l-3xl border-l border-slate-100/50 cursor-default"
            style={{ willChange: 'transform' }}
          >
            <motion.div
              key="mobile-menu-content"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { duration: 0.2, delay: 0.08, ease: [0.32, 0.72, 0, 1] }
              }}
              exit={{ 
                opacity: 0,
                transition: { duration: 0.12, ease: [0.32, 0.72, 0, 1] }
              }}
              layout={false}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="pb-3 border-b border-slate-100/50 text-right">
                  <span className="text-xs font-black text-slate-800">رایا منو</span>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          onClose();
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
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

              <div className="space-y-4">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full px-4 py-3 rounded-xl text-xs font-black text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100/80 hover:border-rose-100/50 transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 duration-200 select-none"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب</span>
                </button>

                <div className="border-t border-slate-100/50 pt-4 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold block">طرح استاندارد فعال</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/40 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer select-none mt-2"
                >
                  <X className="w-4 h-4" />
                  <span>بستن منو</span>
                </button>
              </div>
            </motion.div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
});
