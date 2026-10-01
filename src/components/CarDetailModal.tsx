import React from 'react';
import {
  X,
  Car,
  AlertTriangle,
  Info,
  Edit,
  TrendingUp,
  Fuel,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { Vehicle } from '../types';
import { numFormat, calculateVehicleTotals } from '../utils/calculations';

interface CarDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onOpenEdit: (vehicle: Vehicle) => void;
  onCheckMarketPrice?: (vehicle: Vehicle) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  vehicle,
  onClose,
  onOpenEdit,
  onCheckMarketPrice
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

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-center flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">ราคาประเมิน</p>
                <h4 className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {vehicle.estimatedPrice > 0 ? `~${numFormat(vehicle.estimatedPrice, 0, 0)} บ.` : '-'}
                </h4>
              </div>
              {onCheckMarketPrice && (
                <button
                  onClick={() => onCheckMarketPrice(vehicle)}
                  className="mt-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 font-semibold"
                  title="สืบค้นราคากลางรถรุ่นและปีใกล้เคียงจาก Google Search สดๆ"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>ค้นหาราคากลางสด</span>
                </button>
              )}
            </div>
          </div>

          {/* Monthly Trend Bars */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span>กราฟแนวโน้มค่าน้ำมันและงาน (มิ.ย. - ส.ค. 69)</span>
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> ค่าน้ำมัน (บ.)
                </span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> งาน (Jobs)
                </span>
              </div>
            </div>

            {/* SVG Trend Chart */}
            <div className="h-28 w-full mb-3 bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700 flex flex-col justify-end relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
                {/* Grid horizontal lines */}
                <line x1="0" y1="15" x2="300" y2="15" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="0" y1="45" x2="300" y2="45" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />

                {/* Cost Path (Red) */}
                {(() => {
                  const cMax = Math.max(vehicle.m6.cost, vehicle.m7.cost, vehicle.m8.cost, 1);
                  const y1 = 60 - (vehicle.m6.cost / cMax) * 45;
                  const y2 = 60 - (vehicle.m7.cost / cMax) * 45;
                  const y3 = 60 - (vehicle.m8.cost / cMax) * 45;
                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        points={`50,${y1} 150,${y2} 250,${y3}`}
                      />
                      <circle cx="50" cy={y1} r="4" fill="#ef4444" />
                      <circle cx="150" cy={y2} r="4" fill="#ef4444" />
                      <circle cx="250" cy={y3} r="4" fill="#ef4444" />
                    </>
                  );
                })()}

                {/* Jobs Path (Blue) */}
                {(() => {
                  const jMax = Math.max(vehicle.m6.jobs, vehicle.m7.jobs, vehicle.m8.jobs, 1);
                  const y1 = 60 - (vehicle.m6.jobs / jMax) * 45;
                  const y2 = 60 - (vehicle.m7.jobs / jMax) * 45;
                  const y3 = 60 - (vehicle.m8.jobs / jMax) * 45;
                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        points={`50,${y1} 150,${y2} 250,${y3}`}
                      />
                      <circle cx="50" cy={y1} r="3.5" fill="#2563eb" />
                      <circle cx="150" cy={y2} r="3.5" fill="#2563eb" />
                      <circle cx="250" cy={y3} r="3.5" fill="#2563eb" />
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between px-8 text-[10px] text-slate-400 mt-1">
                <span>เดือน 6 (มิ.ย.)</span>
                <span>เดือน 7 (ก.ค.)</span>
                <span>เดือน 8 (ส.ค.)</span>
              </div>
            </div>

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
