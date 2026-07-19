import { useEffect, useState, useCallback, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, ChevronLeft, X } from 'lucide-react';
import { useMobileMenuStore } from '../store/mobileMenuStore';

interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface MobileMenuProps {
  navItems: NavItem[];
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export default function MobileMenu({ navItems, activeTab, onNavigate, onLogout }: MobileMenuProps) {
  const isOpen = useMobileMenuStore((s) => s.isOpen);
  const close = useMobileMenuStore((s) => s.close);
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  useEffect(() => {
    return () => close();
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setShowBlur(true), 60);
      return () => clearTimeout(t);
    } else {
      setShowBlur(false);
    }
  }, [isOpen]);

  const handleNavClick = useCallback((tabId: string) => {
    onNavigate(tabId);
  }, [onNavigate]);

  const handleLogout = useCallback(() => {
    close();
    onLogout();
  }, [close, onLogout]);

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] md:hidden ${isOpen ? '' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer ${showBlur ? 'backdrop-blur-xs' : ''} ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ willChange: 'opacity' }}
        onClick={close}
      />

      <aside
        onClick={(e) => e.stopPropagation()}
        className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 pb-12 flex flex-col justify-between font-sans rounded-l-3xl border-l border-slate-100/50 cursor-default"
        style={{
          transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
          transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
        }}
      >
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100/50 text-right">
              <span className="text-xs font-black text-slate-800">زیوای منو</span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isTabActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                      isTabActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isTabActive && <ChevronLeft className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-xl text-xs font-black text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100/80 hover:border-rose-100/50 transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 duration-200 select-none"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از حساب</span>
            </button>

            <div className="border-t border-slate-100/50 pt-4 text-center">
              <span className="text-[9px] text-slate-400 font-extrabold block">طرح استاندارد فعال</span>
            </div>

            <button
              onClick={close}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/40 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer select-none mt-2"
            >
              <X className="w-4 h-4" />
              <span>بستن منو</span>
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
