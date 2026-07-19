import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { SectionEyebrow } from './Shared';

const faqs = [
  {
    question: "چگونه می‌توانم صدای کلاس را ضبط کنم؟",
    answer: "با کلیک روی دکمه شروع ضبط، می‌توانید میکروفون مرورگر را فعال کرده و کلاس را به صورت زنده ضبط کنید. هر جلسه ضبط می‌تواند تا ۹۰ دقیقه باشد."
  },
  {
    question: "چه فرمت‌های صوتی پشتیبانی می‌شوند؟",
    answer: "فرمت‌های MP3، WAV، AAC، M4A، OGG و FLAC با حجم حداکثر ۱۰۰ مگابایت پشتیبانی می‌شوند."
  },
  {
    question: "دستیار هوش مصنوعی چگونه کار می‌کند؟",
    answer: "پس از ضبط یا آپلود فایل صوتی، هوش مصنوعی آن را به متن تبدیل کرده و محتوا را برای جستجو و پرسش‌وپاسخ آماده می‌کند."
  },
  {
    question: "تفاوت حالت فقط کلاس و ترکیبی چیست؟",
    answer: "در حالت فقط کلاس، پاسخ‌ها فقط بر اساس محتوای تدریس استاد هستند.\nدر حالت ترکیبی، علاوه بر کلاس، کتاب‌ها، PDFها، اسلایدها و منابع تکمیلی نیز بررسی می‌شوند."
  },
  {
    question: "آیا می‌توانم فایل‌های ضبط‌ شده قبلی را آپلود کنم؟",
    answer: "بله، فایل‌های صوتی کلاس‌های گذشته را می‌توانید آپلود کنید تا پردازش شده و برای پرسش‌وپاسخ استفاده شوند."
  },
  {
    question: "اطلاعات من چگونه محافظت می‌شود؟",
    answer: "تمام فایل‌های صوتی و اطلاعات شخصی در محیط امن ذخیره شده و فقط توسط حساب کاربری شما قابل دسترسی هستند."
  },
  {
    question: "چگونه اشتراک خود را تمدید کنم؟",
    answer: "از طریق داشبورد کاربری و بخش اشتراک می‌توانید اشتراک خود را آنلاین تمدید کنید."
  }
];

function AccordionItem({ faq, isOpen, onClick }: { faq: { question: string, answer: string }, isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border-b border-[var(--border-color)] last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between gap-4 text-start focus:outline-none group"
      >
        <span className="text-[var(--text-primary)] font-medium text-xs sm:text-sm md:text-lg truncate transition-colors group-hover:text-[var(--text-secondary)]">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--icon-bg)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--icon-hover)] transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-xs sm:text-sm md:text-base text-[var(--text-secondary)] leading-relaxed text-start">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 relative z-[1] flex flex-col items-center">
      <div
        className="w-full max-w-3xl px-6"
      >
        <div className="flex flex-col items-center text-center mb-16">
          <SectionEyebrow label="پشتیبانی" tag="سوالات متداول" />
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter mt-6 mb-4 text-[var(--text-primary)]">
            سوالات متداول.
          </h2>
          <p className="text-[var(--text-muted)] max-w-md mx-auto">
            پاسخ به سوالات رایج شما درباره زیوای.
          </p>
        </div>

        <div className="liquid-glass rounded-3xl p-6 md:p-8">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
