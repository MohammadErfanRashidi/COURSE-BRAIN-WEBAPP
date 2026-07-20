import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Clock, Tag, Users, Send, User, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export function FinalCTA() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-[1] w-full" dir="rtl">
      {/* Background Ambient Glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] max-w-[1200px] h-[600px] pointer-events-none opacity-20 blur-[140px] z-[-1] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(40,91,232,0.4) 0%, rgba(49,59,89,0.2) 50%, transparent 100%)' }}
      />

      <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-stretch">

        {/* LEFT PANEL: Contact Information Card */}
          <div
            className="lg:col-span-5 liquid-glass relative overflow-hidden rounded-3xl p-8 md:p-10 flex flex-col justify-between"
          >
          {/* Subtle top inner glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(400px circle at 0% 0%, var(--glow-radial), transparent 70%)' }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-[#285BE8]/15 text-[#285BE8] border border-[#285BE8]/20 flex items-center gap-1.5 self-start">
                <Sparkles className="w-3.5 h-3.5" />
                پشتیبانی دانشجویی
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
              تماس با ما
            </h2>

            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-8 md:mb-10">
              اگر سوالی دارید یا به راهنمایی نیاز دارید، تیم پشتیبانی زیوای آماده پاسخگویی به شماست.
            </p>

            <div className="flex flex-col gap-6 md:gap-8">
              {/* Online Chat */}
              <div className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#285BE8] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-[var(--text-primary)]">💬 پشتیبانی آنلاین</h4>
                  <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">ارتباط مستقیم از طریق چت داخل برنامه</p>
                </div>
              </div>

              {/* Response Time */}
              <div className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-[var(--text-primary)]">⏱ زمان پاسخ</h4>
                  <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">معمولاً کمتر از ۳۰ دقیقه</p>
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-[var(--text-primary)]">🏷 دسته‌بندی‌ها</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['فنی', 'مالی', 'علمی', 'عمومی'].map((cat, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg text-xs bg-[var(--icon-bg)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                        • {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Support Team */}
              <div className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-[var(--text-primary)]">👥 تیم پشتیبانی</h4>
                  <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">تیم پشتیبانی زیوای</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-6 border-t border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)] text-right">
              پلتفرم هوشمند آموزشی زیوای (ZivAI) دستیار برتر ارتقاء نمرات دانشجویی.
            </div>
          </div>
          </div>

        {/* RIGHT PANEL: Premium Support Request Form */}
          <div
            className="lg:col-span-7 liquid-glass relative overflow-hidden rounded-3xl p-8 md:p-10 flex flex-col justify-center min-h-[500px]"
          >
          {/* Subtle bottom-right glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(400px circle at 100% 100%, var(--glow-radial), transparent 70%)' }}
          />

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 relative z-10"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#285BE8]" />
                      نام و نام‌خانوادگی <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="امیر رضایی"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--icon-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:border-[#285BE8] focus:ring-2 focus:ring-[#285BE8]/20 transition-all outline-none"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#285BE8]" />
                      ایمیل معتبر <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--icon-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:border-[#285BE8] focus:ring-2 focus:ring-[#285BE8]/20 transition-all outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#285BE8]" />
                    موضوع پیام
                  </label>
                  <input
                    type="text"
                    placeholder="امور فنی / مالی / سوال درسی"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--icon-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:border-[#285BE8] focus:ring-2 focus:ring-[#285BE8]/20 transition-all outline-none"
                  />
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#285BE8]" />
                    متن پیام <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="پیام خود را در این قسمت بنویسید..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--icon-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:border-[#285BE8] focus:ring-2 focus:ring-[#285BE8]/20 transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#285BE8] hover:bg-[#285BE8]/95 disabled:bg-[#285BE8]/55 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#285BE8]/20 active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ارسال پیام</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center text-center p-6 space-y-6 relative z-10"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                    پیام شما با موفقیت ارسال شد!
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                    ممنون از ارتباط شما. تیم پشتیبانی زیوای (ZivAI) در اسرع وقت (معمولاً در کمتر از ۳۰ دقیقه) از طریق ایمیل یا پیام با شما تماس خواهد گرفت.
                  </p>
                </div>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--icon-hover)] text-sm font-semibold text-[var(--text-secondary)] transition-all cursor-pointer"
                >
                  ارسال پیام دیگر
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
