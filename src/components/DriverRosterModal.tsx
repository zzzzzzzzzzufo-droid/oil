import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserCheck,
  UserPlus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  Calendar,
  Car,
  Sparkles,
  Info
} from 'lucide-react';
import { Vehicle, MonthKey, MONTH_CONFIG } from '../types';

interface DriverRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  initialVehicle: Vehicle | null;
  initialMonth?: MonthKey;
  onSaveVehicle: (id: string, updated: Partial<Vehicle>, reason: string) => Promise<void>;
}

export const DriverRosterModal: React.FC<DriverRosterModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  initialVehicle,
  initialMonth = 'm8',
  onSaveVehicle
}) => {
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [activeMonth, setActiveMonth] = useState<MonthKey>(initialMonth);
  const [viewMode, setViewMode] = useState<'focused' | 'all'>('focused');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state holding driver arrays for all 6 months of current vehicle
  const [monthlyDrivers, setMonthlyDrivers] = useState<Record<MonthKey, string[]>>({
    m6: ['', '', ''],
    m7: ['', '', ''],
    m8: ['', '', ''],
    m9: ['', '', ''],
    m10: ['', '', ''],
    m11: ['', '', '']
  });

  // Sync index when initialVehicle changes
  useEffect(() => {
    if (initialVehicle && vehicles.length > 0) {
      const idx = vehicles.findIndex((v) => v.id === initialVehicle.id);
      if (idx !== -1) {
        setCurrentCarIndex(idx);
      }
    }
  }, [initialVehicle, vehicles]);

  // Sync driver state when selected car changes
  const currentVehicle = vehicles[currentCarIndex] || vehicles[0];

  useEffect(() => {
    if (currentVehicle) {
      const getDrivers = (key: MonthKey): string[] => {
        const raw = currentVehicle[key]?.drivers || [];
        return [raw[0] || '', raw[1] || '', raw[2] || ''];
      };

      setMonthlyDrivers({
        m6: getDrivers('m6'),
        m7: getDrivers('m7'),
        m8: getDrivers('m8'),
        m9: getDrivers('m9'),
        m10: getDrivers('m10'),
        m11: getDrivers('m11')
      });
      setSaveSuccess(false);
    }
  }, [currentVehicle]);

  if (!isOpen || !currentVehicle) return null;

  const months: MonthKey[] = ['m6', 'm7', 'm8', 'm9', 'm10', 'm11'];

  const handleDriverChange = (month: MonthKey, slotIdx: number, value: string) => {
    setMonthlyDrivers((prev) => {
      const updatedList = [...prev[month]];
      updatedList[slotIdx] = value;
      return {
        ...prev,
        [month]: updatedList
      };
    });
    setSaveSuccess(false);
  };

  const handleClearSlot = (month: MonthKey, slotIdx: number) => {
    handleDriverChange(month, slotIdx, '');
  };

  // Copy drivers from another month
  const handleCopyFromMonth = (targetMonth: MonthKey, sourceMonth: MonthKey) => {
    const sourceDrivers = [...monthlyDrivers[sourceMonth]];
    setMonthlyDrivers((prev) => ({
      ...prev,
      [targetMonth]: sourceDrivers
    }));
    setSaveSuccess(false);
  };

  // Apply current month drivers to all future months
  const handleApplyToRemainingMonths = (sourceMonth: MonthKey) => {
    const sourceIndex = months.indexOf(sourceMonth);
    const driversToCopy = [...monthlyDrivers[sourceMonth]];

    setMonthlyDrivers((prev) => {
      const next = { ...prev };
      for (let i = sourceIndex + 1; i < months.length; i++) {
        next[months[i]] = [...driversToCopy];
      }
      return next;
    });
    setSaveSuccess(false);
  };

  // Save changes to Firestore
  const handleSave = async () => {
    if (!currentVehicle) return;
    setSaving(true);
    try {
      // Clean up trailing empty strings for storage cleanliness
      const cleanDrivers = (arr: string[]) => {
        return arr.map((s) => s.trim()).filter(Boolean);
      };

      const payload: Partial<Vehicle> = {
        m6: { ...currentVehicle.m6, drivers: cleanDrivers(monthlyDrivers.m6) },
        m7: { ...currentVehicle.m7, drivers: cleanDrivers(monthlyDrivers.m7) },
        m8: { ...currentVehicle.m8, drivers: cleanDrivers(monthlyDrivers.m8) },
        m9: { ...(currentVehicle.m9 || { dist: 0, fuel: 0, cost: 0, jobs: 0 }), drivers: cleanDrivers(monthlyDrivers.m9) },
        m10: { ...(currentVehicle.m10 || { dist: 0, fuel: 0, cost: 0, jobs: 0 }), drivers: cleanDrivers(monthlyDrivers.m10) },
        m11: { ...(currentVehicle.m11 || { dist: 0, fuel: 0, cost: 0, jobs: 0 }), drivers: cleanDrivers(monthlyDrivers.m11) }
      };

      await onSaveVehicle(
        currentVehicle.id,
        payload,
        `อัปเดตรายชื่อคนขับรถประจำเดือน (สูงสุด 3 คน/คัน) คัน ${currentVehicle.plate}`
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save drivers failed:', err);
    } finally {
      setSaving(false);
    }
  };

  // Navigation helpers
  const handlePrevCar = () => {
    setCurrentCarIndex((prev) => (prev > 0 ? prev - 1 : vehicles.length - 1));
  };

  const handleNextCar = () => {
    setCurrentCarIndex((prev) => (prev < vehicles.length - 1 ? prev + 1 : 0));
  };

  const slotLabels = [
    { label: 'คนขับหลัก (Primary Driver)', role: 'ผู้รับผิดชอบหลัก', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    { label: 'คนขับเสริม 1 (Co-Driver / กะเช้า-บ่าย)', role: 'ผู้ช่วย/สลับกะ', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
    { label: 'คนขับเสริม 2 (Co-Driver / กะดึก-สำรอง)', role: 'คนขับสแตนด์บาย', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-4xl relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">
                  ทำเนียบคนขับรถประจำเดือน (Monthly Driver Roster)
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  สูงสุด 3 คน/คัน
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                บันทึกและสลับเปลี่ยนผู้ขับขี่แต่ละเดือน ข้อมูลถูกซ่อนจากตารางหลักและเปิดดูเฉพาะเมื่อต้องการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* View Mode Toggle */}
            <div className="bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg flex text-xs font-semibold">
              <button
                onClick={() => setViewMode('focused')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'focused'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                โฟกัสรายเดือน
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                ภาพรวม 6 เดือน
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Car Navigation Sub-Bar */}
        <div className="px-5 py-3 bg-blue-50/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevCar}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-600 dark:text-slate-200 transition-colors"
              title="คันก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Car Selector Dropdown */}
            <select
              value={currentVehicle.id}
              onChange={(e) => {
                const idx = vehicles.findIndex((v) => v.id === e.target.value);
                if (idx !== -1) setCurrentCarIndex(idx);
              }}
              className="px-3 py-1.5 text-xs sm:text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              {vehicles.map((v, i) => (
                <option key={v.id} value={v.id}>
                  #{v.order} • ทะเบียน {v.plate} ({v.branch})
                </option>
              ))}
            </select>

            <button
              onClick={handleNextCar}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-600 dark:text-slate-200 transition-colors"
              title="คันถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentVehicle.branch}</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              คันที่ {currentCarIndex + 1} จาก {vehicles.length} คัน
            </span>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {viewMode === 'focused' ? (
            /* FOCUSED MONTH VIEW */
            <div className="space-y-5">
              {/* Month Tabs */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {months.map((mKey) => {
                  const cfg = MONTH_CONFIG[mKey];
                  const drivers = monthlyDrivers[mKey].filter(Boolean);
                  const isSelected = activeMonth === mKey;
                  const count = drivers.length;

                  return (
                    <button
                      key={mKey}
                      type="button"
                      onClick={() => setActiveMonth(mKey)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm font-bold ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span className="text-xs font-semibold">{cfg.shortLabel} 69</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          count > 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {count > 0 ? `${count}/3 คน` : 'ว่าง'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Month Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    จัดการคนขับประจำ: {MONTH_CONFIG[activeMonth].label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick copy from prev month */}
                  {months.indexOf(activeMonth) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const prevIdx = months.indexOf(activeMonth) - 1;
                        handleCopyFromMonth(activeMonth, months[prevIdx]);
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 font-medium shadow-xs"
                      title="คัดลอกรายชื่อคนขับจากเดือนก่อนหน้านี้มาใส่อัตโนมัติ"
                    >
                      <Copy className="w-3 h-3 text-blue-500" />
                      <span>คัดลอกจาก {MONTH_CONFIG[months[months.indexOf(activeMonth) - 1]].shortLabel}</span>
                    </button>
                  )}

                  {/* Apply to remaining */}
                  {months.indexOf(activeMonth) < months.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleApplyToRemainingMonths(activeMonth)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 font-medium shadow-xs"
                      title="นำรายชื่อเดือนนี้ไปใช้กับทุกเดือนถัดไปที่เหลือ"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>ใช้กับเดือนที่เหลือ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Driver Slots */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((slotIdx) => {
                  const meta = slotLabels[slotIdx];
                  const val = monthlyDrivers[activeMonth][slotIdx] || '';
                  const hasValue = val.trim().length > 0;

                  return (
                    <div
                      key={slotIdx}
                      className={`p-4 rounded-xl border transition-all ${
                        hasValue
                          ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
                          ลำดับที่ {slotIdx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {meta.role}
                        </span>
                      </div>

                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                        {meta.label}
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleDriverChange(activeMonth, slotIdx, e.target.value)}
                          placeholder={
                            slotIdx === 0
                              ? 'เช่น นายสมชาย สุขเกษม'
                              : slotIdx === 1
                              ? 'เช่น นายสมศักดิ์ ว่องไว'
                              : 'เช่น นายวิชัย ส่งเร็ว'
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                        />
                        {hasValue && (
                          <button
                            type="button"
                            onClick={() => handleClearSlot(activeMonth, slotIdx)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="ล้างข้อมูลช่องนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>สถานะ: {hasValue ? '🟢 กำหนดแล้ว' : '⚪ ว่าง (ยังไม่ระบุ)'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ALL 6 MONTHS OVERVIEW MATRIX */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">
                  ตารางสรุปรายชื่อคนขับทั้ง 6 เดือน (มิ.ย. - พ.ย. 69) ของทะเบียน {currentVehicle.plate}
                </span>
                <span>สามารถแก้ไขชื่อในแต่ละช่องได้โดยตรง</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {months.map((mKey) => {
                  const cfg = MONTH_CONFIG[mKey];
                  const drivers = monthlyDrivers[mKey];

                  return (
                    <div
                      key={mKey}
                      className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b pb-2 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                          />
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                            {cfg.label}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {drivers.filter(Boolean).length}/3 คน
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[0, 1, 2].map((slotIdx) => (
                          <div key={slotIdx} className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 w-12 shrink-0 font-medium">
                              #{slotIdx + 1} {slotIdx === 0 ? 'หลัก' : `เสริม${slotIdx}`}
                            </span>
                            <input
                              type="text"
                              value={drivers[slotIdx] || ''}
                              onChange={(e) => handleDriverChange(mKey, slotIdx, e.target.value)}
                              placeholder={`ระบุชื่อคนขับช่อง ${slotIdx + 1}...`}
                              className="flex-1 px-2.5 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Practical Guidance Note */}
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <div className="leading-relaxed">
              <p className="font-bold mb-0.5">ระบบจัดการคนขับแบบ Pro-Driver Fleet Manager:</p>
              <p>
                • รถแต่ละคันสามารถกำหนดคนขับได้สูงสุด 3 คนในแต่ละเดือน (คนขับหลัก, คนขับเสริม 1, คนขับเสริม 2)
              </p>
              <p>
                • <b>ไม่รกตารางหลัก</b>: รายชื่อคนขับจะถูกเก็บไว้อย่างเป็นระเบียบ และสามารถคลิกดูผ่านปุ่ม 👤 ในแถวหรือหน้ารายละเอียดรถได้ทุกเมื่อ
              </p>
              <p>
                • เมื่อแก้ไขเสร็จแล้ว กดปุ่ม <b>"บันทึกข้อมูลคนขับ"</b> ระบบจะซิงค์ข้อมูลกับ Firebase ทันที
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ทะเบียนที่เลือก: <b className="text-slate-800 dark:text-white">{currentVehicle.plate}</b> ({currentVehicle.branch})
            </span>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> บันทึกเรียบร้อยแล้ว
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-xs"
            >
              ปิด
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลคนขับ (Save)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
