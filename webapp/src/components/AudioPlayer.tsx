/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack, 
  X, 
  Maximize2, 
  Minimize2,
  ListMusic,
  Gauge
} from 'lucide-react';
import { Recording } from '../types';
import { usePlayerStore } from '../store/playerStore';

interface AudioPlayerProps {
  recording: Recording | null;
  onClose: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ recording, onClose }) => {
  const {
    activeRecording,
    isPlaying,
    currentTime,
    duration,
    speed,
    volume,
    isMuted,
    seekTrigger,
    play,
    pause,
    resume,
    stop,
    setCurrentTime,
    setDuration,
    setSpeed,
    setVolume,
    setIsMuted,
    clearSeekTrigger
  } = usePlayerStore();

  const [isMinimized, setIsMinimized] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Sync external prop with the store
  useEffect(() => {
    if (recording) {
      if (activeRecording?.id !== recording.id) {
        play(recording);
      }
    } else {
      if (activeRecording) {
        stop();
      }
    }
  }, [recording]);

  // Sync state machine when active recording changes
  useEffect(() => {
    if (activeRecording) {
      if (audioRef.current) {
        audioRef.current.playbackRate = speed;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play().catch((e) => {
          console.warn('Audio autoplay blocked or failed. Simulating progress instead.', e);
        });
      }
    }
  }, [activeRecording]);

  // Handle seek triggers from outside (e.g. clicking a timestamp)
  useEffect(() => {
    if (seekTrigger !== null && activeRecording) {
      setCurrentTime(seekTrigger);
      if (audioRef.current) {
        audioRef.current.currentTime = seekTrigger;
        if (!isPlaying) {
          audioRef.current.play().catch(() => {});
          resume();
        }
      }
      clearSeekTrigger();
    }
  }, [seekTrigger, activeRecording]);

  // Sync state machine for simulated progress fallback & real audio
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && activeRecording) {
      timer = setInterval(() => {
        if (audioRef.current && audioRef.current.src && !isNaN(audioRef.current.duration)) {
          // If playing real audio
          setCurrentTime(audioRef.current.currentTime);
        } else {
          // Simulated progress
          setCurrentTime(Math.min(duration, currentTime + (1 * speed)));
          if (currentTime >= duration) {
            pause();
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeRecording, currentTime, duration, speed]);

  const handlePlayPause = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      pause();
    } else {
      if (audioRef.current) {
        audioRef.current.playbackRate = speed;
        audioRef.current.play().catch(() => {});
      }
      resume();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = newVol === 0;
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  const handleSkip = (amount: number) => {
    const target = Math.max(0, Math.min(duration, currentTime + amount));
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const handleClosePlayer = () => {
    stop();
    onClose();
  };

  if (!activeRecording) return null;

  return (
    <div className="fixed bottom-[72px] md:bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[480px] z-45 font-sans text-right animate-in slide-in-from-bottom-8 duration-300">
      
      {/* Real audio stream back-end component with royalty free ambient sound */}
      <audio 
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onEnded={() => pause()}
        className="hidden"
      />

      {isMinimized ? (
        
        /* MINIMIZED VIEW */
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-3 flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="text-right">
              <span className="text-[11px] font-black block truncate max-w-[150px]">{activeRecording.name}</span>
              <span className="text-[9px] text-slate-400 block font-bold">{toPersianDigits(formatTime(currentTime))} / {toPersianDigits(formatTime(duration))}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsMinimized(false)}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="بزرگ‌نمایی"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleClosePlayer}
              className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      ) : (

        /* FULL FLOATING PLAYER VIEW */
        <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 p-5 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                <ListMusic className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-xs font-black block truncate max-w-[200px]">{activeRecording.name}</span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">کارگاه درسی: {activeRecording.className}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="کوچک‌نمایی"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleClosePlayer}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timeline slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
              <span>{toPersianDigits(formatTime(currentTime))}</span>
              <span>{toPersianDigits(formatTime(duration))}</span>
            </div>
            
            <input
              type="range"
              ref={progressRef}
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 outline-none"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between pt-1">
            
            {/* Speed Selector */}
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={speed}
                onChange={handleSpeedChange}
                className="bg-slate-800 border border-slate-700/80 rounded-lg px-1.5 py-1 text-[10px] text-slate-300 outline-none cursor-pointer font-bold"
              >
                <option value="0.5">۰.۵x</option>
                <option value="1">۱.۰x</option>
                <option value="1.25">۱.۲۵x</option>
                <option value="1.5">۱.۵x</option>
                <option value="2">۲.۰x</option>
              </select>
            </div>

            {/* Core Playback controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSkip(-15)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="۱۵ ثانیه عقب"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handlePlayPause}
                className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-md shadow-indigo-600/10"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={() => handleSkip(15)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="۱۵ ثانیه جلو"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume controller */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleMuteToggle}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

          </div>

          {/* Realistic disclaimer for ambient playback fallbacks */}
          <p className="text-[8px] text-slate-500 leading-normal text-center pt-1">
            * در این محیط شبیه‌ساز، پخش صدای فایل با استفاده از تِرک نمونه انجام می‌شود و زمان‌بندی آن دقیقاً با ویس ثبت‌شده شما همگام است.
          </p>

        </div>
      )}

    </div>
  );
};
