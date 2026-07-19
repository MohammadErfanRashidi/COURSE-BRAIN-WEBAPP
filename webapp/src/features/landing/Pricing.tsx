import React, { useState, useRef, useLayoutEffect, ReactNode } from 'react';
import { motion } from 'motion/react';

interface PricingCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
  onNavigate?: () => void;
}

function PricingCard({ children, className = '', index = 0, onNavigate }: PricingCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className={`c3-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}

    >
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-500 ease-in-out"
        style={{
          opacity: isHovered ? 1 : 0,
          zIndex: 1,
        }}
      >
        <div
          className="absolute inset-0 rounded-[inherit] animate-glow-pulse"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--glow-radial), transparent 40%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
      </div>
      <div className="relative z-10 flex flex-col flex-1 h-full">
        {children}
      </div>
    </div>
  );
}

interface PricingProps {
  onNavigate?: () => void;
}

export function Pricing({ onNavigate }: PricingProps) {
  const [yearly, setYearly] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (el) {
      el.scrollLeft = 0;
    }
  }, []);

  return (
    <section className="c3-pricing-section">
      <div className="c3-watermark-container">
        <div className="c3-watermark-main">
          <span className="c3-watermark-line-1">یادگیری شما.</span>
          <span className="c3-watermark-line-2">آسان‌تر شد.</span>
        </div>
      </div>
      <div className="c3-toggle-wrap">
        <span className={`text-sm font-medium transition-colors ${yearly ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>سالانه</span>
        <button
          className={`c3-toggle flex items-center px-1 ${yearly ? 'active' : ''}`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
          onClick={() => setYearly(!yearly)}
        >
          <div className="w-5 h-5 bg-[var(--text-primary)] rounded-full transition-transform duration-300" style={{ transform: yearly ? 'translateX(0)' : 'translateX(-24px)' }}></div>
        </button>
        <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>ماهانه</span>
      </div>

      <div className="c3-grid" ref={gridRef}>
        {/* Free Plan */}
        <PricingCard index={0}>
          <div className="c3-tier-small">پایه</div>
          <div className="c3-tier-large">رایگان</div>
          <div className="c3-desc">برای آشنایی با امکانات پایه دستیار هوشمند زیوای.</div>
          <ul className="c3-list flex-1">
            <li><div className="c3-check"><CheckIcon /></div>تا ۲ ساعت ضبط در ماه</li>
            <li><div className="c3-check"><CheckIcon /></div>پشتیبانی از ۱ کلاس</li>
            <li><div className="c3-check"><CheckIcon /></div>تبدیل صوت به متن پایه</li>
            <li><div className="c3-check"><CheckIcon /></div>دسترسی به داشبورد</li>
            <li><div className="c3-check"><CheckIcon /></div>بدون تولید آزمون</li>
          </ul>
          <button className="c3-btn" onClick={onNavigate}>انتخاب طرح</button>
        </PricingCard>

        {/* Standard Plan */}
        <PricingCard className="c3-card-pro" index={1}>
          <div className="c3-tier-small">طرح دانشجویی</div>
          <div className="c3-tier-large">{yearly ? '۴,۹۹۹,۹۹۹ ت / سال' : '۴۹۹,۹۹۹ ت / ماه'}</div>
          <div className="c3-desc">مناسب برای پوشش کامل نیازهای یک ترم تحصیلی.</div>
          <ul className="c3-list flex-1">
            <li><div className="c3-check"><CheckIcon /></div>۱۰ ساعت ضبط در ماه</li>
            <li><div className="c3-check"><CheckIcon /></div>پشتیبانی از ۵ کلاس</li>
            <li><div className="c3-check"><CheckIcon /></div>۶۰,۰۰۰ توکن روزانه</li>
            <li><div className="c3-check"><CheckIcon /></div>پرسش‌وپاسخ (حالت کلاس و ترکیبی)</li>
            <li><div className="c3-check"><CheckIcon /></div>تولید خودکار کوئیز</li>
          </ul>
          <button className="c3-btn" onClick={onNavigate}>انتخاب طرح</button>
        </PricingCard>

        {/* Pro Plan */}
        <PricingCard index={2}>
          <div className="c3-tier-small">طرح حرفه‌ای</div>
          <div className="c3-tier-large">{yearly ? '۹,۹۹۹,۹۹۹ ت / سال' : '۹۹۹,۹۹۹ ت / ماه'}</div>
          <div className="c3-desc">برای دانشجویانی که به منابع و ساعات بیشتری نیاز دارند.</div>
          <ul className="c3-list flex-1">
            <li><div className="c3-check"><CheckIcon /></div>ساعات ضبط نامحدود</li>
            <li><div className="c3-check"><CheckIcon /></div>کلاس‌های نامحدود</li>
            <li><div className="c3-check"><CheckIcon /></div>توکن روزانه نامحدود</li>
            <li><div className="c3-check"><CheckIcon /></div>دسترسی به منابع تکمیلی پزشکی</li>
            <li><div className="c3-check"><CheckIcon /></div>پشتیبانی ۲۴ ساعته اختصاصی</li>
          </ul>
          <button className="c3-btn" onClick={onNavigate}>انتخاب طرح</button>
        </PricingCard>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--text-primary)]">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
