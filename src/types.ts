export type VehiclePlan = 'urgent_sell' | 'sell' | 'rebrand' | 'keep';

export type MonthKey = 'm6' | 'm7' | 'm8' | 'm9' | 'm10' | 'm11';

export const MONTH_CONFIG: Record<MonthKey, {
  label: string;
  shortLabel: string;
  thaiName: string;
  color: string;
  bgHeader: string;
}> = {
  m6: { label: 'เดือน 6 (มิ.ย. 69)', shortLabel: 'มิ.ย.', thaiName: 'มิถุนายน 2569', color: '#1e40af', bgHeader: 'bg-[#1e40af]' },
  m7: { label: 'เดือน 7 (ก.ค. 69)', shortLabel: 'ก.ค.', thaiName: 'กรกฎาคม 2569', color: '#0e7490', bgHeader: 'bg-[#0e7490]' },
  m8: { label: 'เดือน 8 (ส.ค. 69)', shortLabel: 'ส.ค.', thaiName: 'สิงหาคม 2569', color: '#c2410c', bgHeader: 'bg-[#c2410c]' },
  m9: { label: 'เดือน 9 (ก.ย. 69)', shortLabel: 'ก.ย.', thaiName: 'กันยายน 2569', color: '#059669', bgHeader: 'bg-[#059669]' },
  m10: { label: 'เดือน 10 (ต.ค. 69)', shortLabel: 'ต.ค.', thaiName: 'ตุลาคม 2569', color: '#7c3aed', bgHeader: 'bg-[#7c3aed]' },
  m11: { label: 'เดือน 11 (พ.ย. 69)', shortLabel: 'พ.ย.', thaiName: 'พฤศจิกายน 2569', color: '#db2777', bgHeader: 'bg-[#db2777]' }
};

export interface MonthlyOperationalData {
  dist: number;  // ระยะทาง (กม.)
  fuel: number;  // น้ำมัน (ลิตร)
  cost: number;  // ค่าน้ำมัน (บาท)
  jobs: number;  // จำนวนงาน (งาน)
}

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
  m6: MonthlyOperationalData; // June 69
  m7: MonthlyOperationalData; // July 69
  m8: MonthlyOperationalData; // August 69
  m9: MonthlyOperationalData; // September 69
  m10: MonthlyOperationalData; // October 69 (เว้นว่างรอคีย์ข้อมูล)
  m11: MonthlyOperationalData; // November 69 (เว้นว่างรอคีย์ข้อมูล)
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface VehicleDerivedStats {
  m6: { eff: number; cKm: number; cJob: number };
  m7: { eff: number; cKm: number; cJob: number };
  m8: { eff: number; cKm: number; cJob: number };
  m9: { eff: number; cKm: number; cJob: number };
  m10: { eff: number; cKm: number; cJob: number };
  m11: { eff: number; cKm: number; cJob: number };
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
}

export type PeriodFilter = 'total' | MonthKey;

export type MetricFilter =
  | 'jobs_desc'
  | 'cost_km_desc'
  | 'jobs_asc'
  | 'cost_job_desc'
  | 'limit_usage_desc'
  | 'distance_desc';

export interface AuditLog {
  id: string;
  action: string;
  vehiclePlate: string;
  details: string;
  timestamp: string;
  userId?: string;
}
