import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Layers,
  MessageSquare,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { SectionEyebrow } from './Shared';

export function FeatureTriage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative z-[1] w-full min-w-0 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center w-full min-w-0">
          <div
            className="w-full min-w-0"
          >
          <SectionEyebrow label="امکانات کلیدی" tag="دستیار دانشگاهی" />
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02] text-[var(--text-primary)]">
            جزوات خود را <br /> هوشمندانه مرور کنید.
          </h2>
          <p className="mt-6 text-[var(--text-muted)] text-base leading-[1.6] max-w-md">
            زیوای صدای استاد را به متن دقیق تبدیل می‌کند و با درک عمیق مطالب درسی، امکان جستجو و پرسش‌وپاسخ را برای شما فراهم می‌سازد.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['ضبط زنده کلاس', 'آپلود فایل صوتی', 'تولید خودکار کوئیز', 'پشتیبانی از دروس پزشکی'].map(chip => (
              <span key={chip} className="text-xs text-[var(--text-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md shadow-sm">
                {chip}
              </span>
            ))}
          </div>
          </div>

          <div
            className="w-full max-w-md mx-auto md:max-w-none justify-self-center min-w-0"
          >
          <ChatMockup />
          </div>
      </div>
    </section>
  );
}

function ChatMockup() {
  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-2xl shadow-2xl flex flex-col h-[580px] sm:h-[650px] overflow-hidden relative group w-full max-w-md md:max-w-none" dir="rtl">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 -right-20 w-64 h-64 bg-[#285BE8]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#285BE8]/20 transition-colors duration-1000"></div>

      {/* Header */}
      <div
        className="relative w-full h-12 flex items-center justify-between px-4 shrink-0 z-20 border-b border-[var(--border-color)]"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--glass-bg) 85%, #285BE8 5%), color-mix(in srgb, var(--glass-bg) 95%, transparent))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 4px 20px color-mix(in srgb, #285BE8 5%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white/5 border border-[var(--border-color)] cursor-pointer hover:bg-white/10 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-primary)]" />
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white/5 border border-[var(--border-color)] cursor-pointer hover:bg-white/10 transition-colors">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-primary)]" />
          </div>
        </div>
        <div className="font-bold text-[var(--text-primary)] text-[11px] sm:text-sm md:text-base truncate px-1 sm:px-2 text-center flex-1 min-w-0">
          آشنایی با رایانه نظری و عملی
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white/5 border border-[var(--border-color)] cursor-pointer hover:bg-white/10 transition-colors shrink-0">
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-primary)]" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-5 sm:px-6 py-5 flex flex-col gap-6 relative z-10 w-full min-w-0">
        {/* Date Separator */}
        <div className="flex items-center justify-center my-2">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent"></div>
          <span className="px-3 py-1 text-[10px] text-[var(--text-muted)] bg-[var(--icon-bg)] rounded-full border border-[var(--border-color)] backdrop-blur-md">امروز</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[var(--border-color)] to-transparent"></div>
        </div>

        {/* User Message */}
        <div className="flex flex-col items-start self-start max-w-[85%] sm:max-w-[80%] min-w-0">
          <span className="text-[10px] text-[var(--text-muted)] mb-1 px-1">شما</span>
          <div className="bg-[#285BE8] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-[0_4px_20px_rgba(40,91,232,0.3)] text-sm leading-relaxed">
            سازوکار مولکولی آنزیم ATP سنتاز در غشای داخلی میتوکندری چیست و چگونه جریان الکتروشیمیایی پروتون‌ها را به پتانسیل شیمیایی تبدیل می‌کند؟
          </div>
          <div className="flex items-center gap-2 mt-2 self-end pr-1">
            <button className="w-7 h-7 rounded-full bg-[var(--icon-bg)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-sm">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-[var(--text-muted)]">۱۳:۲۴</span>
          </div>
        </div>

        {/* AI Message */}
        <div className="flex flex-col items-end self-end max-w-[85%] sm:max-w-[80%] min-w-0">
          <span className="text-[10px] text-[var(--text-muted)] mb-1 px-1">زیوای</span>
          <div className="bg-[#313B59]/60 border border-[var(--border-color)] backdrop-blur-md text-[var(--text-primary)] rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm text-xs sm:text-sm leading-[1.8] space-y-3 w-full min-w-0">
            <>
              <p>سلام!</p>
              <p>آنزیم ATP سنتاز بر اساس «مکانیسم تغییر پیوند بویر» (Boyer&apos;s Binding Mechanism) عمل می‌کند که یک نانوموتور چرخشی بیولوژیکی است و شیب الکتروشیمیایی پروتون را به انرژی پیوندهای شیمیایی تبدیل می‌کند. این ساختار از دو بخش اصلی تشکیل شده است:</p>

              <div className="mt-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#285BE8]"></div>
                 <span className="font-bold text-[var(--text-primary)]">بخش F0 (موتور الکتریکی غشایی)</span>
              </div>
              <p className="pr-3 text-[var(--text-secondary)]">پروتون‌ها از طریق دو نیم‌کانال نامتقارن در زیرواحد a حرکت می‌کنند و بار الکتریکی اسیدهای آمینه در حلقه c را خنثی می‌سازند. این خنثی‌سازی باعث چرخش فیزیکی حلقه c در لایه دوقطبی چربی غشا شده و شفت مرکزی (زیرواحد گاما) را می‌چرخاند.</p>

              <div className="mt-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#285BE8]"></div>
                 <span className="font-bold text-[var(--text-primary)]">بخش F1 (کاتالیزور ماتریکس)</span>
              </div>
              <p className="pr-3 text-[var(--text-secondary)]">چرخش شفت نامتقارن گاما در مرکز هگزامیر ثابت آلفا/بتا، تغییرات ساختاری فضایی (Conformational) شدیدی ایجاد می‌کند. هر زیرواحد کاتالیزوری بتا دائماً بین سه حالت فضایی متمایز جابه‌جا می‌شود تا فرآیند اتصال پیش‌ماده‌ها و تشکیل پیوند کووالانسی انجام گیرد.</p>

              <p className="font-bold mt-4 pt-2 border-t border-[var(--border-color)]">سه حالت فضایی چرخه کاتالیزوری:</p>
              <ul className="space-y-2 pr-1 w-full min-w-0">
                <li className="flex items-start gap-2 min-w-0">
                  <span className="font-medium text-[#285BE8] shrink-0 mt-0.5">• Open (O) <span className="opacity-50">←</span></span>
                  <span className="text-[var(--text-secondary)] min-w-0 flex-1 break-words">میل ترکیبی بسیار کم؛ آزادسازی ATP رهاشده و پذیرش مجدد ADP و Pi</span>
                </li>
                <li className="flex items-start gap-2 min-w-0">
                  <span className="font-medium text-[#285BE8] shrink-0 mt-0.5">• Loose (L) <span className="opacity-50">←</span></span>
                  <span className="text-[var(--text-secondary)] min-w-0 flex-1 break-words">اتصال ضعیف و شل؛ محصور کردن مواد اولیه بدون طی شدن واکنش سنتز</span>
                </li>
                <li className="flex items-start gap-2 min-w-0">
                  <span className="font-medium text-[#285BE8] shrink-0 mt-0.5">• Tight (T) <span className="opacity-50">←</span></span>
                  <span className="text-[var(--text-secondary)] min-w-0 flex-1 break-words">اتصال محکم؛ متراکم کردن مکانیکی ساختار برای تشکیل خودبه‌خودی پیوند فسفوانیدرید</span>
                </li>
              </ul>

              {/* Sources section inside AI bubble */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex flex-nowrap items-center justify-between gap-[clamp(4px,0.6vw+2px,8px)] w-full min-w-0">
                <div className="flex items-center gap-[clamp(2px,0.3vw+1px,4px)] text-[var(--text-primary)] font-medium text-[clamp(8px,0.6vw+6px,12px)] shrink-0">
                  <Bookmark className="w-[clamp(12px,0.6vw+10px,16px)] h-[clamp(12px,0.6vw+10px,16px)]" />
                  <span>منابع</span>
                </div>

                <div className="flex items-center justify-center gap-[clamp(2px,0.6vw,6px)] flex-1 min-w-0">
                  <div className="px-[clamp(3px,0.6vw+2px,6px)] py-[clamp(1px,0.3vw+1px,3px)] rounded-[clamp(3px,0.4vw+2px,5px)] bg-[#285BE8]/10 text-[#285BE8] border border-[#285BE8]/20 text-[clamp(7.5px,0.75vw+5px,11px)] font-medium whitespace-nowrap shrink-0">
                    تدریس کلاسی
                  </div>
                  <div className="px-[clamp(3px,0.6vw+2px,6px)] py-[clamp(1px,0.3vw+1px,3px)] rounded-[clamp(3px,0.4vw+2px,5px)] bg-green-500/10 text-green-500 border border-green-500/20 text-[clamp(7.5px,0.75vw+5px,11px)] font-medium whitespace-nowrap shrink-0">
                    کتاب مرجع
                  </div>
                  <div className="px-[clamp(3px,0.6vw+2px,6px)] py-[clamp(1px,0.3vw+1px,3px)] rounded-[clamp(3px,0.4vw+2px,5px)] bg-teal-500/10 text-teal-500 border border-teal-500/20 text-[clamp(7.5px,0.75vw+5px,11px)] font-medium whitespace-nowrap shrink-0">
                    منبع اینترنتی
                  </div>
                </div>

                <div className="w-[clamp(16px,1.2vw+12px,24px)] h-[clamp(16px,1.2vw+12px,24px)] flex items-center justify-center rounded hover:bg-white/5 cursor-pointer transition-colors shrink-0">
                  <ChevronDown className="w-[clamp(10px,0.8vw+8px,16px)] h-[clamp(10px,0.8vw+8px,16px)] text-[var(--text-muted)]" />
                </div>
              </div>
            </>
          </div>

          <div className="flex items-center justify-between w-full mt-2 pr-1">
             <span className="text-[10px] text-[var(--text-muted)]">۱۳:۲۴</span>
             <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-full bg-[var(--icon-bg)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-sm">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded-full bg-[var(--icon-bg)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-sm">
                  <Copy className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>
        </div>

      </div>

      {/* Input Area */}
      <div className="p-1.5 sm:p-2 shrink-0 relative z-20 w-full">
        <div
          className="relative border border-[var(--border-color)] rounded-2xl p-1 sm:p-1.5 flex flex-col gap-1 sm:gap-1.5 transition-colors"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--glass-bg) 85%, #285BE8 5%), color-mix(in srgb, var(--glass-bg) 95%, transparent))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px color-mix(in srgb, #285BE8 15%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
           <textarea
             placeholder="بنویسید..."
             className="w-full bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-1.5 py-0.5 min-h-[24px] sm:min-h-[28px] custom-scrollbar"
             rows={1}
             readOnly
           ></textarea>

           <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-1 sm:pt-1.5 px-0.5">
             <div className="flex items-center gap-1 sm:gap-1.5">
               <button className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-medium text-[var(--text-secondary)] hover:bg-white/5 transition-colors border border-transparent">
                 <FileText className="w-3 h-3" />
                 تدریس کلاسی
               </button>
               <button className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-medium bg-[#285BE8]/10 text-[#285BE8] border border-[#285BE8]/20 transition-colors shadow-sm">
                 <Layers className="w-3 h-3" />
                 ترکیبی
               </button>
             </div>

             <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-transparent text-[var(--text-muted)] hover:text-[#285BE8] hover:bg-[#285BE8]/10 flex items-center justify-center transition-all">
               <Send className="w-3.5 h-3.5 sm:w-4 h-4 -ml-0.5 -scale-x-100" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
