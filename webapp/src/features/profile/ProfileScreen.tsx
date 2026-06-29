/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Award, 
  Clock, 
  BookOpen, 
  ChevronLeft,
  Mail,
  Building,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { useAuthStore } from '../../store/authStore';
import { AcademicService } from '../../services/api';
import { University, Major, Semester, User } from '../../types';
import { formatPersianDuration } from '../../utils/timeFormatter';

interface ProfileScreenProps {
  onNavigate: (tab: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { user, updateUser, subscriptionStatus } = useAuthStore();

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

        if (user) {
          setFullName(user.fullName || '');
          if (user.academicProfile) {
            setSelectedUniversity(user.academicProfile.universityId);
            setSelectedMajor(user.academicProfile.majorId);
            setSelectedSemester(user.academicProfile.semesterId);
            setSelectedDegree(user.academicProfile.degree || 'bachelor');
          }
        }
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت اطلاعات دانشگاهی');
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

      updateUser(updatedUser);
      localStorage.setItem('cb_user_data', JSON.stringify(updatedUser));
      localStorage.setItem(`cb_user_${user.phoneNumber}`, JSON.stringify(updatedUser));

      setSuccessMsg('مشخصات تحصیلی و فردی شما با موفقیت ذخیره شد.');
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت مشخصات');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 font-sans text-right animate-in fade-in duration-300">
      
      {/* Profile Header */}
      <div className="border-b border-slate-100/50 pb-5">
        <h1 className="text-xl font-black text-slate-900">پروفایل دانشجویی</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          اطلاعات شخصی، تحصیلی و مدیریت حساب کاربری خود را مشاهده و ویرایش کنید.
        </p>
      </div>

      {/* Error / Success Toasts */}
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
        
        {/* Right Column — Personal & Academic Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Card */}
          <Card className="border border-slate-100/80 bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100/60 rounded-3xl flex items-center justify-center text-indigo-600 shrink-0">
                <UserIcon className="w-8 h-8" />
              </div>
              <div className="text-right">
                <h2 className="text-base font-black text-slate-900">{user.fullName || 'دانشجوی رایا'}</h2>
                <p className="text-xs text-slate-400 font-bold mt-1">شناسه یکتا: {user.id}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 text-right">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>شماره تلفن همراه (تایید شده)</span>
                </span>
                <span className="text-xs font-black text-slate-800 block direction-ltr text-right">
                  {toPersianDigits(user.phoneNumber)}
                </span>
              </div>
            </div>
          </Card>

          {/* Educational Information — Editable Form */}
          <form onSubmit={handleSaveProfile}>
            <Card className="border border-slate-100/80 bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
              
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100/50">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-black text-slate-800">مشخصات تحصیلی و شناسنامه‌ای</h3>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-20 bg-slate-200 animate-pulse rounded-md" />
                      <div className="h-11 w-full bg-slate-50 border border-slate-100/50 animate-pulse rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
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
              )}

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

        {/* Left Sidebar — Subscription & Stats */}
        <div className="space-y-6">
          
          {/* Subscription Tier badge */}
          <Card className="border border-slate-100/80 bg-white rounded-3xl p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100/60 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">سطح عضویت کاربری</span>
              <span className="text-sm font-black text-slate-800 block mt-1">طرح دانشجویی استاندارد</span>
            </div>
            
            <div className="border-t border-slate-50 pt-3">
              <button
                onClick={() => onNavigate('subscription')}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 justify-center mx-auto cursor-pointer"
              >
                <span>مشاهده جزئیات مصرف و تمدید لایسنس</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
          </Card>

          {/* Academic Stats summary */}
          <Card className="border border-slate-100/80 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4 text-right">
            <span className="text-xs font-black text-slate-800 block pb-2 border-b border-slate-100/50">آمار خلاصه تحصیلی</span>
            
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">کلاس‌های ثبت‌شده</span>
              <span className="text-slate-800 font-black">
                {subscriptionStatus ? toPersianDigits(subscriptionStatus.usage.classesCount) : '۰'} کلاس
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">ضبط جلسات درسی</span>
              <span className="text-slate-800 font-black">
                {subscriptionStatus ? formatPersianDuration(subscriptionStatus.usage.recordingHoursUsed, { includeRemainingSuffix: false }) : '۰ دقیقه'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">سقف استفاده روزانه AI</span>
              <span className="text-emerald-700 font-black">
                سهمیه کامل روزانه (فعال)
              </span>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
