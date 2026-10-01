import React from 'react';
import {
  Truck,
  Flame,
  Sparkles,
  TrendingUp,
  LineChart
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

  // Predicted September Fuel: sum of August fuel + trend
  const augustFuelCost = vehicles.reduce((sum, v) => sum + (v.m8?.cost || 0), 0);
  const julyFuelCost = vehicles.reduce((sum, v) => sum + (v.m7?.cost || 0), 0);
  const diff = augustFuelCost - julyFuelCost;
  const predictedSept = Math.round(augustFuelCost + (diff > 0 ? diff * 0.4 : 0));
  const predictedSeptK = Math.round(predictedSept / 1000);

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

      {/* Predicted September Fuel */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 flex flex-col shadow-md relative overflow-hidden text-white transition-all hover:shadow-lg col-span-2 lg:col-span-1">
        <div className="absolute -right-3 -bottom-3 text-white/15">
          <LineChart className="w-20 h-20" />
        </div>
        <div className="flex items-center gap-2 z-10 mb-1">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <p className="text-xs font-semibold text-white/95">
            พยากรณ์ค่าน้ำมัน ก.ย.
          </p>
        </div>
        <h3 className="text-2xl font-extrabold z-10 text-white">
          {predictedSeptK || 88}K{' '}
          <span className="text-xs font-normal text-white/80">แนวโน้มสูงขึ้น</span>
        </h3>
      </div>
    </div>
  );
};
