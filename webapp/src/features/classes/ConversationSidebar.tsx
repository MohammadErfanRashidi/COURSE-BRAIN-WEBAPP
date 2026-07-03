import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  Plus,
  Pin,
  PinOff,
  Trash2,
  MoreVertical,
  X
} from 'lucide-react';
import { ChatConversation } from '../../types';

interface ConversationSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  isMobile: boolean;
  newChatDisabled?: boolean;
  onSelect: (conversationId: string) => void;
  onNewChat: () => void;
  onTogglePin: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onClose: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  isOpen,
  isMobile,
  newChatDisabled,
  onSelect,
  onNewChat,
  onTogglePin,
  onDelete,
  onClose
}) => {
  const [menuConvId, setMenuConvId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuConvId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuConvId(null);
      }
    };
    const timer = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', handler); };
  }, [menuConvId]);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return 'امروز';
      if (date.toDateString() === yesterday.toDateString()) return 'دیروز';
      return toPersianDigits(date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }));
    } catch {
      return '';
    }
  };

  const pinnedConvs = conversations.filter(c => c.pinned);
  const otherConvs = conversations.filter(c => !c.pinned);

  const renderItem = (conv: ChatConversation) => {
    const isActive = conv.id === activeConversationId;
    const menuOpen = menuConvId === conv.id;

    return (
      <div
        key={conv.id}
        className={`group relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
          isActive
            ? 'bg-indigo-50 border border-indigo-100/60 shadow-xs'
            : 'hover:bg-slate-50 border border-transparent'
        }`}
        onClick={() => { onSelect(conv.id); setMenuConvId(null); }}
      >
        <div className="w-7 h-7 bg-slate-100 border border-slate-200/50 rounded-lg flex items-center justify-center shrink-0 text-slate-500">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-black truncate ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
              {conv.title}
            </span>
            {conv.pinned && <Pin className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          <span className="text-[8px] text-slate-400 font-bold block mt-0.5">{formatDate(conv.updatedAt)}</span>
        </div>

        {/* Three-dot button - always visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuConvId(menuOpen ? null : conv.id);
          }}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-all cursor-pointer shrink-0"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {/* Context Menu */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-100/80 rounded-xl shadow-lg py-1 min-w-[130px] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { onTogglePin(conv.id); setMenuConvId(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              {conv.pinned ? (
                <><PinOff className="w-3.5 h-3.5 text-amber-500" /> لغو نشان</>
              ) : (
                <><Pin className="w-3.5 h-3.5" /> نشان کردن</>
              )}
            </button>
            <button
              onClick={() => { onDelete(conv.id); setMenuConvId(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> حذف گفتگو
            </button>
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/80 shrink-0">
        <span className="text-xs font-black text-slate-800">گفتگوها</span>
        {isMobile && (
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-all">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-3 py-2 shrink-0">
        <button
          onClick={() => { if (!newChatDisabled) { onNewChat(); setMenuConvId(null); } }}
          disabled={newChatDisabled}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-black rounded-xl transition-all duration-200 ${
            newChatDisabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-[0.98]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" /> گفتگوی جدید
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {pinnedConvs.length > 0 && (
          <div className="mb-1">
            <div className="px-3 py-1.5 text-[9px] text-slate-400 font-bold">نشان شده</div>
            {pinnedConvs.map(renderItem)}
          </div>
        )}
        {otherConvs.length > 0 ? (
          <div>
            {pinnedConvs.length > 0 && <div className="px-3 py-1.5 text-[9px] text-slate-400 font-bold">دیگر گفتگوها</div>}
            {otherConvs.map(renderItem)}
          </div>
        ) : pinnedConvs.length === 0 ? (
          <div className="text-center py-10 px-4">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-[10px] text-slate-400 font-bold">هیچ گفتگویی وجود ندارد</p>
            <p className="text-[9px] text-slate-400 mt-1">یک گفتگوی جدید شروع کنید</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  // Desktop: inline sidebar
  if (!isMobile) {
    return (
      <div
        className="border-l border-slate-100/80 bg-white/95 overflow-hidden transition-all duration-200 flex flex-col shrink-0"
        style={{
          width: isOpen ? 256 : 0,
          opacity: isOpen ? 1 : 0,
          overflow: isOpen ? undefined : 'hidden',
          transition: 'width 0.2s ease-out, opacity 0.15s ease-out',
        }}
      >
        {isOpen && sidebarContent}
      </div>
    );
  }

  // Mobile: overlay with matching dashboard animation
  return createPortal(
    <div
      className={`fixed inset-0 z-[60] md:hidden ${isOpen ? '' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer backdrop-blur-xs ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ willChange: 'opacity' }}
        onClick={onClose}
      />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="fixed right-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-0 pb-4 flex flex-col font-sans rounded-l-3xl border-l border-slate-100/50 cursor-default"
        style={{
          transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)',
          transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
        }}
      >
        {sidebarContent}
      </aside>
    </div>,
    document.body
  );
};
