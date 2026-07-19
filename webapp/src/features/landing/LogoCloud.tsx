import React from 'react';
import { motion } from 'motion/react';

export function LogoCloud() {
  const logos = ['علوم پزشکی تهران', 'شهید بهشتی', 'ایران', 'شیراز', 'اصفهان', 'تبریز', 'مشهد', 'جندی شاپور'];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative z-[1]">
      <div className="text-center">
          <p
            className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-semibold"
          >
          مورد اعتماد دانشجویان برترین دانشگاه‌های کشور
        </p>
      </div>
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
        {logos.map((logo, i) => (
            <div
            key={logo}
            className="flex justify-center"
          >
            <span className="text-sm font-semibold tracking-tight text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-default">
              {logo}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
