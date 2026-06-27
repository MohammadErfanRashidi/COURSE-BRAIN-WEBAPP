/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Search, 
  MessageSquare, 
  UserPlus, 
  Check, 
  Clock, 
  Phone, 
  User, 
  Send,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { SupportTicket } from '../types';

export const SupportTab: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'ticket_1',
      userPhone: '09121234567',
      userName: 'محمدرضا کریمی',
      subject: 'عدم نمایش فایل تحلیل صوتی درس هوش مصنوعی در تب کلاس‌های من',
      category: 'TECHNICAL',
      status: 'OPEN',
      createdAt: '۲ ساعت پیش',
      messages: [
        { sender: 'USER', senderName: 'محمدرضا کریمی', text: 'سلام، من فایل صوتی کلاس هوش مصنوعی رو ضبط کردم و آپلود با موفقیت انجام شد، اما موقع کلیک روی گزینه مشاهده رونوشت، پیغامی در صفحه دریافت نمی‌کنم و تحلیل برام لود نمیشه.', timestamp: '۱۰:۳۰' }
      ]
    },
    {
      id: 'ticket_2',
      userPhone: '09199876543',
      userName: 'فاطمه علوی',
      subject: 'نحوه تمدید خودکار لایسنس دانشجویی با کارت شتاب بانک تهران',
      category: 'BILLING',
      status: 'ASSIGNED',
      assignedTo: 'سارا رضایی',
      createdAt: 'دیروز',
      messages: [
        { sender: 'USER', senderName: 'فاطمه علوی', text: 'سلام خسته نباشید. چجوری می‌تونم اشتراک ماهم رو تمدید کنم که وسط ترم قطع نشه؟ آیا تمدید خودکار کارت‌ها کار میکنه؟', timestamp: '۱۴:۱۵' },
        { sender: 'SUPPORT', senderName: 'سارا رضایی', text: 'سلام خانم علوی گرامی. در حال حاضر امکان تمدید خودکار به دلیل زیرساخت‌های بانکی نیست، اما شما می‌توانید با رفتن به تب اشتراک و تمدید دستی اقدام نمایید.', timestamp: '۱۵:۰۰' }
      ]
    },
    {
      id: 'ticket_3',
      userPhone: '09355554433',
      userName: 'امیرحسین رضایی',
      subject: 'درخواست افزودن کتاب درسی پاتولوژی رابینز به کتابخانه اختصاصی پزشکی',
      category: 'ACADEMIC',
      status: 'RESOLVED',
      createdAt: '۳ روز پیش',
      messages: [
        { sender: 'USER', senderName: 'امیرحسین رضایی', text: 'لطفا مرجع آسیب شناسی اختصاصی رابینز را هم به سیستم اضافه کنید چون رفرنس اصلی درس پاتولوژی هست.', timestamp: '۰۹:۰۰' },
        { sender: 'SUPPORT', senderName: 'زهرا احمدی', text: 'دانشجوی گرامی، منبع درخواستی شما بررسی شد و نسخه نهم کتاب رابینز با موفقیت ایندکس و در ردیف درسهای آسیب‌شناسی فعال شد.', timestamp: '۱۸:۳۰' }
      ]
    }
  ]);

  const [activeTicketId, setActiveTicketId] = useState<string>('ticket_1');
  const [replyText, setReplyText] = useState('');
  const [assigneeName, setAssigneeName] = useState('امیررضا علوی');

  const activeTicket = tickets.find(t => t.id === activeTicketId) || tickets[0];

  const toPersianDigits = (str: string | number) => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setTickets(prev => prev.map(t => {
      if (t.id === activeTicketId) {
        return {
          ...t,
          status: 'ASSIGNED',
          assignedTo: assigneeName,
          messages: [
            ...t.messages,
            {
              sender: 'SUPPORT',
              senderName: assigneeName,
              text: replyText,
              timestamp: 'هم‌اکنون'
            }
          ]
        };
      }
      return t;
    }));

    setReplyText('');
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'RESOLVED' };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6 text-right font-sans">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket List Panel (Left, 1 column) */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-slate-400 block uppercase">📥 درخواست‌های پشتیبانی فعال</span>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto pl-1">
            {tickets.map((t) => (
              <div 
                key={t.id}
                onClick={() => setActiveTicketId(t.id)}
                className={`p-3.5 border rounded-2xl cursor-pointer text-right transition-all space-y-2 ${
                  activeTicketId === t.id
                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className={`px-1.5 py-0.5 rounded-md ${
                    t.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : t.status === 'ASSIGNED'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {t.status === 'OPEN' ? 'تازه / باز' : t.status === 'ASSIGNED' ? 'در حال پاسخ' : 'حل شده'}
                  </span>
                  <span className={activeTicketId === t.id ? 'text-indigo-200' : 'text-slate-400'}>
                    {t.createdAt}
                  </span>
                </div>

                <h4 className="text-[11px] font-black leading-relaxed line-clamp-1">
                  {t.subject}
                </h4>

                <div className="flex items-center justify-between text-[9px] font-bold border-t border-dashed border-slate-100/20 pt-2">
                  <span className={activeTicketId === t.id ? 'text-indigo-100' : 'text-slate-500'}>
                    کاربر: {t.userName}
                  </span>
                  {t.assignedTo && (
                    <span className={activeTicketId === t.id ? 'text-indigo-100' : 'text-slate-400'}>
                      👤 {t.assignedTo}
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Ticket Thread Box (Right, 2 columns) */}
        <Card className="lg:col-span-2 p-5 border border-slate-200 bg-white rounded-2xl flex flex-col justify-between min-h-[500px]">
          
          <div className="space-y-4">
            
            {/* Header detail */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">{activeTicket.subject}</h4>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">شروع شده توسط: {activeTicket.userName} ({toPersianDigits(activeTicket.userPhone)})</span>
                </div>
              </div>

              {activeTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleResolveTicket(activeTicket.id)}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 text-emerald-700 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ثبت حل‌شده</span>
                </button>
              )}
            </div>

            {/* Conversation Flow */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto p-1.5 bg-slate-50 rounded-2xl">
              {activeTicket.messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl text-xs max-w-[85%] space-y-1 ${
                    msg.sender === 'USER'
                      ? 'bg-white text-slate-850 border border-slate-150 mr-auto text-right'
                      : 'bg-indigo-600 text-white ml-auto text-right'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-bold opacity-80 pb-1 border-b border-white/10 mb-1">
                    <span>{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed font-bold">{msg.text}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Reply Form */}
          {activeTicket.status !== 'RESOLVED' ? (
            <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full relative">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="پاسخ صمیمانه و راهگشا خود به دانشجو را بنویسید..."
                    className="w-full text-right bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pr-4 pl-12 py-2.5 text-xs font-bold outline-none transition-all placeholder:text-slate-400 text-slate-800"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute left-1 top-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full sm:w-48 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2">
                  <span className="text-[9px] text-slate-400 font-extrabold shrink-0">پاسخ‌دهنده:</span>
                  <select
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black text-slate-700 outline-none w-full text-right"
                  >
                    <option value="امیررضا علوی">امیررضا علوی</option>
                    <option value="سارا رضایی">سارا رضایی</option>
                    <option value="زهرا احمدی">زهرا احمدی</option>
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center text-xs font-black flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4.5 h-4.5" />
              <span>این درخواست با موفقیت حل و مختومه اعلام گردید. ارسال پاسخ جدید متوقف است.</span>
            </div>
          )}

        </Card>

      </div>

    </div>
  );
};
