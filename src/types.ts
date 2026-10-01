export type VehiclePlan = 'urgent_sell' | 'sell' | 'rebrand' | 'keep';

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
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface VehicleDerivedStats {
  m6: { eff: number; cKm: number; cJob: number };
  m7: { eff: number; cKm: number; cJob: number };
  m8: { eff: number; cKm: number; cJob: number };
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

export type PeriodFilter = 'total' | 'm6' | 'm7' | 'm8';

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
