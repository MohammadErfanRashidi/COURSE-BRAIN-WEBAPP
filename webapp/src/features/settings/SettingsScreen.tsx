/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  User as UserIcon, 
  GraduationCap, 
  HelpCircle, 
  Eye, 
  Sliders, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  Building,
  BookOpen,
  Calendar,
  Layers,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { useAuthStore } from '../../store/authStore';
import { AcademicService } from '../../services/api';
import { University, Major, Semester, User } from '../../types';

export const SettingsScreen: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  
  // Academic selections lists loaded from service
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('bachelor');

  // Accessibility State (Stored in localStorage)
  const [density, setDensity] = useState<'cozy' | 'standard' | 'spacious'>('standard');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [uniList, majorList, semList] = await Promise.all([
          AcademicService.getUniversities(),
          AcademicService.getMajors(),
          AcademicService.getSemesters()
        ]);
        setUniversities(uniList);
        setMajors(majorList);
        setSemesters(semList);

        // Populate existing user data
        if (user) {
          setFullName(user.fullName || '');
          if (user.academicProfile) {
            setSelectedUniversity(user.academicProfile.universityId);
            setSelectedMajor(user.academicProfile.majorId);
            setSelectedSemester(user.academicProfile.semesterId);
            setSelectedDegree(user.academicProfile.degree || 'bachelor');
          }
        }

        // Hydrate Accessibility Settings
        const savedDensity = localStorage.getItem('cb_pref_density') as any;
        if (savedDensity) setDensity(savedDensity);
        
        const savedAnim = localStorage.getItem('cb_pref_animations');
        if (savedAnim !== null) setAnimationsEnabled(savedAnim === 'true');

      } catch (err: any) {
        setError(err.message || 'خطا در دریافت الگوهای آکادمیک دانشگاهی');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const selectedUniName = universities.find(u => u.id === selectedUniversity)?.name || '';
      const selectedMajorName = majors.find(m => m.id === selectedMajor)?.name || '';
      const selectedSemesterName = semesters.find(s => s.id === selectedSemester)?.name || '';

      const updatedUser: User = {
        ...user,
        fullName: fullName.trim(),
        academicProfile: {
          universityId: selectedUniversity,
          universityName: selectedUniName,
          degree: selectedDegree,
          majorId: selectedMajor,
          majorName: selectedMajorName,
          semesterId: selectedSemester,
          semesterName: selectedSemesterName,
          classIds: user.academicProfile?.classIds || [],
          classes: user.academicProfile?.classes || []
        }
      };

      // Save to API simulated storage
      updateUser(updatedUser);
      localStorage.setItem('cb_user_data', JSON.stringify(updatedUser));
      localStorage.setItem(`cb_user_${user.phoneNumber}`, JSON.stringify(updatedUser));

      setSuccessMsg('تغییرات پروفایل آکادمیک و اطلاعات فردی شما با موفقیت ذخیره شد.');
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت پروفایل جدید');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleSaveAccessibility = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    localStorage.setItem('cb_pref_density', density);
    localStorage.setItem('cb_pref_animations', String(animationsEnabled));
    setSuccessMsg('تنظیمات دسترسی و تراکم رابط کاربری با موفقیت اعمال شد.');
    
    // Dispatch custom event to trigger dynamic updates in the layout
    window.dispatchEvent(new Event('cb_pref_changed'));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 font-sans text-right p-1">
        {/* Settings Header Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-lg self-start" />
          <div className="h-4 w-72 bg-slate-100 animate-pulse rounded-md self-start" />
        </div>

        {/* Form settings panel */}
        <div className="border border-slate-100/80 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
          <div className="h-4 w-36 bg-slate-250 animate-pulse rounded-md" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-slate-150 animate-pulse rounded-md" />
                <div className="h-11 w-full bg-slate-50 border border-slate-100/50 animate-pulse rounded-xl" />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-50">
            <div className="h-10 w-28 bg-indigo-50 border border-indigo-100/30 text-indigo-600 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-right animate-in fade-in duration-300">
      
      {/* Settings Header */}
      <div className="border-b border-slate-100/50 pb-5">
        <h1 className="text-xl font-black text-slate-900">تنظیمات سیستم و پروفایل</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          مشخصات علمی دانشگاهی، اولویت‌های نمایش و ابزارهای دسترسی‌پذیری خود را شخصی‌سازی کنید.
        </p>
      </div>

      {/* ERROR / SUCCESS TOASTS */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100/60 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100/60 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RIGHT COLUMN: PROFILE & ACADEMIC FORM */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile}>
            <Card className="border border-slate-100/80 bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
              
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100/50">
                <UserIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-black text-slate-800">مشخصات تحصیلی و شناسنامه‌ای</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full Name Input */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 block">نام و نام خانوادگی دانشجو</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="مثال: امیرحسین علوی"
                    className="w-full bg-white border border-slate-200/40 rounded-xl px-4 py-2.5 text-xs text-slate-750 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200 font-bold"
                  />
                </div>

                {/* Degree Selection */}
                <div className="space-y-1.5">
                  <Select
                    label="مقطع تحصیلی"
                    placeholder="مقطع تحصیلی خود را انتخاب کنید"
                    options={[
                      { value: 'associate', label: 'کاردانی' },
                      { value: 'bachelor', label: 'کارشناسی (لیسانس)' },
                      { value: 'master', label: 'کارشناسی ارشد (فوق لیسانس)' },
                      { value: 'phd', label: 'دکتری تخصصی (PhD)' },
                    ]}
                    value={selectedDegree}
                    onChange={setSelectedDegree}
                    searchable={false}
                  />
                </div>

                {/* University Selector */}
                <div className="space-y-1.5">
                  <Select
                    label="مؤسسه یا دانشگاه محل تحصیل"
                    placeholder="-- انتخاب دانشگاه --"
                    options={universities.map(uni => ({ value: uni.id, label: uni.name }))}
                    value={selectedUniversity}
                    onChange={setSelectedUniversity}
                    searchable
                    required
                  />
                </div>

                {/* Major Selector */}
                <div className="space-y-1.5">
                  <Select
                    label="رشته تخصصی تحصیلی"
                    placeholder="-- انتخاب رشته تحصیلی --"
                    options={majors.map(mj => ({ value: mj.id, label: mj.name }))}
                    value={selectedMajor}
                    onChange={setSelectedMajor}
                    searchable
                    required
                  />
                </div>

                {/* Semester Selector */}
                <div className="space-y-1.5">
                  <Select
                    label="نیمسال تحصیلی فعال"
                    placeholder="-- انتخاب نیمسال جاری --"
                    options={semesters.map(sem => ({ value: sem.id, label: sem.name }))}
                    value={selectedSemester}
                    onChange={setSelectedSemester}
                    searchable
                    required
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100/50 flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSubmitLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>ذخیره مشخصات دانشجویی</span>
                </Button>
              </div>

            </Card>
          </form>
        </div>

        {/* LEFT COLUMN: ACCESSIBILITY PREFERENCES */}
        <div className="space-y-6">
          
          <form onSubmit={handleSaveAccessibility}>
            <Card className="border border-slate-100/80 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 text-right">
              
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100/50">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-black text-slate-800">اولویت‌های دسترسی و رابط</h3>
              </div>

              {/* Theme preference */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 block">پوسته بصری فعال</span>
                <div className="p-3 bg-slate-50/50 border border-slate-100/60 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between shadow-xs">
                  <span>تم مینیمال روشن (Soft Light)</span>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md">پیش‌فرض پایدار</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal font-bold">
                  * جهت حفظ سلامت و ارگونومی چشم در زمان مرور طولانی رونوشت‌ها، لایوت اصلی در این فاز بر روی رنگ خنثی سافت لایت قفل شده است.
                </p>
              </div>

              {/* Language preference */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 block">زبان پیش‌فرض هوش مصنوعی</span>
                <div className="p-3 bg-slate-50/50 border border-slate-100/60 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between shadow-xs">
                  <span>فارسی (RTL - راست‌چین)</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">بومی</span>
                </div>
              </div>

              {/* Layout density preference */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 block">تراکم فاصله‌ها و لایوت (Density)</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100/80 border border-slate-100/50 p-1 rounded-xl">
                  {['cozy', 'standard', 'spacious'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDensity(opt as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        density === opt ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {opt === 'cozy' ? 'فشرده' : opt === 'standard' ? 'استاندارد' : 'عریض'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle micro-animations */}
              <div className="flex items-center justify-between p-1">
                <div>
                  <span className="text-xs font-black text-slate-800 block">افکت‌های حرکتی و انیمیشن</span>
                  <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">فعال‌سازی لود کارهای حرکتی Framer Motion</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={animationsEnabled}
                    onChange={(e) => setAnimationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100/50">
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-black text-white hover:text-slate-50 text-xs font-black rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  ذخیره تنظیمات دسترسی
                </button>
              </div>

            </Card>
          </form>

        </div>

      </div>

    </div>
  );
};