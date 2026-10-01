import React from 'react';
import { Fuel, Scale, Info } from 'lucide-react';
import { Vehicle } from '../types';
import {
  numFormat,
  calculateVehicleTotals,
  getEffColor,
  getCkmColor
} from '../utils/calculations';

interface FuelTableProps {
  vehicles: Vehicle[];
  onSelectCar: (vehicle: Vehicle) => void;
}

export const FuelTable: React.FC<FuelTableProps> = ({ vehicles, onSelectCar }) => {
  // Aggregate Fleet Totals
  let fleetDist = 0;
  let fleetFuel = 0;
  let fleetCost = 0;
  let fleetJobs = 0;

  vehicles.forEach((car) => {
    fleetDist += (car.m6.dist || 0) + (car.m7.dist || 0) + (car.m8.dist || 0);
    fleetFuel += (car.m6.fuel || 0) + (car.m7.fuel || 0) + (car.m8.fuel || 0);
    fleetCost += (car.m6.cost || 0) + (car.m7.cost || 0) + (car.m8.cost || 0);
    fleetJobs += (car.m6.jobs || 0) + (car.m7.jobs || 0) + (car.m8.jobs || 0);
  });

  const fleetAvgEff = fleetFuel > 0 ? fleetDist / fleetFuel : 0;
  const fleetAvgCKm = fleetDist > 0 ? fleetCost / fleetDist : 0;
  const fleetAvgCJob = fleetJobs > 0 ? fleetCost / fleetJobs : 0;

  return (
    <div
      id="fuelSection"
      className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden relative z-10 transition-colors mt-8"
    >
      <div className="p-3.5 bg-slate-800 dark:bg-slate-900 text-white flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Fuel className="w-4 h-4 text-emerald-400" />
          <span>ตารางที่ 2: วิเคราะห์ต้นทุนงาน ประสิทธิภาพน้ำมัน และปริมาณ (Integrated)</span>
        </h3>
        <span className="text-[11px] text-slate-300 hidden sm:inline">
          ซิงค์อัตโนมัติแบบเรียลไทม์กับ Firebase
        </span>
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

      {/* Main Integrated Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max text-[11px]" id="integratedFuelTable">
          <thead>
            <tr className="bg-slate-800 dark:bg-slate-900 text-white text-center uppercase tracking-wider border-b border-slate-600">
              <th colSpan={2} className="px-2 py-2 font-semibold sticky left-0 z-30 border-r border-slate-600 bg-slate-800 dark:bg-slate-900">
                ข้อมูลรถ
              </th>
              <th colSpan={6} className="px-2 py-2 font-semibold border-r border-slate-600 bg-[#1e40af]">
                เดือน 6 (มิ.ย. 69)
              </th>
              <th colSpan={6} className="px-2 py-2 font-semibold border-r border-slate-600 bg-[#0e7490]">
                เดือน 7 (ก.ค. 69)
              </th>
              <th colSpan={6} className="px-2 py-2 font-semibold border-r border-slate-600 bg-[#c2410c]">
                เดือน 8 (ส.ค. 69)
              </th>
              <th colSpan={6} className="px-2 py-2 font-semibold border-r border-slate-600 bg-[#1e3a8a]">
                ภาพรวม 3 เดือน
              </th>
            </tr>
            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-center border-b-2 border-slate-300 dark:border-slate-600">
              <th className="px-2 py-2 font-semibold w-[40px] sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                #
              </th>
              <th className="px-3 py-2 font-semibold w-[100px] sticky left-[40px] z-20 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
                ทะเบียนรถ
              </th>

              {/* M6 */}
              <th className="px-2 py-2 font-semibold text-right">ระยะ(กม.)</th>
              <th className="px-2 py-2 font-semibold text-right">ลิตร</th>
              <th className="px-2 py-2 font-semibold text-right">เงิน(บ.)</th>
              <th className="px-2 py-2 font-semibold text-center bg-blue-50/50 dark:bg-blue-900/30">กม./ลิตร</th>
              <th className="px-2 py-2 font-semibold text-center bg-blue-50/50 dark:bg-blue-900/30">บ./กม.</th>
              <th className="px-2 py-2 font-semibold text-right border-r border-slate-300 dark:border-slate-600">บ./งาน</th>

              {/* M7 */}
              <th className="px-2 py-2 font-semibold text-right">ระยะ(กม.)</th>
              <th className="px-2 py-2 font-semibold text-right">ลิตร</th>
              <th className="px-2 py-2 font-semibold text-right">เงิน(บ.)</th>
              <th className="px-2 py-2 font-semibold text-center bg-blue-50/50 dark:bg-blue-900/30">กม./ลิตร</th>
              <th className="px-2 py-2 font-semibold text-center bg-blue-50/50 dark:bg-blue-900/30">บ./กม.</th>
              <th className="px-2 py-2 font-semibold text-right border-r border-slate-300 dark:border-slate-600">บ./งาน</th>

              {/* M8 */}
              <th className="px-2 py-2 font-semibold text-right">ระยะ(กม.)</th>
              <th className="px-2 py-2 font-semibold text-right">ลิตร</th>
              <th className="px-2 py-2 font-semibold text-right">เงิน(บ.)</th>
              <th className="px-2 py-2 font-semibold text-center bg-blue-50/50 dark:bg-blue-900/30">กม./ลิตร</th>
              <th className="px-2 py-2 font-semibold text-center bg-blue-50/50 dark:bg-blue-900/30">บ./กม.</th>
              <th className="px-2 py-2 font-semibold text-right border-r border-slate-300 dark:border-slate-600">บ./งาน</th>

              {/* Total 3 Months */}
              <th className="px-2 py-2 font-semibold text-right bg-blue-50 dark:bg-blue-900/20">รวมกม.</th>
              <th className="px-2 py-2 font-semibold text-right bg-blue-50 dark:bg-blue-900/20">รวมลิตร</th>
              <th className="px-2 py-2 font-semibold text-right bg-blue-50 dark:bg-blue-900/20">ยอดรวม(บ.)</th>
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
              const totals = calculateVehicleTotals(car);
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
                    {car.plate}
                  </td>

                  {/* M6 */}
                  <td className="px-2 py-2 text-right">{numFormat(car.m6.dist, 0, 0)}</td>
                  <td className="px-2 py-2 text-right">{numFormat(car.m6.fuel, 3, 3)}</td>
                  <td className="px-2 py-2 text-right">{numFormat(car.m6.cost)}</td>
                  <td className={`px-2 py-2 text-center ${getEffColor(totals.m6.eff)} bg-blue-50/50 dark:bg-blue-900/20`}>
                    {totals.m6.eff > 0 ? numFormat(totals.m6.eff) : '-'}
                  </td>
                  <td className={`px-2 py-2 text-center ${getCkmColor(totals.m6.cKm)} bg-blue-50/50 dark:bg-blue-900/20`}>
                    {totals.m6.cKm > 0 ? numFormat(totals.m6.cKm) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-slate-300 dark:border-slate-600">
                    {totals.m6.cJob > 0 ? numFormat(totals.m6.cJob) : '-'}
                  </td>

                  {/* M7 */}
                  <td className="px-2 py-2 text-right">{numFormat(car.m7.dist, 0, 0)}</td>
                  <td className="px-2 py-2 text-right">{numFormat(car.m7.fuel, 3, 3)}</td>
                  <td className="px-2 py-2 text-right">{numFormat(car.m7.cost)}</td>
                  <td className={`px-2 py-2 text-center ${getEffColor(totals.m7.eff)} bg-blue-50/50 dark:bg-blue-900/20`}>
                    {totals.m7.eff > 0 ? numFormat(totals.m7.eff) : '-'}
                  </td>
                  <td className={`px-2 py-2 text-center ${getCkmColor(totals.m7.cKm)} bg-blue-50/50 dark:bg-blue-900/20`}>
                    {totals.m7.cKm > 0 ? numFormat(totals.m7.cKm) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-slate-300 dark:border-slate-600">
                    {totals.m7.cJob > 0 ? numFormat(totals.m7.cJob) : '-'}
                  </td>

                  {/* M8 */}
                  <td className="px-2 py-2 text-right">{numFormat(car.m8.dist, 0, 0)}</td>
                  <td className="px-2 py-2 text-right">{numFormat(car.m8.fuel, 3, 3)}</td>
                  <td className="px-2 py-2 text-right">{numFormat(car.m8.cost)}</td>
                  <td className={`px-2 py-2 text-center ${getEffColor(totals.m8.eff)} bg-blue-50/50 dark:bg-blue-900/20`}>
                    {totals.m8.eff > 0 ? numFormat(totals.m8.eff) : '-'}
                  </td>
                  <td className={`px-2 py-2 text-center ${getCkmColor(totals.m8.cKm)} bg-blue-50/50 dark:bg-blue-900/20`}>
                    {totals.m8.cKm > 0 ? numFormat(totals.m8.cKm) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-slate-300 dark:border-slate-600 text-red-500 font-semibold">
                    {totals.m8.cJob > 0 ? numFormat(totals.m8.cJob) : '-'}
                  </td>

                  {/* 3-Month Totals */}
                  <td className="px-2 py-2 text-right bg-blue-50 dark:bg-blue-900/20 font-bold">
                    {numFormat(totals.totalDist, 0, 0)}
                  </td>
                  <td className="px-2 py-2 text-right bg-blue-50 dark:bg-blue-900/20 font-bold">
                    {numFormat(totals.totalFuel, 3, 3)}
                  </td>
                  <td className="px-2 py-2 text-right bg-blue-50 dark:bg-blue-900/20 font-bold text-red-600 dark:text-red-400">
                    {numFormat(totals.totalCost)}
                  </td>
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
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800 text-sm border-t-2 border-slate-300 dark:border-slate-600">
              <td
                colSpan={2}
                className="px-2 py-3 font-bold text-slate-800 dark:text-white text-right sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-600"
              >
                รวมทั้งสิ้น (Fleet Total)
              </td>
              <td colSpan={18} className="px-2 py-3 font-bold text-center text-slate-400">
                ... (รวมสถิติทุกคันในฟลีท) ...
              </td>
              <td className="px-2 py-3 text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/40">
                {numFormat(fleetDist, 0, 0)}
              </td>
              <td className="px-2 py-3 text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/40">
                {numFormat(fleetFuel, 3, 3)}
              </td>
              <td className="px-2 py-3 text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/40">
                {numFormat(fleetCost)}
              </td>
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
    </div>
  );
};
