import React from 'react';

export function Testimonials() {
  const testimonials = [
    {
      quote: "زیوای ساعت‌ها از وقت من را برای پیاده‌سازی صدای اساتید نجات داد. حالا می‌توانم روی یادگیری تمرکز کنم.",
      name: "علیرضا م.",
      role: "دانشجوی پزشکی",
      company: "دانشگاه علوم پزشکی تهران"
    },
    {
      quote: "پرسش‌وپاسخ در حالت فقط کلاس، دقیقاً همان چیزی است که برای امتحانات نیاز داشتم. پاسخ‌ها کاملاً مستند به تدریس استاد هستند.",
      name: "سارا ت.",
      role: "دانشجوی داروسازی",
      company: "دانشگاه شهید بهشتی"
    },
    {
      quote: "تولید خودکار کوئیز از روی ویس استاد فوق‌العاده است. قبل از امتحان می‌توانم خودم را به راحتی محک بزنم.",
      name: "محمد ح.",
      role: "دانشجوی دندانپزشکی",
      company: "دانشگاه علوم پزشکی شیراز"
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative z-[1]">
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="liquid-glass rounded-2xl p-6 flex flex-col justify-between">
            <blockquote className="text-sm text-[var(--text-secondary)] leading-[1.6]">
              "{t.quote}"
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-[var(--border-color)]">
              <div className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
              <div className="text-xs text-[var(--text-primary)] font-semibold tracking-wide uppercase mt-1">{t.company}</div>
            </figcaption>
          </div>
        ))}
      </div>
    </section>
  );
}
