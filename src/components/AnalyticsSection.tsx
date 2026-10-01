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
  ChevronRight
} from 'lucide-react';
import { Vehicle, PeriodFilter, MetricFilter } from '../types';
import { numFormat } from '../utils/calculations';

interface AnalyticsSectionProps {
  vehicles: Vehicle[];
  onSelectCar: (vehicle: Vehicle) => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  vehicles,
  onSelectCar
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('total');
  const [metric, setMetric] = useState<MetricFilter>('jobs_desc');
  const [hoveredCar, setHoveredCar] = useState<{ plate: string; value: number; unit: string } | null>(null);

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

  return (
    <div
      id="chartsSection"
      className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden relative z-10 mt-8 scroll-mt-24 transition-colors"
    >
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e3a8a] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <span>ตารางที่ 3: ศูนย์วิเคราะห์ประสิทธิภาพฟลีทรถและจัดอันดับ (Analytics Suite)</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            ระบบจะจัดอันดับอัตโนมัติตามตัวกรอง (Executive Q&A Dashboard)
          </p>
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
                    ? 'bg-blue-800 dark:bg-blue-600 text-white font-bold border-blue-800 dark:border-blue-600'
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
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-orange-500" />
            <span>มุมมองวิเคราะห์พิเศษ (คลิกเพื่อจัดอันดับทันที):</span>
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Metric 1 */}
            <button
              type="button"
              onClick={() => setMetric('jobs_desc')}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'jobs_desc'
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> งานเยอะที่สุด
              </span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                อันดับงานบริการ
              </span>
            </button>

            {/* Metric 2 */}
            <button
              type="button"
              onClick={() => setMetric('cost_km_desc')}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'cost_km_desc'
                  ? 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300 font-bold ring-2 ring-red-500/20'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-red-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> กินน้ำมัน/ไม่คุ้ม
              </span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                บาท/กม. สูงสุด
              </span>
            </button>

            {/* Metric 3 */}
            <button
              type="button"
              onClick={() => setMetric('jobs_asc')}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'jobs_asc'
                  ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-800 dark:text-amber-300 font-bold ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-amber-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <ArrowDownNarrowWide className="w-3.5 h-3.5 text-amber-600" /> งานน้อยสุด
              </span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                จอดทิ้ง/ขาดความคุ้ม
              </span>
            </button>

            {/* Metric 4 */}
            <button
              type="button"
              onClick={() => setMetric('cost_job_desc')}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'cost_job_desc'
                  ? 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300 font-bold ring-2 ring-red-500/20'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-red-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <BadgeDollarSign className="w-3.5 h-3.5 text-red-500" /> ต้นทุนต่องานแพง
              </span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                บาท/Job สูงสุด
              </span>
            </button>

            {/* Metric 5 */}
            <button
              type="button"
              onClick={() => setMetric('limit_usage_desc')}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'limit_usage_desc'
                  ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-300 font-bold ring-2 ring-orange-500/20'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-orange-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-orange-500" /> ใช้เต็มวงเงิน
              </span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                % วงเงินสูงสุด
              </span>
            </button>

            {/* Metric 6 */}
            <button
              type="button"
              onClick={() => setMetric('distance_desc')}
              className={`p-2.5 text-xs rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                metric === 'distance_desc'
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <Route className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> วิ่งต่อเดือนเยอะ
              </span>
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                ระยะทาง กม. สูงสุด
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="p-4 md:p-6 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
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
        <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700 min-h-[380px] flex flex-col justify-end">
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

          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 sm:gap-2 items-end h-[300px] pt-6 pb-2 border-b border-slate-200 dark:border-slate-700">
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
      </div>
    </div>
  );
};
