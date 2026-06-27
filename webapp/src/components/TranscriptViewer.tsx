/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Clock, 
  Volume2, 
  MessageSquare, 
  Sparkles, 
  FileText,
  Bookmark
} from 'lucide-react';
import { Recording, TranscriptSegment } from '../types';
import { usePlayerStore } from '../store/playerStore';

interface TranscriptViewerProps {
  recording: Recording;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ recording }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const activeSegmentRef = useRef<HTMLDivElement | null>(null);
  
  const { 
    activeRecording, 
    isPlaying, 
    currentTime, 
    play, 
    triggerSeek 
  } = usePlayerStore();

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Check if this recording is currently loaded in the active player
  const isCurrentlyPlayingThis = activeRecording?.id === recording.id;

  // Filter segments based on query
  const filteredSegments = useMemo(() => {
    const segments = recording.segments || [];
    if (!searchQuery.trim()) return segments;
    return segments.filter(seg => 
      seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (seg.speaker && seg.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [recording.segments, searchQuery]);

  // Find the currently active segment based on player's current time
  const activeSegmentIndex = useMemo(() => {
    if (!isCurrentlyPlayingThis || !recording.segments) return -1;
    return recording.segments.findIndex(
      seg => currentTime >= seg.start && currentTime <= seg.end
    );
  }, [isCurrentlyPlayingThis, recording.segments, currentTime]);

  // Handle click on timestamp to seek
  const handleTimestampClick = (startSeconds: number) => {
    if (!isCurrentlyPlayingThis) {
      play(recording);
    }
    // Set immediate play trigger and seek
    triggerSeek(startSeconds);
  };

  // Copy transcript to clipboard
  const handleCopy = () => {
    const textToCopy = recording.segments
      ? recording.segments.map(s => `[${formatTime(s.start)}] ${s.speaker || 'گوینده'}: ${s.text}`).join('\n')
      : recording.transcript || '';
      
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Auto scroll to active segment
  useEffect(() => {
    if (activeSegmentIndex !== -1 && activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeSegmentIndex]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[520px] font-sans text-right">
      
      {/* Header toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">رونوشت خودکار جلسه</h4>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">تبدیل گفتار به متن فارسی دقیق</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy action */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white bg-slate-100 border border-slate-200 hover:border-indigo-100 rounded-xl text-[11px] font-black cursor-pointer transition-all"
            title="کپی متن کامل رونوشت"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی متن</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100 shrink-0 bg-white">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در عبارات و کلمات رونوشت..."
            className="w-full text-right bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pr-9 pl-4 py-2 text-xs font-bold outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Segments Display Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
        {filteredSegments.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <span className="text-xs font-bold text-slate-400 block">هیچ عبارتی یافت نشد</span>
            <p className="text-[10px] text-slate-400">عبارت دیگری را برای جستجو امتحان کنید.</p>
          </div>
        ) : (
          filteredSegments.map((seg, idx) => {
            const isOriginalActive = recording.segments?.indexOf(seg) === activeSegmentIndex;
            
            return (
              <div
                key={idx}
                ref={isOriginalActive ? activeSegmentRef : null}
                className={`p-3.5 rounded-2xl border text-right transition-all duration-200 relative group cursor-pointer ${
                  isOriginalActive
                    ? 'bg-indigo-50/80 border-indigo-200 shadow-xs ring-1 ring-indigo-100'
                    : 'bg-white border-slate-150 hover:border-slate-200'
                }`}
                onClick={() => handleTimestampClick(seg.start)}
              >
                {/* Segment Meta */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {seg.speaker || 'گوینده'}
                    </span>
                    {seg.isAiReferenced && (
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        ارجاع داده شده
                      </span>
                    )}
                  </div>

                  {/* Timestamp Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimestampClick(seg.start);
                    }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                      isOriginalActive 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{toPersianDigits(formatTime(seg.start))}</span>
                  </button>
                </div>

                {/* Segment Text */}
                <p className={`text-xs leading-relaxed font-bold ${
                  isOriginalActive ? 'text-slate-800 font-extrabold' : 'text-slate-600'
                }`}>
                  {/* Simple text highlighter for search querying */}
                  {searchQuery ? (
                    (() => {
                      const parts = seg.text.split(new RegExp(`(${searchQuery})`, 'gi'));
                      return parts.map((part, k) => 
                        part.toLowerCase() === searchQuery.toLowerCase() ? (
                          <mark key={k} className="bg-amber-100 text-slate-900 rounded-xs px-0.5 py-px font-extrabold">
                            {part}
                          </mark>
                        ) : part
                      );
                    })()
                  ) : (
                    seg.text
                  )}
                </p>

                {/* Micro play button overlay */}
                {isOriginalActive && isPlaying && (
                  <div className="absolute left-3 top-3 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sync Status Footer */}
      <div className="px-4 py-2 border-t border-slate-100 bg-white text-[9px] text-slate-400 font-bold flex items-center justify-between shrink-0">
        <span>تعداد قطعات صوتی: {toPersianDigits(filteredSegments.length)} بخش</span>
        <div className="flex items-center gap-1">
          <Bookmark className="w-3 h-3 text-indigo-500" />
          <span>با کلیک روی متن به ثانیه مورد نظر منتقل شوید</span>
        </div>
      </div>

    </div>
  );
};
