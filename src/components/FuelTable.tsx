import React, { useState } from 'react';
import {
  Fuel,
  Scale,
  CreditCard,
  Briefcase,
  Calendar,
  CheckSquare,
  Square,
  Edit3,
  Info,
  Users
} from 'lucide-react';
import { Vehicle, MonthKey, MONTH_CONFIG } from '../types';
import {
  numFormat,
  calculateVehicleTotals,
  getEffColor,
  getCkmColor
} from '../utils/calculations';

interface FuelTableProps {
  vehicles: Vehicle[];
  onSelectCar: (vehicle: Vehicle) => void;
  onEditCar?: (vehicle: Vehicle) => void;
  onOpenDriverRoster?: (vehicle: Vehicle) => void;
  selectedMonths?: MonthKey[];
  onChangeSelectedMonths?: (months: MonthKey[]) => void;
}

export const FuelTable: React.FC<FuelTableProps> = ({
  vehicles,
  onSelectCar,
  onEditCar,
  onOpenDriverRoster,
  selectedMonths: propSelectedMonths,
  onChangeSelectedMonths
}) => {
  // Local fallback state if not controlled by parent - default to 3 months as requested
  const [localSelectedMonths, setLocalSelectedMonths] = useState<MonthKey[]>(['m6', 'm7', 'm8']);
  const activeMonths = propSelectedMonths || localSelectedMonths;

  const setActiveMonths = (months: MonthKey[]) => {
    if (onChangeSelectedMonths) {
      onChangeSelectedMonths(months);
    } else {
      setLocalSelectedMonths(months);
    }
  };

  // Toggle individual month in multi-selection (must keep at least 1 month)
  const toggleMonthSelection = (m: MonthKey) => {
    if (activeMonths.includes(m)) {
      if (activeMonths.length > 1) {
        setActiveMonths(activeMonths.filter((item) => item !== m));
      }
    } else {
      // Keep chronological order: m6, m7, m8, m9, m10, m11
      const all: MonthKey[] = ['m6', 'm7', 'm8', 'm9', 'm10', 'm11'];
      const next = all.filter((item) => activeMonths.includes(item) || item === m);
      setActiveMonths(next);
    }
  };

  // Presets
  const applyPreset = (preset: 'initial3' | 'mid3' | 'latest3' | 'q4' | 'all6') => {
    switch (preset) {
      case 'initial3':
        setActiveMonths(['m6', 'm7', 'm8']);
        break;
      case 'mid3':
        setActiveMonths(['m7', 'm8', 'm9']);
        break;
      case 'latest3':
        setActiveMonths(['m9', 'm10', 'm11']);
        break;
      case 'q4':
        setActiveMonths(['m10', 'm11']);
        break;
      case 'all6':
        setActiveMonths(['m6', 'm7', 'm8', 'm9', 'm10', 'm11']);
        break;
    }
  };

  // Collapsible column states
  const [showLimit, setShowLimit] = useState(true);
  const [showJobs, setShowJobs] = useState(true);

  // Month collapse states (fold/unfold whole month)
  const [collapsedMonths, setCollapsedMonths] = useState<Record<MonthKey, boolean>>({
    m6: false,
    m7: false,
    m8: false,
    m9: false,
    m10: false,
    m11: false
  });

  const toggleMonthCollapse = (m: MonthKey) => {
    setCollapsedMonths((prev) => ({ ...prev, [m]: !prev[m] }));
  };

  // Dynamic Fleet Aggregate Totals based ONLY on activeSelectedMonths
  let fleetDist = 0;
  let fleetFuel = 0;
  let fleetCost = 0;
  let fleetJobs = 0;
  let fleetTotalLimit = 0;

  // Individual month totals
  const monthlyFleetTotals: Record<MonthKey, { dist: number; fuel: number; cost: number; jobs: number; limit: number }> = {
    m6: { dist: 0, fuel: 0, cost: 0, jobs: 0, limit: 0 },
    m7: { dist: 0, fuel: 0, cost: 0, jobs: 0, limit: 0 },
    m8: { dist: 0, fuel: 0, cost: 0, jobs: 0, limit: 0 },
    m9: { dist: 0, fuel: 0, cost: 0, jobs: 0, limit: 0 },
    m10: { dist: 0, fuel: 0, cost: 0, jobs: 0, limit: 0 },
    m11: { dist: 0, fuel: 0, cost: 0, jobs: 0, limit: 0 }
  };

  vehicles.forEach((car) => {
    const lim = car.limit || 0;

    (['m6', 'm7', 'm8', 'm9', 'm10', 'm11'] as MonthKey[]).forEach((mKey) => {
      const data = car[mKey] || { dist: 0, fuel: 0, cost: 0, jobs: 0 };
      monthlyFleetTotals[mKey].dist += data.dist || 0;
      monthlyFleetTotals[mKey].fuel += data.fuel || 0;
      monthlyFleetTotals[mKey].cost += data.cost || 0;
      monthlyFleetTotals[mKey].jobs += data.jobs || 0;
      monthlyFleetTotals[mKey].limit += lim;

      // Add to dynamic totals only if active
      if (activeMonths.includes(mKey)) {
        fleetDist += data.dist || 0;
        fleetFuel += data.fuel || 0;
        fleetCost += data.cost || 0;
        fleetJobs += data.jobs || 0;
        fleetTotalLimit += lim;
      }
    });
  });

  const fleetAvgEff = fleetFuel > 0 ? fleetDist / fleetFuel : 0;
  const fleetAvgCKm = fleetDist > 0 ? fleetCost / fleetDist : 0;
  const fleetAvgCJob = fleetJobs > 0 ? fleetCost / fleetJobs : 0;

  // Calculate dynamic colSpans for top headers
  const getMonthColSpan = (isCollapsed: boolean) => {
    if (isCollapsed) return 1; // Only compact summary column
    let span = 6; // Base: dist, fuel, cost, eff, cKm, cJob
    if (showLimit) span += 1;
    if (showJobs) span += 1;
    return span;
  };

  const totalSummaryColSpan = 6 + (showLimit ? 1 : 0) + (showJobs ? 1 : 0);

  // Descriptive label for summary column
  const summaryTitle = activeMonths.length === 3 && activeMonths.includes('m6') && activeMonths.includes('m7') && activeMonths.includes('m8')
    ? 'ภาพรวม 3 เดือนเริ่มต้น (มิ.ย. - ส.ค. 69)'
    : activeMonths.length === 6
    ? 'ภาพรวม 6 เดือนเต็ม (มิ.ย. - พ.ย. 69)'
    : `ภาพรวม ${activeMonths.length} เดือน (${activeMonths.map((m) => MONTH_CONFIG[m]?.shortLabel || m).join(', ')})`;

  return (
    <div
      id="fuelSection"
      className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden relative z-10 transition-colors mt-8"
    >
      {/* Top Banner */}
      <div className="p-3.5 bg-slate-800 dark:bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Fuel className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-sm">
              ตารางที่ 2: วิเคราะห์ต้นทุนงาน ประสิทธิภาพน้ำมัน และปริมาณ (Integrated Fuel & Operations)
            </h3>
            <p className="text-[11px] text-slate-300">
              วิเคราะห์ความสัมพันธ์ระหว่างระยะทาง น้ำมัน วงเงิน และจำนวนงาน พร้อมระบบฟิลเตอร์เลือกเดือน (มิ.ย. - พ.ย. 69) และย่อ/ขยายคอลัมน์ระดับมือโปร
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-700 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>เชื่อมโยงข้อมูลแบบไดนามิก</span>
          </span>
        </div>
      </div>

      {/* Benchmark Criteria Cards */}
      <div className="bg-white dark:bg-slate-800/90 p-4 border-b border-slate-200 dark:border-slate-700">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>เกณฑ์มาตรฐานการประเมินวิเคราะห์ (Benchmark Criteria)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Excellent */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <h5 className="font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                ดีมาก (Excellent)
              </h5>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex flex-wrap gap-1.5">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                  &gt; 13.0 กม./ลิตร
                </span>
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                  &lt; 2.60 บ./กม.
                </span>
              </div>
              <p className="mt-1 leading-snug">
                วิ่งทางไกลข้ามจังหวัด รถไม่ติด ขับขี่ด้วยความเร็วคงที่ ไม่บรรทุกหนักเกินไป
              </p>
            </div>
          </div>

          {/* Good */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <h5 className="font-bold text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
                ดี (Good)
              </h5>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex flex-wrap gap-1.5">
                <span className="font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                  11.0 - 12.9 กม./ลิตร
                </span>
                <span className="font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                  2.60 - 3.10 บ./กม.
                </span>
              </div>
              <p className="mt-1 leading-snug">
                การวิ่งงานทั่วไป มีการเดินทางผสมผสานทั้งชานเมืองและทางยาว พฤติกรรมการขับขี่ปกติ
              </p>
            </div>
          </div>

          {/* Fair */}
          <div className="bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              <h5 className="font-bold text-orange-700 dark:text-orange-400 text-xs sm:text-sm">
                พอใช้ (Fair)
              </h5>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex flex-wrap gap-1.5">
                <span className="font-semibold text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">
                  9.0 - 10.9 กม./ลิตร
                </span>
                <span className="font-semibold text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">
                  3.11 - 3.80 บ./กม.
                </span>
              </div>
              <p className="mt-1 leading-snug">
                วิ่งงานในเมืองที่รถติดหนัก บรรทุกอุปกรณ์เต็มพิกัด หรือมีการติดเครื่องยนต์นั่งรอหน้างานบ่อย
              </p>
            </div>
          </div>

          {/* Critical */}
          <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <h5 className="font-bold text-red-700 dark:text-red-400 text-xs sm:text-sm">
                ปรับปรุง (Critical)
              </h5>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex flex-wrap gap-1.5">
                <span className="font-semibold text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                  &lt; 9.0 กม./ลิตร
                </span>
                <span className="font-semibold text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                  &gt; 3.80 บ./กม.
                </span>
              </div>
              <p className="mt-1 leading-snug">
                รถมีปัญหาทางเทคนิค (เช่น ลมยางอ่อน เครื่องอืด) หรือพฤติกรรมการขับขี่อันตราย
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROFESSIONAL MONTH MULTI-SELECTOR & COLUMN FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col space-y-3">
        {/* Month Selection Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 shrink-0">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>ฟิลเตอร์เลือกเดือน (Period Multi-Selector):</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-slate-700/60 p-1 rounded-xl border border-slate-200 dark:border-slate-600 shadow-2xs">
              <button
                type="button"
                onClick={() => applyPreset('initial3')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeMonths.length === 3 && activeMonths.includes('m6') && activeMonths.includes('m7') && activeMonths.includes('m8')
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                title="ค่าเริ่มต้น: วิเคราะห์รวม 3 เดือน (มิ.ย. - ส.ค. 69)"
              >
                ⭐ 3 เดือนเริ่มต้น (มิ.ย. - ส.ค.)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('mid3')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeMonths.length === 3 && activeMonths.includes('m7') && activeMonths.includes('m8') && activeMonths.includes('m9')
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                title="วิเคราะห์ 3 เดือนกลาง (ก.ค. - ก.ย. 69)"
              >
                3 เดือนกลาง (ก.ค. - ก.ย.)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('latest3')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeMonths.length === 3 && activeMonths.includes('m9') && activeMonths.includes('m10') && activeMonths.includes('m11')
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                title="วิเคราะห์ 3 เดือนล่าสุด (ก.ย. - พ.ย. 69)"
              >
                3 เดือนล่าสุด (ก.ย. - พ.ย.)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('q4')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeMonths.length === 2 && activeMonths.includes('m10') && activeMonths.includes('m11')
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                title="ไตรมาส 4 (ต.ค. - พ.ย. 69)"
              >
                ไตรมาส 4 (ต.ค. - พ.ย.)
              </button>

              <button
                type="button"
                onClick={() => applyPreset('all6')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeMonths.length === 6
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                title="แสดงครบทั้ง 6 เดือน (มิ.ย. - พ.ย. 69)"
              >
                ครบ 6 เดือน (มิ.ย. - พ.ย.)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            แสดง <b className="text-blue-600 dark:text-blue-400">{activeMonths.length}</b> เดือน • ยอดรวมและอัตราเฉลี่ยคำนวณตามเดือนที่เลือกอัตโนมัติ
          </div>
        </div>

        {/* Individual Month Checkbox Pills & Column Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
          {/* Checkboxes for each month */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
              ปรับแต่งเดือน:
            </span>

            {(['m6', 'm7', 'm8', 'm9', 'm10', 'm11'] as MonthKey[]).map((mKey) => {
              const isSelected = activeMonths.includes(mKey);
              const conf = MONTH_CONFIG[mKey];
              const isNew = mKey === 'm9' || mKey === 'm10' || mKey === 'm11';

              let activeBg = 'bg-blue-700 dark:bg-blue-600 text-white border-blue-700 dark:border-blue-600 ring-2 ring-blue-400/20';
              if (mKey === 'm9') activeBg = 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400/30';
              if (mKey === 'm10') activeBg = 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-400/30';
              if (mKey === 'm11') activeBg = 'bg-pink-600 text-white border-pink-600 ring-2 ring-pink-400/30';

              return (
                <button
                  key={mKey}
                  type="button"
                  onClick={() => toggleMonthSelection(mKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-2xs ${
                    isSelected
                      ? activeBg
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400'
                  }`}
                  title={`คลิกเพื่อ ${isSelected ? 'ซ่อน' : 'แสดง'} ${conf.label}`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{conf.label}</span>
                  {isNew && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>
                      {mKey === 'm9' ? 'ก.ย.' : mKey === 'm10' ? 'ต.ค.' : 'พ.ย.'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Column View Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Toggle Limit Column */}
            <button
              onClick={() => setShowLimit(!showLimit)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                showLimit
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
              }`}
              title="คลิกเพื่อย่อ/แสดงช่องวงเงินบัตรเติมน้ำมันต่อเดือน"
            >
              <CreditCard className="w-3 h-3" />
              <span>ช่องวงเงิน</span>
              <span className="text-[10px] font-bold">{showLimit ? '[-]' : '[+]'}</span>
            </button>

            {/* Toggle Jobs Column */}
            <button
              onClick={() => setShowJobs(!showJobs)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                showJobs
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
              }`}
              title="คลิกเพื่อย่อ/แสดงช่องจำนวนงาน"
            >
              <Briefcase className="w-3 h-3" />
              <span>ช่องงาน</span>
              <span className="text-[10px] font-bold">{showJobs ? '[-]' : '[+]'}</span>
            </button>

            {/* Driver Roster Button */}
            {onOpenDriverRoster && (
              <button
                type="button"
                onClick={() => onOpenDriverRoster(vehicles[0])}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 shadow-2xs ml-1"
                title="เปิดดูและจัดการคนขับรถแต่ละคันแต่ละเดือน (ซ่อนจากตารางหลัก)"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ทำเนียบคนขับ (Driver Roster)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Integrated Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max text-[11px]" id="integratedFuelTable">
          <thead>
            {/* Row 1: Period Super Headers with Toggle buttons */}
            <tr className="bg-slate-800 dark:bg-slate-900 text-white text-center uppercase tracking-wider border-b border-slate-600 select-none">
              <th colSpan={2} className="px-2 py-2.5 font-bold sticky left-0 z-30 border-r border-slate-600 bg-slate-800 dark:bg-slate-900">
                ข้อมูลรถ
              </th>

              {/* Render Super Headers for each active month */}
              {activeMonths.map((mKey) => {
                const conf = MONTH_CONFIG[mKey];
                const isCollapsed = collapsedMonths[mKey];
                const colSpan = getMonthColSpan(isCollapsed);

                return (
                  <th
                    key={mKey}
                    colSpan={colSpan}
                    className={`px-2 py-2.5 font-bold border-r border-slate-600 ${conf.bgHeader} transition-colors`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>{conf.label}</span>
                      <button
                        onClick={() => toggleMonthCollapse(mKey)}
                        className="px-1.5 py-0.5 rounded bg-black/30 hover:bg-black/50 text-[10px] text-white/90 border border-white/20 transition-colors"
                        title={isCollapsed ? `คลิกเพื่อขยายรายละเอียด ${conf.shortLabel}` : `คลิกเพื่อย่อสรุป ${conf.shortLabel}`}
                      >
                        {isCollapsed ? '[+] ขยาย' : '[-] ย่อ'}
                      </button>
                    </div>
                  </th>
                );
              })}

              {/* Total Active Months Super Header */}
              <th
                colSpan={totalSummaryColSpan}
                className="px-2 py-2.5 font-bold border-r border-slate-600 bg-[#1e3a8a]"
              >
                {summaryTitle}
              </th>
            </tr>

            {/* Row 2: Detailed Column Sub-Headers */}
            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-center border-b-2 border-slate-300 dark:border-slate-600">
              <th className="px-2 py-2 font-semibold w-[40px] sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                #
              </th>
              <th className="px-3 py-2 font-semibold w-[100px] sticky left-[40px] z-20 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
                ทะเบียนรถ
              </th>

              {/* Dynamic Columns for each active month */}
              {activeMonths.map((mKey) => {
                const conf = MONTH_CONFIG[mKey];
                const isCollapsed = collapsedMonths[mKey];

                if (isCollapsed) {
                  return (
                    <th
                      key={`${mKey}-collapsed`}
                      className="px-3 py-2 font-bold text-center bg-blue-100/70 dark:bg-blue-900/40 border-r border-slate-300 dark:border-slate-600 text-blue-800 dark:text-blue-300"
                    >
                      {conf.shortLabel} (ยอดรวม)
                    </th>
                  );
                }

                return (
                  <React.Fragment key={`${mKey}-cols`}>
                    <th className="px-2 py-2 font-semibold text-right">ระยะ(กม.)</th>
                    <th className="px-2 py-2 font-semibold text-right">ลิตร</th>

                    {/* วงเงิน (ข้างลิตร ขวา) */}
                    {showLimit && (
                      <th className="px-2 py-2 font-semibold text-right bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-l border-blue-200 dark:border-blue-900">
                        <div className="flex items-center justify-end gap-1">
                          <span>วงเงิน(บ.)</span>
                          <button
                            onClick={() => setShowLimit(false)}
                            className="hover:text-red-500 font-bold text-[9px] px-1 bg-white/70 dark:bg-slate-700 rounded"
                            title="ย่อเก็บช่องวงเงิน"
                          >
                            -
                          </button>
                        </div>
                      </th>
                    )}

                    <th className="px-2 py-2 font-semibold text-right">เงิน(บ.)</th>

                    {/* จำนวนงาน (ถัดจากเงิน) */}
                    {showJobs && (
                      <th className="px-2 py-2 font-semibold text-center bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-l border-emerald-200 dark:border-emerald-900">
                        <div className="flex items-center justify-center gap-1">
                          <span>งาน</span>
                          <button
                            onClick={() => setShowJobs(false)}
                            className="hover:text-red-500 font-bold text-[9px] px-1 bg-white/70 dark:bg-slate-700 rounded"
                            title="ย่อเก็บช่องจำนวนงาน"
                          >
                            -
                          </button>
                        </div>
                      </th>
                    )}

                    <th className="px-2 py-2 font-semibold text-center bg-blue-50/50 dark:bg-blue-900/30">กม./ลิตร</th>
                    <th className="px-2 py-2 font-semibold text-center bg-blue-50/50 dark:bg-blue-900/30">บ./กม.</th>
                    <th className="px-2 py-2 font-semibold text-right border-r border-slate-300 dark:border-slate-600">บ./งาน</th>
                  </React.Fragment>
                );
              })}

              {/* Dynamic Totals Header */}
              <th className="px-2 py-2 font-semibold text-right bg-blue-50 dark:bg-blue-900/20">รวมกม.</th>
              <th className="px-2 py-2 font-semibold text-right bg-blue-50 dark:bg-blue-900/20">รวมลิตร</th>

              {showLimit && (
                <th className="px-2 py-2 font-semibold text-right bg-blue-100/60 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                  วงเงินรวม(บ.)
                </th>
              )}

              <th className="px-2 py-2 font-semibold text-right bg-blue-50 dark:bg-blue-900/20">ยอดรวม(บ.)</th>

              {showJobs && (
                <th className="px-2 py-2 font-semibold text-center bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  รวมงาน
                </th>
              )}

              <th className="px-2 py-2 font-semibold text-center text-blue-700 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/40">
                เฉลี่ย กม./ลิตร
              </th>
              <th className="px-2 py-2 font-semibold text-center bg-blue-50 dark:bg-blue-900/20">เฉลี่ย บ./กม.</th>
              <th className="px-2 py-2 font-semibold text-right border-r border-slate-300 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/20">
                เฉลี่ย บ./งาน
              </th>
            </tr>
          </thead>

          <tbody className="text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
            {vehicles.map((car, idx) => {
              // Calculate dynamic totals for the car using ONLY activeMonths
              const totals = calculateVehicleTotals(car, activeMonths);
              const isUrgent = car.plan === 'urgent_sell';

              return (
                <tr
                  key={car.id || idx}
                  onClick={() => onSelectCar(car)}
                  className={`hover:bg-blue-50/40 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                    isUrgent ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                  }`}
                >
                  <td className="px-2 py-2 text-center text-slate-400 font-bold sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                    {car.order}
                  </td>
                  <td className="px-3 py-2 font-bold text-blue-600 dark:text-blue-400 sticky left-[40px] z-10 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hover:underline shadow-sm">
                    <div className="flex items-center justify-between gap-1.5">
                      <span>{car.plate}</span>
                      {onOpenDriverRoster && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDriverRoster(car);
                          }}
                          title="ทำเนียบคนขับประจำเดือน (คลิกเพื่อดู/แก้ไข)"
                          className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Users className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Render Data Columns for each active month */}
                  {activeMonths.map((mKey) => {
                    const data = car[mKey] || { dist: 0, fuel: 0, cost: 0, jobs: 0 };
                    const mStats = totals[mKey] || { eff: 0, cKm: 0, cJob: 0 };
                    const isCollapsed = collapsedMonths[mKey];
                    const isNewMonth = mKey === 'm9' || mKey === 'm10' || mKey === 'm11';
                    const isEmpty = isNewMonth && !data.dist && !data.fuel && !data.cost && !data.jobs;

                    if (isCollapsed) {
                      return (
                        <td
                          key={`${car.id}-${mKey}-c`}
                          className="px-3 py-2 text-center font-semibold border-r border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                        >
                          {numFormat(data.cost, 0, 0)} บ. • {numFormat(data.dist, 0, 0)} กม. ({data.jobs} งาน)
                        </td>
                      );
                    }

                    return (
                      <React.Fragment key={`${car.id}-${mKey}-data`}>
                        <td className={`px-2 py-2 text-right ${isEmpty ? 'text-slate-400' : ''}`}>
                          {data.dist > 0 ? numFormat(data.dist, 0, 0) : isEmpty ? '-' : '0'}
                        </td>

                        <td className={`px-2 py-2 text-right ${isEmpty ? 'text-slate-400' : ''}`}>
                          {data.fuel > 0 ? numFormat(data.fuel, 3, 3) : isEmpty ? '-' : '0.000'}
                        </td>

                        {/* วงเงิน (ข้างลิตร ขวา) */}
                        {showLimit && (
                          <td className="px-2 py-2 text-right bg-blue-50/40 dark:bg-blue-950/20 font-medium text-slate-600 dark:text-slate-300">
                            {car.limit > 0 ? numFormat(car.limit, 0, 0) : '-'}
                          </td>
                        )}

                        <td className={`px-2 py-2 text-right ${isEmpty ? 'text-slate-400 italic' : 'font-medium'}`}>
                          {data.cost > 0 ? numFormat(data.cost) : isEmpty ? '-' : '0.00'}
                        </td>

                        {/* จำนวนงาน (ถัดจากเงิน) */}
                        {showJobs && (
                          <td className="px-2 py-2 text-center bg-emerald-50/40 dark:bg-emerald-950/20 font-bold text-emerald-700 dark:text-emerald-400">
                            {data.jobs > 0 ? data.jobs : isEmpty ? '-' : '0'}
                          </td>
                        )}

                        <td className={`px-2 py-2 text-center ${getEffColor(mStats.eff)} bg-blue-50/50 dark:bg-blue-900/20`}>
                          {mStats.eff > 0 ? numFormat(mStats.eff) : '-'}
                        </td>

                        <td className={`px-2 py-2 text-center ${getCkmColor(mStats.cKm)} bg-blue-50/50 dark:bg-blue-900/20`}>
                          {mStats.cKm > 0 ? numFormat(mStats.cKm) : '-'}
                        </td>

                        <td className="px-2 py-2 text-right border-r border-slate-300 dark:border-slate-600">
                          {mStats.cJob > 0 ? numFormat(mStats.cJob) : '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}

                  {/* Dynamic Summary Totals Columns */}
                  <td className="px-2 py-2 text-right bg-blue-50 dark:bg-blue-900/20 font-bold">
                    {numFormat(totals.totalDist, 0, 0)}
                  </td>

                  <td className="px-2 py-2 text-right bg-blue-50 dark:bg-blue-900/20 font-bold">
                    {numFormat(totals.totalFuel, 3, 3)}
                  </td>

                  {/* วงเงินรวมตามจำนวนเดือนที่เลือก */}
                  {showLimit && (
                    <td className="px-2 py-2 text-right bg-blue-100/50 dark:bg-blue-900/30 font-bold text-slate-700 dark:text-slate-300">
                      {totals.totalLimit > 0 ? numFormat(totals.totalLimit, 0, 0) : '-'}
                    </td>
                  )}

                  <td className="px-2 py-2 text-right bg-blue-50 dark:bg-blue-900/20 font-bold text-red-600 dark:text-red-400">
                    {numFormat(totals.totalCost)}
                  </td>

                  {/* รวมงาน */}
                  {showJobs && (
                    <td className="px-2 py-2 text-center bg-emerald-100/50 dark:bg-emerald-900/30 font-extrabold text-emerald-700 dark:text-emerald-400">
                      {totals.totalJobs}
                    </td>
                  )}

                  <td className={`px-2 py-2 text-center ${getEffColor(totals.totalEff)} bg-blue-100/50 dark:bg-blue-900/40`}>
                    {totals.totalEff > 0 ? numFormat(totals.totalEff) : '-'}
                  </td>

                  <td className={`px-2 py-2 text-center ${getCkmColor(totals.totalCKm)} bg-blue-50 dark:bg-blue-900/20`}>
                    {totals.totalCKm > 0 ? numFormat(totals.totalCKm) : '-'}
                  </td>

                  <td className="px-2 py-2 text-right border-r border-slate-300 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/20 font-bold">
                    {totals.totalCJob > 0 ? numFormat(totals.totalCJob) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer with Fleet Totals */}
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800 text-xs border-t-2 border-slate-300 dark:border-slate-600">
              <td
                colSpan={2}
                className="px-2 py-3 font-bold text-slate-800 dark:text-white text-right sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-600"
              >
                รวมทั้งสิ้น (Fleet Total)
              </td>

              {/* Render Footer for each active month */}
              {activeMonths.map((mKey) => {
                const fData = monthlyFleetTotals[mKey];
                const isCollapsed = collapsedMonths[mKey];
                const avgEff = fData.fuel > 0 ? fData.dist / fData.fuel : 0;
                const avgCkm = fData.dist > 0 ? fData.cost / fData.dist : 0;
                const avgCjob = fData.jobs > 0 ? fData.cost / fData.jobs : 0;

                if (isCollapsed) {
                  return (
                    <td
                      key={`foot-${mKey}-c`}
                      className="px-2 py-3 text-center font-bold bg-blue-100/50 border-r border-slate-300 dark:border-slate-600"
                    >
                      {numFormat(fData.cost)} บ. ({fData.jobs} งาน)
                    </td>
                  );
                }

                return (
                  <React.Fragment key={`foot-${mKey}-data`}>
                    <td className="px-2 py-3 text-right font-bold">{numFormat(fData.dist, 0, 0)}</td>
                    <td className="px-2 py-3 text-right font-bold">{numFormat(fData.fuel, 2, 2)}</td>

                    {showLimit && (
                      <td className="px-2 py-3 text-right font-bold text-slate-600 dark:text-slate-300">
                        {numFormat(fData.limit, 0, 0)}
                      </td>
                    )}

                    <td className="px-2 py-3 text-right font-bold text-blue-700 dark:text-blue-400">
                      {numFormat(fData.cost)}
                    </td>

                    {showJobs && (
                      <td className="px-2 py-3 text-center font-extrabold text-emerald-700 dark:text-emerald-400">
                        {fData.jobs}
                      </td>
                    )}

                    <td className="px-2 py-3 text-center font-bold">
                      {numFormat(avgEff)}
                    </td>

                    <td className="px-2 py-3 text-center font-bold">
                      {numFormat(avgCkm)}
                    </td>

                    <td className="px-2 py-3 text-right font-bold border-r border-slate-300 dark:border-slate-600">
                      {numFormat(avgCjob)}
                    </td>
                  </React.Fragment>
                );
              })}

              {/* Dynamic Summary Total Footer */}
              <td className="px-2 py-3 text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/40">
                {numFormat(fleetDist, 0, 0)}
              </td>

              <td className="px-2 py-3 text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/40">
                {numFormat(fleetFuel, 2, 2)}
              </td>

              {showLimit && (
                <td className="px-2 py-3 text-right font-bold text-slate-800 dark:text-slate-200 bg-blue-100/60 dark:bg-blue-900/50">
                  {numFormat(fleetTotalLimit, 0, 0)}
                </td>
              )}

              <td className="px-2 py-3 text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/40">
                {numFormat(fleetCost)}
              </td>

              {showJobs && (
                <td className="px-2 py-3 text-center font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/50">
                  {fleetJobs}
                </td>
              )}

              <td className="px-2 py-3 text-center font-bold text-blue-700 dark:text-blue-400 bg-blue-200/50 dark:bg-blue-900/50">
                {numFormat(fleetAvgEff)}
              </td>

              <td className="px-2 py-3 text-center font-bold text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/40">
                {numFormat(fleetAvgCKm)}
              </td>

              <td className="px-2 py-3 text-right font-bold text-blue-700 dark:text-blue-400 border-r border-slate-300 dark:border-slate-600 bg-blue-100/50 dark:bg-blue-900/40">
                {numFormat(fleetAvgCJob)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Info Notice about Month 9, 10, 11 */}
      <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            <b>ระบบรองรับเดือน 6 ถึง 11 (มิ.ย. - พ.ย. 69):</b> ข้อมูลเดือน 9, 10, 11 เว้นว่างไว้รอคีย์ข้อมูล สามารถคลิกที่แถวของรถคันใดก็ได้เพื่อเปิดหน้าต่างกรอกข้อมูลย้อนหลังหรืออัปเดตแบบเรียลไทม์
          </span>
        </div>
        {onEditCar && vehicles.length > 0 && (
          <button
            onClick={() => onEditCar(vehicles[0])}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>กรอก/แก้ไขข้อมูลเดือนใหม่</span>
          </button>
        )}
      </div>
    </div>
  );
};
