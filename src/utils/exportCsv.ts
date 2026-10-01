import { Vehicle } from '../types';
import { calculateVehicleTotals } from './calculations';

export function exportFleetToCsv(vehicles: Vehicle[]) {
  // Plan label mapping
  const planLabels: Record<string, string> = {
    urgent_sell: 'ขายด่วน P1',
    sell: 'ทยอยขาย P2',
    rebrand: 'รอ Re-brand',
    keep: 'เก็บไว้ใช้'
  };

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
    'มิ.ย. ระยะทาง (กม.)',
    'มิ.ย. น้ำมัน (ลิตร)',
    'มิ.ย. ค่าน้ำมัน (บาท)',
    'มิ.ย. กม./ลิตร',
    'มิ.ย. บ./กม.',
    'มิ.ย. บ./งาน',
    'มิ.ย. จำนวนงาน',
    'ก.ค. ระยะทาง (กม.)',
    'ก.ค. น้ำมัน (ลิตร)',
    'ก.ค. ค่าน้ำมัน (บาท)',
    'ก.ค. กม./ลิตร',
    'ก.ค. บ./กม.',
    'ก.ค. บ./งาน',
    'ก.ค. จำนวนงาน',
    'ส.ค. ระยะทาง (กม.)',
    'ส.ค. น้ำมัน (ลิตร)',
    'ส.ค. ค่าน้ำมัน (บาท)',
    'ส.ค. กม./ลิตร',
    'ส.ค. บ./กม.',
    'ส.ค. บ./งาน',
    'ส.ค. จำนวนงาน',
    'รวม 3 เดือน ระยะทาง (กม.)',
    'รวม 3 เดือน น้ำมัน (ลิตร)',
    'รวม 3 เดือน ค่าน้ำมัน (บาท)',
    'รวม 3 เดือน จำนวนงาน',
    'เฉลี่ย 3 เดือน กม./ลิตร',
    'เฉลี่ย 3 เดือน บ./กม.',
    'เฉลี่ย 3 เดือน บ./งาน',
    'ข้อเสนอแนะเชิงลึก'
  ];

  const rows = vehicles.map((car) => {
    const totals = calculateVehicleTotals(car);
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
      car.m6.dist,
      car.m6.fuel,
      car.m6.cost,
      totals.m6.eff.toFixed(2),
      totals.m6.cKm.toFixed(2),
      totals.m6.cJob.toFixed(2),
      car.m6.jobs,
      car.m7.dist,
      car.m7.fuel,
      car.m7.cost,
      totals.m7.eff.toFixed(2),
      totals.m7.cKm.toFixed(2),
      totals.m7.cJob.toFixed(2),
      car.m7.jobs,
      car.m8.dist,
      car.m8.fuel,
      car.m8.cost,
      totals.m8.eff.toFixed(2),
      totals.m8.cKm.toFixed(2),
      totals.m8.cJob.toFixed(2),
      car.m8.jobs,
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
    '\uFEFF' + // UTF-8 BOM for Thai support in Microsoft Excel
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
