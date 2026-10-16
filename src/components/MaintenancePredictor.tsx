import React, { useState, useMemo } from 'react';
import {
  Wrench,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Car,
  DollarSign,
  ArrowRight,
  Sparkles,
  FileText,
  Printer,
  CalendarDays,
  Gauge
} from 'lucide-react';
import { Vehicle } from '../types';
import { numFormat } from '../utils/calculations';

interface MaintenancePredictorProps {
  vehicles: Vehicle[];
  onSelectCar: (vehicle: Vehicle) => void;
  onEditCar?: (vehicle: Vehicle) => void;
  onOpenMemo?: () => void;
  addToast?: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export interface PredictedServiceData {
  vehicle: Vehicle;
  dailyDistance: number;
  monthlyDistance: number;
  currentMileage: number;
  nextTargetMileage: number;
  remainingKm: number;
  daysUntilService: number;
  predictedDate: Date;
  predictedDateFormatted: string;
  urgency: 'critical' | 'warning' | 'normal';
  urgencyLabel: string;
  recommendedPackage: string;
  recommendedTasks: string[];
  estimatedCostMin: number;
  estimatedCostMax: number;
  costSavingAdvice?: string;
}

export const MaintenancePredictor: React.FC<MaintenancePredictorProps> = ({
  vehicles,
  onSelectCar,
  onEditCar,
  onOpenMemo,
  addToast
}) => {
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'warning' | 'normal'>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBookingVehicle, setSelectedBookingVehicle] = useState<PredictedServiceData | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Compute Predictive Maintenance Forecasts for all vehicles
  const predictions: PredictedServiceData[] = useMemo(() => {
    // Current simulation baseline: October 2026
    const baseDate = new Date(2026, 9, 5); // 5 Oct 2026

    return vehicles.map((car) => {
      const totalDist = (car.m6.dist || 0) + (car.m7.dist || 0) + (car.m8.dist || 0) + (car.m9?.dist || 0) + (car.m10?.dist || 0) + (car.m11?.dist || 0);
      const activeCount = ((car.m6.dist ? 1 : 0) + (car.m7.dist ? 1 : 0) + (car.m8.dist ? 1 : 0) + (car.m9?.dist ? 1 : 0) + (car.m10?.dist ? 1 : 0) + (car.m11?.dist ? 1 : 0)) || 3;
      const monthlyDistance = totalDist > 0 ? totalDist / activeCount : 200;
      // Daily run rate with a 15 km/day baseline for commercial pickup
      const dailyDistance = Math.max(15, monthlyDistance / 30);

      const currentMileage = car.mileage || 200000;
      // Standard commercial maintenance cycle: every 10,000 km
      const nextTargetMileage = (Math.floor(currentMileage / 10000) + 1) * 10000;
      const remainingKm = Math.max(150, nextTargetMileage - currentMileage);

      // Health Score degradation factor (Lower health score = faster wear & tear)
      // Score < 60 degrades 2.5x faster; Score < 75 degrades 1.5x faster
      const healthScore = car.healthScore || 70;
      let healthMultiplier = 1.0;

      if (healthScore <= 50) {
        healthMultiplier = 0.35; // Accelerate to critical immediate inspection
      } else if (healthScore <= 60) {
        healthMultiplier = 0.5;
      } else if (healthScore <= 75) {
        healthMultiplier = 0.75;
      } else if (healthScore >= 90) {
        healthMultiplier = 1.15; // Healthy vehicle runs smoother
      }

      // Calculate days until next required service
      const rawDays = (remainingKm / dailyDistance) * healthMultiplier;
      let daysUntilService = Math.round(rawDays);

      // Boundary rules based on health status
      if (healthScore <= 50) {
        daysUntilService = Math.min(10, Math.max(3, daysUntilService));
      } else if (healthScore <= 60) {
        daysUntilService = Math.min(16, Math.max(5, daysUntilService));
      } else if (healthScore <= 75) {
        daysUntilService = Math.min(42, Math.max(15, daysUntilService));
      } else {
        daysUntilService = Math.min(110, Math.max(25, daysUntilService));
      }

      // Predicted Target Date
      const predictedDate = new Date(baseDate.getTime() + daysUntilService * 24 * 60 * 60 * 1000);
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const predictedDateFormatted = `${predictedDate.getDate()} ${thaiMonths[predictedDate.getMonth()]} ${predictedDate.getFullYear() + 543}`;

      // Urgency Classification
      let urgency: 'critical' | 'warning' | 'normal' = 'normal';
      let urgencyLabel = '🟢 ตามรอบปกติ';

      if (daysUntilService <= 14 || healthScore < 60) {
        urgency = 'critical';
        urgencyLabel = '🔴 ด่วนมาก (< 14 วัน)';
      } else if (daysUntilService <= 45 || healthScore < 75) {
        urgency = 'warning';
        urgencyLabel = '🟡 ใกล้ถึงรอบ (15-45 วัน)';
      }

      // Generate Recommended Maintenance Tasks & Forecasted Costs
      let recommendedPackage = 'ตรวจเช็กระยะ 10,000 กม. มาตรฐาน';
      let recommendedTasks: string[] = [
        'เปลี่ยนถ่ายน้ำมันเครื่องดีเซลเกรดสังเคราะห์',
        'เปลี่ยนไส้กรองน้ำมันเครื่องและกรองอากาศ',
        'ตรวจเช็กระดับน้ำยาหล่อเย็นและน้ำมันเบรก',
        'สลับยางและถ่วงล้อ 4 ล้อ'
      ];
      let estimatedCostMin = 2800;
      let estimatedCostMax = 4500;
      let costSavingAdvice: string | undefined = undefined;

      if (currentMileage >= 280000 || healthScore < 60) {
        recommendedPackage = 'ตรวจเช็กใหญ่ & กู้สภาพวิกฤต (Major Overhaul)';
        recommendedTasks = [
          'ตรวจเช็กกำลังอัดกระบอกสูบและล้างหัวฉีดดีเซลคอมมอนเรล',
          'เปลี่ยนผ้าเบรกหน้า-หลังและเจียรจานเบรก',
          'ตรวจเช็กลูกปืนล้อ ลูกหมากคันชัก และบูชปีกนก',
          'เปลี่ยนถ่ายน้ำมันเกียร์และน้ำมันเฟืองท้าย',
          'ตรวจเช็กท่อแคทาลิติกและเซนเซอร์ไอเสีย (O2 Sensor)'
        ];
        estimatedCostMin = 8500;
        estimatedCostMax = 15000;

        if (car.plan === 'urgent_sell') {
          costSavingAdvice = '⚠️ รถอยู่ในแผนขายด่วน P1: ไม่ควรลงทุนซ่อมใหญ่ 12,000+ บาท แนะนำเร่งขายตัดจำหน่ายเพื่อประหยัดงบประมาณก้อนนี้';
        }
      } else if (currentMileage >= 200000 || healthScore < 75) {
        recommendedPackage = 'ตรวจเช็กระยะกลาง 20,000 กม. (Mid-Life Service)';
        recommendedTasks = [
          'เปลี่ยนถ่ายน้ำมันเครื่อง Fully Synthetic',
          'เปลี่ยนกรองน้ำมันเชื้อเพลิง (Fuel Filter)',
          'ตรวจเช็กระบบเบรกและสายพานหน้าเครื่อง',
          'ทำความสะอาดระบบแอร์และกรองอากาศในห้องโดยสาร'
        ];
        estimatedCostMin = 4200;
        estimatedCostMax = 7200;

        if (car.plan === 'sell') {
          costSavingAdvice = 'ℹ️ รถเตรียมขาย P2: แนะนำทำเฉพาะการบำรุงรักษาพื้นฐานเพื่อรักษาความต่อเนื่องในการวิ่งส่งงาน';
        }
      }

      return {
        vehicle: car,
        dailyDistance,
        monthlyDistance,
        currentMileage,
        nextTargetMileage,
        remainingKm,
        daysUntilService,
        predictedDate,
        predictedDateFormatted,
        urgency,
        urgencyLabel,
        recommendedPackage,
        recommendedTasks,
        estimatedCostMin,
        estimatedCostMax,
        costSavingAdvice
      };
    });
  }, [vehicles]);

  // Unique branches for filtering
  const branches = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((c) => {
      if (c.branch) set.add(c.branch);
    });
    return Array.from(set).sort();
  }, [vehicles]);

  // Filtered Predictions
  const filteredPredictions = useMemo(() => {
    return predictions.filter((item) => {
      const matchUrgency = filterUrgency === 'all' || item.urgency === filterUrgency;
      const matchBranch = filterBranch === 'all' || item.vehicle.branch === filterBranch;
      const matchSearch =
        searchTerm.trim() === '' ||
        item.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicle.branch.toLowerCase().includes(searchTerm.toLowerCase());

      return matchUrgency && matchBranch && matchSearch;
    });
  }, [predictions, filterUrgency, filterBranch, searchTerm]);

  // Aggregate Metrics for Predictor Dashboard
  const metrics = useMemo(() => {
    const criticalCount = predictions.filter((p) => p.urgency === 'critical').length;
    const warningCount = predictions.filter((p) => p.urgency === 'warning').length;
    const normalCount = predictions.filter((p) => p.urgency === 'normal').length;

    const avgDays = Math.round(
      predictions.reduce((acc, p) => acc + p.daysUntilService, 0) / (predictions.length || 1)
    );

    const totalEstimatedCost = predictions.reduce(
      (acc, p) => acc + (p.estimatedCostMin + p.estimatedCostMax) / 2,
      0
    );

    // Fleet Reliability Index based on average health & distance to service
    const avgHealth =
      predictions.reduce((acc, p) => acc + (p.vehicle.healthScore || 70), 0) /
      (predictions.length || 1);
    const reliabilityIndex = Math.min(99, Math.round(avgHealth * 0.95));

    return {
      criticalCount,
      warningCount,
      normalCount,
      avgDays,
      totalEstimatedCost,
      reliabilityIndex
    };
  }, [predictions]);

  // Handle Book Service Appointment
  const handleBookService = (data: PredictedServiceData) => {
    setSelectedBookingVehicle(data);
    setBookingConfirmed(false);
  };

  const confirmBooking = () => {
    if (!selectedBookingVehicle) return;
    setBookingConfirmed(true);
    if (addToast) {
      addToast(
        'success',
        `จองคิวเช็กระยะสำเร็จ (${selectedBookingVehicle.vehicle.plate})`,
        `นัดหมายศูนย์บริการล่วงหน้าเรียบร้อย คาดการณ์เข้าตรวจวันที่ ${selectedBookingVehicle.predictedDateFormatted}`
      );
    }
    setTimeout(() => {
      setSelectedBookingVehicle(null);
      setBookingConfirmed(false);
    }, 1500);
  };

  return (
    <div
      id="maintenanceSection"
      className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden relative z-10 mt-8 scroll-mt-24 transition-colors"
    >
      {/* Top Banner Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-white">
              AI Predictor
            </span>
            <span className="text-xs text-blue-200">
              พยากรณ์รอบเช็กระยะล่วงหน้าจากข้อมูลสุขภาพรถ (Predictive Maintenance)
            </span>
          </div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" />
            <span>ตารางที่ 4: ศูนย์พยากรณ์การซ่อมบำรุงและรอบเช็กระยะเชิงรุก (Maintenance Predictor)</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMemo && (
            <button
              onClick={onOpenMemo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            >
              <FileText className="w-3.5 h-3.5 text-orange-300" />
              <span>เปิดใบขออนุมัติขาย (PDF Memo)</span>
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            title="พิมพ์ตารางพยากรณ์การซ่อมบำรุง"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์ตาราง</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-700">
        {/* Card 1: Critical Urgency */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/60 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              ต้องเข้าตรวจด่วน (&lt; 14 วัน)
            </div>
            <div className="text-xl font-extrabold text-red-600 dark:text-red-400">
              {metrics.criticalCount} <span className="text-xs font-normal text-slate-500">คัน</span>
            </div>
            <div className="text-[10px] text-red-500">เสี่ยงยกกินตายกลางทาง</div>
          </div>
        </div>

        {/* Card 2: Average Days to Service */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              รอบเข้าศูนย์เฉลี่ยของฟลีท
            </div>
            <div className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
              {metrics.avgDays} <span className="text-xs font-normal text-slate-500">วัน</span>
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-300">
              พยากรณ์จากอัตราวิ่งจริง
            </div>
          </div>
        </div>

        {/* Card 3: Estimated Next 90 Days Maintenance Budget */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-purple-900/60 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              งบซ่อมบำรุงคาดการณ์ (90 วัน)
            </div>
            <div className="text-xl font-extrabold text-purple-700 dark:text-purple-400">
              ~{numFormat(metrics.totalEstimatedCost, 0, 0)} <span className="text-xs font-normal text-slate-500">บ.</span>
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-300">
              รวมเช็กใหญ่และเปลี่ยนอะไหล่
            </div>
          </div>
        </div>

        {/* Card 4: Fleet Reliability Index */}
        <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              ดัชนีความพร้อมฟลีท (Reliability)
            </div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {metrics.reliabilityIndex}%
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-300">
              {metrics.normalCount} คัน อยู่ในเกณฑ์ดี
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Urgency Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-500" /> สถานะ:
          </span>
          {[
            { id: 'all', label: `ทั้งหมด (${predictions.length})` },
            { id: 'critical', label: `🔴 ด่วนมาก (${metrics.criticalCount})` },
            { id: 'warning', label: `🟡 ใกล้ถึงรอบ (${metrics.warningCount})` },
            { id: 'normal', label: `🟢 ปกติตามรอบ (${metrics.normalCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterUrgency(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                filterUrgency === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Branch Filter & Search Input */}
        <div className="flex items-center gap-2">
          {/* Branch Selector */}
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
          >
            <option value="all">ทุกสาขา ({branches.length} สาขา)</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                สาขา {b}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาทะเบียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs focus:ring-2 focus:ring-blue-500 outline-hidden w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Predictive Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max text-[11px]">
          <thead>
            <tr className="bg-slate-800 dark:bg-slate-900 text-white uppercase tracking-wider text-center border-b border-slate-700">
              <th className="px-2.5 py-3 font-bold sticky left-0 z-20 bg-slate-800 dark:bg-slate-900 w-10">#</th>
              <th className="px-3 py-3 font-bold sticky left-10 z-20 bg-slate-800 dark:bg-slate-900 text-left w-32 border-r border-slate-700">
                ทะเบียน / สาขา
              </th>
              <th className="px-2.5 py-3 font-semibold">แผนจัดการ</th>
              <th className="px-2.5 py-3 font-semibold text-center">สุขภาพรถ (Health)</th>
              <th className="px-2.5 py-3 font-semibold text-right">ไมล์ปัจจุบัน</th>
              <th className="px-2.5 py-3 font-semibold text-right">วิ่งเฉลี่ย/วัน</th>
              <th className="px-2.5 py-3 font-semibold text-right">เหลืออีก (กม.)</th>
              <th className="px-3 py-3 font-bold text-center bg-[#1e40af] text-white">
                วันพยากรณ์เข้าศูนย์
              </th>
              <th className="px-3 py-3 font-bold text-center bg-[#1e3a8a] text-white">
                ระยะเวลานับถอยหลัง
              </th>
              <th className="px-3 py-3 font-semibold text-left">รายการบริการที่แนะนำ</th>
              <th className="px-2.5 py-3 font-semibold text-right">ประมาณการค่าใช้จ่าย</th>
              <th className="px-3 py-3 font-semibold text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
            {filteredPredictions.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  ไม่พบข้อมูลรถยนต์ตามเงื่อนไขที่เลือก
                </td>
              </tr>
            ) : (
              filteredPredictions.map((item, idx) => {
                const isCritical = item.urgency === 'critical';
                const isWarning = item.urgency === 'warning';

                return (
                  <tr
                    key={item.vehicle.id || idx}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/80 transition-colors ${
                      isCritical
                        ? 'bg-red-50/20 dark:bg-red-950/10'
                        : isWarning
                        ? 'bg-amber-50/15 dark:bg-amber-950/5'
                        : ''
                    }`}
                  >
                    {/* Order */}
                    <td className="px-2.5 py-2.5 text-center text-slate-400 font-bold sticky left-0 z-10 bg-white dark:bg-[#1e293b]">
                      {item.vehicle.order}
                    </td>

                    {/* Plate & Branch */}
                    <td className="px-3 py-2.5 font-bold sticky left-10 z-10 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-700">
                      <div
                        onClick={() => onSelectCar(item.vehicle)}
                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5"
                      >
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.vehicle.plate}</span>
                      </div>
                      <div className="text-[10px] font-normal text-slate-400">
                        {item.vehicle.branch} • {item.vehicle.age} ปี
                      </div>
                    </td>

                    {/* Plan Badge */}
                    <td className="px-2.5 py-2.5 text-center">
                      {item.vehicle.plan === 'urgent_sell' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                          ขายด่วน P1
                        </span>
                      )}
                      {item.vehicle.plan === 'sell' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-300">
                          ทยอยขาย P2
                        </span>
                      )}
                      {item.vehicle.plan === 'rebrand' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          Re-brand
                        </span>
                      )}
                      {item.vehicle.plan === 'keep' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200">
                          เก็บไว้ใช้
                        </span>
                      )}
                    </td>

                    {/* Health Score */}
                    <td className="px-2.5 py-2.5 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`font-extrabold text-xs px-2 py-0.5 rounded-md ${
                            item.vehicle.healthScore < 60
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                              : item.vehicle.healthScore < 75
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {item.vehicle.healthScore} / 100
                        </span>
                      </div>
                    </td>

                    {/* Mileage */}
                    <td className="px-2.5 py-2.5 text-right font-semibold">
                      {numFormat(item.currentMileage, 0, 0)} กม.
                    </td>

                    {/* Daily run rate */}
                    <td className="px-2.5 py-2.5 text-right text-slate-500 dark:text-slate-400">
                      ~{Math.round(item.dailyDistance)} กม./วัน
                    </td>

                    {/* Remaining km */}
                    <td className="px-2.5 py-2.5 text-right font-medium">
                      {numFormat(item.remainingKm, 0, 0)} กม.
                    </td>

                    {/* Predicted Service Date */}
                    <td className="px-3 py-2.5 text-center font-bold text-xs bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-x border-blue-200 dark:border-blue-900">
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{item.predictedDateFormatted}</span>
                      </div>
                    </td>

                    {/* Countdown Days & Urgency Pill */}
                    <td className="px-3 py-2.5 text-center bg-blue-50/40 dark:bg-blue-950/20">
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isCritical
                              ? 'bg-red-500 text-white border-red-600 animate-pulse'
                              : isWarning
                              ? 'bg-amber-400 text-slate-900 border-amber-500 font-bold'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {item.daysUntilService <= 7
                            ? `⚡ ต้องตรวจใน ${item.daysUntilService} วัน`
                            : `ในอีก ${item.daysUntilService} วัน`}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {isCritical ? 'เร่งด่วนสูงสุด' : isWarning ? 'นัดหมายเดือนนี้' : 'ตามรอบปกติ'}
                        </span>
                      </div>
                    </td>

                    {/* Recommended Package */}
                    <td className="px-3 py-2.5">
                      <div className="max-w-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {item.recommendedPackage}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.recommendedTasks[0]}, {item.recommendedTasks[1]}...
                        </div>
                        {item.costSavingAdvice && (
                          <div className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-0.5">
                            {item.costSavingAdvice}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Estimated Cost */}
                    <td className="px-2.5 py-2.5 text-right font-extrabold text-slate-800 dark:text-white">
                      ~{numFormat(item.estimatedCostMin, 0, 0)} - {numFormat(item.estimatedCostMax, 0, 0)} บ.
                    </td>

                    {/* Action Buttons */}
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleBookService(item)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold transition-colors shadow-xs flex items-center gap-1"
                          title="ลงทะเบียนนัดหมายศูนย์บริการล่วงหน้า"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>นัดหมาย</span>
                        </button>
                        <button
                          onClick={() => onSelectCar(item.vehicle)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                          title="ดูโปรไฟล์รถเชิงลึก"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Strategic Insight Callout */}
      <div className="p-4 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 dark:from-slate-800 dark:via-blue-950/20 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0" />
          <span>
            <b>กลยุทธ์ลดต้นทุนซ่อมบำรุง (Cost Avoidance):</b> สำหรับรถกลุ่มขายด่วน P1 (ฒจ 99, ฒย 88, ถอ 1111) ที่พยากรณ์ว่าต้องเข้าตรวจใหญ่เร็วๆ นี้ หากเร่งตัดจำหน่ายในเดือนนี้ จะช่วยประหยัดงบประมาณซ่อมบำรุงก้อนใหญ่ได้ทันทีรวมกว่า <b>35,000 - 45,000 บาท</b>
          </span>
        </div>

        {onOpenMemo && (
          <button
            onClick={onOpenMemo}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ดูเอกสารขออนุมัติขาย</span>
          </button>
        )}
      </div>

      {/* Booking Service Modal */}
      {selectedBookingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedBookingVehicle(null)}
          />
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-5 relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-base text-slate-800 dark:text-white">
                  นัดหมายรอบเช็กระยะล่วงหน้า
                </h4>
              </div>
              <button
                onClick={() => setSelectedBookingVehicle(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-blue-800 dark:text-blue-300">
                    ทะเบียน {selectedBookingVehicle.vehicle.plate} (สาขา {selectedBookingVehicle.vehicle.branch})
                  </div>
                  <div className="text-slate-500">
                    ไมล์สะสม: {numFormat(selectedBookingVehicle.currentMileage, 0, 0)} กม. • สุขภาพ: {selectedBookingVehicle.vehicle.healthScore}/100
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600 dark:text-red-400">
                    {selectedBookingVehicle.predictedDateFormatted}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    (ในอีก {selectedBookingVehicle.daysUntilService} วัน)
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  แพ็กเกจบริการที่พยากรณ์:
                </label>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-750 rounded-lg font-semibold text-slate-800 dark:text-slate-200">
                  {selectedBookingVehicle.recommendedPackage} (~{numFormat(selectedBookingVehicle.estimatedCostMin, 0, 0)} - {numFormat(selectedBookingVehicle.estimatedCostMax, 0, 0)} บ.)
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  รายการตรวจเช็กสำคัญ:
                </label>
                <ul className="space-y-1 list-disc list-inside bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {selectedBookingVehicle.recommendedTasks.map((task, i) => (
                    <li key={i} className="text-slate-600 dark:text-slate-300">
                      {task}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedBookingVehicle.costSavingAdvice && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-[11px] font-semibold">
                  {selectedBookingVehicle.costSavingAdvice}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedBookingVehicle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmBooking}
                disabled={bookingConfirmed}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                {bookingConfirmed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>บันทึกนัดหมายสำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>ยืนยันการจองคิวศูนย์บริการ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
