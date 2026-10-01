import React, { useState } from 'react';
import {
  X,
  Save,
  Car,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Fuel,
  Briefcase,
  Route,
  Banknote
} from 'lucide-react';
import { Vehicle, VehiclePlan } from '../types';

interface EditCarModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (id: string, updated: Partial<Vehicle>, reason: string) => Promise<void>;
}

export const EditCarModal: React.FC<EditCarModalProps> = ({
  vehicle,
  onClose,
  onSave
}) => {
  if (!vehicle) return null;

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

  // Monthly values
  const [m6Dist, setM6Dist] = useState(vehicle.m6.dist);
  const [m6Fuel, setM6Fuel] = useState(vehicle.m6.fuel);
  const [m6Cost, setM6Cost] = useState(vehicle.m6.cost);
  const [m6Jobs, setM6Jobs] = useState(vehicle.m6.jobs);

  const [m7Dist, setM7Dist] = useState(vehicle.m7.dist);
  const [m7Fuel, setM7Fuel] = useState(vehicle.m7.fuel);
  const [m7Cost, setM7Cost] = useState(vehicle.m7.cost);
  const [m7Jobs, setM7Jobs] = useState(vehicle.m7.jobs);

  const [m8Dist, setM8Dist] = useState(vehicle.m8.dist);
  const [m8Fuel, setM8Fuel] = useState(vehicle.m8.fuel);
  const [m8Cost, setM8Cost] = useState(vehicle.m8.cost);
  const [m8Jobs, setM8Jobs] = useState(vehicle.m8.jobs);

  const [editReason, setEditReason] = useState('บันทึกข้อมูลย้อนหลัง / ปรับปรุงข้อมูลจริง');
  const [saving, setSaving] = useState(false);

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
        notes,
        m6: {
          dist: Number(m6Dist),
          fuel: Number(m6Fuel),
          cost: Number(m6Cost),
          jobs: Number(m6Jobs)
        },
        m7: {
          dist: Number(m7Dist),
          fuel: Number(m7Fuel),
          cost: Number(m7Cost),
          jobs: Number(m7Jobs)
        },
        m8: {
          dist: Number(m8Dist),
          fuel: Number(m8Fuel),
          cost: Number(m8Cost),
          jobs: Number(m8Jobs)
        }
      };

      await onSave(vehicle.id, updated, editReason);
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

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
                การแก้ไขจะอัปเดตแบบเรียลไทม์ไปยังทุกอุปกรณ์และซิงค์คลาวด์อัตโนมัติ
              </p>
            </div>
          </div>
          <button
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

          {/* Monthly Operational Data (M6, M7, M8) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ข้อมูลการปฏิบัติงานรายเดือน (มิ.ย. - ส.ค. 69)
            </h4>

            {/* M6 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block mb-2">
                เดือน 6 (มิ.ย. 69)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500">ระยะทาง (กม.)</label>
                  <input
                    type="number"
                    step="any"
                    value={m6Dist}
                    onChange={(e) => setM6Dist(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">น้ำมัน (ลิตร)</label>
                  <input
                    type="number"
                    step="any"
                    value={m6Fuel}
                    onChange={(e) => setM6Fuel(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">ค่าน้ำมัน (บาท)</label>
                  <input
                    type="number"
                    step="any"
                    value={m6Cost}
                    onChange={(e) => setM6Cost(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">จำนวนงาน (Jobs)</label>
                  <input
                    type="number"
                    value={m6Jobs}
                    onChange={(e) => setM6Jobs(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* M7 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 block mb-2">
                เดือน 7 (ก.ค. 69)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500">ระยะทาง (กม.)</label>
                  <input
                    type="number"
                    step="any"
                    value={m7Dist}
                    onChange={(e) => setM7Dist(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">น้ำมัน (ลิตร)</label>
                  <input
                    type="number"
                    step="any"
                    value={m7Fuel}
                    onChange={(e) => setM7Fuel(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">ค่าน้ำมัน (บาท)</label>
                  <input
                    type="number"
                    step="any"
                    value={m7Cost}
                    onChange={(e) => setM7Cost(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">จำนวนงาน (Jobs)</label>
                  <input
                    type="number"
                    value={m7Jobs}
                    onChange={(e) => setM7Jobs(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold text-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* M8 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400 block mb-2">
                เดือน 8 (ส.ค. 69) - อัปเดตงานย้อนหลัง
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500">ระยะทาง (กม.)</label>
                  <input
                    type="number"
                    step="any"
                    value={m8Dist}
                    onChange={(e) => setM8Dist(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">น้ำมัน (ลิตร)</label>
                  <input
                    type="number"
                    step="any"
                    value={m8Fuel}
                    onChange={(e) => setM8Fuel(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">ค่าน้ำมัน (บาท)</label>
                  <input
                    type="number"
                    step="any"
                    value={m8Cost}
                    onChange={(e) => setM8Cost(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-bold text-orange-600 dark:text-orange-400">
                    จำนวนงาน (Jobs) *
                  </label>
                  <input
                    type="number"
                    value={m8Jobs}
                    onChange={(e) => setM8Jobs(Number(e.target.value))}
                    placeholder="เช่น 45"
                    className="w-full text-xs p-1.5 rounded border-2 border-orange-400 dark:border-orange-500 bg-white dark:bg-slate-800 font-bold text-orange-600"
                  />
                </div>
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
