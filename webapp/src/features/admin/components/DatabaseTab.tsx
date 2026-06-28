/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  RotateCw, 
  Layers, 
  Server, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Terminal,
  Activity,
  FileText
} from 'lucide-react';
import { Card } from '../../../components/Card';

export const DatabaseTab: React.FC = () => {
  const [isReindexing, setIsReindexing] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [slowQueryLog, setSlowQueryLog] = useState([
    { id: 1, duration: '۳.۴ ثانیه', query: 'SELECT * FROM recordings JOIN classes ON recordings.class_id = classes.id WHERE classes.university_id = $1 ORDER BY recordings.created_at DESC', table: 'recordings', timestamp: '۱۰ دقیقه پیش' },
    { id: 2, duration: '۱.۹ ثانیه', query: 'SELECT chunk_text, embedding_distance FROM chroma_embeddings WHERE text_vector <=> $1 LIMIT 5', table: 'chromadb', timestamp: '۳۵ دقیقه پیش' },
  ]);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const handleReindex = () => {
    setIsReindexing(true);
    setTimeout(() => {
      setIsReindexing(false);
      alert('تمامی خزانه‌های دانش با موفقیت بهینه‌سازی و بازنشانی شدند.');
    }, 2500);
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 block">پایگاه داده PostgreSQL</span>
              <span className="text-sm font-black text-slate-800">۱۸.۴ مگابایت مصرف هارد</span>
              <span className="text-[9px] text-emerald-600 font-bold block">۹ اتصـال فعال (تست شده)</span>
            </div>
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Database className="w-4.5 h-4.5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 block">پایگاه دانش هوشمند</span>
              <span className="text-sm font-black text-slate-800">۶ کالکشن تخصصی فعال</span>
              <span className="text-[9px] text-indigo-600 font-bold block">۳۴,۵۰۰ قطعه اطلاعات ثبت شده</span>
            </div>
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/50 bg-white rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 block">متوسط زمان پاسخ هوشمند</span>
              <span className="text-sm font-black text-slate-800">۱۴۰ میلی‌ثانیه جستجوی هوشمند</span>
              <span className="text-[9px] text-emerald-600 font-bold block">نرخ بازخوانی درست: ۹۹.۴٪</span>
            </div>
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-100/60 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ChromaDB Collections */}
        <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl text-right space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
            <div>
              <h4 className="text-xs font-black text-slate-800">خزانه‌های دانش هوشمند</h4>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">مدیریت مخازن، دسته‌بندی و جستجوی دانش</span>
            </div>

            <button
              onClick={handleReindex}
              disabled={isReindexing}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[10px] font-black rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin' : ''}`} />
              <span>{isReindexing ? 'درحال بهینه‌سازی...' : 'بهینه‌سازی دانش'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {[
              { name: 'biology_textbooks_v1', count: '۱۲,۴۰۰ قطعه', size: '۴.۲ مگابایت', distance: 'L2 Distance' },
              { name: 'computer_science_v2', count: '۸,۹۰۰ قطعه', size: '۲.۹ مگابایت', distance: 'Cosine Similarity' },
              { name: 'physics_mechanics_v1', count: '۶,۱۰۰ قطعه', size: '۱.۸ مگابایت', distance: 'Cosine Similarity' },
              { name: 'general_anatomy_v1', count: '۷,۱۰۰ قطعه', size: '۲.۱ مگابایت', distance: 'Cosine Similarity' },
            ].map((col, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedCollection(col.name)}
                className={`p-3 border rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                  selectedCollection === col.name 
                    ? 'bg-indigo-50/50 border-indigo-200/50 text-indigo-900' 
                    : 'bg-slate-50/50 border-slate-200/40 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="block font-mono text-[11px] text-slate-900">{col.name}</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">فرمول مقایسه: {col.distance}</span>
                </div>
                <div className="text-left">
                  <span className="text-slate-800 block">{toPersianDigits(col.count)}</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">فضای دیسک: {toPersianDigits(col.size)}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedCollection && (
            <div className="bg-slate-900 text-white p-3 rounded-xl text-[10px] font-mono space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400">
                <span>نمای فراداده (Metadata) کالکشن:</span>
                <button onClick={() => setSelectedCollection(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <div>Collection Name: {selectedCollection}</div>
              <div>Distance Metric: Cosine</div>
              <div>Dimensionality: 1536 (Ollama / RAYA Embedding Compatibility)</div>
              <div>Auto Ingestion Trigger: Enabled</div>
            </div>
          )}
        </Card>

        {/* PostgreSQL Sizing & Slow queries */}
        <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl text-right space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
            <div>
              <h4 className="text-xs font-black text-slate-800">کوئری‌های کند و ابزارهای عیب‌یابی SQL</h4>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">رصد کوئری‌های پرهزینه بالای ۱.۵ ثانیه</span>
            </div>
            <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100/60 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>۲ هشدار بهینه‌سازی</span>
            </span>
          </div>

          <div className="space-y-3">
            {slowQueryLog.map((log) => (
              <div key={log.id} className="p-3 bg-rose-50/40 border border-rose-100/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-rose-600 bg-rose-100/50 px-1.5 py-0.5 rounded-sm">تاخیر: {toPersianDigits(log.duration)}</span>
                  <span className="text-slate-400 font-semibold">{log.timestamp}</span>
                </div>
                <p className="text-[10px] font-mono text-slate-600 bg-white p-2 border border-slate-200/40 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed text-left" dir="ltr">
                  {log.query}
                </p>
                <div className="text-[9px] text-slate-400 font-bold flex items-center justify-between">
                  <span>جدول هدف: <code className="text-slate-700 bg-slate-100 px-1 rounded-sm">{log.table}</code></span>
                  <button className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer">انجام بررسی ایندکس گذاری</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200/40 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
            <span>بررسی وضعیت دوره‌ای جداول (VACUUM ANALYZE)</span>
            <button className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-black cursor-pointer transition-colors">
              اجرا
            </button>
          </div>
        </Card>

      </div>

    </div>
  );
};
