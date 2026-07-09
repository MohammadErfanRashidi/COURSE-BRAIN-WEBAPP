/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GraduationCap, AlertTriangle, CheckCircle, User, ChevronRight } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { AcademicService } from '../../services/api';
import { University } from '../../types';
import { useAuthStore } from '../../store/authStore';

const OTHER_UNIVERSITY_ID = 'other';

interface AcademicScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export const AcademicScreen: React.FC<AcademicScreenProps> = ({ onComplete, onBack }) => {
  const { user, updateUser } = useAuthStore();

  // Form States
  const [fullName, setFullName] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [customUniversityName, setCustomUniversityName] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('md');

  // Database Master Data lists
  const [universities, setUniversities] = useState<University[]>([]);

  // Visual/Logic states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Derived — show custom uni input only when "سایر" is selected
  const isOtherSelected = selectedUniversity === OTHER_UNIVERSITY_ID;

  // Fetch initial profile data (Universities)
  useEffect(() => {
    async function loadMasterData() {
      setIsLoadingData(true);
      try {
        const uniList = await AcademicService.getUniversities();
        setUniversities(uniList);
      } catch (err) {
        setFormError('خطا در دریافت لیست اطلاعات دانشگاهی از سرور.');
      } finally {
        setIsLoadingData(false);
      }
    }
    loadMasterData();
  }, []);

  // Pre-fill form from existing profile data when returning from subscription
  useEffect(() => {
    const profile = user?.academicProfile;
    if (profile) {
      if (user.fullName) setFullName(user.fullName);
      if (profile.universityId) setSelectedUniversity(profile.universityId);
      if (profile.customUniversityName) setCustomUniversityName(profile.customUniversityName);
    }
  }, [user]);

  const handleOnboardingSubmit = async () => {
    setFormError('');
    if (!fullName.trim()) {
      setFormError('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }
    if (!selectedUniversity || !selectedDegree) {
      setFormError('لطفاً تمامی فیلدهای اطلاعات دانشگاهی را پر کنید.');
      return;
    }
    if (isOtherSelected && !customUniversityName.trim()) {
      setFormError('لطفاً نام دانشگاه خود را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await AcademicService.submitOnboarding({
        universityId: selectedUniversity,
        degree: selectedDegree,
        fullName: fullName.trim(),
        customUniversityName: isOtherSelected ? customUniversityName.trim() : undefined,
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
            {[1, 2, 3].map(i => (
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
      <Card className="border border-slate-100/80 shadow-[0_24px_60px_rgba(0,0,0,0.05)] relative p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/60">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">تشکیل پرونده تحصیلی</h2>
              <p className="text-[10px] text-slate-400 font-bold">مرحله {toPersianDigits(1)} از {toPersianDigits(1)}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-100/80 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>بازگشت</span>
          </button>
        </div>

        {/* Single Step: Academic Data Setup */}
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">مشخصات فردی و تحصیلی شما</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              نام، دانشگاه و مقطع تحصیلی خود را برای شخصیسازی و همگامسازی زیوای مشخص کنید.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100/60 rounded-2xl text-xs text-rose-600 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 block">نام و نام خانوادگی <span className="text-rose-500">*</span></label>
              <div className="relative flex items-center">
                <div className="absolute right-3 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="نام و نام خانوادگی"
                  className="w-full bg-slate-50 border border-slate-200/40 rounded-2xl pr-10 pl-4 py-3 text-xs text-slate-750 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200 font-bold"
                  dir="rtl"
                />
              </div>
            </div>

            <Select
              label="دانشگاه محل تحصیل"
              placeholder="نام دانشگاه خود را جستجو یا انتخاب کنید"
              options={universityOptions}
              value={selectedUniversity}
              onChange={(val) => {
                setSelectedUniversity(val);
                if (val !== OTHER_UNIVERSITY_ID) {
                  setCustomUniversityName('');
                }
              }}
              searchPlaceholder="مثال: دانشگاه تهران..."
              required
            />

            {/* Custom University Name Field — only when "سایر" is selected */}
            {isOtherSelected && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-[11px] font-black text-slate-500 block">نام دانشگاه <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={customUniversityName}
                  onChange={(e) => setCustomUniversityName(e.target.value)}
                  placeholder="نام دانشگاه خود را وارد کنید"
                  required
                  className="w-full bg-slate-50 border border-slate-200/40 rounded-2xl px-4 py-3 text-xs text-slate-750 outline-none focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200 font-bold"
                  dir="rtl"
                />
              </div>
            )}

            {/* Degree locked to MD */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 block">مقطع تحصیلی</label>
              <div className="w-full bg-slate-50 border border-slate-200/40 rounded-2xl px-4 py-3 text-xs text-slate-500 font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>دکترای پزشکی عمومی (MD)</span>
              </div>
              <span className="text-[9px] text-slate-400 block font-bold">
                زیوای در حال حاضر صرفاً از برنامه درسی دکترای پزشکی عمومی (MD) پشتیبانی میکند.
              </span>
            </div>
          </div>

          <Button
            onClick={handleOnboardingSubmit}
            fullWidth
            isLoading={isSubmitting}
            disabled={!fullName.trim() || !selectedUniversity || isSubmitting || (isOtherSelected && !customUniversityName.trim())}
            className="mt-6"
          >
            ثبت و ورود به سامانه
          </Button>
        </div>
      </Card>
    </div>
  );
};