/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Upload, 
  AlertTriangle, 
  Sparkles, 
  FileAudio, 
  Trash2, 
  Pause, 
  Play, 
  Square,
  CheckCircle2, 
  Volume2, 
  Info,
  Loader2,
  ListPlus,
  Compass,
  Check,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { ClassService, RecordingService, SubscriptionService } from '../../services/api';
import { Class, Recording, SubscriptionStatus } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { ProcessingQueueService, ProcessJob, JobStage } from '../../services/processingQueue';


interface RecordScreenProps {
  onNavigate: (tab: string, arg?: any) => void;
  focusRecord?: boolean;
  focusUpload?: boolean;
  preselectClassId?: string | null;
}

type PipelineStage = 
  | 'idle' 
  | 'uploading' 
  | 'queued' 
  | 'transcribing' 
  | 'chunking' 
  | 'embedding' 
  | 'saving' 
  | 'completed';

export const RecordScreen: React.FC<RecordScreenProps> = ({ 
  onNavigate, 
  focusRecord = false, 
  focusUpload = false,
  preselectClassId = null
}) => {
  const { subscriptionStatus, syncSubscription } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [error, setError] = useState<string | null>(null);



  // -------------------------------------------------------------------------
  // 1. LIVE RECORDING STATE
  // -------------------------------------------------------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [microphoneStatus, setMicrophoneStatus] = useState<'blocked' | 'granted' | 'prompt'>('prompt');
  const [recordingName, setRecordingName] = useState('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showClassAssignment, setShowClassAssignment] = useState(false);
  const [assignedClassId, setAssignedClassId] = useState(preselectClassId || '');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isPausedRef = useRef(false);
  const maxDurationReachedRef = useRef(false);

  // -------------------------------------------------------------------------
  // 2. FILE UPLOAD STATE
  // -------------------------------------------------------------------------
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadClassId, setUploadClassId] = useState(preselectClassId || '');
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [simulatedDuration, setSimulatedDuration] = useState(0);
  const [jobs, setJobs] = useState<ProcessJob[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Persian Number Formatter
  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const hStr = hours > 0 ? `${hours}:` : '';
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');
    
    return toPersianDigits(`${hStr}${mStr}:${sStr}`);
  };

  // On mount: load active classes & preselect parameters
  useEffect(() => {
    async function initScreen() {
      setIsLoadingClasses(true);
      try {
        const list = await ClassService.getClasses();
        setClasses(list);
        
        if (preselectClassId) {
          const matched = list.find(c => c.id === preselectClassId);
          if (matched) {
            setAssignedClassId(matched.id);
            setUploadClassId(matched.id);
          }
        } else if (list.length > 0) {
          setAssignedClassId(list[0].id);
          setUploadClassId(list[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'خطا در بارگذاری کلاس‌های ترم');
      } finally {
        setIsLoadingClasses(false);
      }
    }

    initScreen();

    // Focus tab parameter checks
    if (focusUpload) {
      setActiveTab('upload');
    } else if (focusRecord) {
      setActiveTab('record');
    }

    // Try reading temporary recording state from localStorage on load
    const savedName = localStorage.getItem('cb_temp_recording_name');
    if (savedName) {
      setRecordingName(savedName);
    } else {
      setRecordingName(`تدریس مورخ ${toPersianDigits(new Date().toLocaleDateString('fa-IR'))}`);
    }

    // Check mic permission status
    navigator.permissions?.query({ name: 'microphone' as any }).then(permissionStatus => {
      setMicrophoneStatus(permissionStatus.state === 'granted' ? 'granted' : 
                          permissionStatus.state === 'denied' ? 'blocked' : 'prompt');
      permissionStatus.onchange = () => {
        setMicrophoneStatus(permissionStatus.state === 'granted' ? 'granted' : 
                            permissionStatus.state === 'denied' ? 'blocked' : 'prompt');
      };
    }).catch(() => {
      // Fallback for browsers not supporting querying microphone directly
    });

    return () => {
      cleanupRecording();
    };
  }, [focusRecord, focusUpload, preselectClassId]);

  useEffect(() => {
    const handleJobsChanged = () => {
      setJobs(ProcessingQueueService.getJobs());
    };
    
    handleJobsChanged();
    window.addEventListener('cb-jobs-changed', handleJobsChanged);
    return () => {
      window.removeEventListener('cb-jobs-changed', handleJobsChanged);
    };
  }, []);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Keep refs in sync with state for closure safety in setInterval / beforeunload
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // Auto-stop at max duration (90 minutes = 5400 seconds)
  useEffect(() => {
    if (recordingSeconds >= 5400 && isRecording && !maxDurationReachedRef.current) {
      maxDurationReachedRef.current = true;
      handleStopRecording();
      setError('مدت زمان ضبط به سقف مجاز ۹۰ دقیقه رسید و ذخیره شد.');
    }
  }, [recordingSeconds, isRecording]);

  // Navigation protection: beforeunload for browser refresh/close
  useEffect(() => {
    if (!isRecording && !isPaused) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isRecording, isPaused]);

  // Expose recording state + discard handler for App.tsx navigation guard
  useEffect(() => {
    (window as any).__cbRecordingActive = isRecording || isPaused ? (isPaused ? 'paused' : 'recording') : null;
    (window as any).__cbDiscardRecording = handleDiscardAndLeave;
    return () => {
      (window as any).__cbRecordingActive = null;
      (window as any).__cbDiscardRecording = null;
    };
  }, [isRecording, isPaused]);

  const syncUsageData = async () => {
    try {
      await syncSubscription();
    } catch (err) {
      console.warn('Failed to sync limits', err);
    }
  };

  // -------------------------------------------------------------------------
  // MEDIA RECORDER - LIVE MICROPHONE ENGINE
  // -------------------------------------------------------------------------
  const startAudioContext = async (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      drawWaveform();
    } catch (e) {
      console.error('Failed to initialize AudioContext waveform', e);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2.2;
        // Adjust for paused amplitude
        if (isPaused) {
          barHeight = 2;
        }

        // Elegant Indigo color scheme for waveform
        ctx.fillStyle = `rgba(79, 70, 229, ${Math.max(0.2, barHeight / 100)})`;
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  const handleStartRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    setRecordedBlob(null);
    maxDurationReachedRef.current = false;

    // Save active recording name
    if (!recordingName.trim()) {
      const defaultName = `تدریس مورخ ${toPersianDigits(new Date().toLocaleDateString('fa-IR'))}`;
      setRecordingName(defaultName);
      localStorage.setItem('cb_temp_recording_name', defaultName);
    } else {
      localStorage.setItem('cb_temp_recording_name', recordingName);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicrophoneStatus('granted');

      const options = { mimeType: 'audio/webm' };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        setShowClassAssignment(true);
      };

      recorder.start(1000); // chunk every 1 sec
      setIsRecording(true);
      setIsPaused(false);

      await startAudioContext(stream);

      // Start timer tick — respects pause via ref
      timerIntervalRef.current = setInterval(() => {
        if (isPausedRef.current) return;
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to access microphone', err);
      setMicrophoneStatus('blocked');
      setError('دسترسی به میکروفون مسدود شده است. لطفاً دسترسی مرورگر را باز کنید.');
    }
  };

  const handlePauseToggle = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      isPausedRef.current = false;
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      isPausedRef.current = true;
    }
  };

  const handleDiscardAndLeave = () => {
    cleanupRecording();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordingSeconds(0);
    setRecordedBlob(null);
    maxDurationReachedRef.current = false;
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    cleanupRecording();
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleDiscardRecording = () => {
    setRecordedBlob(null);
    setShowClassAssignment(false);
    setRecordingSeconds(0);
    setError(null);
  };

  const handleSaveRecordedToClass = async () => {
    if (!recordedBlob || !assignedClassId) return;
    setIsSubmitLoading(true);
    setError(null);

    try {
      const recordingSize = recordedBlob.size;
      const recordingNameFinal = recordingName.trim() || `تدریس کلاس ${toPersianDigits(new Date().toLocaleDateString('fa-IR'))}`;
      
      // Upload recording simulated call
      await RecordingService.uploadRecording({
        name: recordingNameFinal,
        duration: recordingSeconds,
        classId: assignedClassId,
        size: recordingSize
      });

      // Clear cached temp name
      localStorage.removeItem('cb_temp_recording_name');
      setRecordingName(`تدریس مورخ ${toPersianDigits(new Date().toLocaleDateString('fa-IR'))}`);
      
      // Refresh metrics on parent and sync limits
      await syncUsageData();
      
      // Clean states
      setRecordedBlob(null);
      setShowClassAssignment(false);
      setRecordingSeconds(0);
      
      // Navigate to the assigned class page to see the results
      onNavigate('classes', { openClassId: assignedClassId });
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت و انتساب فایل ضبط شده به کلاس درسی');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // AUDIO FILE UPLOAD PIPELINE
  // -------------------------------------------------------------------------
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(url);
          if (isFinite(audio.duration) && audio.duration > 0) {
            resolve(audio.duration);
          } else {
            reject(new Error('مدت زمان فایل صوتی قابل تشخیص نیست.'));
          }
        });
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          reject(new Error('فایل صوتی قابل خواندن نیست.'));
        });
        audio.src = url;
      } catch {
        reject(new Error('خطا در خواندن فایل صوتی'));
      }
    });
  };

  const validateAndSetFile = async (file: File) => {
    setError(null);

    // Size check: max 100MB
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('اندازه فایل صوتی بیش از حد مجاز (۱۰۰ مگابایت) است.');
      setSelectedFile(null);
      return;
    }

    // Format validation
    const allowedExtensions = ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError('فرمت فایل صوتی انتخاب شده پشتیبانی نمی‌شود. فرمت‌های مجاز: MP3, WAV, AAC, M4A, OGG, FLAC');
      setSelectedFile(null);
      return;
    }

    // Read actual audio duration from file metadata
    let durationSecs: number;
    try {
      durationSecs = await getAudioDuration(file);
    } catch {
      setError('مدت زمان فایل صوتی قابل تشخیص نیست. لطفا از سالم بودن فایل اطمینان حاصل کنید.');
      setSelectedFile(null);
      return;
    }

    // Check remaining recording balance before allowing upload
    const remainingSecs = (subscriptionStatus.usage.maxRecordingHours - subscriptionStatus.usage.recordingHoursUsed) * 3600;
    if (durationSecs > remainingSecs) {
      const remainingFormatted = formatTime(remainingSecs);
      const durationFormatted = formatTime(durationSecs);
      setError(
        `مدت زمان فایل صوتی (${durationFormatted}) بیش از سهمیه باقی‌مانده (${remainingFormatted}) است. ` +
        `لطفا فایل کوتاه‌تری انتخاب کنید یا اشتراک خود را تمدید نمایید.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setSimulatedDuration(durationSecs);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setPipelineStage('idle');
    setError(null);
  };

  const handleStartPipeline = async () => {
    if (!selectedFile || !uploadClassId) return;
    setError(null);

    const targetClass = classes.find(c => c.id === uploadClassId);
    const className = targetClass ? targetClass.name : 'کلاس درسی';

    // Guard: re-check remaining balance before queueing
    const remainingSecs = (subscriptionStatus.usage.maxRecordingHours - subscriptionStatus.usage.recordingHoursUsed) * 3600;
    if (simulatedDuration > remainingSecs) {
      setError('سهمیه ضبط شما برای این فایل صوتی کافی نیست.');
      return;
    }

    try {
      ProcessingQueueService.addJob({
        name: selectedFile.name.replace(/\.[^/.]+$/, ""),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        duration: simulatedDuration,
        classId: uploadClassId,
        className: className
      });

      // Clear local upload state - job will run in background!
      setSelectedFile(null);
      setUploadProgress(0);
      setPipelineStage('idle');
      
      // Sync hours remaining
      await syncUsageData();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت و شروع پردازش فایل صوتی');
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="font-sans text-right space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="pb-5">
        <h1 className="text-xl font-black text-slate-900">ضبط و بارگذاری</h1>
      </div>

      {/* ERROR TOAST */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100/60 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-bold shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span>خطا رخ داد:</span>
            <p className="font-semibold mt-1 text-[11px] leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* TABS SELECTOR */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-100/50 w-full sm:w-80">
        <button
          onClick={() => { setActiveTab('record'); setError(null); }}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'record' ? 'bg-white dark:bg-white/10 text-indigo-700 dark:text-indigo-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>ضبط زنده صدا</span>
        </button>
        <button
          onClick={() => { setActiveTab('upload'); setError(null); }}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'upload' ? 'bg-white dark:bg-white/10 text-indigo-700 dark:text-indigo-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>بارگذاری فایل صوتی</span>
        </button>
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="bg-white border border-slate-100/80 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        
        {/* ========================================================
           TAB: LIVE RECORDING
           ======================================================== */}
        {activeTab === 'record' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            
            <div className="space-y-2">
              <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full font-extrabold inline-block">
                ضبط از میکروفون مرورگر
              </span>
               <h2 className="text-base font-black text-slate-800">ضبط زیوای</h2>
            </div>

            {/* Title Assignment Before Recording */}
            <div className="text-right space-y-1.5 max-w-sm mx-auto">
              <label className="text-[10px] font-black text-slate-400">عنوان فایل ضبط شده</label>
              <input
                type="text"
                disabled={isRecording}
                value={recordingName}
                onChange={(e) => {
                  setRecordingName(e.target.value);
                  localStorage.setItem('cb_temp_recording_name', e.target.value);
                }}
                placeholder="مثال: جلسه سوم ریاضی مهندسی"
                className="w-full bg-white dark:bg-white/[0.05] border border-slate-200/40 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-750 dark:text-slate-200 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200 font-bold disabled:bg-slate-50 dark:disabled:bg-white/[0.02] disabled:text-slate-400 dark:disabled:text-slate-500"
              />
            </div>

            {/* Big Pulsating Recording Hub */}
            <div className="py-8 flex flex-col items-center justify-center relative">
              <div className="relative">
                
                {/* Visual pulsating circles when recording is active */}
                {isRecording && !isPaused && (
                  <>
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-rose-500/10 rounded-full"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                      className="absolute inset-0 bg-rose-500/5 rounded-full"
                    />
                  </>
                )}

                <button
                  onClick={() => {
                    if (!isRecording) {
                      handleStartRecording();
                    } else if (isPaused) {
                      handlePauseToggle();
                    } else {
                      handleStopRecording();
                    }
                  }}
                  className={`w-24 h-24 rounded-full border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative z-10 ${
                    !isRecording
                      ? 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700 hover:scale-105 shadow-[0_12px_40px_rgba(43,89,234,0.15)]'
                      : isPaused
                        ? 'bg-slate-400 border-slate-500 text-white hover:bg-slate-500 shadow-[0_8px_32px_rgba(100,116,139,0.3)]'
                        : 'bg-rose-600 border-rose-700 text-white hover:bg-rose-700 shadow-[0_8px_32px_rgba(225,29,72,0.3)] animate-recording-pulse'
                  }`}
                >
                  {!isRecording ? (
                    <Mic className="w-8 h-8" />
                  ) : isPaused ? (
                    <Play className="w-8 h-8" />
                  ) : (
                    <Square className="w-8 h-8" />
                  )}
                  <span className="text-[10px] font-black mt-1.5">
                    {!isRecording ? 'شروع ضبط' : isPaused ? 'ادامه ضبط' : 'پایان ضبط'}
                  </span>
                </button>
              </div>

              {/* Timer & Micro Status */}
              <div className="mt-6 space-y-1.5">
                <div className="text-2xl font-black text-slate-800 tracking-tight font-mono">
                  {formatTime(recordingSeconds)}
                </div>
                
                {/* 89 Minute Warning Alert banner */}
                {recordingSeconds >= 5340 && recordingSeconds < 5400 && (
                  <div className="bg-amber-50 text-amber-800 text-[10px] font-bold py-1 px-3 border border-amber-100/60 rounded-lg max-w-xs mx-auto animate-bounce mt-2">
                    ضبط صوتی تا یک دقیقه دیگر به طور خودکار متوقف خواهد شد.
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-bold mt-1">
                  <span>کیفیت ضبط: عالی</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${microphoneStatus === 'granted' ? 'bg-emerald-500' : 'bg-slate-350'}`} />
                    میکروفون فعال
                  </span>
                </div>
              </div>
            </div>

            {/* Recording Controls: Pause & Resume */}
            {isRecording && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={handlePauseToggle}
                  className="px-5 py-2 bg-slate-50 border border-slate-100/80 hover:border-slate-200/60 rounded-xl font-bold text-xs text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'ادامه ضبط' : 'موقت متوقف کن'}</span>
                </button>
              </div>
            )}

            {/* CLASS ASSIGNMENT PROCESS MODAL (FORCED AFTER RECORDING) */}
            <AnimatePresence>
              {showClassAssignment && recordedBlob && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white border border-slate-100/80 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-6 space-y-5 text-right font-sans"
                  >
                    <div className="border-b border-slate-100/50 pb-3 flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <ListPlus className="w-4 h-4 text-indigo-600" />
                        <span>انتساب ویس ضبط شده به کلاس درسی</span>
                      </h3>
                      <button 
                        onClick={handleDiscardRecording}
                        className="w-8 h-8 text-slate-400 hover:bg-slate-50 rounded-lg flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      
                      <div className="bg-slate-50 rounded-2xl p-4 text-[11px] leading-relaxed font-semibold text-slate-650 space-y-1 text-right">
                        <div>فایل صوتی با موفقیت ضبط شد.</div>
                        <div>نام فایل: <span className="text-slate-800 font-bold">{recordingName}</span></div>
                        <div>مدت زمان ضبط: <span className="text-slate-850 font-bold">{formatTime(recordingSeconds)}</span></div>
                        <div>حجم صوتی تقریبی: <span className="text-slate-850 font-bold">{toPersianDigits((recordedBlob.size / (1024 * 1024)).toFixed(1))} مگابایت</span></div>
                      </div>

                      {/* Force Assign a Class Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 block">لطفاً کلاس مربوط به این ضبط صوتی را مشخص کنید</label>
                        {isLoadingClasses ? (
                          <div className="h-10 w-full bg-slate-100 animate-pulse rounded-xl" />
                        ) : classes.length === 0 ? (
                          <div className="text-xs text-rose-600 font-black p-3 bg-rose-50 border border-rose-100/60 rounded-xl leading-relaxed">
                            ⚠️ شما هیچ کلاس فعالی در ترم تحصیلی جاری ثبت نکرده‌اید! ابتدا به منوی کلاس‌ها رفته و یک کلاس درسی اضافه کنید.
                          </div>
                        ) : (
                          <Select
                            placeholder="-- کلاس مورد نظر را انتخاب کنید --"
                            options={classes.map(cls => ({ value: cls.id, label: cls.name }))}
                            value={assignedClassId}
                            onChange={setAssignedClassId}
                            searchable
                          />
                        )}
                        <span className="text-[9px] text-slate-400 block font-bold mt-1">
                          * بدون انتساب این ضبط به کلاس مربوطه، امکان بارگذاری و آغاز تحلیل وجود نخواهد داشت.
                        </span>
                      </div>

                    </div>

                    <div className="pt-4 border-t border-slate-100/50 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={handleDiscardRecording}
                        className="px-4 py-2 border border-slate-100/80 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-200/60 cursor-pointer shadow-xs transition-all"
                      >
                        دور ریختن ویس ضبط شده
                      </button>
                      <Button
                        onClick={handleSaveRecordedToClass}
                        disabled={isSubmitLoading || !assignedClassId || classes.length === 0}
                        isLoading={isSubmitLoading}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer"
                      >
                        تایید و ارسال به کارگاه کلاس
                      </Button>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* ========================================================
           TAB: AUDIO FILE UPLOAD
           ======================================================== */}
        {activeTab === 'upload' && (
          <div className="space-y-6 max-w-xl mx-auto">
            
            <div className="text-center space-y-1.5">
              <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full font-extrabold inline-block">
                بارگذاری صوت از پیش ضبط شده
              </span>
              <h2 className="text-base font-black text-slate-800">بارگذاری صوت تدریس</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                فرمت‌های مجاز فایل صوتی شامل MP3, WAV, AAC, M4A, OGG, FLAC با حداکثر ظرفیت ۱۰۰ مگابایت می‌باشند.
              </p>
            </div>

            {/* Drag & Drop File Zone */}
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-50/20 shadow-md dark:border-indigo-400 dark:bg-indigo-950/20' 
                    : 'border-slate-200/50 bg-slate-50/10 hover:border-indigo-200/80 hover:bg-slate-50/30 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-indigo-500/30 dark:hover:bg-white/[0.04]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".mp3,.wav,.aac,.m4a,.ogg,.flac,audio/*"
                  className="hidden"
                />
                
                <div className="w-12 h-12 bg-white dark:bg-white/[0.05] border border-slate-100/80 dark:border-white/5 rounded-2xl flex items-center justify-center shadow-xs text-slate-400 dark:text-slate-500 mb-4">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                
                <span className="text-xs font-black text-slate-800 dark:text-slate-300">بارگذاری یا درگ صوتی به اینجا</span>
              </div>
            ) : (
              /* FILE SELECTED VIEW & PROCESSING STAGE INDICATORS */
              <Card className="border border-slate-100/80 dark:border-white/5 bg-white dark:bg-white/[0.03] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100/50 dark:border-b-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-center text-indigo-600">
                      <FileAudio className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800 block truncate max-w-[180px] sm:max-w-xs">
                        {selectedFile.name}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        اندازه: {toPersianDigits((selectedFile.size / (1024 * 1024)).toFixed(1))} مگابایت | مدت: {formatTime(simulatedDuration)}
                      </span>
                    </div>
                  </div>

                  {pipelineStage === 'idle' && (
                    <button
                      onClick={handleRemoveFile}
                      className="p-1.5 text-slate-450 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="حذف فایل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Class Assignment Selector inside the box */}
                {pipelineStage === 'idle' && (
                  <div className="space-y-1.5 text-right">
                    <label className="text-[10px] font-black text-slate-400 block">نام کلاس درسی منتسب</label>
                    {classes.length === 0 ? (
                      <div className="text-[10px] text-rose-600 font-bold p-3 bg-rose-50 border border-rose-100/60 rounded-xl">
                        ⚠️ قبل از شروع آپلود، باید یک کلاس در ترم تحصیلی جاری خود ثبت کنید.
                      </div>
                    ) : (
                      <Select
                        placeholder="-- یک کلاس درسی انتخاب کنید --"
                        options={classes.map(cls => ({ value: cls.id, label: cls.name }))}
                        value={uploadClassId}
                        onChange={setUploadClassId}
                        searchable
                      />
                    )}
                  </div>
                )}

                {/* PIPELINE PROCESSING VISUAL TIMELINE */}
                {pipelineStage !== 'idle' && (
                  <div className="pt-2 space-y-4 text-right">
                    
                    {/* Progression bar */}
                    {pipelineStage === 'uploading' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>در حال آپلود به فضای ابری زیوای...</span>
                          <span className="font-mono">{toPersianDigits(uploadProgress)}٪</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step-by-step progress status list */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-50">
                      
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>مراحل پردازش فایل صوتی</span>
                        <div className="flex items-center gap-1 text-[10px] text-indigo-600">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                           <span>تحلیل خودکار توسط هوش مصنوعی</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 font-semibold">
                        
                        {/* Step 1: Uploading */}
                        <div className="flex items-center gap-2">
                          <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${
                            pipelineStage === 'uploading' ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {pipelineStage === 'uploading' ? '●' : <Check className="w-3 h-3" />}
                          </div>
                          <span className={pipelineStage === 'uploading' ? 'text-indigo-600 font-black' : 'text-slate-400'}>بارگذاری فایل صوتی</span>
                        </div>

                        {/* Step 2: Queued */}
                        <div className="flex items-center gap-2">
                          <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${
                            pipelineStage === 'queued' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                            ['idle', 'uploading'].includes(pipelineStage) ? 'bg-slate-100 text-slate-400' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {pipelineStage === 'queued' ? '●' : ['idle', 'uploading'].includes(pipelineStage) ? '۲' : <Check className="w-3 h-3" />}
                          </div>
                          <span className={pipelineStage === 'queued' ? 'text-indigo-600 font-black' : 'text-slate-400'}>افزودن به صف پردازش هوشمند</span>
                        </div>

                        {/* Step 3: Soniox Transcription */}
                        <div className="flex items-center gap-2">
                          <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${
                            pipelineStage === 'transcribing' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                            ['idle', 'uploading', 'queued'].includes(pipelineStage) ? 'bg-slate-100 text-slate-400' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {pipelineStage === 'transcribing' ? '●' : ['idle', 'uploading', 'queued'].includes(pipelineStage) ? '۳' : <Check className="w-3 h-3" />}
                          </div>
                          <span className={pipelineStage === 'transcribing' ? 'text-indigo-600 font-black' : 'text-slate-400'}>رونوشت کلامی و تبدیل گفتار به متن</span>
                        </div>

                        {/* Step 4: Chunking */}
                        <div className="flex items-center gap-2">
                          <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${
                            pipelineStage === 'chunking' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                            ['idle', 'uploading', 'queued', 'transcribing'].includes(pipelineStage) ? 'bg-slate-100 text-slate-400' :
                            'bg-emerald-50 text-emerald-650 border border-emerald-100'
                          }`}>
                            {pipelineStage === 'chunking' ? '●' : ['idle', 'uploading', 'queued', 'transcribing'].includes(pipelineStage) ? '۴' : <Check className="w-3 h-3" />}
                          </div>
                          <span className={pipelineStage === 'chunking' ? 'text-indigo-600 font-black' : 'text-slate-400'}>ساختاردهی و بخش‌بندی محتوا</span>
                        </div>

                        {/* Step 5: Embeddings */}
                        <div className="flex items-center gap-2">
                          <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] ${
                            pipelineStage === 'embedding' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                            ['idle', 'uploading', 'queued', 'transcribing', 'chunking'].includes(pipelineStage) ? 'bg-slate-100 text-slate-400' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {pipelineStage === 'embedding' ? '●' : ['idle', 'uploading', 'queued', 'transcribing', 'chunking'].includes(pipelineStage) ? '۵' : <Check className="w-3 h-3" />}
                          </div>
                          <span className={pipelineStage === 'embedding' ? 'text-indigo-600 font-black' : 'text-slate-400'}>دسته‌بندی مفهومی و ذخیره‌سازی دانش</span>
                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* Confirm upload buttons */}
                {pipelineStage === 'idle' && (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={handleRemoveFile}
                      className="px-4 py-2 border border-slate-100/80 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-200/60 cursor-pointer shadow-xs transition-all"
                    >
                      انصراف
                    </button>
                    <Button
                      onClick={handleStartPipeline}
                      disabled={!uploadClassId || classes.length === 0}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer"
                    >
                      شروع بارگذاری و پردازش
                    </Button>
                  </div>
                )}

              </Card>
            )}

            {/* Quick tips */}
            <div className="bg-slate-50 rounded-2xl p-4 text-right flex items-start gap-3 border border-slate-200/40">
              <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                 <span className="text-xs font-black text-slate-800 block">درباره فرآیند بارگذاری و پردازش</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold mt-1">
                  پس از تایید فایل صوتی، فرآیند تبدیل گفتار به متن به صورت کاملاً غیرهمزمان در پس‌زمینه اجرا می‌شود و به هیچ عنوان صفحه شما منجمد نخواهد شد. مدت زمان مصرف‌شده مستقیماً از سهمیه لایسنس شما کسر می‌گردد.
                </p>
              </div>
            </div>

            {/* LIVE BACKGROUND JOBS PROCESSING QUEUE */}
            {jobs.length > 0 && (
              <div className="pt-6 space-y-4 text-right">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                    </span>
                    <span>صف پردازش و تحلیل همزمان جلسات</span>
                  </h3>
                  <button
                    onClick={() => {
                      ProcessingQueueService.clearFinishedJobs();
                    }}
                    className="text-[10px] text-slate-450 hover:text-indigo-600 font-black cursor-pointer transition-colors"
                  >
                    پاک کردن تاریخچه فرآیندها
                  </button>
                </div>

                <div className="space-y-4">
                  {jobs.map((job) => {
                    const pct = (() => {
                      switch (job.stage) {
                        case 'uploading': return 10;
                        case 'queued': return 20;
                        case 'preparing': return 30;
                        case 'uploading_audio': return 40;
                        case 'transcribing': return 55;
                        case 'generating_transcript': return 70;
                        case 'chunking': return 80;
                        case 'embedding': return 85;
                        case 'indexing': return 90;
                        case 'saving_metadata': return 95;
                        case 'completed': return 100;
                        case 'failed': return 100;
                        default: return 0;
                      }
                    })();

                    const stageLabel = (() => {
                      switch (job.stage) {
                        case 'uploading': return 'در حال بارگذاری فایل صوتی...';
                        case 'queued': return 'در صف انتظار پردازش هوشمند';
                        case 'preparing': return 'آماده‌سازی برای پردازش';
                        case 'uploading_audio': return 'ذخیره‌سازی امن فایل صوتی';
                        case 'transcribing': return 'تبدیل دقیق گفتار به متن فارسی';
                        case 'generating_transcript': return 'ساخت رونوشت زمانی گفتار';
                        case 'chunking': return 'ساختاردهی و تفکیک محتوا';
                        case 'embedding': return 'دسته‌بندی مفهومی اطلاعات';
                        case 'indexing': return 'ذخیره‌سازی هوشمند اطلاعات';
                        case 'saving_metadata': return 'به‌روزرسانی نهایی اطلاعات کلاس';
                        case 'completed': return 'فرآیند با موفقیت پایان یافت ✔️';
                        case 'failed': return 'خطایی رخ داد؛ پردازش لغو شد';
                        default: return 'در حال تحلیل متن و صوت...';
                      }
                    })();

                    const isRunning = !['completed', 'failed'].includes(job.stage);

                    return (
                      <Card key={job.id} className="border border-slate-200/50 dark:border-white/5 bg-white dark:bg-white/[0.03] p-5 rounded-2xl space-y-4 relative overflow-hidden">
                        
                        {/* Background progress tint for premium touch */}
                        {isRunning && (
                          <div 
                            className="absolute inset-y-0 right-0 bg-indigo-50/15 dark:bg-indigo-500/[0.06] transition-all duration-1000 ease-out z-0"
                            style={{ width: `${pct}%` }}
                          />
                        )}

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100/50 dark:border-white/5">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">{job.name}</span>
                            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                              <span>کلاس: {job.className}</span>
                              <span>•</span>
                              <span>حجم: {toPersianDigits((job.fileSize / (1024 * 1024)).toFixed(1))} مگابایت</span>
                              <span>•</span>
                              <span>مدت: {toPersianDigits(Math.floor(job.duration / 60))} دقیقه</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {job.stage === 'completed' ? (
                              <button
                                onClick={() => onNavigate('classes', { openClassId: job.classId })}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 text-emerald-700 text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>برو به کلاس</span>
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            ) : job.stage === 'failed' ? (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100/60 px-2 py-0.5 rounded-md">
                                ناموفق
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-black">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>موقعیت در صف: {toPersianDigits(job.queuePosition)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Real-time Stage & Progress Bar */}
                        <div className="relative z-10 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className={isRunning ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}>
                              {stageLabel}
                            </span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              {toPersianDigits(pct)}٪
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                job.stage === 'failed' ? 'bg-rose-500' : 
                                job.stage === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {/* Extra Metadata Row */}
                          <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold pt-1">
                            <span>زمان سپری شده: {toPersianDigits(job.elapsedTime)} ثانیه</span>
                            {isRunning && (
                              <span>تخمین زمان باقی‌مانده: {toPersianDigits(job.estimatedTimeRemaining)} ثانیه</span>
                            )}
                          </div>
                        </div>

                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};