import { Vehicle, MonthlyOperationalData } from '../types';

export function numFormat(num: number | undefined | null, min = 2, max = 2): string {
  if (num === undefined || num === null || isNaN(num)) return '-';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: min,
    maximumFractionDigits: max
  });
}

export function calculateMonthlyStats(m: MonthlyOperationalData) {
  const eff = m.fuel > 0 ? m.dist / m.fuel : 0;
  const cKm = m.dist > 0 ? m.cost / m.dist : 0;
  const cJob = m.jobs > 0 ? m.cost / m.jobs : 0;
  return { eff, cKm, cJob };
}

export function calculateVehicleTotals(vehicle: Vehicle) {
  const m6 = calculateMonthlyStats(vehicle.m6);
  const m7 = calculateMonthlyStats(vehicle.m7);
  const m8 = calculateMonthlyStats(vehicle.m8);

  const totalDist = vehicle.m6.dist + vehicle.m7.dist + vehicle.m8.dist;
  const totalFuel = vehicle.m6.fuel + vehicle.m7.fuel + vehicle.m8.fuel;
  const totalCost = vehicle.m6.cost + vehicle.m7.cost + vehicle.m8.cost;
  const totalJobs = vehicle.m6.jobs + vehicle.m7.jobs + vehicle.m8.jobs;

  const totalEff = totalFuel > 0 ? totalDist / totalFuel : 0;
  const totalCKm = totalDist > 0 ? totalCost / totalDist : 0;
  const totalCJob = totalJobs > 0 ? totalCost / totalJobs : 0;

  // 3-month total limit
  const threeMonthLimit = vehicle.limit * 3;
  const limitUsagePercent = threeMonthLimit > 0 ? (totalCost / threeMonthLimit) * 100 : 0;

  return {
    m6,
    m7,
    m8,
    totalDist,
    totalFuel,
    totalCost,
    totalJobs,
    totalEff,
    totalCKm,
    totalCJob,
    limitUsagePercent
  };
}

export function getEffColor(e: number): string {
  if (!e || e <= 0) return 'text-slate-400';
  if (e >= 13.0) return 'text-emerald-600 dark:text-emerald-400 font-bold';
  if (e >= 11.0) return 'text-amber-600 dark:text-amber-400 font-bold';
  if (e >= 9.0) return 'text-orange-500 dark:text-orange-400 font-bold';
  return 'text-red-600 dark:text-red-400 font-bold bg-red-100/60 dark:bg-red-900/30 px-1 rounded';
}

export function getCkmColor(c: number): string {
  if (!c || c <= 0) return 'text-slate-400';
  if (c < 2.60) return 'text-emerald-600 dark:text-emerald-400 font-bold';
  if (c <= 3.10) return 'text-amber-600 dark:text-amber-400 font-bold';
  if (c <= 3.80) return 'text-orange-500 dark:text-orange-400 font-bold';
  return 'text-red-600 dark:text-red-400 font-bold bg-red-100/60 dark:bg-red-900/30 px-1 rounded';
}
