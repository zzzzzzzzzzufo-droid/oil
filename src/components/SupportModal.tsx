import React from 'react';
import {
  X,
  ShieldCheck,
  Headphones,
  Award,
  Cloud,
  CheckCircle,
  Clock,
  PhoneCall,
  Mail,
  Smartphone
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-lg relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">ศูนย์สนับสนุนฟลีทระดับมืออาชีพ</h3>
              <p className="text-xs text-blue-200">
                พร้อมดูแลตลอด 24 ชั่วโมง • ประสบการณ์กว่า 20 ปี
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold mb-1">
                <Award className="w-4 h-4" /> ประสบการณ์ 20+ ปี
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                เชี่ยวชาญการบริหารฟลีทขนาดใหญ่และการจัดจำหน่ายสินทรัพย์คุ้มค่าสูงสุด
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                <Clock className="w-4 h-4" /> ดูแลตลอด 24 ชั่วโมง
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                ทีมวิศวกรและผู้เชี่ยวชาญพร้อมให้คำปรึกษาและซัพพอร์ตระบบตลอดเวลา
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              มาตรฐานความเสถียรและความปลอดภัยของข้อมูล
            </h4>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <b>ซิงค์ข้อมูลเรียลไทม์บน Firebase Cloud:</b> รองรับการทำงานหลายอุปกรณ์พร้อมกันโดยไม่มีข้อมูลสูญหาย
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <b>ระบบออฟไลน์สมบูรณ์แบบ (Offline Persistence):</b> บันทึกข้อมูลได้แม้ไม่มีอินเทอร์เน็ต และระบบจะซิงค์ให้อัตโนมัติเมื่อออนไลน์
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <b>การจัดการความขัดแย้งอัตโนมัติ:</b> ป้องกันข้อมูลซ้ำซ้อนและบันทึกประวัติการเปลี่ยนแปลง (Audit Trail)
              </span>
            </div>
          </div>

          {/* Contact Box */}
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold">สายด่วนช่วยเหลือฟลีท:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">02-999-8888 (24 ชม.)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-semibold">อีเมลติดต่อ:</span>
              <span>support@bugsolutions.co.th</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            รับทราบและปิด
          </button>
        </div>
      </div>
    </div>
  );
};
