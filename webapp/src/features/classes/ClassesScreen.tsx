/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Trash2, 
  Plus, 
  Mic, 
  Play, 
  Activity, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  AlertTriangle,
  FolderOpen,
  User as UserIcon,
  RotateCw,
  Search,
  Tag,
  FileText,
  X,
  MoreVertical,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ClassService, RecordingService, SubscriptionService, ChatService } from '../../services/api';
import { Class, Recording, SubscriptionStatus } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { ClassChat } from './ClassChat';
import { TranscriptViewer } from '../../components/TranscriptViewer';
import { RecordingDetailsScreen } from './RecordingDetailsScreen';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ClassesScreenProps {
  onNavigate: (tab: string, arg?: any) => void;
  openClassId?: string | null;
  onClearClassId?: () => void;
  onPlayRecording: (recording: Recording) => void;
  shouldOpenCreateModal?: boolean;
  onCloseCreateModal?: () => void;
}

export const ClassesScreen: React.FC<ClassesScreenProps> = ({ 
  onNavigate, 
  openClassId, 
  onClearClassId,
  onPlayRecording,
  shouldOpenCreateModal,
  onCloseCreateModal
}) => {
  const { subscriptionStatus, syncSubscription } = useAuthStore();
  const [classes, setClasses] = useState<Class[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals / Dialogs State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Class | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [transcriptRecording, setTranscriptRecording] = useState<Recording | null>(null);
  const [detailedRecording, setDetailedRecording] = useState<Recording | null>(null);
  const [showRecordingsDropdown, setShowRecordingsDropdown] = useState(false);
  
  // Chat Conversation State
  const [chatKey, setChatKey] = useState(0);
  const [hasMessages, setHasMessages] = useState(false);
  const [showResetChatConfirm, setShowResetChatConfirm] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  
  // Create Class Form State
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [instructor, setInstructor] = useState('');
  const [classCode, setClassCode] = useState('');

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

  const loadData = async () => {
    setIsLoading(true);
    try {
      await syncSubscription();
      const [fetchedClasses, fetchedRecordings, fetchedTemplates] = await Promise.all([
        ClassService.getClasses(),
        RecordingService.getRecordings(),
        ClassService.getAvailableTemplates()
      ]);
      setClasses(fetchedClasses);
      setRecordings(fetchedRecordings);
      setTemplates(fetchedTemplates);

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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setShowRecordingsDropdown(false);
  }, [openClassId]);

  useEffect(() => {
    setShowRecordingsDropdown(false);
  }, [selectedClass]);

  // Hook for layout triggers
  useEffect(() => {
    if (shouldOpenCreateModal) {
      setError(null);
      setSelectedTemplate('');
      setInstructor('');
      setClassCode('');
      setShowCreateModal(true);
      if (onCloseCreateModal) {
        onCloseCreateModal();
      }
    }
  }, [shouldOpenCreateModal, onCloseCreateModal]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setIsSubmitLoading(true);
    setError(null);

    try {
      await ClassService.createClass(selectedTemplate, instructor, classCode);
      setShowCreateModal(false);
      setSelectedTemplate('');
      setInstructor('');
      setClassCode('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت کلاس جدید');
    } finally {
      setIsSubmitLoading(false);
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

  const handleResetConversation = async () => {
    if (!selectedClass) return;
    setIsResetLoading(true);
    try {
      await ChatService.deleteConversation(selectedClass.id);
      setChatKey(prev => prev + 1);
      setHasMessages(false);
      setShowResetChatConfirm(false);
      await syncSubscription();
    } catch (err: any) {
      setError(err.message || 'خطا در پاک‌سازی گفتگو');
    } finally {
      setIsResetLoading(false);
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
      <RecordingDetailsScreen 
        recording={detailedRecording}
        onBack={() => { setDetailedRecording(null); loadData(); }}
        onNavigate={onNavigate}
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

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-5.5 w-32 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-10 w-36 bg-slate-150 animate-pulse rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-slate-100/80 rounded-3xl p-6 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[165px]">
                <div>
                  <div className="flex items-center justify-between">
                    {/* Icon on right */}
                    <div className="w-9 h-9 bg-slate-100 animate-pulse rounded-xl shrink-0" />
                    {/* Status / Tag on left */}
                    <div className="h-4 w-16 bg-slate-50 border border-slate-100/80 animate-pulse rounded-md" />
                  </div>
                  {/* Title and Code */}
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-32 bg-slate-200 animate-pulse rounded-md" />
                    <div className="h-3 w-16 bg-slate-100 animate-pulse rounded-md" />
                  </div>
                </div>
                {/* Footer details */}
                <div className="border-t border-slate-50 pt-3.5 flex items-center justify-between">
                  <div className="h-3.5 w-16 bg-slate-100 animate-pulse rounded-md" />
                  <div className="h-3.5 w-12 bg-slate-100 animate-pulse rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : selectedClass ? (
        
        /* ========================================================
           CLASS WORKSPACE VIEW
           ======================================================== */
        <div className="relative flex flex-col h-full w-full overflow-hidden">
          
          {/* Workspace Header Nav - Premium Floating Glass Aesthetic */}
          <div className="absolute top-2 left-2 right-2 md:top-3 md:left-4 md:right-4 z-20 flex items-center justify-between bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_32px_rgba(15,23,42,0.06)] rounded-[20px] md:rounded-[26px] px-3.5 py-2.5 shrink-0 select-none transition-all duration-300">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <button 
                  onClick={handleGoBack}
                  className="w-9 h-9 md:w-10 md:h-10 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-[14px] md:rounded-2xl flex items-center justify-center border border-slate-100/80 hover:border-slate-200/60 cursor-pointer shadow-3xs transition-all duration-200 active:scale-95"
                  title="بازگشت به کلاس‌ها"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <h1 className="text-xs md:text-sm font-black text-slate-800 tracking-tight line-clamp-1 max-w-[140px] xs:max-w-xs sm:max-w-none">{selectedClass.name}</h1>
              </div>
              
              {/* Utility action buttons grouped neatly on the left */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Recordings Dropdown */}
                <div className="relative shrink-0 group" data-recordings-dropdown>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRecordingsDropdown(!showRecordingsDropdown);
                    }}
                    className="w-9 h-9 md:w-10 md:h-10 bg-white/80 hover:bg-white hover:text-indigo-600 text-slate-600 border border-slate-100/80 hover:border-slate-200/60 rounded-[14px] md:rounded-2xl flex items-center justify-center cursor-pointer shadow-3xs transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                    aria-label="جلسات ضبط شده"
                  >
                    <Headphones className="w-4.5 h-4.5" />
                  </button>

                  {/* Tooltip */}
                  {!showRecordingsDropdown && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden md:block opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md z-30">
                      جلسات ضبط شده
                    </div>
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
                          {/* Dropdown Header */}
                          <div className="px-3.5 py-2.5 border-b border-slate-100/50 bg-slate-50/50 flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                              <span>فایل‌های صوتی ضبط شده</span>
                            </span>
                            <button 
                              onClick={() => {
                                setShowRecordingsDropdown(false);
                                onNavigate('record', { preselectClassId: selectedClass.id });
                              }}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black rounded-lg flex items-center gap-1 transition-all shadow-3xs cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>افزودن صوت</span>
                            </button>
                          </div>

                          {/* Dropdown List */}
                          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100/50 p-1.5">
                            {getClassRecordings(selectedClass.id).length === 0 ? (
                              <div className="text-center py-6 px-4 space-y-2">
                                <div className="w-8 h-8 bg-slate-50 border border-slate-100/80 rounded-xl flex items-center justify-center mx-auto text-slate-350">
                                  <Mic className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-[10px] text-slate-500 font-bold">هیچ فایل صوتی بارگذاری نشده است.</div>
                                <p className="text-[9px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                                  جلسات درسی ضبط شده را اضافه کنید تا RAYA پاسخ‌های دقیق‌تری ارائه دهد.
                                </p>
                              </div>
                            ) : (
                              getClassRecordings(selectedClass.id).map((rec) => (
                                <div key={rec.id} className="p-2 hover:bg-slate-50 rounded-xl transition-colors flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          onPlayRecording(rec);
                                          setShowRecordingsDropdown(false);
                                        }}
                                        className="w-7 h-7 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/60 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer group"
                                        title="پخش صوت"
                                      >
                                        <Play className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                      </button>
                                      <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-800 block line-clamp-1">{rec.name}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[8px] text-slate-400 font-bold">
                                          <span>مدت: {toPersianDigits(Math.floor(rec.duration / 60))}:{toPersianDigits(String(rec.duration % 60).padStart(2, '0'))}</span>
                                          <span>•</span>
                                          <span>حجم: {toPersianDigits((rec.size / (1024 * 1024)).toFixed(1))} مگابایت</span>
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                                      {toPersianDigits(new Date(rec.createdAt).toLocaleDateString('fa-IR'))}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 border-t border-slate-50/50 pt-1 mt-0.5">
                                    <span className="text-[8px] text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-1 py-0.5 rounded font-bold">
                                      آماده تحلیل
                                    </span>
                                    <button
                                      onClick={() => {
                                        setDetailedRecording(rec);
                                        setShowRecordingsDropdown(false);
                                      }}
                                      className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200/40 hover:border-indigo-100/60 text-slate-600 hover:text-indigo-600 text-[9px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                      title="مشاهده رونوشت و جستجو در متن"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>رونوشت و تحلیل</span>
                                    </button>
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

                {/* Reset Chat Button */}
                <div className="relative group">
                  <button
                    onClick={() => setShowResetChatConfirm(true)}
                    disabled={!hasMessages}
                    className="w-9 h-9 md:w-10 md:h-10 bg-white/80 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-100/80 hover:border-rose-100/60 rounded-[14px] md:rounded-2xl flex items-center justify-center cursor-pointer shadow-3xs transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:text-slate-400 disabled:border-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20"
                    aria-label="پاک‌سازی گفتگو"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden md:block opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md z-30">
                    پاک‌سازی گفتگو
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Layout - Full Height Container with Conversation */}
          <div className="flex-1 min-h-0 flex flex-col">
            <ClassChat 
              key={`${selectedClass.id}-${chatKey}`}
              classId={selectedClass.id} 
              className={selectedClass.name}
              onMessagesChange={(msgs) => setHasMessages(msgs.length > 0)}
            />
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
                setSelectedTemplate('');
                setInstructor('');
                setClassCode('');
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
                <div className="w-14 h-14 bg-slate-50 border border-slate-200/40 rounded-2xl flex items-center justify-center mx-auto text-slate-350 animate-pulse">
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
         MODAL: CREATE CLASS
         ======================================================== */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100/80 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-6 space-y-5 text-right font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>ثبت کلاس درسی جدید</span>
                </h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 text-slate-450 hover:bg-slate-50 border border-slate-100/80 rounded-lg flex items-center justify-center cursor-pointer font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                
                {/* Available Classes Template Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 block">انتخاب عنوان درس (لیست مجاز دانشگاه)</label>
                  <div className="relative">
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      required
className="w-full bg-white border border-slate-200/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-750 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 font-bold cursor-pointer transition-all duration-200"
                      >
                        <option value="">-- لطفا یک عنوان درس را انتخاب کنید --</option>
                        {templates.map((temp) => (
                          <option key={temp} value={temp}>{temp}</option>
                        ))}
                      </select>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-bold leading-normal">
                    * جهت انطباق علمی در سرورهای مرکزی، عنوان کلاس باید از قالب سرفصل‌های دانشگاه انتخاب شود.
                  </span>
                </div>

                {/* Instructor Name Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 block">نام استاد مدرس (اختیاری)</label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="مثال: دکتر علوی"
className="w-full bg-white border border-slate-200/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-750 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 font-bold transition-all duration-200"
                    />
                </div>

                {/* Class Code Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 block">کد یا شماره کلاس (اختیاری)</label>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="مثال: math-101"
                    className="w-full bg-white border border-slate-200/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-750 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 font-mono text-left font-bold transition-all duration-200"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100/50 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-100/80 hover:border-slate-200/60 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-3xs"
                  >
                    انصراف
                  </button>
                  <Button
                    type="submit"
                    disabled={isSubmitLoading || !selectedTemplate}
                    isLoading={isSubmitLoading}
                    className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    تایید و ثبت نهایی
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ========================================================
         MODAL: DELETE CONFIRMATION
         ======================================================== */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-rose-100/60 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-6 space-y-5 text-right font-sans"
            >
              <div className="flex items-center gap-2 text-rose-650 font-black text-sm border-b border-rose-50 pb-3">
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
                    با تایید نهایی، تمام اطلاعات مرتبط شامل فایل‌های صوتی بارگذاری شده، خلاصه رونوشت‌ها، حافظه چت‌های صوتی، ایندکس‌های ChromaDB و اطلاعات جانبی مرتبط در سرورهای مرکزی برای همیشه پاک خواهند شد.
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
        )}
      </AnimatePresence>

      {/* ========================================================
         MODAL: RESET CHAT CONFIRMATION
         ======================================================== */}
      <AnimatePresence>
        {showResetChatConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-rose-100/60 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-6 space-y-5 text-right font-sans"
            >
              <div className="flex items-center gap-2 text-rose-650 font-black text-sm border-b border-rose-50 pb-3">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <span>شروع مجدد گفتگو؟</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  آیا مایل به شروع مجدد و پاک‌سازی کامل گفتگوی این کلاس درسی هستید؟
                </p>
                
                <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 text-[10px] text-rose-800 leading-relaxed font-semibold shadow-3xs">
                  با این کار تمام پیام‌های گفتگوی این کلاس برای همیشه حذف خواهند شد. اطلاعات کلاس، جلسات ضبط شده و سایر داده‌های شما بدون تغییر باقی می‌مانند.
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetChatConfirm(false)}
                  className="px-4 py-2 border border-slate-100/80 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer shadow-3xs"
                >
                  انصراف
                </button>
                <Button
                  onClick={handleResetConversation}
                  isLoading={isResetLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer"
                >
                  شروع مجدد گفتگو
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
         MODAL: TRANSCRIPT AND ANALYSIS VIEW
         ======================================================== */}
      <AnimatePresence>
        {transcriptRecording && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border border-slate-100/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-6 space-y-4 text-right font-sans relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{transcriptRecording.name}</h3>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">مشاهده رونوشت، همگام‌سازی صوت و ارجاعات هوش مصنوعی</span>
                  </div>
                </div>
                <button 
                  onClick={() => setTranscriptRecording(null)} 
                  className="w-8 h-8 text-slate-450 hover:bg-slate-50 hover:text-slate-800 border border-slate-100/80 hover:border-slate-200/60 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Embed the TranscriptViewer component */}
              <TranscriptViewer recording={transcriptRecording} />

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => setTranscriptRecording(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  بستن پنجره رونوشت
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};