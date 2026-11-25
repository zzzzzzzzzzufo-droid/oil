import {
  Vehicle,
  MonthlyOperationalData,
  MonthKey,
  ALL_MONTH_KEYS,
  MonthlyComputedStat
} from '../types';

export function numFormat(num: number | undefined | null, min = 2, max = 2): string {
  if (num === undefined || num === null || isNaN(num)) return '-';
  return Number(num).toLocaleString('en-US', {
    minimumFractionDigits: min,
    maximumFractionDigits: max
  });
}

export function getVehicleMonthData(
  vehicle: Vehicle,
  monthKey: MonthKey
): MonthlyOperationalData {
  const data = vehicle[monthKey];
  if (!data) {
    return { dist: 0, fuel: 0, cost: 0, jobs: 0, drivers: [] };
  }
  return {
    dist: data.dist || 0,
    fuel: data.fuel || 0,
    cost: data.cost || 0,
    jobs: data.jobs || 0,
    drivers: data.drivers || []
  };
}

export function calculateMonthlyStats(m: MonthlyOperationalData | undefined): MonthlyComputedStat {
  if (!m) return { eff: 0, cKm: 0, cJob: 0 };
  const eff = m.fuel > 0 ? m.dist / m.fuel : 0;
  const cKm = m.dist > 0 ? m.cost / m.dist : 0;
  const cJob = m.jobs > 0 ? m.cost / m.jobs : 0;
  return { eff, cKm, cJob };
}

export function calculateVehicleTotals(
  vehicle: Vehicle,
  selectedMonths: MonthKey[] = ['m6', 'm7', 'm8']
) {
  const monthlyStats = {} as Record<MonthKey, MonthlyComputedStat>;
  ALL_MONTH_KEYS.forEach((mKey) => {
    monthlyStats[mKey] = calculateMonthlyStats(vehicle[mKey]);
  });

  let totalDist = 0;
  let totalFuel = 0;
  let totalCost = 0;
  let totalJobs = 0;

  selectedMonths.forEach((mKey) => {
    const data = vehicle[mKey];
    if (data) {
      totalDist += data.dist || 0;
      totalFuel += data.fuel || 0;
      totalCost += data.cost || 0;
      totalJobs += data.jobs || 0;
    }
  });

  const totalEff = totalFuel > 0 ? totalDist / totalFuel : 0;
  const totalCKm = totalDist > 0 ? totalCost / totalDist : 0;
  const totalCJob = totalJobs > 0 ? totalCost / totalJobs : 0;

  // Total limit based on number of active selected months
  const monthsCount = selectedMonths.length || 1;
  const totalLimit = (vehicle.limit || 0) * monthsCount;
  const limitUsagePercent = totalLimit > 0 ? (totalCost / totalLimit) * 100 : 0;

  return {
    ...monthlyStats,
    totalDist,
    totalFuel,
    totalCost,
    totalJobs,
    totalEff,
    totalCKm,
    totalCJob,
    totalLimit,
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
