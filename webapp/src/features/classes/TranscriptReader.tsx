import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Bookmark,
  Download,
  X
} from 'lucide-react';
import { Recording, TranscriptSegment } from '../../types';
import { RecordingService } from '../../services/api';
import { BookmarkService } from '../../services/bookmarks';

interface TranscriptReaderProps {
  recording: Recording;
  onBack: () => void;
}

export const TranscriptReader: React.FC<TranscriptReaderProps> = ({ recording: initialRecording, onBack }) => {
  const [recording, setRecording] = useState<Recording>(initialRecording);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    () => BookmarkService.isBookmarked('lecture', 'lectureId', recording.id)
  );

  useEffect(() => {
    setIsBookmarked(BookmarkService.isBookmarked('lecture', 'lectureId', recording.id));
  }, [recording.id]);

  useEffect(() => {
    const handler = () => {
      setIsBookmarked(BookmarkService.isBookmarked('lecture', 'lectureId', recording.id));
    };
    window.addEventListener('cb-bookmarks-changed', handler);
    return () => window.removeEventListener('cb-bookmarks-changed', handler);
  }, [recording.id]);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const formatShortDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fa-IR');
    } catch {
      return dateStr;
    }
  };

  const getTranscriptText = () => {
    if (recording.segments) {
      return recording.segments
        .map(s => `[${formatTime(s.start)}] ${s.speaker || 'گوینده'}: ${s.text}`)
        .join('\n');
    }
    return recording.transcript || '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getTranscriptText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const text = getTranscriptText();
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `رونوشت_${recording.name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      BookmarkService.removeBookmarkByMetadata('lecture', 'lectureId', recording.id);
      setIsBookmarked(false);
    } else {
      BookmarkService.addBookmark({
        type: 'lecture',
        title: recording.name,
        description: `کلاس ${recording.className}`,
        classId: recording.classId,
        className: recording.className,
        metadata: {
          lectureId: recording.id,
          lectureName: recording.name
        }
      });
      setIsBookmarked(true);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await RecordingService.deleteRecording(recording.id);
      onBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="font-sans text-right h-full w-full flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-100/80 bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="w-9 h-9 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded-[14px] flex items-center justify-center border border-slate-100/80 hover:border-slate-200/60 cursor-pointer shadow-3xs transition-all duration-200 active:scale-95"
                title="بازگشت"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm md:text-base font-black text-slate-800 truncate">
                  {recording.name}
                </h1>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {recording.className} • {toPersianDigits(formatShortDate(recording.createdAt))}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleToggleBookmark}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-200 active:scale-95 ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white/80 hover:bg-white border-slate-100/80 hover:border-slate-200/60 text-slate-500 hover:text-amber-600'
                }`}
                title={isBookmarked ? 'حذف از نشان شده‌ها' : 'نشان کردن'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleCopy}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all duration-200 active:scale-95 ${
                  copied
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'bg-white/80 hover:bg-white border-slate-100/80 hover:border-slate-200/60 text-slate-500 hover:text-indigo-600'
                }`}
                title="کپی متن"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                className="w-9 h-9 bg-white/80 hover:bg-white border border-slate-100/80 hover:border-slate-200/60 text-slate-500 hover:text-indigo-600 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95"
                title="دانلود رونوشت"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-9 h-9 bg-white/80 hover:bg-rose-50 border border-slate-100/80 hover:border-rose-100/60 text-slate-500 hover:text-rose-600 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95"
                title="حذف رونوشت"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/40">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
          {recording.segments && recording.segments.length > 0 ? (
            recording.segments.map((seg, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-100/80 p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {seg.speaker || 'گوینده'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{toPersianDigits(formatTime(seg.start))}</span>
                  </span>
                </div>
                <p className="text-sm md:text-[15px] leading-[2] font-medium text-slate-700">
                  {seg.text}
                </p>
              </div>
            ))
          ) : recording.transcript ? (
            <div className="bg-white rounded-2xl border border-slate-100/80 p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <p className="text-sm md:text-[15px] leading-[2.2] font-medium text-slate-700 whitespace-pre-wrap">
                {recording.transcript}
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">رونوشتی برای این جلسه وجود ندارد</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100/50 bg-white px-4 md:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span>
            {recording.segments
              ? `${toPersianDigits(recording.segments.length)} بخش`
              : 'رونوشت'}
          </span>
          <span>{recording.name}</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-xl max-w-sm w-full p-6 text-right space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100/60 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">حذف رونوشت</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  این رونوشت از کلاس حذف خواهد شد.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-bold leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100/50">
              آیا از حذف رونوشت <span className="text-slate-900">"{recording.name}"</span> اطمینان دارید؟
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition-all disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال حذف...
                  </>
                ) : (
                  'حذف رونوشت'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
