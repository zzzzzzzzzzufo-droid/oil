import React from 'react';
import {
  Truck,
  Flame,
  Sparkles,
  TrendingUp,
  LineChart,
  CheckCircle2
} from 'lucide-react';
import { Vehicle } from '../types';

interface SummaryCardsProps {
  vehicles: Vehicle[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ vehicles }) => {
  const totalCars = vehicles.length;
  const disposalCars = vehicles.filter(
    (v) => v.plan === 'urgent_sell' || v.plan === 'sell'
  ).length;
  const keepCars = vehicles.filter(
    (v) => v.plan === 'keep' || v.plan === 'rebrand'
  ).length;

  const totalCashflow = vehicles.reduce((sum, v) => sum + (v.estimatedPrice || 0), 0);
  const cashflowMillion = (totalCashflow / 1000000).toFixed(2);

  // Check if New Months (Sep 9, Oct 10, Nov 11) have actual data entered
  const septActualCost = vehicles.reduce((sum, v) => sum + (v.m9?.cost || 0), 0);
  const octActualCost = vehicles.reduce((sum, v) => sum + (v.m10?.cost || 0), 0);
  const novActualCost = vehicles.reduce((sum, v) => sum + (v.m11?.cost || 0), 0);
  const newMonthsTotalCost = septActualCost + octActualCost + novActualCost;
  const newMonthsCostK = Math.round(newMonthsTotalCost / 1000);

  // Predicted Monthly Fuel: based on recent actual trend (~85-90K / month)
  const augustFuelCost = vehicles.reduce((sum, v) => sum + (v.m8?.cost || 0), 0);
  const julyFuelCost = vehicles.reduce((sum, v) => sum + (v.m7?.cost || 0), 0);
  const diff = augustFuelCost - julyFuelCost;
  const predictedMonthly = Math.round(augustFuelCost + (diff > 0 ? diff * 0.3 : 0));
  const predictedMonthlyK = Math.round(predictedMonthly / 1000);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      {/* Total Cars */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 flex flex-col border border-slate-200 dark:border-slate-700 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center gap-2 z-10 mb-1">
          <Truck className="w-4 h-4 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            รถประเมินทั้งหมด
          </p>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white z-10">
          {totalCars} <span className="text-xs font-normal text-slate-500">คัน</span>
        </h3>
      </div>

      {/* Disposal Cars */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 flex flex-col border border-slate-200 dark:border-slate-700 border-b-2 border-b-red-500 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center gap-2 z-10 mb-1">
          <Flame className="w-4 h-4 text-red-500" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            ปลดระวาง (รวม)
          </p>
        </div>
        <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 z-10">
          {disposalCars} <span className="text-xs font-normal text-slate-500">คัน</span>
        </h3>
      </div>

      {/* Keep / Re-brand */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 flex flex-col border border-slate-200 dark:border-slate-700 border-b-2 border-b-blue-600 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center gap-2 z-10 mb-1">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            ใช้งานต่อ / Re-brand
          </p>
        </div>
        <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 z-10">
          {keepCars} <span className="text-xs font-normal text-slate-500">คัน</span>
        </h3>
      </div>

      {/* Estimated Cashflow */}
      <div className="bg-slate-800 dark:bg-slate-900 rounded-xl p-4 flex flex-col border border-slate-700 shadow-xs relative overflow-hidden text-white transition-all hover:shadow-md">
        <div className="flex items-center gap-2 z-10 mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <p className="text-xs font-semibold text-slate-300">
            คาดการณ์ Cashflow
          </p>
        </div>
        <h3 className="text-2xl font-extrabold z-10 text-white">
          ~{cashflowMillion}{' '}
          <span className="text-xs font-normal text-slate-300">ล้านบาท</span>
        </h3>
      </div>

      {/* Months 9-11 / Q4 Fuel (Actual if entered, otherwise prediction) */}
      <div className={`rounded-xl p-4 flex flex-col shadow-md relative overflow-hidden text-white transition-all hover:shadow-lg col-span-2 lg:col-span-1 ${
        newMonthsTotalCost > 0
          ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
          : 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500'
      }`}>
        <div className="absolute -right-3 -bottom-3 text-white/15">
          <LineChart className="w-20 h-20" />
        </div>
        <div className="flex items-center gap-2 z-10 mb-1">
          {newMonthsTotalCost > 0 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          ) : (
            <Sparkles className="w-4 h-4 text-pink-200" />
          )}
          <p className="text-xs font-semibold text-white/95">
            {newMonthsTotalCost > 0 ? 'ค่าน้ำมัน ก.ย.-พ.ย. (จริง)' : 'พยากรณ์น้ำมัน (ก.ย.-พ.ย.)'}
          </p>
        </div>
        <h3 className="text-2xl font-extrabold z-10 text-white">
          {newMonthsTotalCost > 0 ? `${newMonthsCostK}K` : `~${predictedMonthlyK || 88}K/ด.`}{' '}
          <span className="text-xs font-normal text-white/80">
            {newMonthsTotalCost > 0 ? 'บันทึกแล้ว' : 'ต.ค.-พ.ย. รอคีย์'}
          </span>
        </h3>
      </div>
    </div>
  );
};
