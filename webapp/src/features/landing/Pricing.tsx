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

      <div className="c3-grid" ref={gridRef}>
        {/* برنامه رایگان */}
        <PricingCard index={0}>
          <div className="c3-tier-small">شروع رایگان</div>
          <div className="c3-tier-large">۰ تومان / ماه</div>
          <div className="c3-desc">برای آشنایی با امکانات پایه دستیار هوشمند زیوای.</div>
          <ul className="c3-list flex-1">
            <li><div className="c3-check"><CheckIcon /></div>۱۵ دقیقه تبدیل گفتار به متن در ماه</li>
            <li><div className="c3-check"><CheckIcon /></div>چت هوش مصنوعی با متن پیاده‌شده و منابع کلاس‌های شما</li>
          </ul>
          <button className="c3-btn" onClick={onNavigate}>شروع کنید</button>
        </PricingCard>

        {/* برنامه حرفه‌ای - محبوب‌ترین */}
        <PricingCard className="c3-card-pro" index={1}>
          <div className="relative">
            <span className="inline-block px-3 py-1 rounded-full bg-[#285BE8] text-white text-[10px] font-black tracking-wide mb-3">محبوب‌ترین</span>
          </div>
          <div className="c3-tier-small">حرفه‌ای</div>
          <div className="c3-tier-large">۶۰۰,۰۰۰ تومان / ماه</div>
          <div className="c3-desc">مناسب برای پوشش کامل نیازهای یک ترم تحصیلی.</div>
          <ul className="c3-list flex-1">
            <li><div className="c3-check"><CheckIcon /></div>۱۰ ساعت تبدیل گفتار به متن در ماه</li>
            <li><div className="c3-check"><CheckIcon /></div>چت نامحدود هوش مصنوعی (RAG) با فایل‌های شما</li>
            <li><div className="c3-check"><CheckIcon /></div>دسترسی به پایگاه داده وسیع کلاس‌ها و دانشگاه‌ها</li>
          </ul>
          <button className="c3-btn" onClick={onNavigate}>ارتقا به حساب حرفه‌ای</button>
        </PricingCard>

        {/* برنامه کاربر پیشرفته */}
        <PricingCard index={2}>
          <div className="c3-tier-small">کاربر پیشرفته</div>
          <div className="c3-tier-large">۱,۴۰۰,۰۰۰ تومان / ماه</div>
          <div className="c3-desc">برای دانشجویانی که به منابع و ساعات بیشتری نیاز دارند.</div>
          <ul className="c3-list flex-1">
            <li><div className="c3-check"><CheckIcon /></div>۳۰ ساعت تبدیل گفتار به متن در ماه</li>
            <li><div className="c3-check"><CheckIcon /></div>چت نامحدود هوش مصنوعی (RAG) با فایل‌های شما</li>
          </ul>
          <button className="c3-btn" onClick={onNavigate}>خرید حساب پیشرفته</button>
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
