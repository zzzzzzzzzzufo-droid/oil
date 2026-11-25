import React, { useState, useMemo } from 'react';
import {
  Fuel,
  Trophy,
  Flame,
  BarChart3,
  Calendar,
  Users,
  Edit3,
  ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';
import {
  Vehicle,
  MonthKey,
  MONTH_CONFIG,
  ALL_MONTH_KEYS,
  MONTHS_2569,
  MONTHS_2570
} from '../types';
import { numFormat, getVehicleMonthData } from '../utils/calculations';

interface MonthlyTopFuelChartProps {
  vehicles: Vehicle[];
  onSelectCar: (vehicle: Vehicle) => void;
  onEditCar?: (vehicle: Vehicle) => void;
  onOpenDriverRoster?: (vehicle: Vehicle, month?: MonthKey) => void;
  selectedMonths?: MonthKey[];
}

interface ChampionEntry {
  vehicle: Vehicle;
  cost: number;
  fuel: number;
  dist: number;
  jobs: number;
  eff: number;
  cKm: number;
  cJob: number;
  limitUsage: number;
  drivers: string[];
}

export const MonthlyTopFuelChart: React.FC<MonthlyTopFuelChartProps> = ({
  vehicles,
  onSelectCar,
  onEditCar,
  onOpenDriverRoster,
  selectedMonths
}) => {
  const activePeriodMonths: MonthKey[] = selectedMonths || ['m6', 'm7', 'm8'];

  // Year filter for clean cross-year navigation
  const [yearScope, setYearScope] = useState<'2569' | '2570' | 'all'>('2569');
  const [activeMonth, setActiveMonth] = useState<MonthKey | 'total'>('m7');
  const [activeTab, setActiveTab] = useState<'champions' | 'ranking'>('champions');
  const [chartMode, setChartMode] = useState<'monthlyComparison' | 'fleetDistribution'>('monthlyComparison');
  const [hoveredPlate, setHoveredPlate] = useState<string | null>(null);

  const visibleMonths: MonthKey[] = useMemo(() => {
    if (yearScope === '2569') return [...MONTHS_2569];
    if (yearScope === '2570') return [...MONTHS_2570];
    return [...ALL_MONTH_KEYS];
  }, [yearScope]);

  const handleChangeYearScope = (nextScope: '2569' | '2570' | 'all') => {
    setYearScope(nextScope);
    if (nextScope === '2569' && activeMonth !== 'total' && !MONTHS_2569.includes(activeMonth as typeof MONTHS_2569[number])) {
      setActiveMonth('m12');
    } else if (nextScope === '2570' && activeMonth !== 'total' && !MONTHS_2570.includes(activeMonth as typeof MONTHS_2570[number])) {
      setActiveMonth('y70_m1');
    }
  };

  // Compute #1 Champion for each of the 19 months
  const monthlyChampions = useMemo(() => {
    const map = {} as Record<MonthKey, ChampionEntry | null>;

    ALL_MONTH_KEYS.forEach((m) => {
      const sorted = [...vehicles].sort(
        (a, b) => getVehicleMonthData(b, m).cost - getVehicleMonthData(a, m).cost
      );
      const top = sorted[0];
      const topData = top ? getVehicleMonthData(top, m) : null;

      if (top && topData && topData.cost > 0) {
        const { cost, fuel, dist, jobs, drivers = [] } = topData;
        const limit = top.limit || 12000;
        const eff = fuel > 0 ? dist / fuel : 0;
        const cKm = dist > 0 ? cost / dist : 0;
        const cJob = jobs > 0 ? cost / jobs : 0;
        const limitUsage = limit > 0 ? (cost / limit) * 100 : 0;

        map[m] = {
          vehicle: top,
          cost,
          fuel,
          dist,
          jobs,
          eff,
          cKm,
          cJob,
          limitUsage,
          drivers
        };
      } else {
        map[m] = null;
      }
    });

    return map;
  }, [vehicles]);

  // Overall Total Champion across activePeriodMonths
  const totalChampion = useMemo(() => {
    const sorted = [...vehicles].sort((a, b) => {
      const costA = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(a, m).cost, 0);
      const costB = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(b, m).cost, 0);
      return costB - costA;
    });

    const top = sorted[0];
    if (!top) return null;

    const cost = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(top, m).cost, 0);
    const fuel = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(top, m).fuel, 0);
    const dist = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(top, m).dist, 0);
    const jobs = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(top, m).jobs, 0);
    const limit = (top.limit || 12000) * activePeriodMonths.length;
    const eff = fuel > 0 ? dist / fuel : 0;
    const cKm = dist > 0 ? cost / dist : 0;
    const cJob = jobs > 0 ? cost / jobs : 0;
    const limitUsage = limit > 0 ? (cost / limit) * 100 : 0;

    return {
      vehicle: top,
      cost,
      fuel,
      dist,
      jobs,
      eff,
      cKm,
      cJob,
      limitUsage,
      drivers: top.m8?.drivers || top.m7?.drivers || []
    };
  }, [vehicles, activePeriodMonths]);

  // Vehicles ranked for the currently active month
  const activeMonthRankings = useMemo(() => {
    if (activeMonth === 'total') {
      return [...vehicles]
        .map((v) => {
          const cost = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(v, m).cost, 0);
          const fuel = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(v, m).fuel, 0);
          const dist = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(v, m).dist, 0);
          const jobs = activePeriodMonths.reduce((sum, m) => sum + getVehicleMonthData(v, m).jobs, 0);
          const limit = (v.limit || 0) * activePeriodMonths.length;
          const eff = fuel > 0 ? dist / fuel : 0;
          const cKm = dist > 0 ? cost / dist : 0;
          const cJob = jobs > 0 ? cost / jobs : 0;
          const limitUsage = limit > 0 ? (cost / limit) * 100 : 0;
          return {
            vehicle: v,
            cost,
            fuel,
            dist,
            jobs,
            limit,
            eff,
            cKm,
            cJob,
            limitUsage,
            drivers: v.m8?.drivers || []
          };
        })
        .sort((a, b) => b.cost - a.cost);
    }

    return [...vehicles]
      .map((v) => {
        const mData = getVehicleMonthData(v, activeMonth);
        const { cost, fuel, dist, jobs, drivers = [] } = mData;
        const limit = v.limit || 0;
        const eff = fuel > 0 ? dist / fuel : 0;
        const cKm = dist > 0 ? cost / dist : 0;
        const cJob = jobs > 0 ? cost / jobs : 0;
        const limitUsage = limit > 0 ? (cost / limit) * 100 : 0;
        return {
          vehicle: v,
          cost,
          fuel,
          dist,
          jobs,
          limit,
          eff,
          cKm,
          cJob,
          limitUsage,
          drivers
        };
      })
      .sort((a, b) => b.cost - a.cost);
  }, [vehicles, activeMonth, activePeriodMonths]);

  const currentSpotlight = activeMonth === 'total' ? totalChampion : monthlyChampions[activeMonth];

  const maxFleetCost = useMemo(() => {
    return Math.max(...activeMonthRankings.map((r) => r.cost), 12000);
  }, [activeMonthRankings]);

  const avgFleetCost = useMemo(() => {
    const total = activeMonthRankings.reduce((sum, r) => sum + r.cost, 0);
    return activeMonthRankings.length > 0 ? total / activeMonthRankings.length : 0;
  }, [activeMonthRankings]);

  const maxMonthlyChampionCost = useMemo(() => {
    let max = 12000;
    visibleMonths.forEach((m) => {
      const champ = monthlyChampions[m];
      if (champ && champ.cost > max) max = champ.cost;
    });
    return max;
  }, [monthlyChampions, visibleMonths]);

  const getPlanBadge = (plan: Vehicle['plan']) => {
    switch (plan) {
      case 'urgent_sell':
        return <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">ขายด่วน P1</span>;
      case 'sell':
        return <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-900">ทยอยขาย P2</span>;
      case 'rebrand':
        return <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">Re-brand</span>;
      case 'keep':
      default:
        return <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">เก็บไว้ใช้</span>;
    }
  };

  return (
    <div
      id="monthlyTopFuelSection"
      className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden relative z-10 mt-8 scroll-mt-24 transition-colors"
    >
      {/* Top Banner Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>Fuel Peak Analytics</span>
            </span>
            <span className="text-xs text-amber-300 font-medium">
              ปี 2569 – ปี 2570 (19 เดือน)
            </span>
          </div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>ทำเนียบรถยอดเติมน้ำมันเยอะสุดในแต่ละเดือน (ตาราง & กราฟวิเคราะห์)</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            ตรวจพบว่าคันไหนกินน้ำมันสูงสุดในแต่ละรอบเดือน เปรียบเทียบกับเพดานวงเงินบัตร และติดตามคนขับประจำเดือน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-950/60 border border-amber-600/60 rounded-xl px-3 py-1.5 text-xs text-amber-200 flex items-center gap-2 shadow-xs">
            <Fuel className="w-4 h-4 text-amber-400" />
            <span>เพดานบัตรปกติ: <b>12,000 บ./เดือน</b></span>
          </div>
        </div>
      </div>

      {/* Year Scope & Month Navigation Bar */}
      <div className="p-4 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>เลือกรอบปี & เดือนที่ต้องการดูแชมป์เติมน้ำมัน:</span>
          </div>

          {/* Year Scope Segmented Control */}
          <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-700 p-1 text-xs font-bold border border-slate-300/60 dark:border-slate-600">
            <button
              type="button"
              onClick={() => handleChangeYearScope('2569')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                yearScope === '2569'
                  ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              ปี 2569 (มิ.ย.-ธ.ค.)
            </button>
            <button
              type="button"
              onClick={() => handleChangeYearScope('2570')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                yearScope === '2570'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              ปี 2570 (ม.ค.-ธ.ค.)
            </button>
            <button
              type="button"
              onClick={() => handleChangeYearScope('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                yearScope === 'all'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              ทั้งหมด (19 ด.)
            </button>
          </div>
        </div>

        {/* Month Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleMonths.map((m) => {
            const conf = MONTH_CONFIG[m];
            const champ = monthlyChampions[m];
            const isSelected = activeMonth === m;

            return (
              <button
                key={m}
                type="button"
                onClick={() => setActiveMonth(m)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-2xs ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-400/30'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-amber-300'
                }`}
              >
                <span>{conf.shortYearLabel}</span>
                {champ ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${isSelected ? 'bg-black/20 text-white' : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                    {champ.vehicle.plate}
                  </span>
                ) : (
                  <span className={`text-[10px] ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>รอข้อมูล</span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveMonth('total')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-2xs ${
              activeMonth === 'total'
                ? 'bg-blue-700 text-white border-blue-700 ring-2 ring-blue-400/30'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-300'
            }`}
          >
            <span>ยอดรวมสะสม ({activePeriodMonths.length} ด.)</span>
            {totalChampion && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${activeMonth === 'total' ? 'bg-black/20 text-white' : 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300'}`}>
                {totalChampion.vehicle.plate}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Spotlight Card: The #1 Vehicle for the Active Month */}
      <div className="p-4 md:p-6 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/10 border-b border-slate-200 dark:border-slate-700">
        {currentSpotlight ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 border border-amber-200 dark:border-amber-900/60 shadow-md relative overflow-hidden">
            <Trophy className="w-48 h-48 text-amber-500/5 dark:text-amber-400/5 absolute -right-6 -bottom-6 pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xs">
                    <Trophy className="w-3.5 h-3.5 fill-current" />
                    <span>อันดับ 1 ยอดเติมน้ำมันสูงสุด</span>
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {activeMonth === 'total'
                      ? `ภาพรวมสะสม ${activePeriodMonths.length} เดือน`
                      : MONTH_CONFIG[activeMonth]?.thaiName}
                  </span>
                  {getPlanBadge(currentSpotlight.vehicle.plan)}
                </div>

                <div className="flex items-baseline gap-3">
                  <h4
                    onClick={() => onSelectCar(currentSpotlight.vehicle)}
                    className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    title="คลิกเพื่อดูรายละเอียดรถคันนี้"
                  >
                    {currentSpotlight.vehicle.plate}
                  </h4>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {currentSpotlight.vehicle.branch}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
                  {currentSpotlight.vehicle.notes || currentSpotlight.vehicle.recommendation}
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    คนขับประจำเดือน:
                  </span>
                  {currentSpotlight.drivers.filter(Boolean).length > 0 ? (
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                      {currentSpotlight.drivers.filter(Boolean).join(' • ')}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">ยังไม่ได้ระบุชื่อคนขับ</span>
                  )}

                  {onOpenDriverRoster && (
                    <button
                      type="button"
                      onClick={() => onOpenDriverRoster(currentSpotlight.vehicle, activeMonth === 'total' ? 'm8' : activeMonth)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-1 flex items-center gap-0.5"
                    >
                      <span>[จัดการคนขับ]</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                    ยอดเติมน้ำมัน
                  </span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {numFormat(currentSpotlight.cost, 0, 2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">บาท</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    ปริมาณที่เติม
                  </span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {numFormat(currentSpotlight.fuel, 0, 1)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">ลิตร</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    อัตรากินน้ำมัน
                  </span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {currentSpotlight.eff > 0 ? numFormat(currentSpotlight.eff, 0, 2) : '-'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">กม./ลิตร</span>
                </div>

                <div className={`rounded-xl p-3 text-center border ${
                  currentSpotlight.limitUsage >= 100
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                }`}>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    ใช้เพดานบัตร
                  </span>
                  <span className={`text-xl font-black ${
                    currentSpotlight.limitUsage >= 100
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {numFormat(currentSpotlight.limitUsage, 0, 1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {currentSpotlight.limitUsage >= 100 ? '⚠️ เต็มเพดาน' : 'อยู่ในเกณฑ์'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>ระยะทางที่วิ่ง: <b>{numFormat(currentSpotlight.dist)} กม.</b></span>
                <span>•</span>
                <span>จำนวนงาน: <b>{currentSpotlight.jobs} งาน</b></span>
                <span>•</span>
                <span>ต้นทุน/กม.: <b>{currentSpotlight.cKm > 0 ? numFormat(currentSpotlight.cKm, 0, 2) : '-'} บ.</b></span>
                <span>•</span>
                <span>ต้นทุน/งาน: <b>{currentSpotlight.cJob > 0 ? numFormat(currentSpotlight.cJob, 0, 2) : '-'} บ.</b></span>
              </div>

              <div className="flex items-center gap-2">
                {onEditCar && (
                  <button
                    type="button"
                    onClick={() => onEditCar(currentSpotlight.vehicle)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                    <span>แก้ไขตัวเลขน้ำมัน</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSelectCar(currentSpotlight.vehicle)}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <span>ดูสถิติและประวัติคันนี้</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <Fuel className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              ยังไม่มีข้อมูลการเติมน้ำมันในเดือน {activeMonth === 'total' ? 'ที่เลือก' : MONTH_CONFIG[activeMonth]?.thaiName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              ท่านสามารถคลิกที่ปุ่ม &quot;แก้ไขข้อมูล&quot; ในตารางหลักเพื่อเริ่มบันทึกตัวเลขค่าน้ำมันและระยะทางประจำเดือนนี้ได้ทันที
            </p>
          </div>
        )}
      </div>

      {/* Graphs Section */}
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>
                {chartMode === 'monthlyComparison'
                  ? `กราฟเปรียบเทียบแชมป์ยอดเติมน้ำมันสูงสุด (${
                      yearScope === '2569' ? 'ปี 2569: มิ.ย.-ธ.ค.' : yearScope === '2570' ? 'ปี 2570: ม.ค.-ธ.ค.' : 'ครบ 19 เดือน: มิ.ย. 69 - ธ.ค. 70'
                    })`
                  : `กราฟจัดอันดับยอดเติมน้ำมันทั้งฟลีทในเดือน ${activeMonth === 'total' ? 'ภาพรวมสะสม' : MONTH_CONFIG[activeMonth]?.thaiName}`}
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {chartMode === 'monthlyComparison'
                ? 'คลิกที่แท่งกราฟประจำเดือนเพื่อสลับไปดูรายละเอียดเชิงลึกของเดือนนั้น'
                : 'แสดงอันดับค่าน้ำมันของรถทุกคันในฟลีท เรียงจากยอดเติมเยอะสุดไปน้อยสุด'}
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setChartMode('monthlyComparison')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMode === 'monthlyComparison'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              เทรนด์เปรียบเทียบรายเดือน
            </button>
            <button
              type="button"
              onClick={() => setChartMode('fleetDistribution')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMode === 'fleetDistribution'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              จัดอันดับรถทั้งฟลีท (เดือนนี้)
            </button>
          </div>
        </div>

        {/* Chart View 1: Chronological Comparison */}
        {chartMode === 'monthlyComparison' && (
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 overflow-x-auto">
            {hoveredPlate && (
              <div className="mb-2 p-2 bg-slate-900/90 text-white rounded-lg text-xs font-medium self-center shadow-lg transition-all animate-fade-in flex items-center gap-2 max-w-fit mx-auto">
                <span className="font-bold text-amber-300">รถ {hoveredPlate}</span>
                <span>•</span>
                <span>ยอดเติมสูงสุดประจำเดือน</span>
              </div>
            )}

            <div
              className="grid gap-2 sm:gap-3 items-end h-[240px] pt-8 pb-2 border-b border-slate-200 dark:border-slate-700 relative min-w-[540px]"
              style={{
                gridTemplateColumns: `repeat(${visibleMonths.length}, minmax(48px, 1fr))`
              }}
            >
              {/* Benchmark Reference Line (12,000 Baht Limit) */}
              <div
                className="absolute w-full border-b border-dashed border-red-400/60 dark:border-red-500/60 z-10 pointer-events-none flex items-center justify-end pr-2"
                style={{
                  bottom: `${Math.min(100, (12000 / maxMonthlyChampionCost) * 100)}%`
                }}
              >
                <span className="text-[10px] font-bold text-red-500 bg-white/90 dark:bg-slate-900/90 px-1 rounded shadow-2xs">
                  เพดานบัตรปกติ 12,000 บ.
                </span>
              </div>

              {visibleMonths.map((m) => {
                const conf = MONTH_CONFIG[m];
                const champ = monthlyChampions[m];
                const cost = champ?.cost || 0;
                const heightPercent = maxMonthlyChampionCost > 0 ? (cost / maxMonthlyChampionCost) * 100 : 0;
                const isSelected = activeMonth === m;

                return (
                  <div
                    key={m}
                    onClick={() => setActiveMonth(m)}
                    onMouseEnter={() => champ && setHoveredPlate(champ.vehicle.plate)}
                    onMouseLeave={() => setHoveredPlate(null)}
                    className="group flex flex-col items-center justify-end h-full cursor-pointer relative"
                  >
                    <div className={`mb-1 text-center transition-all ${champ ? 'opacity-100' : 'opacity-40'}`}>
                      {champ ? (
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-black ${
                            cost >= 12000 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {numFormat(cost)} บ.
                          </span>
                          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-1 rounded truncate max-w-[60px]">
                            {champ.vehicle.plate}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">0 บ.</span>
                      )}
                    </div>

                    <div
                      style={{
                        height: `${Math.max(heightPercent, cost > 0 ? 6 : 2)}%`
                      }}
                      className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 relative shadow-xs group-hover:brightness-110 ${
                        isSelected
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 ring-2 ring-amber-400 shadow-md'
                          : cost >= 12000
                          ? 'bg-gradient-to-t from-red-600 to-red-400'
                          : cost > 0
                          ? 'bg-gradient-to-t from-slate-600 to-amber-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      {champ && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[9px] text-white">
                          🏆
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-center">
                      <span className={`text-[11px] font-bold block ${isSelected ? 'text-amber-600 dark:text-amber-400 underline underline-offset-4' : 'text-slate-700 dark:text-slate-300'}`}>
                        {conf.shortLabel}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        {conf.year === 2569 ? '69' : '70'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  <span>คันที่เติมเยอะที่สุดประจำเดือน</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-500" />
                  <span>ชนเพดาน 12,000 บ. (เต็มวงเงิน)</span>
                </span>
              </div>
              <span>คลิกที่แท่งกราฟของเดือนใดก็ได้เพื่อเปิดตารางของเดือนนั้น</span>
            </div>
          </div>
        )}

        {/* Chart View 2: Full Fleet Fuel Ranking for Selected Month */}
        {chartMode === 'fleetDistribution' && (
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold">
                จัดอันดับรถ {vehicles.length} คันตามยอดเติมน้ำมัน ({activeMonth === 'total' ? 'ยอดรวมสะสม' : MONTH_CONFIG[activeMonth]?.thaiName})
              </span>
              <span>
                ค่าเฉลี่ยฟลีท: <b className="text-amber-600 dark:text-amber-400">{numFormat(avgFleetCost, 0, 0)} บาท/คัน</b>
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {activeMonthRankings.map((item, idx) => {
                const widthPercent = maxFleetCost > 0 ? (item.cost / maxFleetCost) * 100 : 0;
                const isChampion = idx === 0 && item.cost > 0;
                const isOverLimit = item.cost >= item.limit && item.limit > 0;

                return (
                  <div
                    key={item.vehicle.id}
                    onClick={() => onSelectCar(item.vehicle)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      isChampion
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="w-[140px] shrink-0 flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {item.vehicle.plate}
                      </span>
                      {isChampion && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                    </div>

                    <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                      <div
                        style={{ width: `${Math.max(widthPercent, item.cost > 0 ? 3 : 0)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isChampion
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                            : isOverLimit
                            ? 'bg-gradient-to-r from-red-600 to-red-400'
                            : item.cost > 0
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-500'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>

                    <div className="w-[180px] shrink-0 text-right flex items-center justify-end gap-3">
                      <div>
                        <span className={`font-black ${
                          isChampion
                            ? 'text-amber-600 dark:text-amber-400'
                            : isOverLimit
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {numFormat(item.cost, 0, 2)} บ.
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {numFormat(item.fuel, 0, 1)} ลิตร
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.limitUsage >= 100
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {numFormat(item.limitUsage, 0, 0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tables Section: 2 Tabbed Modes */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {activeTab === 'champions'
                ? `ตารางที่ 1: สรุปคันที่เติมน้ำมันเยอะสุดในแต่ละเดือน (${
                    yearScope === '2569' ? 'ปี 2569' : yearScope === '2570' ? 'ปี 2570' : 'ปี 2569 - 2570'
                  })`
                : `ตารางที่ 2: รายการจัดอันดับยอดเติมน้ำมันทุกคันประจำเดือน (${activeMonth === 'total' ? 'ยอดรวมสะสม' : MONTH_CONFIG[activeMonth]?.thaiName})`}
            </h4>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('champions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'champions'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ตารางแชมป์ทุกเดือน ({visibleMonths.length} ด.)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ranking')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ranking'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ตารางจัดอันดับรถทั้งฟลีท ({vehicles.length} คัน)
            </button>
          </div>
        </div>

        {/* Tab 1: Monthly Champions Matrix */}
        {activeTab === 'champions' && (
          <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-slate-800 text-white border-b border-slate-700 text-center uppercase tracking-wider text-[11px]">
                  <th className="px-3 py-2.5 font-bold text-left">เดือน (Month)</th>
                  <th className="px-3 py-2.5 font-bold text-left">🏆 คันที่เติมเยอะที่สุด</th>
                  <th className="px-3 py-2.5 font-bold">สังกัด/สาขา</th>
                  <th className="px-3 py-2.5 font-bold bg-amber-900/60 text-amber-200">ยอดเงิน (บาท)</th>
                  <th className="px-3 py-2.5 font-bold">ปริมาณ (ลิตร)</th>
                  <th className="px-3 py-2.5 font-bold">ระยะทาง (กม.)</th>
                  <th className="px-3 py-2.5 font-bold">กม./ลิตร</th>
                  <th className="px-3 py-2.5 font-bold">บ./กม.</th>
                  <th className="px-3 py-2.5 font-bold">ใช้เพดาน (%)</th>
                  <th className="px-3 py-2.5 font-bold text-left">คนขับประจำเดือน</th>
                  <th className="px-3 py-2.5 font-bold">แผนจัดการ</th>
                  <th className="px-3 py-2.5 font-bold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {visibleMonths.map((m) => {
                  const conf = MONTH_CONFIG[m];
                  const champ = monthlyChampions[m];
                  const isSelected = activeMonth === m;

                  if (!champ) {
                    return (
                      <tr key={m} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                        <td className="px-3 py-3 font-bold text-slate-800 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.color }} />
                            <span>{conf.thaiName}</span>
                          </span>
                        </td>
                        <td colSpan={10} className="px-3 py-3 text-slate-400 italic">
                          เว้นว่างไว้เพื่อรอคีย์ข้อมูลจริง (คลิกปุ่ม &quot;แก้ไขข้อมูล&quot; ในตารางหลักเพื่อใส่ตัวเลขได้ทันที)
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => setActiveMonth(m)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            เลือกเดือน
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  const { vehicle, cost, fuel, dist, eff, cKm, limitUsage, drivers } = champ;

                  return (
                    <tr
                      key={m}
                      className={`hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors ${
                        isSelected ? 'bg-amber-50/40 dark:bg-amber-950/20 font-medium' : ''
                      }`}
                    >
                      <td className="px-3 py-3 font-bold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.color }} />
                          <span>{conf.thaiName}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 font-black text-slate-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => onSelectCar(vehicle)}
                          className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{vehicle.plate}</span>
                        </button>
                      </td>

                      <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-300">
                        {vehicle.branch}
                      </td>

                      <td className="px-3 py-3 text-center font-black text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30">
                        {numFormat(cost, 0, 2)}
                      </td>

                      <td className="px-3 py-3 text-center text-slate-700 dark:text-slate-300">
                        {numFormat(fuel, 0, 1)}
                      </td>

                      <td className="px-3 py-3 text-center text-slate-700 dark:text-slate-300">
                        {numFormat(dist)}
                      </td>

                      <td className="px-3 py-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {eff > 0 ? numFormat(eff, 0, 2) : '-'}
                      </td>

                      <td className="px-3 py-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {cKm > 0 ? numFormat(cKm, 0, 2) : '-'}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          limitUsage >= 100
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}>
                          {numFormat(limitUsage, 0, 1)}%
                        </span>
                      </td>

                      <td className="px-3 py-3 text-left">
                        {drivers.filter(Boolean).length > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            {drivers.filter(Boolean).join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-center">
                        {getPlanBadge(vehicle.plan)}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectCar(vehicle)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            title="ดูโปรไฟล์รถ"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          {onEditCar && (
                            <button
                              type="button"
                              onClick={() => onEditCar(vehicle)}
                              className="p-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                              title="แก้ไขข้อมูลน้ำมัน"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Full Fleet Ranking for Selected Month */}
        {activeTab === 'ranking' && (
          <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="bg-slate-800 text-white border-b border-slate-700 text-center uppercase tracking-wider text-[11px]">
                  <th className="px-3 py-2.5 font-bold w-[40px]">#</th>
                  <th className="px-3 py-2.5 font-bold text-left">ทะเบียนรถ</th>
                  <th className="px-3 py-2.5 font-bold">สังกัด/สาขา</th>
                  <th className="px-3 py-2.5 font-bold bg-amber-900/60 text-amber-200">ยอดเติมน้ำมัน (บาท)</th>
                  <th className="px-3 py-2.5 font-bold">ปริมาณ (ลิตร)</th>
                  <th className="px-3 py-2.5 font-bold">วงเงิน (บาท)</th>
                  <th className="px-3 py-2.5 font-bold">การใช้วงเงิน (%)</th>
                  <th className="px-3 py-2.5 font-bold">ระยะทาง (กม.)</th>
                  <th className="px-3 py-2.5 font-bold">งาน (Jobs)</th>
                  <th className="px-3 py-2.5 font-bold">ต้นทุน/กม.</th>
                  <th className="px-3 py-2.5 font-bold">ต้นทุน/งาน</th>
                  <th className="px-3 py-2.5 font-bold text-left">คนขับ</th>
                  <th className="px-3 py-2.5 font-bold">แผนจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                {activeMonthRankings.map((r, index) => {
                  const isTop1 = index === 0 && r.cost > 0;
                  const isOverLimit = r.cost >= r.limit && r.limit > 0;

                  return (
                    <tr
                      key={r.vehicle.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors ${
                        isTop1 ? 'bg-amber-50/50 dark:bg-amber-950/20 font-medium' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center font-bold">
                        {isTop1 ? (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black inline-flex items-center justify-center text-[10px]">
                            1
                          </span>
                        ) : (
                          <span className="text-slate-500">{index + 1}</span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 font-black text-slate-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => onSelectCar(r.vehicle)}
                          className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1"
                        >
                          {isTop1 && <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                          <span>{r.vehicle.plate}</span>
                        </button>
                      </td>

                      <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">
                        {r.vehicle.branch}
                      </td>

                      <td className={`px-3 py-2.5 text-center font-black ${
                        isTop1
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
                          : isOverLimit
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {numFormat(r.cost, 0, 2)}
                      </td>

                      <td className="px-3 py-2.5 text-center text-slate-700 dark:text-slate-300">
                        {numFormat(r.fuel, 0, 1)}
                      </td>

                      <td className="px-3 py-2.5 text-center text-slate-500 dark:text-slate-400">
                        {numFormat(r.limit)}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          r.limitUsage >= 100
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {numFormat(r.limitUsage, 0, 1)}%
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-center text-slate-700 dark:text-slate-300">
                        {numFormat(r.dist)}
                      </td>

                      <td className="px-3 py-2.5 text-center text-slate-700 dark:text-slate-300">
                        {r.jobs}
                      </td>

                      <td className="px-3 py-2.5 text-center text-slate-800 dark:text-slate-200">
                        {r.cKm > 0 ? numFormat(r.cKm, 0, 2) : '-'}
                      </td>

                      <td className="px-3 py-2.5 text-center text-slate-800 dark:text-slate-200">
                        {r.cJob > 0 ? numFormat(r.cJob, 0, 2) : '-'}
                      </td>

                      <td className="px-3 py-2.5 text-left text-slate-600 dark:text-slate-300">
                        {r.drivers.filter(Boolean).length > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            {r.drivers.filter(Boolean).join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        {getPlanBadge(r.vehicle.plan)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
