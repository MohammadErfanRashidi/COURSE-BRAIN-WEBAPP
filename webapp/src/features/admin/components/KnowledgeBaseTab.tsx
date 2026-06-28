/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  Trash2, 
  RefreshCw, 
  Database, 
  Tag, 
  Sliders,
  Sparkles,
  BookOpen,
  Plus,
  Play,
  FileCheck
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Select } from '../../../components/Select';
import { TextbookKnowledge } from '../types';

export const KnowledgeBaseTab: React.FC = () => {
  const [textbooks, setTextbooks] = useState<TextbookKnowledge[]>([
    {
      id: 'tx_1',
      title: 'اصول و مبانی مهندسی نرم‌افزار پرسمن',
      subject: 'مهندسی کامپیوتر',
      fileName: 'pressman_software_eng_9th.pdf',
      fileSize: 18.5, // MB
      chunkCount: 2450,
      embeddingCount: 2450,
      status: 'INDEXED',
      progress: 100,
      version: 'نسخه ۹ ویرایش دوم',
      uploadedAt: '۱۴۰۵/۰۲/۱۵'
    },
    {
      id: 'tx_2',
      title: 'بیولوژی عمومی کمپبل - ساختار سلولی',
      subject: 'زیست‌شناسی',
      fileName: 'campbell_biology_cell.pdf',
      fileSize: 42.1,
      chunkCount: 5610,
      embeddingCount: 5610,
      status: 'INDEXED',
      progress: 100,
      version: 'ویرایش دوازدهم رسمی',
      uploadedAt: '۱۴۰۵/۰۳/۰۱'
    },
    {
      id: 'tx_3',
      title: 'فیزیک هالیدی - جلد اول مکانیک',
      subject: 'فیزیک عمومی',
      fileName: 'halliday_physics_vol1.pdf',
      fileSize: 24.8,
      chunkCount: 0,
      embeddingCount: 0,
      status: 'EMBEDDING',
      progress: 68,
      version: 'ویرایش دهم فارسی',
      uploadedAt: '۱۴۰۵/۰۴/۰۲'
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('مهندسی کامپیوتر');
  const [newVersion, setNewVersion] = useState('ویرایش اول');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedFile) {
      alert('لطفا عنوان رفرنس و فایل درسی را مشخص فرمایید.');
      return;
    }

    setUploadProgress(10);
    setUploadStep('در حال آپلود فایل PDF به سرور...');

    // Phase 1: Uploading
    setTimeout(() => {
      setUploadProgress(35);
      setUploadStep('بارگذاری کامل شد. در حال استخراج متون...');
      
      // Phase 2: Extraction
      setTimeout(() => {
        setUploadProgress(55);
        setUploadStep('قطعه‌بندی محتوا بر اساس سرفصل‌ها...');
        
        // Phase 3: Chunking
        setTimeout(() => {
          setUploadProgress(80);
          setUploadStep('تولید و استخراج محتوای هوشمند...');
          
          // Phase 4: Ingestion/Indexing
          setTimeout(() => {
            setUploadProgress(100);
            setUploadStep('پایان عملیات: با موفقیت در کتابخانه هوشمند ثبت شد.');
            
            // Add to list
            const newDoc: TextbookKnowledge = {
              id: `tx_${Date.now()}`,
              title: newTitle,
              subject: newSubject,
              fileName: selectedFile,
              fileSize: 12.5,
              chunkCount: 1420,
              embeddingCount: 1420,
              status: 'INDEXED',
              progress: 100,
              version: newVersion,
              uploadedAt: 'امروز'
            };

            setTextbooks(prev => [newDoc, ...prev]);
            
            // Reset fields
            setTimeout(() => {
              setUploadProgress(null);
              setNewTitle('');
              setSelectedFile(null);
            }, 2000);

          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('آیا از حذف این منبع آموزشی و اطلاعات نمایه‌سازی شده آن اطمینان دارید؟')) {
      setTextbooks(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Ingestion Control (Left, 1 column) */}
        <Card className="p-5 border border-slate-200/50 bg-white rounded-2xl text-right space-y-4">
          <div>
            <h4 className="text-xs font-black text-slate-800">بارگذاری و افزودن کتاب جدید</h4>
            <span className="text-[9px] text-slate-400 font-bold block mt-0.5">افزودن خودکار مرجع آموزشی جدید به پایگاه دانش هوش مصنوعی</span>
          </div>

          <form onSubmit={handleSimulateUpload} className="space-y-3">
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">عنوان کتاب مرجع:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: طراحی الگوریتم نیپولیتان"
                className="w-full text-right bg-slate-50 border border-slate-200/50 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-bold outline-none transition-all placeholder:text-slate-300 text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Select
                  label="رشته تحصیلی:"
                  options={[
                    { value: 'مهندسی کامپیوتر', label: 'کامپیوتر' },
                    { value: 'پزشکی عمومی', label: 'پزشکی' },
                    { value: 'زیست‌شناسی', label: 'زیست‌شناسی' },
                    { value: 'فیزیک عمومی', label: 'فیزیک' },
                  ]}
                  value={newSubject}
                  onChange={setNewSubject}
                  searchable={false}
                  size="sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">نگارش / نسخه:</label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="ویرایش نهم"
                  className="w-full text-right bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-bold outline-none placeholder:text-slate-300 text-slate-800"
                />
              </div>
            </div>

            {/* Simulated file selector click */}
            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-bold text-slate-500 block">فایل کتاب درسی (PDF):</label>
              {selectedFile ? (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100/60 rounded-xl flex items-center justify-between text-xs font-bold text-indigo-900">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>{selectedFile}</span>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-[10px] text-rose-600 font-extrabold hover:underline">تغییر</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedFile('algorithm_design_clrs_4th.pdf')}
                  className="w-full border-2 border-dashed border-slate-200/50 hover:border-indigo-400 py-6 rounded-2xl flex flex-col items-center justify-center text-slate-450 hover:text-indigo-600 transition-all cursor-pointer bg-slate-50/50"
                >
                  <UploadCloud className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-black">انتخاب و کشیدن فایل کتاب به اینجا</span>
                  <span className="text-[8px] text-slate-400 font-semibold mt-1">پسوندهای مجاز: فقط PDF (حداکثر ۱۰۰ مگابایت)</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={uploadProgress !== null}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
            >
              شروع خودکار عملیات پردازش متون
            </button>

          </form>

          {/* Live Ingestion Steps Tracker */}
          {uploadProgress !== null && (
            <div className="p-4 bg-slate-50 border border-indigo-100/60 rounded-2xl space-y-3 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-indigo-600">روند پیشرفت عملیات</span>
                <span className="text-[10px] font-mono text-slate-800 font-bold">{toPersianDigits(uploadProgress)}٪</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-1000" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-slate-500 font-black leading-relaxed">{uploadStep}</p>
            </div>
          )}

        </Card>

        {/* Existing Textbook knowledge list (Right, 2 columns) */}
        <Card className="lg:col-span-2 p-5 border border-slate-200/50 bg-white rounded-2xl text-right space-y-4">
          <div>
            <h4 className="text-xs font-black text-slate-800">کتاب‌های مرجع ثبت شده در سیستم</h4>
            <span className="text-[9px] text-slate-400 font-bold block mt-0.5">مشاهده حجم اطلاعات، تعداد قطعات و نسخه‌های فعال</span>
          </div>

          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {textbooks.map((b) => (
              <div key={b.id} className="p-4 border border-slate-200/40 bg-slate-50/50 hover:bg-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-slate-900">{b.title}</h5>
                    <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                      <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md border border-indigo-100/60">رشته: {b.subject}</span>
                      <span className="text-slate-400">فایل: {b.fileName} ({toPersianDigits(b.fileSize)} مگابایت)</span>
                      <span className="text-slate-400">نسخه: {b.version}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100/50">
                  <div className="text-right sm:text-left">
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-md font-bold block">
                      پردازش کامل ({toPersianDigits(b.chunkCount)} قطعه)
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1 font-semibold">ثبت در {toPersianDigits(b.uploadedAt)}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteBook(b.id)}
                    className="w-7 h-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg flex items-center justify-center border border-slate-200/40 hover:border-rose-100/60 transition-colors cursor-pointer"
                    title="حذف کتاب و اطلاعات آن"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </Card>

      </div>

    </div>
  );
};
