/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, AlertTriangle, Check, ListChecks, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select, SelectOption } from '../../components/Select';
import { AcademicService } from '../../services/api';
import { University, Major, Semester, Class } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface AcademicScreenProps {
  onComplete: () => void;
}

export const AcademicScreen: React.FC<AcademicScreenProps> = ({ onComplete }) => {
  const { updateUser } = useAuthStore();
  
  // Wizards steps: 1 = Basic Info, 2 = Classes Selection
  const [step, setStep] = useState(1);
  
  // Form States
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Database Master Data lists
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);

  // Visual/Logic states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const degreeOptions: SelectOption[] = [
    { value: 'associate', label: 'کاردانی' },
    { value: 'bachelor', label: 'کارشناسی (لیسانس)' },
    { value: 'master', label: 'کارشناسی ارشد (فوق لیسانس)' },
    { value: 'phd', label: 'دکتری تخصصی (PhD)' },
  ];

  // Fetch initial profile data (Universities, Majors, Semesters)
  useEffect(() => {
    async function loadMasterData() {
      setIsLoadingData(true);
      try {
        const [uniList, majorList, semList] = await Promise.all([
          AcademicService.getUniversities(),
          AcademicService.getMajors(),
          AcademicService.getSemesters(),
        ]);
        setUniversities(uniList);
        setMajors(majorList);
        setSemesters(semList);
      } catch (err) {
        setFormError('خطا در دریافت لیست اطلاعات دانشگاهی از سرور.');
      } finally {
        setIsLoadingData(false);
      }
    }
    loadMasterData();
  }, []);

  // Fetch classes when semester changes
  useEffect(() => {
    if (!selectedSemester) return;
    
    async function loadClasses() {
      setIsLoadingClasses(true);
      setSelectedClasses([]); // Reset selected classes when semester changes
      try {
        const classesList = await AcademicService.getClasses(selectedSemester);
        setAvailableClasses(classesList);
      } catch (err) {
        setFormError('خطا در دریافت لیست دروس ترم.');
      } finally {
        setIsLoadingClasses(false);
      }
    }
    loadClasses();
  }, [selectedSemester]);

  const handleNextStep = () => {
    setFormError('');
    if (!selectedUniversity || !selectedDegree || !selectedMajor || !selectedSemester) {
      setFormError('لطفاً تمامی فیلدهای اطلاعات دانشگاهی را پر کنید.');
      return;
    }
    setStep(2);
  };

  const handleClassToggle = (classId: string) => {
    setFormError('');
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    } else {
      // Enforce premium subscription limit of maximum 5 classes
      if (selectedClasses.length >= 5) {
        setFormError('شما در طرح پایه‌ای اشتراک حداکثر مجاز به انتخاب ۵ درس هستید.');
        return;
      }
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handleOnboardingSubmit = async () => {
    setFormError('');
    if (selectedClasses.length === 0) {
      setFormError('لطفاً حداقل ۱ درس را برای این ترم تحصیلی خود انتخاب کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await AcademicService.submitOnboarding({
        universityId: selectedUniversity,
        degree: selectedDegree,
        majorId: selectedMajor,
        semesterId: selectedSemester,
        classIds: selectedClasses,
      });
      updateUser(updatedUser);
      onComplete();
    } catch (err: any) {
      setFormError(err.message || 'خطا در ثبت پروفایل دانشگاهی تحصیلی شما.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  // Map options for custom search selects
  const universityOptions = universities.map(u => ({ value: u.id, label: u.name }));
  const majorOptions = majors.map(m => ({ value: m.id, label: m.name }));
  const semesterOptions = semesters.map(s => ({ value: s.id, label: s.name }));

  if (isLoadingData) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 flex flex-col justify-center min-h-[80vh] font-sans">
        <Card className="border border-slate-100/80 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-8 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <GraduationCap className="w-10 h-10 text-indigo-600 animate-pulse" />
            <div className="h-5 w-48 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-13 w-full bg-slate-50 rounded-2xl border border-slate-200/50 animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 flex flex-col justify-center min-h-[85vh] font-sans">
      <Card className="border border-slate-100/80 shadow-[0_24px_60px_rgba(0,0,0,0.05)] relative">
        
        {/* Step Indicator Top */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/60">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">تشکیل پرونده تحصیلی</h2>
              <p className="text-[10px] text-slate-400 font-bold">مرحله {toPersianDigits(step)} از ۲</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 w-6 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* Step 1: Academic Data Setup */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-1 duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">مشخصات تحصیلی شما</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                رایا با دانستن دانشگاه و رشته تحصیلی، دستیار هوش مصنوعی شما را بر مبنای سرفصل‌های مصوب آموزش عالی همگام‌سازی می‌کند.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100/60 rounded-2xl text-xs text-rose-600 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4">
              <Select
                label="دانشگاه محل تحصیل"
                placeholder="نام دانشگاه خود را جستجو یا انتخاب کنید"
                options={universityOptions}
                value={selectedUniversity}
                onChange={setSelectedUniversity}
                searchPlaceholder="مثال: دانشگاه تهران..."
              />

              <Select
                label="مقطع تحصیلی"
                placeholder="مقطع تحصیلی خود را انتخاب کنید"
                options={degreeOptions}
                value={selectedDegree}
                onChange={setSelectedDegree}
                searchable={false}
              />

              <Select
                label="رشته تحصیلی"
                placeholder="رشته تحصیلی خود را جستجو یا انتخاب کنید"
                options={majorOptions}
                value={selectedMajor}
                onChange={setSelectedMajor}
                searchPlaceholder="مثال: مهندسی کامپیوتر..."
              />

              <Select
                label="نیمسال تحصیلی جاری"
                placeholder="نیمسال فعلی تحصیلی خود را انتخاب کنید"
                options={semesterOptions}
                value={selectedSemester}
                onChange={setSelectedSemester}
                searchable={false}
              />
            </div>

            <Button
              onClick={handleNextStep}
              fullWidth
              className="mt-6"
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
            >
              مرحله بعد: انتخاب دروس این ترم
            </Button>
          </div>
        )}

        {/* Step 2: Subject/Classes Selection */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-left-1 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">انتخاب دروس نیمسال تحصیلی</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  دروس در حال تحصیل این ترم خود را مشخص کنید (کلاس‌های مصوب دانشگاهی).
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl font-bold cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>قبلی</span>
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100/60 rounded-2xl text-xs text-rose-600 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Premium Notice Banner */}
            <div className="p-3.5 bg-slate-50/50 border border-slate-100/80 rounded-2xl flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-700 block">طرح استاندارد رایا</span>
                <span className="text-[10px] text-slate-400 block leading-relaxed mt-0.5">
                  شما مجاز به تعریف حداکثر <strong className="text-slate-800 font-black">۵ کلاس مجزا</strong> برای ضبط و پرسش‌و‌پاسخ هستید. ({toPersianDigits(selectedClasses.length)} از ۵ انتخاب شده)
                </span>
              </div>
            </div>

            {isLoadingClasses ? (
              <div className="space-y-2 py-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : availableClasses.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto no-scrollbar py-1">
                {availableClasses.map((item) => {
                  const isChecked = selectedClasses.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleClassToggle(item.id)}
                      className={`
                        p-3.5 rounded-2xl border text-right cursor-pointer select-none flex items-center justify-between transition-all duration-200
                        ${isChecked 
                          ? 'border-indigo-500 bg-indigo-50/20 shadow-xs' 
                          : 'border-slate-100/80 bg-white hover:border-slate-200/60 hover:bg-slate-50/10'
                        }
                      `}
                    >
                      <div>
                        <span className={`text-xs font-bold block ${isChecked ? 'text-indigo-800 font-black' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          استاد: {item.instructor || 'مشخص نشده'} | کد درس: {toPersianDigits(item.code || '')}
                        </span>
                      </div>
                      
                      <div className={`
                        w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150
                        ${isChecked ? 'border-indigo-500 bg-indigo-500 text-white scale-105' : 'border-slate-300 bg-slate-50'}
                      `}>
                        {isChecked && <Check className="w-3.5 h-3.5 animate-in fade-in zoom-in-50 duration-150" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                هیچ درسی برای این نیمسال ثبت نشده است. ابتدا نیمسال دیگری انتخاب کنید.
              </div>
            )}

            <Button
              onClick={handleOnboardingSubmit}
              fullWidth
              isLoading={isSubmitting}
              disabled={selectedClasses.length === 0 || isSubmitting}
              icon={<ListChecks className="w-5 h-5" />}
              iconPosition="left"
              className="mt-6"
            >
              ثبت نهایی و ورود به سامانه
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
