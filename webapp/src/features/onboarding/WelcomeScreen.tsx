/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mic, Database, MessageSquare, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

interface WelcomeScreenProps {
  onComplete: () => void;
}

interface Slide {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: 'سامانه هوشمند کمک‌آموزشی رایا',
      description: 'به Raya خوش آمدید! پلتفرمی تجاری و پیشرفته بر پایه هوش مصنوعی RAG که رفیق شفیق شما در طول نیمسال تحصیلی است. در این پلتفرم می‌توانید ویس کلاس‌ها را پیاده‌سازی و جزوات هوشمند بسازید.',
      icon: <GraduationCap className="w-10 h-10 text-indigo-600 animate-bounce" />,
      color: 'text-indigo-600 border-indigo-100/60',
      bgColor: 'bg-indigo-50/60'
    },
    {
      title: 'ضبط خودکار و پیاده‌سازی ویس استاد',
      description: 'دیگر نیازی به نوشتن جزوه سر کلاس نیست. صدای استاد را در کلاس درس ضبط یا آپلود کنید. موتور قدرتمند پردازش صوتی ما در کسری از ثانیه ویس را به متن تایپ‌شده و ساختاریافته (ترنسکریپشن علمی) تبدیل می‌کند.',
      icon: <Mic className="w-10 h-10 text-indigo-600" />,
      color: 'text-indigo-600 border-indigo-100/60',
      bgColor: 'bg-indigo-50/60'
    },
    {
      title: 'پایگاه برداری و همگام‌سازی کتاب‌ها',
      description: 'متون پیاده‌سازی شده همراه با کتاب‌های مرجع و جزوات، به کدهای برداری (Embeddings) تبدیل شده و در پایگاه داده اختصاصی ChromaDB شما ذخیره می‌شوند تا اطلاعات علمی همواره در دسترس دستیار هوشمند شما باشند.',
      icon: <Database className="w-10 h-10 text-indigo-600" />,
      color: 'text-indigo-600 border-indigo-100/60',
      bgColor: 'bg-indigo-50/60'
    },
    {
      title: 'چت و پاسخ‌دهی دقیق RAG با ارجاع به منبع',
      description: 'در هر زمان با چت‌بات درسی خود گفتگو کنید. دستیار علمی بر اساس رفرنس‌های معتبر کتابخانه و فایل‌های صوتی خودتان پاسخ مستند می‌دهد و بخش دقیق آن را از جزوه یا فصل کتاب برای شما مشخص می‌کند.',
      icon: <MessageSquare className="w-10 h-10 text-indigo-600" />,
      color: 'text-indigo-600 border-indigo-100/60',
      bgColor: 'bg-indigo-50/60'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // Convert English digits to Persian
  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 flex flex-col justify-center min-h-[85vh] font-sans">
      <Card className="border border-slate-200/50 shadow-2xl shadow-slate-200/50 relative overflow-hidden flex flex-col min-h-[460px]">
        {/* Step counter top-left */}
        <div className="absolute left-6 top-6 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500">
          گام {toPersianDigits(currentSlide + 1)} از {toPersianDigits(slides.length)}
        </div>

        {/* Dynamic content transition container */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-8">
          <div className={`w-20 h-20 ${slides[currentSlide].bgColor} rounded-3xl flex items-center justify-center border ${slides[currentSlide].color} mb-6 shadow-sm`}>
            {slides[currentSlide].icon}
          </div>
          
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-snug mb-3">
            {slides[currentSlide].title}
          </h2>
          
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200'}`}
              aria-label={`اسلاید ${toPersianDigits(i + 1)}`}
            />
          ))}
        </div>

        {/* Navigation Action Panel */}
        <div className="flex gap-3 pt-4 border-t border-slate-100/50">
          {currentSlide > 0 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              className="px-4"
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              قبلی
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={handleNext}
            fullWidth={currentSlide === 0}
            className="flex-1"
            icon={currentSlide === slides.length - 1 ? undefined : <ChevronLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            {currentSlide === slides.length - 1 ? 'بسیار خب، شروع ثبت‌نام تحصیلی' : 'بعدی'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
