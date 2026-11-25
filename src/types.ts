export type VehiclePlan = 'urgent_sell' | 'sell' | 'rebrand' | 'keep';

export type MonthKey2569 = 'm6' | 'm7' | 'm8' | 'm9' | 'm10' | 'm11' | 'm12';

export type MonthKey2570 =
  | 'y70_m1'
  | 'y70_m2'
  | 'y70_m3'
  | 'y70_m4'
  | 'y70_m5'
  | 'y70_m6'
  | 'y70_m7'
  | 'y70_m8'
  | 'y70_m9'
  | 'y70_m10'
  | 'y70_m11'
  | 'y70_m12';

export type MonthKey = MonthKey2569 | MonthKey2570;

export const MONTHS_2569: MonthKey2569[] = ['m6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12'];

export const MONTHS_2570: MonthKey2570[] = [
  'y70_m1',
  'y70_m2',
  'y70_m3',
  'y70_m4',
  'y70_m5',
  'y70_m6',
  'y70_m7',
  'y70_m8',
  'y70_m9',
  'y70_m10',
  'y70_m11',
  'y70_m12'
];

export const ALL_MONTH_KEYS: MonthKey[] = [...MONTHS_2569, ...MONTHS_2570];

export interface MonthMetadata {
  year: 2569 | 2570;
  monthNum: number;
  label: string;
  shortLabel: string;
  shortYearLabel: string;
  thaiName: string;
  color: string;
  bgHeader: string;
}

export const MONTH_CONFIG: Record<MonthKey, MonthMetadata> = {
  // ปี 2569 (มิ.ย. - ธ.ค. 2569)
  m6: { year: 2569, monthNum: 6, label: 'เดือน 6 (มิ.ย. 69)', shortLabel: 'มิ.ย.', shortYearLabel: 'มิ.ย. 69', thaiName: 'มิถุนายน 2569', color: '#1e40af', bgHeader: 'bg-[#1e40af]' },
  m7: { year: 2569, monthNum: 7, label: 'เดือน 7 (ก.ค. 69)', shortLabel: 'ก.ค.', shortYearLabel: 'ก.ค. 69', thaiName: 'กรกฎาคม 2569', color: '#0e7490', bgHeader: 'bg-[#0e7490]' },
  m8: { year: 2569, monthNum: 8, label: 'เดือน 8 (ส.ค. 69)', shortLabel: 'ส.ค.', shortYearLabel: 'ส.ค. 69', thaiName: 'สิงหาคม 2569', color: '#c2410c', bgHeader: 'bg-[#c2410c]' },
  m9: { year: 2569, monthNum: 9, label: 'เดือน 9 (ก.ย. 69)', shortLabel: 'ก.ย.', shortYearLabel: 'ก.ย. 69', thaiName: 'กันยายน 2569', color: '#059669', bgHeader: 'bg-[#059669]' },
  m10: { year: 2569, monthNum: 10, label: 'เดือน 10 (ต.ค. 69)', shortLabel: 'ต.ค.', shortYearLabel: 'ต.ค. 69', thaiName: 'ตุลาคม 2569', color: '#7c3aed', bgHeader: 'bg-[#7c3aed]' },
  m11: { year: 2569, monthNum: 11, label: 'เดือน 11 (พ.ย. 69)', shortLabel: 'พ.ย.', shortYearLabel: 'พ.ย. 69', thaiName: 'พฤศจิกายน 2569', color: '#db2777', bgHeader: 'bg-[#db2777]' },
  m12: { year: 2569, monthNum: 12, label: 'เดือน 12 (ธ.ค. 69)', shortLabel: 'ธ.ค.', shortYearLabel: 'ธ.ค. 69', thaiName: 'ธันวาคม 2569', color: '#b45309', bgHeader: 'bg-[#b45309]' },

  // ปี 2570 (ม.ค. - ธ.ค. 2570)
  y70_m1: { year: 2570, monthNum: 1, label: 'เดือน 1 (ม.ค. 70)', shortLabel: 'ม.ค.', shortYearLabel: 'ม.ค. 70', thaiName: 'มกราคม 2570', color: '#0369a1', bgHeader: 'bg-[#0369a1]' },
  y70_m2: { year: 2570, monthNum: 2, label: 'เดือน 2 (ก.พ. 70)', shortLabel: 'ก.พ.', shortYearLabel: 'ก.พ. 70', thaiName: 'กุมภาพันธ์ 2570', color: '#0f766e', bgHeader: 'bg-[#0f766e]' },
  y70_m3: { year: 2570, monthNum: 3, label: 'เดือน 3 (มี.ค. 70)', shortLabel: 'มี.ค.', shortYearLabel: 'มี.ค. 70', thaiName: 'มีนาคม 2570', color: '#047857', bgHeader: 'bg-[#047857]' },
  y70_m4: { year: 2570, monthNum: 4, label: 'เดือน 4 (เม.ย. 70)', shortLabel: 'เม.ย.', shortYearLabel: 'เม.ย. 70', thaiName: 'เมษายน 2570', color: '#d97706', bgHeader: 'bg-[#d97706]' },
  y70_m5: { year: 2570, monthNum: 5, label: 'เดือน 5 (พ.ค. 70)', shortLabel: 'พ.ค.', shortYearLabel: 'พ.ค. 70', thaiName: 'พฤษภาคม 2570', color: '#ea580c', bgHeader: 'bg-[#ea580c]' },
  y70_m6: { year: 2570, monthNum: 6, label: 'เดือน 6 (มิ.ย. 70)', shortLabel: 'มิ.ย.', shortYearLabel: 'มิ.ย. 70', thaiName: 'มิถุนายน 2570', color: '#1d4ed8', bgHeader: 'bg-[#1d4ed8]' },
  y70_m7: { year: 2570, monthNum: 7, label: 'เดือน 7 (ก.ค. 70)', shortLabel: 'ก.ค.', shortYearLabel: 'ก.ค. 70', thaiName: 'กรกฎาคม 2570', color: '#0284c7', bgHeader: 'bg-[#0284c7]' },
  y70_m8: { year: 2570, monthNum: 8, label: 'เดือน 8 (ส.ค. 70)', shortLabel: 'ส.ค.', shortYearLabel: 'ส.ค. 70', thaiName: 'สิงหาคม 2570', color: '#c2410c', bgHeader: 'bg-[#c2410c]' },
  y70_m9: { year: 2570, monthNum: 9, label: 'เดือน 9 (ก.ย. 70)', shortLabel: 'ก.ย.', shortYearLabel: 'ก.ย. 70', thaiName: 'กันยายน 2570', color: '#059669', bgHeader: 'bg-[#059669]' },
  y70_m10: { year: 2570, monthNum: 10, label: 'เดือน 10 (ต.ค. 70)', shortLabel: 'ต.ค.', shortYearLabel: 'ต.ค. 70', thaiName: 'ตุลาคม 2570', color: '#6d28d9', bgHeader: 'bg-[#6d28d9]' },
  y70_m11: { year: 2570, monthNum: 11, label: 'เดือน 11 (พ.ย. 70)', shortLabel: 'พ.ย.', shortYearLabel: 'พ.ย. 70', thaiName: 'พฤศจิกายน 2570', color: '#be185d', bgHeader: 'bg-[#be185d]' },
  y70_m12: { year: 2570, monthNum: 12, label: 'เดือน 12 (ธ.ค. 70)', shortLabel: 'ธ.ค.', shortYearLabel: 'ธ.ค. 70', thaiName: 'ธันวาคม 2570', color: '#991b1b', bgHeader: 'bg-[#991b1b]' }
};

export interface MonthlyOperationalData {
  dist: number;  // ระยะทาง (กม.)
  fuel: number;  // น้ำมัน (ลิตร)
  cost: number;  // ค่าน้ำมัน (บาท)
  jobs: number;  // จำนวนงาน (งาน)
  drivers?: string[]; // รายชื่อคนขับประจำเดือน สูงสุด 3 คน (คนขับหลัก, คนขับสำรอง 1, คนขับสำรอง 2)
}

export const createEmptyMonthData = (): MonthlyOperationalData => ({
  dist: 0,
  fuel: 0,
  cost: 0,
  jobs: 0,
  drivers: []
});

export interface Vehicle {
  id: string; // document ID
  order: number;
  plate: string;
  age: number;
  mileage: number;
  branch: string;
  healthScore: number;
  healthStatus: 'critical' | 'warning' | 'good' | 'excellent' | 'na';
  recommendation: string;
  estimatedPrice: number; // 0 if none
  plan: VehiclePlan;
  limit: number; // fuel limit per month
  // ปี 2569 (มิ.ย. - ธ.ค. 2569)
  m6: MonthlyOperationalData;
  m7: MonthlyOperationalData;
  m8: MonthlyOperationalData;
  m9: MonthlyOperationalData;
  m10: MonthlyOperationalData;
  m11: MonthlyOperationalData;
  m12?: MonthlyOperationalData;
  // ปี 2570 (ม.ค. - ธ.ค. 2570)
  y70_m1?: MonthlyOperationalData;
  y70_m2?: MonthlyOperationalData;
  y70_m3?: MonthlyOperationalData;
  y70_m4?: MonthlyOperationalData;
  y70_m5?: MonthlyOperationalData;
  y70_m6?: MonthlyOperationalData;
  y70_m7?: MonthlyOperationalData;
  y70_m8?: MonthlyOperationalData;
  y70_m9?: MonthlyOperationalData;
  y70_m10?: MonthlyOperationalData;
  y70_m11?: MonthlyOperationalData;
  y70_m12?: MonthlyOperationalData;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface MonthlyComputedStat {
  eff: number;
  cKm: number;
  cJob: number;
}

export type VehicleDerivedStats = Record<MonthKey, MonthlyComputedStat> & {
  total: {
    dist: number;
    fuel: number;
    cost: number;
    jobs: number;
    eff: number;
    cKm: number;
    cJob: number;
    limitPercent: number;
  };
};

export type PeriodFilter = 'total' | MonthKey;

export type MetricFilter =
  | 'jobs_desc'
  | 'cost_km_desc'
  | 'jobs_asc'
  | 'cost_job_desc'
  | 'limit_usage_desc'
  | 'distance_desc'
  | 'fuel_cost_desc';

export interface AuditLog {
  id: string;
  action: string;
  vehiclePlate: string;
  details: string;
  timestamp: string;
  userId?: string;
}
