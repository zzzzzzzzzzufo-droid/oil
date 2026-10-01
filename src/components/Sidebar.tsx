import React from 'react';
import {
  PieChart,
  BarChart3,
  FileText,
  X,
  ShieldCheck,
  Fuel,
  Car
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMemo: () => void;
  onOpenSupport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenMemo,
  onOpenSupport
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside
        className={`w-64 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 transition-all duration-300 z-40 h-full fixed md:relative ${
          isOpen ? 'left-0 shadow-2xl md:shadow-none' : '-left-64 md:left-0 md:w-64'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="font-extrabold text-xl tracking-tight">
              <span className="text-orange-500">BUG</span>{' '}
              <span className="text-blue-700 dark:text-blue-400">SOLUTIONS</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Sidebar"
            className="md:hidden text-slate-400 hover:text-red-500 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-2">
            <a
              href="#dashboardOverview"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 rounded-xl font-medium border border-blue-100 dark:border-slate-700 shadow-xs"
            >
              <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>ภาพรวมฟลีท (Dashboard)</span>
            </a>

            <a
              href="#healthSection"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-orange-600 rounded-xl font-medium transition-colors"
            >
              <Car className="w-5 h-5 text-slate-400 group-hover:text-orange-500" />
              <span>สุขภาพรถ (Health Score)</span>
            </a>

            <a
              href="#fuelSection"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 rounded-xl font-medium transition-colors"
            >
              <Fuel className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
              <span>ต้นทุนน้ำมัน & งาน</span>
            </a>

            <a
              href="#chartsSection"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 rounded-xl font-medium transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
              <span>วิเคราะห์จัดอันดับ 6 มิติ</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onOpenMemo();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-xl font-medium transition-colors text-left"
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <span>พิมพ์ใบขออนุมัติขาย (P1)</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40">
          <div
            onClick={onOpenSupport}
            className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-md">
              PRO
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                ทีมบริการเชี่ยวชาญ 20+ ปี
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3" /> ออนไลน์ 24/7 เรียลไทม์
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
