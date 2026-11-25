import React, { useState } from 'react';
import {
  X,
  Save,
  Car,
  Users,
  Calendar,
  Copy
} from 'lucide-react';
import {
  Vehicle,
  VehiclePlan,
  MonthKey,
  MONTHS_2569,
  MONTHS_2570,
  ALL_MONTH_KEYS,
  MONTH_CONFIG,
  MonthlyOperationalData
} from '../types';
import { getVehicleMonthData } from '../utils/calculations';

interface EditCarModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (id: string, updated: Partial<Vehicle>, reason: string) => Promise<void>;
}

const getInitDrivers = (d?: string[]) => [d?.[0] || '', d?.[1] || '', d?.[2] || ''];

const EditCarModalInner: React.FC<{
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (id: string, updated: Partial<Vehicle>, reason: string) => Promise<void>;
}> = ({ vehicle, onClose, onSave }) => {
  const [plate, setPlate] = useState(vehicle.plate);
  const [branch, setBranch] = useState(vehicle.branch);
  const [age, setAge] = useState(vehicle.age);
  const [mileage, setMileage] = useState(vehicle.mileage);
  const [plan, setPlan] = useState<VehiclePlan>(vehicle.plan);
  const [healthScore, setHealthScore] = useState(vehicle.healthScore);
  const [estimatedPrice, setEstimatedPrice] = useState(vehicle.estimatedPrice || 0);
  const [limit, setLimit] = useState(vehicle.limit || 0);
  const [recommendation, setRecommendation] = useState(vehicle.recommendation);
  const [notes, setNotes] = useState(vehicle.notes || '');

  // Unified state for all 19 months (มิ.ย. 69 - ธ.ค. 70)
  const [monthDataMap, setMonthDataMap] = useState<Record<MonthKey, Omit<MonthlyOperationalData, 'drivers'>>>(() => {
    const initial = {} as Record<MonthKey, Omit<MonthlyOperationalData, 'drivers'>>;
    ALL_MONTH_KEYS.forEach((mKey) => {
      const m = getVehicleMonthData(vehicle, mKey);
      initial[mKey] = {
        dist: m.dist || 0,
        fuel: m.fuel || 0,
        cost: m.cost || 0,
        jobs: m.jobs || 0
      };
    });
    return initial;
  });

  // Driver arrays per month (up to 3 drivers per vehicle per month)
  const [driversMap, setDriversMap] = useState<Record<MonthKey, string[]>>(() => {
    const initial = {} as Record<MonthKey, string[]>;
    ALL_MONTH_KEYS.forEach((mKey) => {
      const m = getVehicleMonthData(vehicle, mKey);
      initial[mKey] = getInitDrivers(m.drivers);
    });
    return initial;
  });

  const [selectedYear, setSelectedYear] = useState<2569 | 2570>(2569);
  const [activeMonth, setActiveMonth] = useState<MonthKey>('m8');

  const [editReason, setEditReason] = useState('บันทึกข้อมูลย้อนหลัง / ปรับปรุงข้อมูลจริง');
  const [saving, setSaving] = useState(false);

  const cleanDrivers = (arr: string[]) => arr.map((s) => s.trim()).filter(Boolean);

  const handleFieldChange = (
    mKey: MonthKey,
    field: 'dist' | 'fuel' | 'cost' | 'jobs',
    value: number
  ) => {
    setMonthDataMap((prev) => ({
      ...prev,
      [mKey]: {
        ...prev[mKey],
        [field]: Number.isFinite(value) ? value : 0
      }
    }));
  };

  const handleDriverChange = (mKey: MonthKey, slotIdx: number, value: string) => {
    setDriversMap((prev) => {
      const next = [...prev[mKey]];
      next[slotIdx] = value;
      return {
        ...prev,
        [mKey]: next
      };
    });
  };

  const handleCopyDriversFromPrev = (targetMonth: MonthKey) => {
    const idx = ALL_MONTH_KEYS.indexOf(targetMonth);
    if (idx <= 0) return;
    const prevMonth = ALL_MONTH_KEYS[idx - 1];
    setDriversMap((prev) => ({
      ...prev,
      [targetMonth]: [...prev[prevMonth]]
    }));
  };

  const handleYearSwitch = (year: 2569 | 2570) => {
    setSelectedYear(year);
    const list = year === 2569 ? MONTHS_2569 : MONTHS_2570;
    if (!list.includes(activeMonth as never)) {
      setActiveMonth(list[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: Partial<Vehicle> = {
        plate,
        branch,
        age: Number(age),
        mileage: Number(mileage),
        plan,
        healthScore: Number(healthScore),
        estimatedPrice: Number(estimatedPrice),
        limit: Number(limit),
        recommendation,
        notes
      };

      ALL_MONTH_KEYS.forEach((mKey) => {
        const d = monthDataMap[mKey];
        (updated as Record<string, unknown>)[mKey] = {
          dist: Number(d.dist) || 0,
          fuel: Number(d.fuel) || 0,
          cost: Number(d.cost) || 0,
          jobs: Number(d.jobs) || 0,
          drivers: cleanDrivers(driversMap[mKey] || [])
        };
      });

      await onSave(vehicle.id, updated, editReason);
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const yearMonths: MonthKey[] = selectedYear === 2569 ? MONTHS_2569 : MONTHS_2570;
  const activeCfg = MONTH_CONFIG[activeMonth];
  const activeData = monthDataMap[activeMonth];
  const activeDrivers = driversMap[activeMonth] || ['', '', ''];
  const activeMonthIndex = ALL_MONTH_KEYS.indexOf(activeMonth);

  // Live calculation across all 19 months AND selected year
  const grandStats = ALL_MONTH_KEYS.reduce(
    (acc, mKey) => {
      const m = monthDataMap[mKey];
      acc.dist += Number(m.dist) || 0;
      acc.fuel += Number(m.fuel) || 0;
      acc.cost += Number(m.cost) || 0;
      acc.jobs += Number(m.jobs) || 0;
      return acc;
    },
    { dist: 0, fuel: 0, cost: 0, jobs: 0 }
  );

  const yearStats = yearMonths.reduce(
    (acc, mKey) => {
      const m = monthDataMap[mKey];
      acc.dist += Number(m.dist) || 0;
      acc.fuel += Number(m.fuel) || 0;
      acc.cost += Number(m.cost) || 0;
      acc.jobs += Number(m.jobs) || 0;
      return acc;
    },
    { dist: 0, fuel: 0, cost: 0, jobs: 0 }
  );

  const liveEff = grandStats.fuel > 0 ? grandStats.dist / grandStats.fuel : 0;
  const liveCjob = grandStats.jobs > 0 ? grandStats.cost / grandStats.jobs : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-3xl relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                แก้ไขข้อมูลรถ: ทะเบียน {vehicle.plate}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รองรับข้อมูล 19 เดือน (ปี 2569 มิ.ย.-ธ.ค. และ ปี 2570 ม.ค.-ธ.ค.) ซิงค์คลาวด์อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-6">
          {/* Basic Car Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              ข้อมูลทั่วไป & แผนการจัดการ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  ทะเบียนรถ
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  สังกัด/สาขา
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  แผนจัดการฟลีท
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as VehiclePlan)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium"
                >
                  <option value="urgent_sell">ขายด่วน P1</option>
                  <option value="sell">ทยอยขาย P2</option>
                  <option value="rebrand">รอ Re-brand</option>
                  <option value="keep">เก็บไว้ใช้</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  อายุ (ปี)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  ไมล์สะสม (กม.)
                </label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Health Score (0-100)
                </label>
                <input
                  type="number"
                  value={healthScore}
                  onChange={(e) => setHealthScore(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  ราคาประเมินขาย (บาท)
                </label>
                <input
                  type="number"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  วงเงินน้ำมันต่อเดือน (บาท)
                </label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Monthly Operational Data (2569 & 2570 Tabbed Editor) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>ข้อมูลการปฏิบัติงานรายเดือน (เลือกปีและเดือนที่ต้องการบันทึก)</span>
              </h4>

              {/* Year Tabs */}
              <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleYearSwitch(2569)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    selectedYear === 2569
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  ปี 2569 (มิ.ย.-ธ.ค.)
                </button>
                <button
                  type="button"
                  onClick={() => handleYearSwitch(2570)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    selectedYear === 2570
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  ปี 2570 (ม.ค.-ธ.ค.)
                </button>
              </div>
            </div>

            {/* Month Selector Grid within Selected Year */}
            <div className={`grid gap-1.5 ${selectedYear === 2569 ? 'grid-cols-4 sm:grid-cols-7' : 'grid-cols-4 sm:grid-cols-6'}`}>
              {yearMonths.map((mKey) => {
                const cfg = MONTH_CONFIG[mKey];
                const d = monthDataMap[mKey];
                const drvCount = (driversMap[mKey] || []).filter((s) => s.trim()).length;
                const hasData = d.dist > 0 || d.fuel > 0 || d.cost > 0 || d.jobs > 0;
                const isSelected = activeMonth === mKey;

                return (
                  <button
                    key={mKey}
                    type="button"
                    onClick={() => setActiveMonth(mKey)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                        : hasData
                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-blue-400'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-400 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? '#ffffff' : cfg.color }}
                      />
                      <span className="text-xs font-bold">{cfg.shortYearLabel}</span>
                    </div>
                    <span
                      className={`text-[9px] font-medium ${
                        isSelected
                          ? 'text-blue-200'
                          : hasData
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {hasData ? `${d.cost.toLocaleString()}บ.` : drvCount > 0 ? `คนขับ ${drvCount}` : 'ว่าง'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Month Editor Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl border-2 border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: activeCfg.color }}
                  />
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    {activeCfg.label} — {activeCfg.thaiName}
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  {activeData.dist > 0 || activeData.cost > 0 || activeData.jobs > 0
                    ? 'มีข้อมูลแล้ว (แก้ไขได้ทันที)'
                    : 'เดือนว่าง (พร้อมกรอกข้อมูล)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    ระยะทาง (กม.)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={activeData.dist || ''}
                    placeholder="0"
                    onChange={(e) => handleFieldChange(activeMonth, 'dist', Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    น้ำมัน (ลิตร)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={activeData.fuel || ''}
                    placeholder="0"
                    onChange={(e) => handleFieldChange(activeMonth, 'fuel', Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-red-600 dark:text-red-400 block mb-1">
                    ค่าน้ำมัน (บาท)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={activeData.cost || ''}
                    placeholder="0"
                    onChange={(e) => handleFieldChange(activeMonth, 'cost', Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold text-red-600 dark:text-red-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    จำนวนงาน (Jobs)
                  </label>
                  <input
                    type="number"
                    value={activeData.jobs || ''}
                    placeholder="0"
                    onChange={(e) => handleFieldChange(activeMonth, 'jobs', Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border-2 border-blue-400 dark:border-blue-500 bg-white dark:bg-slate-900 font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>

              {/* Drivers for Active Month */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>คนขับประจำเดือน {activeCfg.shortYearLabel} (สูงสุด 3 คน):</span>
                  </span>
                  {activeMonthIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => handleCopyDriversFromPrev(activeMonth)}
                      className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-blue-600 flex items-center gap-1 font-medium"
                    >
                      <Copy className="w-3 h-3 text-blue-500" />
                      <span>คัดลอกคนขับจาก {MONTH_CONFIG[ALL_MONTH_KEYS[activeMonthIndex - 1]].shortYearLabel}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[0, 1, 2].map((slotIdx) => (
                    <div key={slotIdx}>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                        {slotIdx === 0 ? '1. คนขับหลัก' : ` ${slotIdx + 1}. คนขับเสริม ${slotIdx}`}
                      </label>
                      <input
                        type="text"
                        value={activeDrivers[slotIdx] || ''}
                        placeholder={
                          slotIdx === 0
                            ? 'เช่น นายสมชาย'
                            : slotIdx === 1
                            ? 'เช่น นายสมศักดิ์'
                            : 'เช่น นายวิชัย'
                        }
                        onChange={(e) => handleDriverChange(activeMonth, slotIdx, e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-2.5">
              <div className="font-bold text-blue-800 dark:text-blue-300 flex flex-wrap items-center justify-between gap-2">
                <span>⚡ สรุปผลคำนวณสดสะสมทั้ง 19 เดือน (Live Calculated Preview):</span>
                {liveEff >= 13 ? (
                  <span className="text-emerald-600 font-bold">เกณฑ์ดีมาก</span>
                ) : liveEff >= 11 ? (
                  <span className="text-amber-600 font-bold">เกณฑ์ดี</span>
                ) : liveEff >= 9 ? (
                  <span className="text-orange-500 font-bold">เกณฑ์พอใช้</span>
                ) : (
                  <span className="text-red-600 font-bold">เกณฑ์วิกฤต (ปรับปรุง)</span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-[11px] text-slate-500">รวมระยะทาง (ทั้งหมด):</span>
                  <p className="font-bold">{grandStats.dist.toLocaleString()} กม.</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">รวมค่าน้ำมัน (ทั้งหมด):</span>
                  <p className="font-bold text-red-600 dark:text-red-400">{grandStats.cost.toLocaleString()} บ.</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">เฉลี่ย กม./ลิตร:</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {liveEff > 0 ? liveEff.toFixed(2) : '-'} กม./ลิตร
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">เฉลี่ย บ./งาน:</span>
                  <p className="font-bold text-orange-600 dark:text-orange-400">
                    {liveCjob > 0 ? liveCjob.toFixed(2) : '-'} บ./งาน
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-blue-200/70 dark:border-blue-800/70 flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>
                  เฉพาะปี {selectedYear}: ระยะทาง <b>{yearStats.dist.toLocaleString()}</b> กม. • ค่าน้ำมัน{' '}
                  <b className="text-red-600 dark:text-red-400">{yearStats.cost.toLocaleString()}</b> บ. • งาน{' '}
                  <b className="text-blue-600 dark:text-blue-400">{yearStats.jobs.toLocaleString()}</b> งาน
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation & Reason */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                ข้อเสนอแนะเชิงลึก
              </label>
              <textarea
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                เหตุผลการแก้ไข (Audit Trail Reason)
              </label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="เช่น บันทึกจำนวนงานที่รอรายงานย้อนหลัง"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลเรียลไทม์'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditCarModal: React.FC<EditCarModalProps> = ({
  vehicle,
  onClose,
  onSave
}) => {
  if (!vehicle) return null;
  return <EditCarModalInner key={vehicle.id} vehicle={vehicle} onClose={onClose} onSave={onSave} />;
};
