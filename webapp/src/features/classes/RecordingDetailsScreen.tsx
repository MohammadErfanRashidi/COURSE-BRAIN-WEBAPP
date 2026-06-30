/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileText, 
  Clock, 
  Trash2, 
  Edit3, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  MessageSquare, 
  BarChart2, 
  Bookmark, 
  BookMarked,
  Share2,
  Minimize2,
  Maximize2,
  Info,
  ArrowRight,
  Search,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/Card';
import { Recording, TranscriptSegment } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { RecordingService, ChatService } from '../../services/api';
import { BookmarkService } from '../../services/bookmarks';

interface RecordingDetailsScreenProps {
  recording: Recording;
  onBack: () => void;
  onNavigate: (tab: string, args?: any) => void;
}

export const RecordingDetailsScreen: React.FC<RecordingDetailsScreenProps> = ({ 
  recording: initialRecording, 
  onBack,
  onNavigate
}) => {
  const [recording, setRecording] = useState<Recording>(initialRecording);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'transcript' | 'summary' | 'chat' | 'stats'>('transcript');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(recording.name);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Bookmarks State
  const [isLectureBookmarked, setIsLectureBookmarked] = useState(false);
  const [bookmarkedSegments, setBookmarkedSegments] = useState<Record<number, boolean>>({});

  // Study Mode Toggle (Point 11)
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [fontSizeClass, setFontSizeClass] = useState<'text-xs' | 'text-sm' | 'text-base'>('text-xs');

  const { activeRecording, isPlaying, currentTime, play, triggerSeek } = usePlayerStore();
  const transcriptActiveRef = useRef<HTMLDivElement | null>(null);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${toPersianDigits(mins)} دقیقه و ${toPersianDigits(remainingSecs)} ثانیه`;
  };

  const formatShortTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Sync bookmark state on load
  const syncBookmarkStates = () => {
    setIsLectureBookmarked(BookmarkService.isBookmarked('lecture', 'lectureId', recording.id));
    
    // Check which segments are bookmarked
    const segmentMap: Record<number, boolean> = {};
    if (recording.segments) {
      recording.segments.forEach((_, idx) => {
        segmentMap[idx] = BookmarkService.isBookmarked('transcript', 'segmentIndex', idx) && 
                          BookmarkService.isBookmarked('transcript', 'lectureId', recording.id);
      });
    }
    setBookmarkedSegments(segmentMap);
  };

  useEffect(() => {
    syncBookmarkStates();
  }, [recording]);

  const handleToggleLectureBookmark = () => {
    if (isLectureBookmarked) {
      BookmarkService.removeBookmarkByMetadata('lecture', 'lectureId', recording.id);
      setIsLectureBookmarked(false);
    } else {
      BookmarkService.addBookmark({
        type: 'lecture',
        title: recording.name,
        description: `کلاس ${recording.className} • مدت زمان ${formatDuration(recording.duration)}`,
        classId: recording.classId,
        className: recording.className,
        metadata: {
          lectureId: recording.id,
          lectureName: recording.name
        }
      });
      setIsLectureBookmarked(true);
    }
  };

  const handleToggleSegmentBookmark = (seg: TranscriptSegment, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isBookmarked = bookmarkedSegments[idx];

    if (isBookmarked) {
      // Remove
      const bookmarks = BookmarkService.getBookmarks();
      const match = bookmarks.find(b => b.type === 'transcript' && 
                                        b.metadata.lectureId === recording.id && 
                                        b.metadata.segmentIndex === idx);
      if (match) {
        BookmarkService.removeBookmark(match.id);
      }
      setBookmarkedSegments(prev => ({ ...prev, [idx]: false }));
    } else {
      // Add
      BookmarkService.addBookmark({
        type: 'transcript',
        title: `نکته کلاسی در ${toPersianDigits(formatShortTime(seg.start))} از درس ${recording.name}`,
        description: seg.text,
        classId: recording.classId,
        className: recording.className,
        metadata: {
          lectureId: recording.id,
          lectureName: recording.name,
          segmentIndex: idx,
          timestamp: seg.start,
          timestampText: formatShortTime(seg.start)
        }
      });
      setBookmarkedSegments(prev => ({ ...prev, [idx]: true }));
    }
  };

  const isCurrentlyPlayingThis = activeRecording?.id === recording.id;

  // Find the currently active segment based on player's current time
  const activeSegmentIdx = useMemo(() => {
    if (!isCurrentlyPlayingThis || !recording.segments) return -1;
    return recording.segments.findIndex(
      seg => currentTime >= seg.start && currentTime <= seg.end
    );
  }, [isCurrentlyPlayingThis, recording.segments, currentTime]);

  // Auto scroll transcript to active segment
  useEffect(() => {
    if (activeSegmentIdx !== -1 && transcriptActiveRef.current) {
      transcriptActiveRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeSegmentIdx]);

  const handleSegmentClick = (start: number) => {
    if (!isCurrentlyPlayingThis) {
      play(recording);
    }
    triggerSeek(start);
  };

  // Copy full transcript
  const handleCopyTranscript = () => {
    const textToCopy = recording.segments
      ? recording.segments.map(s => `[${formatShortTime(s.start)}] ${s.speaker || 'استاد'}: ${s.text}`).join('\n')
      : recording.transcript || '';
      
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Download transcript as file
  const handleDownloadTranscript = () => {
    const textToCopy = recording.segments
      ? recording.segments.map(s => `[${formatShortTime(s.start)}] ${s.speaker || 'استاد'}: ${s.text}`).join('\n')
      : recording.transcript || '';

    const element = document.createElement("a");
    const file = new Blob([textToCopy], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `رونوشت_${recording.name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getRecordingsKey = (): string => {
    try {
      const raw = localStorage.getItem('cb_user_data');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.id) return `cb_simulated_recordings_${u.id}`;
      }
    } catch {}
    return 'cb_simulated_recordings_preauth';
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const updated = await RecordingService.renameRecording(recording.id, newName.trim());
      if (updated) {
        setRecording(updated);
      } else {
        // Mock fallback
        const mockUpdated = { ...recording, name: newName.trim() };
        setRecording(mockUpdated);
        // update list in localstorage
        const cached = localStorage.getItem(getRecordingsKey());
        if (cached) {
          const parsed = JSON.parse(cached) as Recording[];
          const idx = parsed.findIndex(r => r.id === recording.id);
          if (idx !== -1) {
            parsed[idx].name = newName.trim();
            localStorage.setItem(getRecordingsKey(), JSON.stringify(parsed));
          }
        }
      }
      setIsRenameOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await RecordingService.deleteRecording(recording.id);
      setIsDeleteOpen(false);
      onBack();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter segments based on query
  const filteredSegments = useMemo(() => {
    const segments = recording.segments || [];
    if (!transcriptSearch.trim()) return segments;
    return segments.filter(seg => 
      seg.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
      (seg.speaker && seg.speaker.toLowerCase().includes(transcriptSearch.toLowerCase()))
    );
  }, [recording.segments, transcriptSearch]);

  // Collapsible summary details (Point 10)
  const aiSummaryData = useMemo(() => {
    const isMath = recording.name.includes('ریاضی') || recording.name.includes('حد') || recording.name.includes('پیوستگی');
    
    if (isMath) {
      return {
        concepts: [
          { title: 'تعریف حدی تابع', text: 'حد توصیف‌کننده رفتار تابع در نزدیکی یک نقطه مرزی است، بدون اینکه بر روی مقدار دقیق تابع در آن نقطه تمرکز داشته باشد.' },
          { title: 'برابری حدهای یک‌طرفه', text: 'یک تابع در نقطه c دارای حد حقیقی است اگر و تنها اگر حد چپ و حد راست آن تابع در نقطه c هر دو موجود و کاملاً با هم برابر باشند.' },
          { title: 'شروط پیوستگی پیوسته', text: 'تابع در یک نقطه پیوسته است اگر تعریف شده باشد، حد داشته باشد و مقدار حد آن با تعریف تابع در آن نقطه مساوی باشد.' }
        ],
        definitions: [
          { term: 'حد راست (Right Hand Limit)', formula: '\\lim_{x \\to c^+} f(x) = L', desc: 'حرکت به سمت نقطه c از مقادیر بزرگتر از c (سمت راست)' },
          { term: 'حد چپ (Left Hand Limit)', formula: '\\lim_{x \\to c^-} f(x) = L', desc: 'حرکت به سمت نقطه c از مقادیر کوچکتر از c (سمت چپ)' },
          { term: 'پیوستگی (Continuity)', formula: '\\lim_{x \\to c} f(x) = f(c)', desc: 'عدم وجود شکاف، جهش یا نقطه انفصال در نمودار تابع' }
        ],
        importantPoints: [
          'استاد تأکید کرد که در صورت مبهم بودن حد (مانند ابهام صفر بر روی صفر ۰/۰)، ابتدا باید با تجزیه عبارت یا استفاده از قوانین هۆپیتال، عامل ابهام را حذف کنیم.',
          'امتحان پایان‌ترم شامل حداقل یک سوال تشریحی ۴ نمره‌ای در خصوص اثبات پیوستگی توابع تکه‌ای خواهد بود.',
          'در نقاط انفصال مجانبی (مجانب قائم)، تابع حد بی‌نهایت پیدا کرده و هرگز پیوسته نخواهد بود.'
        ],
        studyTips: [
          '💡 همیشه مخرج کسر را بررسی کنید؛ هر نقطه‌ای که مخرج کسر را صفر کند اما صورت را صفر نکند، نقطه مجانب قائم است.',
          '💡 نمودارهای توابع پرکاربرد مثل سینوس، قدرمطلق و کسرها را در ذهن داشته باشید تا بصری پیوستگی را حدس بزنید.',
          '💡 تمرین شماره ۱۲ و ۱۵ کتاب دیفرانسیل توماس منبع سوال کوئیز هفته آینده است.'
        ],
        quickReview: 'اگر حد چپ تابعی در نقطه c برابر ۵ و حد راست آن برابر ۵.۱ باشد، این تابع در نقطه c دارای انفصال جهشی است و حد کل ندارد.'
      };
    }

    // Default academic lecture summary fallback
    return {
      concepts: [
        { title: 'موضوع کلی درس', text: 'معرفی مبانی سرفصل‌های دانشگاهی، اهمیت حضور فعال در جلسات و توزیع درصدی بارم نمرات امتحانات نهایی.' },
        { title: 'رویکرد تحلیلی کلاس', text: 'تمرکز بر یادگیری عمیق مفاهیم علمی به‌جای حفظ فرمول‌ها، همراه با شبیه‌سازی تمارین کلاسی.' },
        { title: 'روش‌های ارزیابی ترم', text: 'تقسیم‌بندی نمرات به آزمون نهایی (۷۰ درصد)، کوئیزهای کلاسی (۲۰ درصد) و حضور مستمر صوتی (۱۰ درصد).' }
      ],
      definitions: [
        { term: 'نمره مستمر', formula: '۲۰٪ نمره کل', desc: 'تخصیص نمرات به فعالیت کلاسی و کوئیزهای ناگهانی در شروع جلسات صوتی' },
        { term: 'مرجع علمی اصلی', formula: 'کتاب مرجع معرفی شده', desc: 'منبع طرح سوالات پایان‌ترم و تکالیف پیشرفته هفتگی کلاس' }
      ],
      importantPoints: [
        'تمام کوئیزهای کلاسی به صورت تستی و با مدت زمان کوتاه طراحی می‌شوند.',
        'تمرین‌های آخر فصل کتاب مرجع، پایه‌گذار اصلی سوالات تشریحی آزمون‌های مستمر خواهند بود.',
        'غیبت بیش از ۳ جلسه، دانشجو را در معرض حذف محرومیت کلاسی قرار می‌دهد.'
      ],
      studyTips: [
        '💡 یادداشت‌برداری در زمان ضبط کلاس به شدت بازدهی رونوشت هوشمند رایا را افزایش می‌دهد.',
        '💡 مرور فایل خلاصه ده دقیقه قبل از شروع کوئیز، شانس پاسخ صحیح را تا ۸۰٪ ارتقا می‌بخشد.',
        '💡 از چت موضوعی همین جلسه برای حل سوالات تمارین پایانی کمک بگیرید.'
      ],
      quickReview: 'با گوش سپردن روزانه به رونوشت جلسات صوتی و ادغام کتاب مرجع، آمادگی شب امتحان خود را کامل کنید.'
    };
  }, [recording]);

  return (
    <div className={`font-sans text-right relative space-y-6 ${isStudyMode ? 'bg-slate-50/70 p-6 md:p-12 rounded-3xl min-h-[90vh]' : ''}`}>
      
      {/* 1. STUDY MODE / DISTRACTION-FREE NAVBAR (Point 11) */}
      {isStudyMode && (
        <div className="flex items-center justify-between border-b border-slate-100/50 pb-4 mb-4 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-slate-800">حالت مطالعه بدون حواس‌پرتی فعال است</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Font Sizer */}
            <div className="flex items-center border border-slate-100/80 bg-white/85 rounded-xl p-0.5 text-[10px] font-bold shadow-xs">
              <button 
                onClick={() => setFontSizeClass('text-xs')}
                className={`px-2 py-1 rounded-lg ${fontSizeClass === 'text-xs' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}
              >
                کوچک
              </button>
              <button 
                onClick={() => setFontSizeClass('text-sm')}
                className={`px-2 py-1 rounded-lg ${fontSizeClass === 'text-sm' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}
              >
                متوسط
              </button>
              <button 
                onClick={() => setFontSizeClass('text-base')}
                className={`px-2 py-1 rounded-lg ${fontSizeClass === 'text-base' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}
              >
                بزرگ
              </button>
            </div>

            <button
              onClick={() => setIsStudyMode(false)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-sm"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>خروج از حالت مطالعه</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. STANDARD DETAIL HEADER (Hidden in strict Study Mode) */}
      {!isStudyMode && (
        <div className="space-y-4">
          {/* Back button row */}
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به فضای کارگاه کلاس</span>
            </button>

            <button
              onClick={() => setIsStudyMode(true)}
              className="px-3 py-1.5 bg-white border border-slate-100/80 hover:border-slate-200/60 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-600 hover:text-slate-800 transition-all cursor-pointer shadow-xs"
            >
              <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>حالت مطالعه (بدون حواس‌پرتی)</span>
            </button>
          </div>

          {/* Title Card */}
          <Card className="p-6 bg-white border border-slate-100/80 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-50 border border-indigo-100/60 text-indigo-600 font-black px-2.5 py-0.5 rounded-lg">
                  کلاس {recording.className}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-lg">
                  رونوشت نهایی
                </span>
              </div>
              
              <h1 className="text-lg font-black text-slate-900 leading-snug">
                {recording.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3.5 text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-350" />
                  <span>مدت زمان: {formatDuration(recording.duration)}</span>
                </span>
                <span>•</span>
                <span>اندازه: {toPersianDigits((recording.size / (1024 * 1024)).toFixed(1))} مگابایت</span>
                <span>•</span>
                <span>تاریخ بارگذاری: {toPersianDigits(new Date(recording.createdAt).toLocaleDateString('fa-IR'))}</span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Bookmark Lecture */}
              <button
                onClick={handleToggleLectureBookmark}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                  isLectureBookmarked 
                    ? 'bg-amber-50 border-amber-250 text-amber-600 shadow-xs' 
                    : 'bg-white border-slate-100/80 text-slate-400 hover:text-slate-600 hover:border-slate-200/60'
                }`}
                title="نشان کردن کامل این جلسه"
              >
                <Bookmark className={`w-4 h-4 ${isLectureBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setIsRenameOpen(true)}
                className="px-3.5 py-2 bg-white border border-slate-100/80 hover:border-slate-200/60 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4 text-slate-400" />
                <span>ویرایش نام</span>
              </button>

              <button
                onClick={() => setIsDeleteOpen(true)}
                className="px-3.5 py-2 bg-rose-50 border border-rose-100/60 hover:border-rose-250 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-rose-100 transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>حذف فایل</span>
              </button>

            </div>

          </Card>
        </div>
      )}

      {/* 3. CORE WORKSPACE WORKBENCH LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Workspace Nav Sidebar (Horizontal on Mobile, Vertical on Desktop - Hidden in Study Mode to focus strictly on text) */}
        {!isStudyMode && (
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-black text-slate-400 block px-1">میز کار تحلیل علمی</h3>
            
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 p-1 font-bold text-xs">
              <button
                onClick={() => setActiveWorkspaceTab('transcript')}
                className={`w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between cursor-pointer whitespace-nowrap shrink-0 ${
                  activeWorkspaceTab === 'transcript'
                    ? 'bg-indigo-600 text-white shadow-3xs font-black'
                    : 'bg-white border border-slate-200/50 text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>رونوشت کامل تدریس</span>
                </div>
                {activeWorkspaceTab === 'transcript' && <ChevronRight className="w-4 h-4 hidden lg:block rotate-180" />}
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('summary')}
                className={`w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between cursor-pointer whitespace-nowrap shrink-0 ${
                  activeWorkspaceTab === 'summary'
                    ? 'bg-indigo-600 text-white shadow-3xs font-black'
                    : 'bg-white border border-slate-200/50 text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>خلاصه علمی هوشمند</span>
                </div>
                {activeWorkspaceTab === 'summary' && <ChevronRight className="w-4 h-4 hidden lg:block rotate-180" />}
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('chat')}
                className={`w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between cursor-pointer whitespace-nowrap shrink-0 ${
                  activeWorkspaceTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-3xs font-black'
                    : 'bg-white border border-slate-200/50 text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>پرسش‌وپاسخ موضوعی</span>
                </div>
                {activeWorkspaceTab === 'chat' && <ChevronRight className="w-4 h-4 hidden lg:block rotate-180" />}
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('stats')}
                className={`w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between cursor-pointer whitespace-nowrap shrink-0 ${
                  activeWorkspaceTab === 'stats'
                    ? 'bg-indigo-600 text-white shadow-3xs font-black'
                    : 'bg-white border border-slate-200/50 text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  <span>آمار و فرکانس گفتار</span>
                </div>
                {activeWorkspaceTab === 'stats' && <ChevronRight className="w-4 h-4 hidden lg:block rotate-180" />}
              </button>
            </nav>
            
            {/* Audio player reminder card */}
            <Card className="bg-slate-50/50 border border-slate-100/80 p-4 rounded-2xl space-y-2 select-none shadow-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-black text-slate-800">پلیر یکپارچه صوتی</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
                کلیک روی زمان قطعات در متن رونوشت، فایل صوتی را در همان لحظه در پلیر شناور پایین صفحه پخش می‌کند.
              </p>
            </Card>
          </div>
        )}

        {/* Workspace Display Area (Takes full width in study mode or 3 cols in standard workspace) */}
        <div className={isStudyMode || activeWorkspaceTab === 'summary' ? 'lg:col-span-4' : 'lg:col-span-3'}>
          <div className="bg-white rounded-3xl border border-slate-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] min-h-[500px] flex flex-col overflow-hidden">
            
            {/* TAB PANEL 1: TRANSCRIPT (Supercharged, Point 2) */}
            {(activeWorkspaceTab === 'transcript' || isStudyMode) && (
              <div className="flex-1 flex flex-col h-full">
                {/* Panel Toolbar */}
                <div className="p-4 bg-slate-50/60 border-b border-slate-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 select-none">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-black text-slate-800">رونوشت کامل و تفکیک شده گویندگان</h4>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ثبت شده به همراه دقیق‌ترین زمان‌ب بندی‌های کلاسی</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-bold text-[11px]">
                    <button
                      onClick={handleCopyTranscript}
                      className="px-3 py-1.5 bg-white border border-slate-100/80 hover:border-slate-200/60 text-slate-600 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">کپی شد!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی کل رونوشت</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadTranscript}
                      className="px-3 py-1.5 bg-white border border-slate-100/80 hover:border-slate-200/60 text-slate-600 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود فایل متنی</span>
                    </button>
                  </div>
                </div>

                {/* Transcript Local Search */}
                <div className="p-3 border-b border-slate-100/50 bg-white shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={transcriptSearch}
                      onChange={(e) => setTranscriptSearch(e.target.value)}
                      placeholder="جستجو و همگام‌سازی فوری در عبارات رونوشت..."
                      className="w-full text-right bg-slate-50 border border-slate-200/40 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white rounded-xl pr-9 pl-4 py-2 text-xs font-bold outline-none transition-all placeholder:text-slate-400 text-slate-800"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                {/* Main Transcript Body */}
                <div className="flex-1 p-5 overflow-y-auto max-h-[550px] space-y-3.5 bg-slate-50/30">
                  {filteredSegments.length > 0 ? (
                    filteredSegments.map((seg, idx) => {
                      const isSegActive = recording.segments?.indexOf(seg) === activeSegmentIdx;
                      const isBookmarked = bookmarkedSegments[recording.segments?.indexOf(seg) ?? -1];

                      return (
                        <div
                          key={idx}
                          ref={isSegActive ? transcriptActiveRef : null}
                          onClick={() => handleSegmentClick(seg.start)}
                          className={`p-4 rounded-2xl border text-right transition-all duration-200 relative group cursor-pointer ${
                            isSegActive
                              ? 'bg-indigo-50/80 border-indigo-200/50 shadow-xs ring-1 ring-indigo-100'
                              : 'bg-white border-slate-100/80 hover:border-indigo-100/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 select-none">
                              <span className="text-[9px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                {seg.speaker || 'استاد کلاس'}
                              </span>
                              {seg.isAiReferenced && (
                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  ارجاع هوشمند شده
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Bookmark transcript line */}
                              <button
                                onClick={(e) => handleToggleSegmentBookmark(seg, recording.segments?.indexOf(seg) ?? -1, e)}
                                className={`p-1 rounded-md border transition-all ${
                                  isBookmarked 
                                    ? 'bg-amber-50 border-amber-200 text-amber-600' 
                                    : 'opacity-0 group-hover:opacity-100 bg-slate-50 border-slate-100/80 hover:border-slate-200/60 text-slate-400 hover:text-slate-600 shadow-3xs'
                                }`}
                                title="نشان کردن این بخش"
                              >
                                <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
                              </button>

                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black transition-all ${
                                isSegActive 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>{toPersianDigits(formatShortTime(seg.start))}</span>
                              </span>
                            </div>
                          </div>

                          <p className={`leading-relaxed font-bold ${fontSizeClass} ${
                            isSegActive ? 'text-slate-900 font-black' : 'text-slate-600'
                          }`}>
                            {transcriptSearch ? (
                              (() => {
                                const parts = seg.text.split(new RegExp(`(${transcriptSearch})`, 'gi'));
                                return parts.map((part, k) => 
                                  part.toLowerCase() === transcriptSearch.toLowerCase() ? (
                                    <mark key={k} className="bg-amber-100 text-slate-900 rounded-xs px-0.5 py-px font-black">
                                      {part}
                                    </mark>
                                  ) : part
                                );
                              })()
                            ) : (
                              seg.text
                            )}
                          </p>

                          {isSegActive && isPlaying && (
                            <div className="absolute left-3 bottom-3 animate-pulse">
                              <Volume2 className="w-4 h-4 text-indigo-500" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 bg-white border border-slate-100/80 rounded-2xl space-y-2">
                      <Search className="w-8 h-8 text-slate-300 mx-auto" />
                      <span className="text-xs font-bold text-slate-400 block">هیچ عبارتی منطبق با فیلتر یافت نشد</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB PANEL 2: COLLAPSIBLE AI SUMMARY (Point 10) */}
            {activeWorkspaceTab === 'summary' && !isStudyMode && (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100/50 pb-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black text-slate-800">خلاصه علمی هوشمند و مفاهیم آموزشی</h3>
                    <p className="text-[10px] text-slate-400 font-bold">تولید شده به وسیله هوش مصنوعی بر اساس صحبت‌های استاد</p>
                  </div>
                </div>

                {/* Bento Grid summary details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Key Concepts */}
                  <Card className="p-5 border border-slate-100/80 rounded-2xl bg-slate-50/10 space-y-3 shadow-xs">
                    <h4 className="text-xs font-black text-indigo-600 block border-b border-slate-100/50 pb-2">🧠 مفاهیم کلیدی جلسه</h4>
                    <div className="space-y-3 font-bold text-xs">
                      {aiSummaryData.concepts.map((concept, k) => (
                        <div key={k} className="space-y-1">
                          <span className="text-slate-800 font-black text-xs block">{concept.title}</span>
                          <p className="text-slate-500 text-[11px] leading-relaxed">{concept.text}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Definitions & Formulas */}
                  <Card className="p-5 border border-slate-100/80 rounded-2xl bg-slate-50/10 space-y-3 shadow-xs">
                    <h4 className="text-xs font-black text-emerald-600 block border-b border-slate-100/50 pb-2">📝 فرمول‌ها و تعاریف مهم</h4>
                    <div className="space-y-3.5 font-bold text-xs">
                      {aiSummaryData.definitions.map((def, k) => (
                        <div key={k} className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100/80 shadow-3xs">
                          <span className="text-slate-800 font-black text-xs block">{def.term}</span>
                          <code className="text-[11px] text-indigo-600 font-mono block py-1 font-black" dir="ltr">
                            {def.formula}
                          </code>
                          <p className="text-slate-400 text-[10px]">{def.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Important Points */}
                  <Card className="p-5 border border-slate-100/80 rounded-2xl bg-slate-50/10 space-y-3 md:col-span-2 shadow-xs">
                    <h4 className="text-xs font-black text-amber-600 block border-b border-slate-100/50 pb-2">🎯 نکات طلایی امتحان پایان‌ترم</h4>
                    <ul className="space-y-2 text-xs font-bold text-slate-600 leading-relaxed list-disc list-inside mr-2">
                      {aiSummaryData.importantPoints.map((pt, k) => (
                        <li key={k} className="text-slate-600">{pt}</li>
                      ))}
                    </ul>
                  </Card>

                  {/* Study Tips */}
                  <Card className="p-5 border border-slate-100/80 rounded-2xl bg-slate-50/10 space-y-3 shadow-xs">
                    <h4 className="text-xs font-black text-indigo-600 block border-b border-slate-100/50 pb-2">💡 روش‌های طلایی مطالعه</h4>
                    <div className="space-y-2 text-[11px] font-bold text-slate-600 leading-relaxed">
                      {aiSummaryData.studyTips.map((tip, k) => (
                        <p key={k}>{tip}</p>
                      ))}
                    </div>
                  </Card>

                  {/* Quick Review */}
                  <Card className="p-5 border border-slate-100/80 rounded-2xl bg-slate-50/10 space-y-3 flex flex-col justify-between shadow-xs">
                    <div>
                      <h4 className="text-xs font-black text-rose-500 block border-b border-slate-100/50 pb-2">⚡ مرور فوق‌سریع</h4>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed pt-2">
                        {aiSummaryData.quickReview}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100/50 text-center">
                      <button 
                        onClick={() => setActiveWorkspaceTab('chat')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-3xs transition-all w-full"
                      >
                        طراحی کوئیز از این مبحث در چت هوشمند
                      </button>
                    </div>
                  </Card>

                </div>
              </div>
            )}

            {/* TAB PANEL 3: SPECIFIC REFERENCED LECTURE CHAT */}
            {activeWorkspaceTab === 'chat' && !isStudyMode && (
              <div className="flex-1 flex flex-col h-[520px]">
                <div className="p-4 bg-slate-50/60 border-b border-slate-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-black text-slate-800">گفتگوی موضوعی اختصاصی جلسه</h4>
                      <span className="text-[9px] text-slate-400 font-bold block">محدود شده به پایگاه داده این جلسه صوتی و کتاب مرتبط</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onNavigate('classes', { openClassId: recording.classId })}
                    className="text-xs font-black text-indigo-600 hover:underline cursor-pointer"
                  >
                    انتقال به چت عمومی کلاس
                  </button>
                </div>

                {/* Simulated workspace chat link */}
                <div className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xs">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800">چت موضوعی برای جلسه فعال</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      شما می‌توانید سوالات خود را درباره این تدریس بپرسید. برای استفاده، به بخش دستیار چت عمومی کلاس وارد شوید. سیستم به طور خودکار از مفاهیم این جلسه به عنوان منبع استفاده می‌کند.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('classes', { openClassId: recording.classId })}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    باز کردن چت هوشمند کلاس
                  </button>
                </div>
              </div>
            )}

            {/* TAB PANEL 4: SPEECH STATISTICS (Point 3) */}
            {activeWorkspaceTab === 'stats' && !isStudyMode && (
              <div className="p-6 space-y-6 font-bold text-xs">
                <div className="flex items-center gap-2 border-b border-slate-100/50 pb-3">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-black text-slate-800">گزارش و آمارهای گفتاری جلسه</h3>
                    <p className="text-[10px] text-slate-400 font-bold">شاخص‌های به دست آمده از پردازش فایل صوتی تدریس</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-slate-50/20 border border-slate-100/80 rounded-2xl space-y-2 shadow-3xs">
                    <span className="text-[10px] text-slate-400 block font-black">کل کلمات رونوشت شده</span>
                    <span className="text-base font-black text-slate-800">{toPersianDigits(recording.segments ? recording.segments.reduce((sum, s) => sum + s.text.split(' ').length, 0) : 120)} کلمه</span>
                  </Card>

                  <Card className="p-4 bg-slate-50/20 border border-slate-100/80 rounded-2xl space-y-2 shadow-3xs">
                    <span className="text-[10px] text-slate-400 block font-black">دقت تشخیص کلمات (Confidence)</span>
                    <span className="text-base font-black text-slate-800">{toPersianDigits('98.7')}٪</span>
                  </Card>

                  <Card className="p-4 bg-slate-50/20 border border-slate-100/80 rounded-2xl space-y-2 shadow-3xs">
                    <span className="text-[10px] text-slate-400 block font-black">سرعت متوسط ادای گوینده</span>
                    <span className="text-base font-black text-slate-800">{toPersianDigits(135)} کلمه در دقیقه</span>
                  </Card>
                </div>

                {/* Additional stats illustration */}
                <div className="bg-slate-50/20 border border-slate-100/80 p-5 rounded-2xl space-y-4 shadow-3xs">
                  <h4 className="text-xs font-black text-slate-800">تفکیک سهم زمانی گویندگان</h4>
                  
                  <div className="space-y-3 text-[11px] font-bold">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">استاد مربوطه (گوینده اول)</span>
                        <span className="text-slate-800">۹۲٪ زمان کل تدریس</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">پرسش‌های دانشجویان (گوینده دوم)</span>
                        <span className="text-slate-800">۸٪ زمان کل تدریس</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '8%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* 4. MODALS & DIALOGS */}
      {/* RENAME MODAL */}
      {isRenameOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <form onSubmit={handleRename} className="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-xl max-w-sm w-full text-right space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-slate-900">ویرایش نام فایل ضبط شده</h3>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">نام جدید جلسه</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-right bg-slate-50 border border-slate-200/50 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2 text-xs font-bold outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 font-bold text-xs">
              <button
                type="button"
                onClick={() => setIsRenameOpen(false)}
                className="px-4 py-2 bg-slate-100 border border-slate-200/50 text-slate-700 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
              >
                ثبت نام جدید
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-xl max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100/60 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1 text-right">
              <h3 className="text-sm font-black text-slate-900 text-center">آیا از حذف این جلسه صوتی اطمینان دارید؟</h3>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed text-center">
                با تایید این گزینه، فایل صوتی، رونوشت استخراج شده، حدهای تفکیک شده و مفاهیم تولید شده هوش مصنوعی متعلق به آن برای همیشه پاک خواهند شد.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 font-bold text-xs">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-slate-100 border border-slate-200/50 text-slate-700 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all cursor-pointer shadow-sm"
              >
                بله، برای همیشه حذف شود
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
