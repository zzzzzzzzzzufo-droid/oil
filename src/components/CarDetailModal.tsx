import React from 'react';
import {
  X,
  Car,
  AlertTriangle,
  Info,
  Edit,
  TrendingUp,
  Fuel,
  Briefcase
} from 'lucide-react';
import { Vehicle } from '../types';
import { numFormat, calculateVehicleTotals } from '../utils/calculations';

interface CarDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onOpenEdit: (vehicle: Vehicle) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  vehicle,
  onClose,
  onOpenEdit
}) => {
  if (!vehicle) return null;

  const totals = calculateVehicleTotals(vehicle);

  // Health Score formatting
  let scoreBadge = 'N/A';
  let scoreColor = 'text-slate-400';
  if (vehicle.healthScore >= 90) {
    scoreBadge = `🏆 ${vehicle.healthScore}/100`;
    scoreColor = 'text-emerald-500';
  } else if (vehicle.healthScore >= 70) {
    scoreBadge = `🏅 ${vehicle.healthScore}/100`;
    scoreColor = 'text-emerald-600';
  } else if (vehicle.healthScore >= 50) {
    scoreBadge = `⚠️ ${vehicle.healthScore}/100`;
    scoreColor = 'text-orange-500';
  } else if (vehicle.healthScore > 0) {
    scoreBadge = `💀 ${vehicle.healthScore}/100`;
    scoreColor = 'text-red-600';
  }

  // Predicted September Fuel
  const m8Cost = vehicle.m8.cost || 0;
  const m7Cost = vehicle.m7.cost || 0;
  let predict = m8Cost;
  if (m8Cost > 0 && m7Cost > 0) {
    predict = Math.round(m8Cost + (m8Cost - m7Cost) * 0.5);
  }

  const maxCost = Math.max(vehicle.m6.cost, vehicle.m7.cost, vehicle.m8.cost, 1);
  const maxJobs = Math.max(vehicle.m6.jobs, vehicle.m7.jobs, vehicle.m8.jobs, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                  ทะเบียน {vehicle.plate}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {vehicle.branch}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                อายุ {vehicle.age} ปี • เลขไมล์สะสม {numFormat(vehicle.mileage, 0, 0)} กม.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs font-bold text-slate-400 mb-1">Health Score</p>
              <h4 className={`text-xl font-extrabold ${scoreColor}`}>
                {scoreBadge}
              </h4>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs font-bold text-slate-400 mb-1">พยากรณ์ ก.ย.</p>
              <h4 className="text-xl font-extrabold text-red-500">
                ~{numFormat(predict, 0, 0)} บ.
              </h4>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs font-bold text-slate-400 mb-1">วงเงินต่อเดือน</p>
              <h4 className="text-xl font-extrabold text-slate-800 dark:text-white">
                {vehicle.limit > 0 ? `${numFormat(vehicle.limit, 0, 0)} บ.` : 'ไม่มีวงเงิน'}
              </h4>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs font-bold text-slate-400 mb-1">ราคาประเมิน</p>
              <h4 className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {vehicle.estimatedPrice > 0 ? `~${numFormat(vehicle.estimatedPrice, 0, 0)} บ.` : '-'}
              </h4>
            </div>
          </div>

          {/* Monthly Trend Bars */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span>เทรนด์ค่าน้ำมันและจำนวนงาน (มิ.ย. - ส.ค. 69)</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'เดือน 6 (มิ.ย.)', data: vehicle.m6 },
                { label: 'เดือน 7 (ก.ค.)', data: vehicle.m7 },
                { label: 'เดือน 8 (ส.ค.)', data: vehicle.m8 }
              ].map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 border-b pb-1 dark:border-slate-700">
                    {m.label}
                  </p>
                  <div className="space-y-1.5 my-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-red-500" /> ค่าน้ำมัน:
                      </span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {numFormat(m.data.cost)} บ.
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-blue-500" /> งาน:
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {m.data.jobs} งาน
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>ระยะทาง:</span>
                      <span>{numFormat(m.data.dist, 0, 0)} กม.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation & Notes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ข้อเสนอแนะเชิงลึกและการวิเคราะห์
            </h4>
            <div className="p-3.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-xl text-xs text-orange-900 dark:text-orange-200 leading-relaxed font-medium">
              💡 {vehicle.recommendation}
            </div>
            {vehicle.notes && (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                บันทึกเพิ่มเติม: {vehicle.notes}
              </div>
            )}
          </div>

          {/* Alert Notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              *หมายเหตุ: หากข้อมูลจำนวนงานในระบบยังไม่ได้รับการบันทึกครบถ้วน (เช่น เดือน 8 ไม่มีบันทึกงาน) ท่านสามารถกดปุ่ม <b>"แก้ไขข้อมูล"</b> ด้านล่างเพื่ออัปเดตข้อมูลย้อนหลังได้ทันที ข้อมูลจะซิงค์กับฐานข้อมูล Firebase แบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              onOpenEdit(vehicle);
            }}
            className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-xs flex items-center gap-2"
          >
            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>แก้ไขข้อมูล (Edit Data)</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
