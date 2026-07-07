/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  Trash2, 
  Plus, 
  Mic, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  AlertTriangle,
  FolderOpen,
  User as UserIcon,
  Search,
  Tag,
  FileText,
  MoreVertical,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AcademicService, ClassService, RecordingService, SubscriptionService } from '../../services/api';
import { ChatEngine } from '../../services/chatEngine';
import { Class, Course, Recording, SubscriptionStatus, ChatConversation } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { ClassChat } from './ClassChat';
import { TranscriptReader } from './TranscriptReader';
import { ConversationSidebar } from './ConversationSidebar';
import { ConversationEngine, migrateOldChatToConversation } from '../../services/conversationEngine';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ClassesScreenProps {
  onNavigate: (tab: string, arg?: any) => void;
  openClassId?: string | null;
  conversationId?: string | null;
  onClearClassId?: () => void;
  shouldOpenCreateModal?: boolean;
  onCloseCreateModal?: () => void;
}

let _cachedClasses: Class[] = [];
let _cachedRecordings: Recording[] = [];
let _cachedCourses: Course[] = [];

export const ClassesScreen: React.FC<ClassesScreenProps> = ({ 
  onNavigate, 
  openClassId, 
  conversationId,
  onClearClassId,
  shouldOpenCreateModal,
  onCloseCreateModal
}) => {
  const { subscriptionStatus, syncSubscription } = useAuthStore();
  const [classes, setClasses] = useState<Class[]>(_cachedClasses);
  const [recordings, setRecordings] = useState<Recording[]>(_cachedRecordings);
  const [selectedClass, setSelectedClass] = useState<Class | null>(() => {
    if (openClassId) {
      return _cachedClasses.find(c => c.id === openClassId) || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => _cachedClasses.length === 0);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals / Dialogs State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Class | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [detailedRecording, setDetailedRecording] = useState<Recording | null>(null);
  const [showRecordingsDropdown, setShowRecordingsDropdown] = useState(false);
  
  // Chat Conversation State
  const [chatKey, setChatKey] = useState(0);
  const [hasMessages, setHasMessages] = useState(false);
  
  // Conversation Management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [draftActive, setDraftActive] = useState(false);
  const [showDeleteConvConfirm, setShowDeleteConvConfirm] = useState<string | null>(null);
  
  // MD Course Catalog States
  const [courses, setCourses] = useState<Course[]>(_cachedCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set([1]));

  // Close overflow menus on click outside or Escape
  useClickOutside({
    isOpen: activeDropdownId !== null,
    onClose: () => setActiveDropdownId(null),
    containerSelector: '[data-overflow-menu]',
  });

  // Close recordings dropdown on click outside or Escape
  useClickOutside({
    isOpen: showRecordingsDropdown,
    onClose: () => setShowRecordingsDropdown(false),
    containerSelector: '[data-recordings-dropdown]',
  });



  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const dataLoadedRef = useRef(false);
  const classesRef = useRef<Class[]>([]);

  const loadData = async () => {
    const needsSkeleton = _cachedClasses.length === 0;
    if (needsSkeleton) setIsLoading(true);
    try {
      await syncSubscription();
      const [fetchedClasses, fetchedRecordings, fetchedCourses] = await Promise.all([
        ClassService.getClasses(),
        RecordingService.getRecordings(),
        AcademicService.getMDCourses()
      ]);
      setClasses(fetchedClasses);
      setRecordings(fetchedRecordings);
      setCourses(fetchedCourses);
      classesRef.current = fetchedClasses;
      dataLoadedRef.current = true;
      _cachedClasses = fetchedClasses;
      _cachedRecordings = fetchedRecordings;
      _cachedCourses = fetchedCourses;

      if (openClassId) {
        const cls = fetchedClasses.find(c => c.id === openClassId);
        if (cls) {
          setSelectedClass(cls);
        }
      } else {
        setSelectedClass(null);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری اطلاعات کلاس‌ها');
    } finally {
      if (needsSkeleton) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setShowRecordingsDropdown(false);
  }, []);

  useEffect(() => {
    setShowRecordingsDropdown(false);
    if (!dataLoadedRef.current) return;

    if (!openClassId) {
      setSelectedClass(null);
      return;
    }

    const cls = classesRef.current.find(c => c.id === openClassId);
    setSelectedClass(cls || null);
  }, [openClassId]);

  useEffect(() => {
    setShowRecordingsDropdown(false);
  }, [selectedClass]);

  // Hook for layout triggers
  useEffect(() => {
    if (shouldOpenCreateModal) {
      setError(null);
      setSearchQuery('');
      setShowCreateModal(true);
      if (onCloseCreateModal) {
        onCloseCreateModal();
      }
    }
  }, [shouldOpenCreateModal, onCloseCreateModal]);

  const handleCreateClass = async (course: Course) => {
    if (classes.length >= 5) {
      setError('شما به حداکثر ۵ کلاس مجاز در طرح جاری رسیده‌اید.');
      return;
    }
    setIsSubmitLoading(true);
    setError(null);

    try {
      await ClassService.createClass(course.name, '', course.id);
      setShowCreateModal(false);
      setSearchQuery('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت کلاس جدید');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Group courses by semester
  const coursesBySemester = useMemo(() => {
    const map = new Map<number, Course[]>();
    courses.forEach(c => {
      if (!map.has(c.semester)) map.set(c.semester, []);
      map.get(c.semester)!.push(c);
    });
    return map;
  }, [courses]);

  // Filter courses by search query
  const filteredSemesters = useMemo(() => {
    if (!searchQuery.trim()) return coursesBySemester;
    const q = searchQuery.trim().toLowerCase();
    const result = new Map<number, Course[]>();
    coursesBySemester.forEach((courseList, sem) => {
      const filtered = courseList.filter(c => c.name.toLowerCase().includes(q));
      if (filtered.length > 0) result.set(sem, filtered);
    });
    return result;
  }, [coursesBySemester, searchQuery]);

  const toggleSemester = (sem: number) => {
    setExpandedSemesters(prev => {
      const next = new Set(prev);
      if (next.has(sem)) next.delete(sem);
      else next.add(sem);
      return next;
    });
  };

  const toggleAllSemesters = () => {
    if (expandedSemesters.size === filteredSemesters.size) {
      setExpandedSemesters(new Set());
    } else {
      setExpandedSemesters(new Set(filteredSemesters.keys()));
    }
  };


  const handleDeleteClass = async (id: string) => {
    setIsSubmitLoading(true);
    try {
      await ClassService.deleteClass(id);
      setShowDeleteConfirm(null);
      if (selectedClass?.id === id) {
        setSelectedClass(null);
        if (onClearClassId) onClearClassId();
      }
      await loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در حذف کلاس');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // ── Conversation Management ──

  const refreshConversations = useCallback((classId: string) => {
    setConversations(ConversationEngine.getSortedConversations(classId));
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setConversations([]);
      setActiveConversationId(null);
      setDraftActive(false);
      return;
    }
    const classId = selectedClass.id;
    migrateOldChatToConversation(classId);
    const existing = ConversationEngine.getSortedConversations(classId);
    setConversations(existing);

    if (conversationId) {
      const target = existing.find(c => c.id === conversationId);
      if (target) {
        setActiveConversationId(conversationId);
        setDraftActive(false);
        setChatKey(prev => prev + 1);
        return;
      }
    }

    const draftId = 'draft_' + Date.now();
    setActiveConversationId(draftId);
    setDraftActive(true);
    setChatKey(prev => prev + 1);
  }, [selectedClass?.id, conversationId]);

  // Save last visited conversation per class
  useEffect(() => {
    if (!selectedClass || !activeConversationId || activeConversationId.startsWith('draft_')) return;
    localStorage.setItem(`cb_last_conv_${selectedClass.id}`, activeConversationId);
  }, [activeConversationId, selectedClass]);

  useEffect(() => {
    if (!selectedClass) return;
    const classId = selectedClass.id;
    const handler = () => {
      setConversations(ConversationEngine.getSortedConversations(classId));
    };
    window.addEventListener('cb-conversations-changed', handler);
    return () => window.removeEventListener('cb-conversations-changed', handler);
  }, [selectedClass?.id]);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [selectedClass?.id, isMobile]);

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setDraftActive(false);
    setChatKey(prev => prev + 1);
    if (isMobile) setSidebarOpen(false);
  };

  const handleNewConversation = () => {
    if (!selectedClass || draftActive) return;
    const draftId = 'draft_' + Date.now();
    setActiveConversationId(draftId);
    setDraftActive(true);
    setChatKey(prev => prev + 1);
    if (isMobile) setSidebarOpen(false);
  };

  const handleTogglePin = (convId: string) => {
    if (!selectedClass) return;
    const result = ConversationEngine.togglePin(selectedClass.id, convId);
    if (!result.success && result.message) setError(result.message);
    else setError(null);
    setConversations(ConversationEngine.getSortedConversations(selectedClass.id));
    setShowDeleteConvConfirm(null);
  };

  const handleDeleteConversation = (convId: string) => {
    setShowDeleteConvConfirm(convId);
  };

  const confirmDeleteConversation = async () => {
    if (!selectedClass || !showDeleteConvConfirm) return;
    const convId = showDeleteConvConfirm;
    ConversationEngine.deleteConversation(selectedClass.id, convId);
    const remaining = ConversationEngine.getSortedConversations(selectedClass.id);
    setConversations(remaining);
    setShowDeleteConvConfirm(null);
    if (convId === activeConversationId) {
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
        setDraftActive(false);
      } else {
        setActiveConversationId('draft_' + Date.now());
        setDraftActive(true);
      }
      setChatKey(prev => prev + 1);
    }
  };

  const handleConversationTitleChange = (title: string) => {
    if (!selectedClass || !activeConversationId) return;
    if (draftActive) {
      const classId = selectedClass.id;
      const draftId = activeConversationId;
      const messages = ChatEngine.getMessages(draftId);
      const conv = ConversationEngine.promoteDraft(classId, draftId, title, messages);
      setConversations(ConversationEngine.getSortedConversations(classId));
      setActiveConversationId(conv.id);
      setDraftActive(false);
    } else {
      ConversationEngine.updateTitle(selectedClass.id, activeConversationId, title);
      setConversations(ConversationEngine.getSortedConversations(selectedClass.id));
    }
  };

  const handleOpenClass = (cls: Class) => {
    setSelectedClass(cls);
    onNavigate('classes', { openClassId: cls.id });
  };

  const handleGoBack = () => {
    setSelectedClass(null);
    if (onClearClassId) onClearClassId();
    onNavigate('classes');
  };

  // Helper selectors
  const getClassRecordings = (classId: string) => recordings.filter(r => r.classId === classId);
  const activeClasses = classes;

  if (detailedRecording) {
    return (
      <TranscriptReader 
        recording={detailedRecording}
        onBack={() => { setDetailedRecording(null); loadData(); }}
      />
    );
  }

  return (
    <div className={`font-sans text-right relative animate-in fade-in duration-300 ${
      selectedClass 
        ? "h-full w-full flex flex-col min-h-0" 
        : "min-h-[60vh]"
    }`}>
      
      {/* ERROR TOAST */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100/60 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedClass ? (
        
        /* ========================================================
           CLASS WORKSPACE VIEW
           ======================================================== */
        <div className="relative flex flex-col h-full w-full overflow-hidden">
          
          {/* Workspace Header Nav */}
          <div className="relative z-20 shrink-0 bg-white/70 backdrop-blur-md border-b border-slate-100/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between px-3.5 md:px-4 h-14 md:h-16">
              <div className="flex items-center gap-2 min-w-0">
                <button 
                  onClick={handleGoBack}
                  className="w-9 h-9 md:w-10 md:h-10 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-[14px] md:rounded-2xl flex items-center justify-center border border-slate-100/80 hover:border-slate-200/60 cursor-pointer shadow-3xs transition-all duration-200 active:scale-95"
                  title="بازگشت به کلاس‌ها"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-9 h-9 md:w-10 md:h-10 bg-white/80 hover:bg-white text-slate-600 hover:text-indigo-600 rounded-[14px] md:rounded-2xl flex items-center justify-center border border-slate-100/80 hover:border-slate-200/60 cursor-pointer shadow-3xs transition-all duration-200 active:scale-95"
                  title={sidebarOpen ? 'بستن لیست گفتگوها' : 'نمایش لیست گفتگوها'}
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                </button>
              </div>
              
              <h1 className="text-xs md:text-sm font-black text-slate-800 tracking-tight absolute left-1/2 -translate-x-1/2 whitespace-nowrap select-none">
                {selectedClass.name}
              </h1>
              
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative shrink-0 group" data-recordings-dropdown>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowRecordingsDropdown(!showRecordingsDropdown); }}
                    className="w-9 h-9 md:w-10 md:h-10 bg-white/80 hover:bg-white hover:text-indigo-600 text-slate-600 border border-slate-100/80 hover:border-slate-200/60 rounded-[14px] md:rounded-2xl flex items-center justify-center cursor-pointer shadow-3xs transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                    aria-label="رونوشت جلسات"
                  >
                    <FileText className="w-4.5 h-4.5" />
                  </button>
                  {!showRecordingsDropdown && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden md:block opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md z-30">رونوشت جلسات</div>
                  )}
                  <AnimatePresence>
                    {showRecordingsDropdown && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="fixed left-4 right-4 max-w-lg mx-auto top-[72px] md:absolute md:left-0 md:right-auto md:top-full md:mt-2 md:w-96 md:mx-0 md:max-w-none bg-white border border-slate-200/50 rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.15)] z-50 overflow-hidden text-right font-sans"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3.5 py-2.5 border-b border-slate-100/50 bg-slate-50/50 flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              <span>رونوشت جلسات</span>
                            </span>
                            <button onClick={() => { setShowRecordingsDropdown(false); onNavigate('record', { preselectClassId: selectedClass.id }); }} className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black rounded-lg flex items-center gap-1 transition-all shadow-3xs cursor-pointer"><Plus className="w-3 h-3" /> افزودن صوت</button>
                          </div>
                          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100/50 p-1.5">
                            {getClassRecordings(selectedClass.id).length === 0 ? (
                              <div className="text-center py-6 px-4 space-y-2">
                                <div className="w-8 h-8 bg-slate-50 border border-slate-100/80 rounded-xl flex items-center justify-center mx-auto text-slate-350"><FileText className="w-3.5 h-3.5" /></div>
                                <div className="text-[10px] text-slate-500 font-bold">هیچ رونوشتی بارگذاری نشده است.</div>
                                 <p className="text-[9px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">رونوشت جلسات را اضافه کنید تا زیوای پاسخ‌های دقیق‌تری ارائه دهد.</p>
                              </div>
                            ) : (
                              getClassRecordings(selectedClass.id).map((rec) => (
                                <div key={rec.id} className="p-2 hover:bg-slate-50 rounded-xl transition-colors flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-right">
                                      <span className="text-[10px] font-black text-slate-800 block line-clamp-1">{rec.name}</span>
                                      <div className="flex items-center gap-1.5 mt-0.5 text-[8px] text-slate-400 font-bold">
                                        <span>تعداد قطعات: {toPersianDigits(rec.segments?.length || 0)}</span>
                                        <span>•</span>
                                        <span>{toPersianDigits(new Date(rec.createdAt).toLocaleDateString('fa-IR'))}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end gap-2 border-t border-slate-50/50 pt-1 mt-0.5">
                                    <button onClick={() => { setDetailedRecording(rec); setShowRecordingsDropdown(false); }} className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200/40 hover:border-indigo-100/60 text-slate-600 hover:text-indigo-600 text-[9px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer" title="مشاهده رونوشت"><FileText className="w-3 h-3" /> مشاهده رونوشت</button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
        )}
      </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Layout with Sidebar + Chat */}
          <div className="flex-1 min-h-0 flex">
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              isOpen={sidebarOpen}
              isMobile={isMobile}
              newChatDisabled={draftActive}
              onSelect={handleSelectConversation}
              onNewChat={handleNewConversation}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteConversation}
              onClose={() => setSidebarOpen(false)}
            />
            <div className="flex-1 min-h-0 flex flex-col min-w-0">
              <ClassChat 
                key={`${selectedClass.id}-${activeConversationId}-${chatKey}`}
                classId={selectedClass.id} 
                className={selectedClass.name}
                conversationId={activeConversationId || ''}
                onMessagesChange={(msgs) => setHasMessages(msgs.length > 0)}
                onTitleChange={handleConversationTitleChange}
              />
            </div>
          </div>

        </div>

      ) : (

        /* ========================================================
           CLASSES LIST GRID
           ======================================================== */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900">کلاس‌های درسی من</h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                کلاس‌های ترم فعال جاری خود را در این بخش مدیریت کنید.
              </p>
            </div>

            <button
              onClick={() => {
                setError(null);
                setSearchQuery('');
                setExpandedSemesters(new Set([1]));
                setShowCreateModal(true);
              }}
              disabled={activeClasses.length >= 5}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                activeClasses.length >= 5 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>ثبت کلاس جدید</span>
            </button>
          </div>

          {/* S_MAX WARNING */}
          {activeClasses.length >= 5 && (
            <div className="p-4 bg-amber-50 border border-amber-100/60 rounded-2xl flex items-start gap-3 text-amber-800 text-xs font-bold leading-relaxed shadow-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span>سقف مجاز ایجاد کلاس به پایان رسیده است</span>
                <p className="text-[10px] text-amber-700 font-semibold mt-1">
                  شما در حال حاضر ۵ کلاس در سهمیه فعال طرح استاندارد دارید. برای ثبت کلاس جدید، ابتدا باید یکی از کلاس‌های بلااستفاده قبلی خود را برای همیشه حذف کنید.
                </p>
              </div>
            </div>
          )}

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => {
              const classRecs = getClassRecordings(cls.id);
              return (
                <Card 
                  key={cls.id}
                  onClick={() => handleOpenClass(cls)}
                  className="border rounded-3xl p-6 bg-white transition-all flex flex-col justify-between min-h-[165px] group relative cursor-pointer border-slate-100/80 hover:border-indigo-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)]"
                >
                  {/* Overflow Action Menu */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="relative" data-overflow-menu>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === cls.id ? null : cls.id);
                        }}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center justify-center transition-all cursor-pointer"
                        title="مدیریت کلاس"
                        aria-label="مدیریت کلاس"
                      >
                        <MoreVertical className="w-4.5 h-4.5" />
                      </button>

                      <AnimatePresence>
                        {activeDropdownId === cls.id && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 mt-1 w-32 bg-white border border-slate-200/40 rounded-xl shadow-lg z-30 overflow-hidden text-right py-1 font-sans"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(null);
                                  setShowDeleteConfirm(cls);
                                }}
                                className="w-full px-3 py-2 text-[11px] font-black text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors cursor-pointer text-right"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف کلاس</span>
                              </button>
                            </motion.div>
                          </>
        )}
      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 bg-indigo-50 group-hover:bg-indigo-100 border border-indigo-100/50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                        <BookOpen className="w-4.5 h-4.5" />
                      </div>
                      
                      <span className="text-[10px] text-slate-450 font-bold pl-8">
                        {cls.code ? toPersianDigits(cls.code) : 'کد ثبت نشده'}
                      </span>
                    </div>

                    <div className="mt-4 text-right">
                      <h3 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">
                        استاد: {cls.instructor || 'مشخص نشده'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100/50 text-[10px] text-slate-450 font-black">
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-slate-400" />
                      <span>{toPersianDigits(classRecs.length)} ضبط</span>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-600 group-hover:translate-x-[-2px] transition-transform">
                      <span>ورود به کارگاه</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Card>
              );
            })}

            {classes.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white border border-slate-100/80 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
                <div className="w-14 h-14 bg-slate-50 border border-slate-200/40 rounded-2xl flex items-center justify-center mx-auto text-slate-350">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-slate-800">هنوز هیچ کلاسی ثبت نکرده‌اید!</div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                  از دکمه بالای صفحه استفاده کنید تا کلاس‌های تحصیلی نیمسال جاری خود را ثبت کرده و ساختار درختی دستیار هوش مصنوعی خود را پیاده‌سازی نمایید.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
         MODAL: ADD CLASS FROM MD COURSE CATALOG
         ======================================================== */}
      {showCreateModal && createPortal(
          <div key="create-class-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-100/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] text-right font-sans flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-slate-100/50 shrink-0">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>انتخاب درس از برنامه MD</span>
                </h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 text-slate-450 hover:bg-slate-50 border border-slate-100/80 rounded-lg flex items-center justify-center cursor-pointer font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Search Input */}
              <div className="px-6 pt-4 pb-2 shrink-0">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی درس..."
                    className="w-full bg-slate-50 border border-slate-200/40 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-750 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 font-bold transition-all duration-200"
                  />
                </div>
              </div>

              {/* Toggle all button */}
              <div className="px-6 pb-2 shrink-0 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  {courses.length} درس در {coursesBySemester.size} نیمسال
                </span>
                <button
                  onClick={toggleAllSemesters}
                  className="text-[10px] text-indigo-600 font-black hover:text-indigo-800 cursor-pointer"
                >
                  {expandedSemesters.size === filteredSemesters.size ? 'بستن همه' : 'باز کردن همه'}
                </button>
              </div>

              {/* Scrollable Course List */}
              <div className="overflow-y-auto px-6 pb-6 space-y-2 flex-1 min-h-0">
                {filteredSemesters.size === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-bold">
                    هیچ درسی با جستجوی شما مطابقت نداشت.
                  </div>
                ) : (
                  Array.from(filteredSemesters.entries()).sort(([a], [b]) => a - b).map(([sem, courseList]) => {
                    const isOpen = expandedSemesters.has(sem);
                    return (
                      <div key={sem} className="border border-slate-100/80 rounded-2xl overflow-hidden">
                        {/* Semester Header */}
                        <button
                          onClick={() => toggleSemester(sem)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-100/30 transition-colors cursor-pointer text-right"
                        >
                          <span className="text-xs font-black text-slate-700">
                            نیمسال {toPersianDigits(sem)}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Course Items */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {courseList.map(course => {
                                const alreadyAdded = classes.some(c => c.code === course.id);
                                return (
                                  <div
                                    key={course.id}
                                    onClick={() => {
                                      if (!alreadyAdded) handleCreateClass(course);
                                    }}
                                    className={`
                                      flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-t border-slate-100/50 first:border-t-0
                                      ${alreadyAdded 
                                        ? 'bg-slate-50/50 text-slate-400 cursor-not-allowed' 
                                        : 'hover:bg-indigo-50/30 text-slate-800'
                                      }
                                    `}
                                  >
                                    <span className={`text-xs font-bold ${alreadyAdded ? '' : 'font-black'}`}>
                                      {course.name}
                                    </span>
                                    {alreadyAdded ? (
                                      <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded font-bold shrink-0">
                                        ثبت شده
                                      </span>
                                    ) : (
                                      <div className="w-5 h-5 border border-slate-300 bg-slate-50 rounded flex items-center justify-center shrink-0">
                                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}

                {/* Loading overlay */}
                {isSubmitLoading && (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <span className="text-[10px] text-slate-400 font-bold block mt-2">در حال ثبت...</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100/50 shrink-0 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  {classes.length} از ۵ کلاس فعال
                </span>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-100/80 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-3xs"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        , document.body)}


      {/* ========================================================
         MODAL: DELETE CONFIRMATION
         ======================================================== */}
      {showDeleteConfirm && createPortal(
          <div key="delete-class-modal" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4" onClick={() => setShowDeleteConfirm(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-rose-100/60 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-6 space-y-5 text-right font-sans"
            >
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm border-b border-rose-50 pb-3">
                <AlertTriangle className="w-5 h-5" />
                <span>هشدار: حذف دائمی و قطعی کلاس درسی</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  آیا واقعا مایل به حذف کامل کلاس <span className="text-indigo-600 font-black">«{showDeleteConfirm.name}»</span> هستید؟
                </p>
                
                <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 text-[10px] text-rose-800 leading-relaxed font-semibold space-y-1 shadow-3xs">
                  <div>⚠️ این عملیات به هیچ عنوان قابل بازگشت نیست!</div>
                  <p>
                    با تایید نهایی، تمام اطلاعات مرتبط شامل فایل‌های صوتی بارگذاری شده، خلاصه رونوشت‌ها، حافظه چت‌های صوتی، اطلاعات نمایه‌سازی شده و اطلاعات جانبی مرتبط در سرورهای مرکزی برای همیشه پاک خواهند شد.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-slate-100/80 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer shadow-3xs"
                >
                  انصراف
                </button>
                <Button
                  onClick={() => handleDeleteClass(showDeleteConfirm.id)}
                  isLoading={isSubmitLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer"
                >
                  حذف قطعی و دائمی
                </Button>
              </div>
            </motion.div>
          </div>
        , document.body)}

      {/* ========================================================
         MODAL: DELETE CONVERSATION CONFIRMATION
         ======================================================== */}
      {showDeleteConvConfirm && createPortal(
          <div key="delete-conversation-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowDeleteConvConfirm(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-rose-100/60 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.12)] p-6 space-y-5 text-right font-sans"
            >
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm border-b border-rose-50 pb-3">
                <Trash2 className="w-5 h-5" />
                <span>حذف گفتگو</span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed font-bold">آیا از حذف گفتگوی زیر اطمینان دارید؟</p>
                <div className="bg-slate-50 border border-slate-100/80 rounded-2xl px-4 py-3">
                  <p className="text-sm font-black text-slate-800 text-center">
                    {conversations.find(c => c.id === showDeleteConvConfirm)?.title || 'گفتگو'}
                  </p>
                </div>
                <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 text-[10px] text-rose-800 leading-relaxed font-semibold shadow-3xs">
                  این عملیات قابل بازگشت نیست. گفتگو برای همیشه حذف خواهد شد.
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100/50 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowDeleteConvConfirm(null)} className="px-4 py-2 border border-slate-100/80 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer shadow-3xs">انصراف</button>
                <button onClick={confirmDeleteConversation} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer transition-colors">حذف گفتگو</button>
              </div>
            </motion.div>
          </div>
        , document.body)}



    </div>
  );
};