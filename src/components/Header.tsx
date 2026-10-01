import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Download,
  Wifi,
  WifiOff,
  Headphones,
  RotateCcw,
  CheckCircle2,
  Cloud,
  History,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
  onOpenMemo: () => void;
  onOpenSupport: () => void;
  onOpenAudit?: () => void;
  onOpenMarketIntel?: () => void;
  onResetData: () => void;
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onToggleSidebar,
  sidebarOpen,
  onOpenMemo,
  onOpenSupport,
  onOpenAudit,
  onOpenMarketIntel,
  onResetData,
  isOnline,
  syncStatus
}) => {
  return (
    <header className="h-20 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-20 shadow-sm transition-colors">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "ย่อเก็บแถบข้าง" : "เปิดแถบข้าง"}
          title={sidebarOpen ? "ย่อเก็บแถบข้าง (Collapse Menu)" : "เปิดแถบข้าง (Open Menu)"}
          className={`p-2 rounded-lg transition-colors ${
            sidebarOpen
              ? 'text-blue-600 bg-blue-50 dark:bg-slate-800'
              : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="font-extrabold text-xl tracking-tight hidden sm:block">
            <span className="text-orange-500">BUG</span>{' '}
            <span className="text-blue-700 dark:text-blue-400">SOLUTIONS</span>
          </div>
          <span className="hidden lg:inline text-slate-300 dark:text-slate-600">|</span>
          <h2 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
            ระบบวิเคราะห์ข้อมูลเชิงลึก (Fleet Optimization Pro)
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Sync & Connection Status */}
        <div
          title={isOnline ? 'เชื่อมต่อ Firebase แบบเรียลไทม์' : 'โหมดออฟไลน์ ข้อมูลถูกจัดเก็บอย่างปลอดภัยบนเครื่องและจะซิงค์อัตโนมัติเมื่อออนไลน์'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs transition-all ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          }`}
        >
          {isOnline ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="hidden md:inline">
                {syncStatus === 'syncing' ? 'กำลังซิงค์...' : 'Firebase เรียลไทม์'}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">ออฟไลน์ (ซิงค์อัตโนมัติ)</span>
            </>
          )}
        </div>

        {/* 24/7 Support */}
        <button
          onClick={onOpenSupport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="ฝ่ายสนับสนุน 24 ชั่วโมง ประสบการณ์กว่า 20 ปี"
        >
          <Headphones className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">สนับสนุน 24 ชม.</span>
        </button>

        {/* Audit Trail Button */}
        {onOpenAudit && (
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors border border-purple-200 dark:border-purple-800"
            title="ดูประวัติการแก้ไขและบันทึกข้อมูล (Audit Trail)"
          >
            <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden lg:inline">ประวัติแก้ไข</span>
          </button>
        )}

        {/* AI Market Intel (Google Search Grounding) */}
        {onOpenMarketIntel && (
          <button
            onClick={onOpenMarketIntel}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-xs"
            title="สืบค้นราคาน้ำมันสดและราคากลางรถมือสองด้วย Google Search Grounding (gemini-3.5-flash)"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-900" />
            <span className="hidden md:inline">AI ค้นหาข้อมูลสด</span>
          </button>
        )}

        {/* Reset / Reseed Authentic Data */}
        <button
          onClick={onResetData}
          title="รีเซ็ตข้อมูลตั้งต้น 16 คัน"
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Dark Mode */}
        <button
          onClick={onToggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Export / Print */}
        <button
          onClick={onOpenMemo}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ใบขออนุมัติขาย (PDF)</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>
    </header>
  );
};
