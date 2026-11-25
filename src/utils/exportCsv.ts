import { Vehicle, MonthKey, MONTH_CONFIG, ALL_MONTH_KEYS } from '../types';
import { calculateVehicleTotals, getVehicleMonthData } from './calculations';

export function exportFleetToCsv(
  vehicles: Vehicle[],
  monthsToExport: MonthKey[] = ALL_MONTH_KEYS
) {
  const planLabels: Record<string, string> = {
    urgent_sell: 'ขายด่วน P1',
    sell: 'ทยอยขาย P2',
    rebrand: 'รอ Re-brand',
    keep: 'เก็บไว้ใช้'
  };

  const monthHeaders = monthsToExport.flatMap((mKey) => {
    const label = MONTH_CONFIG[mKey]?.shortYearLabel || mKey;
    return [
      `${label} ระยะทาง (กม.)`,
      `${label} น้ำมัน (ลิตร)`,
      `${label} ค่าน้ำมัน (บาท)`,
      `${label} กม./ลิตร`,
      `${label} บ./กม.`,
      `${label} บ./งาน`,
      `${label} จำนวนงาน`,
      `${label} คนขับ`
    ];
  });

  const headers = [
    'ลำดับ',
    'ทะเบียนรถ',
    'อายุ (ปี)',
    'ไมล์สะสม (กม.)',
    'สังกัด/สาขา',
    'คะแนนสุขภาพ (Health Score)',
    'แผนจัดการ',
    'ราคาประเมิน (บาท)',
    'วงเงินน้ำมันต่อเดือน (บาท)',
    ...monthHeaders,
    `รวม ${monthsToExport.length} เดือน ระยะทาง (กม.)`,
    `รวม ${monthsToExport.length} เดือน น้ำมัน (ลิตร)`,
    `รวม ${monthsToExport.length} เดือน ค่าน้ำมัน (บาท)`,
    `รวม ${monthsToExport.length} เดือน จำนวนงาน`,
    `เฉลี่ย ${monthsToExport.length} เดือน กม./ลิตร`,
    `เฉลี่ย ${monthsToExport.length} เดือน บ./กม.`,
    `เฉลี่ย ${monthsToExport.length} เดือน บ./งาน`,
    'ข้อเสนอแนะเชิงลึก'
  ];

  const rows = vehicles.map((car) => {
    const totals = calculateVehicleTotals(car, monthsToExport);

    const monthValues = monthsToExport.flatMap((mKey) => {
      const mData = getVehicleMonthData(car, mKey);
      const mStats = totals[mKey];
      const driversStr = (mData.drivers || []).filter(Boolean).join(' / ');
      return [
        mData.dist,
        mData.fuel,
        mData.cost,
        mStats.eff.toFixed(2),
        mStats.cKm.toFixed(2),
        mStats.cJob.toFixed(2),
        mData.jobs,
        `"${driversStr.replace(/"/g, '""')}"`
      ];
    });

    return [
      car.order,
      `"${car.plate}"`,
      car.age,
      car.mileage,
      `"${car.branch}"`,
      car.healthScore || 'N/A',
      `"${planLabels[car.plan] || car.plan}"`,
      car.estimatedPrice || 0,
      car.limit || 0,
      ...monthValues,
      totals.totalDist,
      totals.totalFuel.toFixed(3),
      totals.totalCost.toFixed(2),
      totals.totalJobs,
      totals.totalEff.toFixed(2),
      totals.totalCKm.toFixed(2),
      totals.totalCJob.toFixed(2),
      `"${car.recommendation.replace(/"/g, '""')}"`
    ];
  });

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Fleet_Optimization_Report_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
