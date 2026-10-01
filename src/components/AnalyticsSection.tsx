import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  CalendarCheck,
  Filter,
  Trophy,
  AlertTriangle,
  ArrowDownNarrowWide,
  BadgeDollarSign,
  CreditCard,
  Route,
  ChevronRight,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  Car,
  Flame,
  Paintbrush,
  Check,
  ShieldAlert,
  Wrench,
  Layers,
  Coins,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { Vehicle, PeriodFilter, MetricFilter } from '../types';
import { numFormat } from '../utils/calculations';
import { STRATEGIC_PLANS, ActionSolution } from '../utils/strategicSolutions';

interface AnalyticsSectionProps {
  vehicles: Vehicle[];
  onSelectCar: (vehicle: Vehicle) => void;
  onEditCar?: (vehicle: Vehicle) => void;
  onOpenMemo?: () => void;
  onOpenMarketIntel?: (vehicle?: Vehicle) => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  vehicles,
  onSelectCar,
  onEditCar,
  onOpenMemo,
  onOpenMarketIntel
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('total');
  const [metric, setMetric] = useState<MetricFilter>('cost_km_desc'); // default to the most critical topic as requested
  const [hoveredCar, setHoveredCar] = useState<{ plate: string; value: number; unit: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'technical' | 'management' | 'finance' | 'policy'>('all');

  // Compute sorted items based on metric and period
  const { title, unit, sortedData, maxValue } = useMemo(() => {
    let t = '';
    let u = '';
    let extractor: (v: Vehicle) => number = () => 0;
    let comparator: (a: Vehicle, b: Vehicle) => number = () => 0;

    switch (metric) {
      case 'jobs_desc':
        t = 'อันดับรถที่วิ่งงานเยอะที่สุด';
        u = 'งาน';
        extractor = (v) =>
          period === 'total'
            ? v.m6.jobs + v.m7.jobs + v.m8.jobs
            : v[period]?.jobs || 0;
        comparator = (a, b) => extractor(b) - extractor(a);
        break;

      case 'cost_km_desc':
        t = 'อันดับรถวิ่งไม่คุ้มค่า (กินน้ำมันสูงสุด)';
        u = 'บ./กม.';
        extractor = (v) => {
          const cost =
            period === 'total'
              ? v.m6.cost + v.m7.cost + v.m8.cost
              : v[period]?.cost || 0;
          const dist =
            period === 'total'
              ? v.m6.dist + v.m7.dist + v.m8.dist
              : v[period]?.dist || 0;
          return dist > 0 ? cost / dist : 0;
        };
        comparator = (a, b) => extractor(b) - extractor(a);
        break;

      case 'jobs_asc':
        t = 'อันดับรถที่จอดแช่ (งานน้อยที่สุด)';
        u = 'งาน';
        extractor = (v) =>
          period === 'total'
            ? v.m6.jobs + v.m7.jobs + v.m8.jobs
            : v[period]?.jobs || 0;
        comparator = (a, b) => extractor(a) - extractor(b);
        break;

      case 'cost_job_desc':
        t = 'อันดับรถต้นทุนต่องานแพงที่สุด';
        u = 'บ./งาน';
        extractor = (v) => {
          const cost =
            period === 'total'
              ? v.m6.cost + v.m7.cost + v.m8.cost
              : v[period]?.cost || 0;
          const jobs =
            period === 'total'
              ? v.m6.jobs + v.m7.jobs + v.m8.jobs
              : v[period]?.jobs || 0;
          return jobs > 0 ? cost / jobs : 0;
        };
        comparator = (a, b) => extractor(b) - extractor(a);
        break;

      case 'limit_usage_desc':
        t = 'อันดับรถใช้วงเงินเติมน้ำมันเต็มเพดาน';
        u = '%';
        extractor = (v) => {
          let lim = v.limit;
          if (lim === 0) return 0;
          if (period === 'total') lim *= 3;
          const cost =
            period === 'total'
              ? v.m6.cost + v.m7.cost + v.m8.cost
              : v[period]?.cost || 0;
          return (cost / lim) * 100;
        };
        comparator = (a, b) => extractor(b) - extractor(a);
        break;

      case 'distance_desc':
        t = 'อันดับรถวิ่งระยะทางเยอะที่สุด';
        u = 'กม.';
        extractor = (v) =>
          period === 'total'
            ? v.m6.dist + v.m7.dist + v.m8.dist
            : v[period]?.dist || 0;
        comparator = (a, b) => extractor(b) - extractor(a);
        break;
    }

    const sorted = [...vehicles].sort(comparator).map((v) => ({
      vehicle: v,
      value: extractor(v)
    }));

    const max = Math.max(...sorted.map((s) => s.value), 1);

    return {
      title: t,
      unit: u,
      sortedData: sorted,
      maxValue: max
    };
  }, [vehicles, metric, period]);

  // Current strategic plan for selected metric
  const currentPlan = STRATEGIC_PLANS[metric] || STRATEGIC_PLANS.cost_km_desc;

  // Filter solutions by category tab
  const filteredSolutions = useMemo(() => {
    if (categoryFilter === 'all') return currentPlan.solutions;
    return currentPlan.solutions.filter((s) => s.category === categoryFilter);
  }, [currentPlan, categoryFilter]);

  // Top 3 Spotlight Cars
  const top3Cars = useMemo(() => {
    return sortedData.slice(0, 3);
  }, [sortedData]);

  const periodLabels: Record<PeriodFilter, string> = {
    total: 'รวม 3 เดือน',
    m6: 'เดือน 6 (มิ.ย.)',
    m7: 'เดือน 7 (ก.ค.)',
    m8: 'เดือน 8 (ส.ค.)'
  };

  const getBarColor = (plan: string) => {
    switch (plan) {
      case 'urgent_sell':
        return '#ef4444'; // Red
      case 'sell':
        return '#fb923c'; // Orange
      case 'rebrand':
        return '#94a3b8'; // Slate
      case 'keep':
      default:
        return '#2563eb'; // Blue
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'urgent_sell':
        return (
          <span className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-xs">
            <Flame className="w-2.5 h-2.5" /> ขายด่วน P1
          </span>
        );
      case 'sell':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-200 dark:border-orange-800">
            ทยอยขาย P2
          </span>
        );
      case 'rebrand':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
            <Paintbrush className="w-2.5 h-2.5" /> Re-brand
          </span>
        );
      case 'keep':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800">
            <Check className="w-2.5 h-2.5" /> เก็บไว้ใช้
          </span>
        );
    }
  };

  return (
    <div
      id="chartsSection"
      className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden relative z-10 mt-8 scroll-mt-24 transition-colors"
    >
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e3a8a] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <span>ตารางที่ 3: ศูนย์วิเคราะห์ประสิทธิภาพฟลีทรถและจัดอันดับ (Analytics Suite)</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            คลิกเลือกหัวข้อวิเคราะห์ด้านล่างเพื่อจัดอันดับและดู 10 แนวทางแก้ไขปัญหาเชิงลึกแบบมือโปร
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenMemo && (
            <button
              onClick={onOpenMemo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            >
              <FileText className="w-3.5 h-3.5 text-orange-300" />
              <span>ใบขออนุมัติขาย (PDF Memo)</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col space-y-4">
        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider shrink-0">
            <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>เลือกรอบเดือน (Period):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {(['total', 'm6', 'm7', 'm8'] as PeriodFilter[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border shadow-xs ${
                  period === p
                    ? 'bg-blue-800 dark:bg-blue-600 text-white font-bold border-blue-800 dark:border-blue-600 ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Executive Metric Filters */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-orange-500" />
              <span>เลือกหัวข้อวิเคราะห์ (คลิกเพื่อจัดอันดับ + ดู 10 ข้อแก้ไขทันที):</span>
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hidden md:inline">
              ✓ แผนปฏิบัติการ 10 ข้อเชื่อมโยงตามหัวข้อที่เลือกอัตโนมัติ
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Metric 1 */}
            <button
              type="button"
              onClick={() => {
                setMetric('jobs_desc');
                setCategoryFilter('all');
              }}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'jobs_desc'
                  ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-500/30 border-blue-600'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <Trophy className={`w-3.5 h-3.5 ${metric === 'jobs_desc' ? 'text-amber-300' : 'text-amber-500'}`} />
                <span>งานเยอะที่สุด</span>
              </span>
              <span className={`text-[10px] mt-1 ${metric === 'jobs_desc' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                อันดับงานบริการ
              </span>
            </button>

            {/* Metric 2 */}
            <button
              type="button"
              onClick={() => {
                setMetric('cost_km_desc');
                setCategoryFilter('all');
              }}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'cost_km_desc'
                  ? 'bg-red-600 text-white font-bold ring-2 ring-red-500/30 border-red-600'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-red-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <AlertTriangle className={`w-3.5 h-3.5 ${metric === 'cost_km_desc' ? 'text-amber-300' : 'text-red-500'}`} />
                <span>กินน้ำมัน/ไม่คุ้ม</span>
              </span>
              <span className={`text-[10px] mt-1 ${metric === 'cost_km_desc' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                บาท/กม. สูงสุด
              </span>
            </button>

            {/* Metric 3 */}
            <button
              type="button"
              onClick={() => {
                setMetric('jobs_asc');
                setCategoryFilter('all');
              }}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'jobs_asc'
                  ? 'bg-amber-600 text-white font-bold ring-2 ring-amber-500/30 border-amber-600'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-amber-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <ArrowDownNarrowWide className={`w-3.5 h-3.5 ${metric === 'jobs_asc' ? 'text-white' : 'text-amber-500'}`} />
                <span>รถจอดแช่</span>
              </span>
              <span className={`text-[10px] mt-1 ${metric === 'jobs_asc' ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'}`}>
                งานน้อยที่สุด
              </span>
            </button>

            {/* Metric 4 */}
            <button
              type="button"
              onClick={() => {
                setMetric('cost_job_desc');
                setCategoryFilter('all');
              }}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'cost_job_desc'
                  ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-500/30 border-purple-600'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-purple-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <BadgeDollarSign className={`w-3.5 h-3.5 ${metric === 'cost_job_desc' ? 'text-amber-300' : 'text-purple-500'}`} />
                <span>ต้นทุนต่องานแพง</span>
              </span>
              <span className={`text-[10px] mt-1 ${metric === 'cost_job_desc' ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'}`}>
                บาท/งาน สูงสุด
              </span>
            </button>

            {/* Metric 5 */}
            <button
              type="button"
              onClick={() => {
                setMetric('limit_usage_desc');
                setCategoryFilter('all');
              }}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'limit_usage_desc'
                  ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-500/30 border-emerald-600'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-emerald-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <CreditCard className={`w-3.5 h-3.5 ${metric === 'limit_usage_desc' ? 'text-white' : 'text-emerald-500'}`} />
                <span>ใช้วงเงินเต็ม</span>
              </span>
              <span className={`text-[10px] mt-1 ${metric === 'limit_usage_desc' ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                % เพดานบัตร
              </span>
            </button>

            {/* Metric 6 */}
            <button
              type="button"
              onClick={() => {
                setMetric('distance_desc');
                setCategoryFilter('all');
              }}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'distance_desc'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-500/30 border-indigo-600'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-indigo-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <Route className={`w-3.5 h-3.5 ${metric === 'distance_desc' ? 'text-white' : 'text-indigo-500'}`} />
                <span>วิ่งไกลที่สุด</span>
              </span>
              <span className={`text-[10px] mt-1 ${metric === 'distance_desc' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                ระยะทางสะสม กม.
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="p-4 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>{title}</span>
              <span className="text-blue-600 dark:text-blue-400 font-normal text-xs">
                ({periodLabels[period]})
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              คลิกที่แท่งกราฟหรือทะเบียนเพื่อดู/แก้ไขข้อมูลเชิงลึก
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> ขายด่วน P1
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> ทยอยขาย P2
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Re-brand
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> เก็บไว้ใช้
            </span>
          </div>
        </div>

        {/* Responsive Custom Bar Chart */}
        <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700 min-h-[360px] flex flex-col justify-end">
          {/* Tooltip Overlay */}
          {hoveredCar && (
            <div className="mb-2 p-2 bg-slate-900/90 text-white rounded-lg text-xs font-medium self-center shadow-lg transition-all animate-fade-in flex items-center gap-2">
              <span className="font-bold text-blue-300">ทะเบียน {hoveredCar.plate}</span>
              <span>:</span>
              <span className="font-bold text-orange-400">
                {numFormat(hoveredCar.value, 0, 2)} {hoveredCar.unit}
              </span>
            </div>
          )}

          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 sm:gap-2 items-end h-[280px] pt-6 pb-2 border-b border-slate-200 dark:border-slate-700">
            {sortedData.map((item) => {
              const heightPercent = Math.max(
                (item.value / maxValue) * 100,
                item.value > 0 ? 4 : 1
              );
              const color = getBarColor(item.vehicle.plan);

              return (
                <div
                  key={item.vehicle.plate}
                  onClick={() => onSelectCar(item.vehicle)}
                  onMouseEnter={() =>
                    setHoveredCar({
                      plate: item.vehicle.plate,
                      value: item.value,
                      unit
                    })
                  }
                  onMouseLeave={() => setHoveredCar(null)}
                  className="group relative flex flex-col items-center h-full justify-end cursor-pointer"
                >
                  {/* Bar Value Tooltip on Top */}
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-700 dark:text-slate-200 absolute -top-5 transition-opacity whitespace-nowrap z-20">
                    {numFormat(item.value, 0, 1)}
                  </span>

                  {/* The Colored Bar */}
                  <div
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: color
                    }}
                    className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-110 shadow-xs group-hover:scale-y-105 origin-bottom"
                  />

                  {/* Plate Label at the Bottom */}
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-2 truncate max-w-full group-hover:text-blue-600 group-hover:font-bold transition-colors">
                    {item.vehicle.plate.replace(' ', '')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
            <span>0 {unit}</span>
            <span>
              ค่าสูงสุด: {numFormat(maxValue, 0, 1)} {unit}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE 10-POINT PROFESSIONAL ACTION PLAN & STRATEGIC SOLUTIONS SUITE */}
        {/* ========================================================================= */}
        <div className="mt-4 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-6">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-white">
                  Executive Action Plan
                </span>
                <span className="text-xs text-slate-300">
                  ครอบคลุมครบ 10 ข้อระดับมืออาชีพ
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{currentPlan.title}</span>
              </h4>
              <p className="text-xs text-slate-300">
                {currentPlan.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenMarketIntel && (
                <button
                  onClick={() => onOpenMarketIntel()}
                  className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>AI เช็กข้อมูลสด</span>
                </button>
              )}
              {onOpenMemo && (
                <button
                  onClick={onOpenMemo}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>เปิดใบขออนุมัติขาย</span>
                </button>
              )}
            </div>
          </div>

          {/* Executive Summary Rationale */}
          <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">บทวิเคราะห์ผู้บริหาร (Executive Rationale): </span>
              {currentPlan.summaryExecutive}
            </div>
          </div>

          {/* SPOTLIGHT: TOP 3 VEHICLES IN THIS METRIC */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-orange-500" />
                <span>เจาะลึก 3 คันที่มีผลกระทบสูงสุดในหมวดนี้ (Top 3 Impact Vehicles):</span>
              </h5>
              <span className="text-[11px] text-slate-400">
                คลิกที่การ์ดเพื่อดูข้อมูลเต็มหรือตรวจสอบราคากลางสด
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {top3Cars.map((item, idx) => {
                const rankLabels = ['อันดับ 1 (สูงสุด)', 'อันดับ 2', 'อันดับ 3'];
                const rankBadges = [
                  'bg-red-600 text-white',
                  'bg-orange-500 text-white',
                  'bg-amber-500 text-white'
                ];

                return (
                  <div
                    key={item.vehicle.plate}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rankBadges[idx]}`}>
                          {rankLabels[idx]}
                        </span>
                        <h6
                          onClick={() => onSelectCar(item.vehicle)}
                          className="font-extrabold text-base text-blue-600 dark:text-blue-400 hover:underline cursor-pointer pt-1"
                        >
                          ทะเบียน {item.vehicle.plate}
                        </h6>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          สังกัด: {item.vehicle.branch} • อายุ {item.vehicle.age} ปี
                        </p>
                      </div>
                      <div className="text-right">
                        {getPlanBadge(item.vehicle.plan)}
                        <p className="text-xs text-slate-400 mt-1">
                          ไมล์ {item.vehicle.mileage.toLocaleString()} กม.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">ค่าวิเคราะห์ ({unit}):</span>
                      <span className="font-extrabold text-sm text-red-600 dark:text-red-400">
                        {numFormat(item.value, 0, 2)} {unit}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onSelectCar(item.vehicle)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors text-center"
                      >
                        🔍 ดูโปรไฟล์รถ
                      </button>
                      {onOpenMarketIntel ? (
                        <button
                          onClick={() => onOpenMarketIntel(item.vehicle)}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>เช็กราคาสด</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onEditCar?.(item.vehicle)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors text-center"
                        >
                          ✏️ แก้ไขข้อมูล
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FILTER CHIPS FOR 10 ACTION SOLUTIONS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                10 แนวทางปฏิบัติการแก้ไขอย่างมือโปร (Action Guidelines):
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `ทั้งหมด (10 ข้อ)` },
                { id: 'technical', label: `🛠️ เทคนิค (${currentPlan.solutions.filter(s => s.category === 'technical').length})` },
                { id: 'management', label: `📊 บริหาร (${currentPlan.solutions.filter(s => s.category === 'management').length})` },
                { id: 'finance', label: `💰 การเงิน (${currentPlan.solutions.filter(s => s.category === 'finance').length})` },
                { id: 'policy', label: `📜 นโยบาย (${currentPlan.solutions.filter(s => s.category === 'policy').length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                    categoryFilter === tab.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 10 ACTION CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSolutions.map((sol: ActionSolution) => {
              const urgencyBadge =
                sol.urgency === 'high'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900'
                  : sol.urgency === 'medium'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';

              const urgencyText =
                sol.urgency === 'high'
                  ? '🔴 เร่งด่วนสูงสุด'
                  : sol.urgency === 'medium'
                  ? '🟡 ปานกลาง (30 วัน)'
                  : '🟢 แผนประจำรอบ';

              return (
                <div
                  key={sol.id}
                  className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                          {sol.id.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {sol.categoryLabel}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyBadge}`}>
                        {urgencyText}
                      </span>
                    </div>

                    <h6 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white leading-snug">
                      {sol.title}
                    </h6>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {sol.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>ผลลัพธ์: {sol.impact}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Interconnection Callout */}
          <div className="p-4 bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 dark:from-slate-800 dark:via-blue-950/20 dark:to-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                <b>การเชื่อมโยงระบบสมบูรณ์แบบ:</b> ข้อมูลในแผนปฏิบัติการนี้สอดคล้องกับตารางประเมินสภาพ (Table 1), ตารางค่าน้ำมัน (Table 2) และพร้อมนำเข้าสู่เอกสารขออนุมัติขาย (PDF Memo) เพื่อเสนอ C-Level ทันที
              </span>
            </div>
            {onOpenMemo && (
              <button
                onClick={onOpenMemo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>เปิดดูใบขออนุมัติ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
