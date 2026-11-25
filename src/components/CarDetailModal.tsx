import React, { useState } from 'react';
import {
  X,
  Car,
  Info,
  Edit,
  TrendingUp,
  Fuel,
  Briefcase,
  Sparkles,
  Users,
  UserCheck
} from 'lucide-react';
import { Vehicle, MonthKey, MONTHS_2569, MONTHS_2570, ALL_MONTH_KEYS, MONTH_CONFIG } from '../types';
import { numFormat, getVehicleMonthData } from '../utils/calculations';

interface CarDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onOpenEdit: (vehicle: Vehicle) => void;
  onCheckMarketPrice?: (vehicle: Vehicle) => void;
  onOpenDriverRoster?: (vehicle: Vehicle, month?: MonthKey) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  vehicle,
  onClose,
  onOpenEdit,
  onCheckMarketPrice,
  onOpenDriverRoster
}) => {
  const [selectedYear, setSelectedYear] = useState<2569 | 2570>(2569);

  if (!vehicle) return null;

  const yearMonths: MonthKey[] = selectedYear === 2569 ? MONTHS_2569 : MONTHS_2570;

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

  // Predicted Next Active Month Fuel based on latest populated months
  const populatedCostMonths = ALL_MONTH_KEYS.map((k) => ({
    key: k,
    cost: getVehicleMonthData(vehicle, k).cost
  })).filter((item) => item.cost > 0);

  let predict = getVehicleMonthData(vehicle, 'm8').cost;
  if (populatedCostMonths.length >= 2) {
    const last = populatedCostMonths[populatedCostMonths.length - 1].cost;
    const prev = populatedCostMonths[populatedCostMonths.length - 2].cost;
    predict = Math.max(0, Math.round(last + (last - prev) * 0.5));
  } else if (populatedCostMonths.length === 1) {
    predict = populatedCostMonths[0].cost;
  }

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
              <p className="text-xs font-bold text-slate-400 mb-1">พยากรณ์เดือนถัดไป</p>
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
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span>
                  กราฟแนวโน้มค่าน้ำมันและงาน ปี {selectedYear} ({selectedYear === 2569 ? 'มิ.ย. - ธ.ค. 69' : 'ม.ค. - ธ.ค. 70'})
                </span>
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex bg-slate-200/80 dark:bg-slate-700/80 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedYear(2569)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      selectedYear === 2569
                        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ปี 2569 (7 ด.)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedYear(2570)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      selectedYear === 2570
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ปี 2570 (12 ด.)
                  </button>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> ค่าน้ำมัน
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> งาน
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Trend Chart across selected year */}
            <div className="h-32 w-full mb-3 bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700 flex flex-col justify-end relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
                {/* Grid horizontal lines */}
                <line x1="0" y1="15" x2="300" y2="15" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1="0" y1="45" x2="300" y2="45" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="3 3" />

                {(() => {
                  const count = yearMonths.length;
                  const step = 300 / count;
                  const xCoords = yearMonths.map((_, i) => step * i + step / 2);

                  const mData = yearMonths.map((mKey) => getVehicleMonthData(vehicle, mKey).cost);
                  const cMax = Math.max(...mData, 1);
                  const costPoints = mData.map((val, i) => `${xCoords[i]},${60 - (val / cMax) * 45}`).join(' ');

                  const jData = yearMonths.map((mKey) => getVehicleMonthData(vehicle, mKey).jobs);
                  const jMax = Math.max(...jData, 1);
                  const jobPoints = jData.map((val, i) => `${xCoords[i]},${60 - (val / jMax) * 45}`).join(' ');

                  return (
                    <>
                      {/* Cost Path (Red) */}
                      <polyline
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={costPoints}
                      />
                      {mData.map((val, i) => (
                        <circle
                          key={`c-${yearMonths[i]}`}
                          cx={xCoords[i]}
                          cy={60 - (val / cMax) * 45}
                          r={val > 0 ? 3.5 : 2}
                          fill={val > 0 ? '#ef4444' : '#94a3b8'}
                        />
                      ))}

                      {/* Jobs Path (Blue) */}
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={jobPoints}
                      />
                      {jData.map((val, i) => (
                        <circle
                          key={`j-${yearMonths[i]}`}
                          cx={xCoords[i]}
                          cy={60 - (val / jMax) * 45}
                          r={val > 0 ? 3.5 : 2}
                          fill={val > 0 ? '#2563eb' : '#94a3b8'}
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
              <div
                className="grid text-center text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold"
                style={{ gridTemplateColumns: `repeat(${yearMonths.length}, minmax(0, 1fr))` }}
              >
                {yearMonths.map((mKey) => {
                  const cfg = MONTH_CONFIG[mKey];
                  const isBaseline = mKey === 'm6' || mKey === 'm7' || mKey === 'm8';
                  return (
                    <span
                      key={mKey}
                      style={!isBaseline ? { color: cfg.color } : undefined}
                    >
                      {cfg.shortLabel}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {yearMonths.map((mKey) => {
                const cfg = MONTH_CONFIG[mKey];
                const data = getVehicleMonthData(vehicle, mKey);
                const isNew = !['m6', 'm7', 'm8'].includes(mKey);
                const isEmpty = !data.cost && !data.dist && !data.jobs;
                const activeDrivers = (data.drivers || []).filter(Boolean);

                return (
                  <div
                    key={mKey}
                    className={`p-3 rounded-lg border flex flex-col justify-between ${
                      isNew && isEmpty
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-1 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <span>{cfg.label}</span>
                      </p>
                      {isNew && isEmpty && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          รอคีย์ข้อมูล
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 my-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-red-500" /> ค่าน้ำมัน:
                        </span>
                        <span className={`font-bold ${isEmpty ? 'text-slate-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isEmpty ? '-' : `${numFormat(data.cost)} บ.`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-blue-500" /> งาน:
                        </span>
                        <span className={`font-bold ${isEmpty ? 'text-slate-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {isEmpty ? '-' : `${data.jobs} งาน`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>ระยะทาง:</span>
                        <span>{isEmpty ? '-' : `${numFormat(data.dist, 0, 0)} กม.`}</span>
                      </div>

                      {/* Driver Summary in Card */}
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-500" /> คนขับ:
                        </span>
                        {activeDrivers.length > 0 ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDriverRoster?.(vehicle, mKey);
                            }}
                            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer truncate max-w-[110px]"
                            title={activeDrivers.join(', ')}
                          >
                            {activeDrivers[0]}
                            {activeDrivers.length > 1 && ` (+${activeDrivers.length - 1})`}
                          </span>
                        ) : (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDriverRoster?.(vehicle, mKey);
                            }}
                            className="text-slate-400 hover:text-blue-500 cursor-pointer italic"
                          >
                            + ระบุคนขับ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Driver Roster Section (Max 3 drivers/month) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  ทำเนียบคนขับประจำเดือน ปี {selectedYear} (สูงสุด 3 คน/คัน)
                </h4>
              </div>
              {onOpenDriverRoster && (
                <button
                  type="button"
                  onClick={() => onOpenDriverRoster(vehicle, yearMonths[0])}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>จัดการ / แก้ไขคนขับ (Manage Drivers)</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              รายชื่อผู้ขับขี่ถูกบันทึกแยกตามแต่ละเดือนทั้งปี 2569 และ 2570 อย่างเป็นระเบียบ (ซ่อนไว้ไม่รบกวนตารางหลัก)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {yearMonths.map((mKey) => {
                const cfg = MONTH_CONFIG[mKey];
                const dData = getVehicleMonthData(vehicle, mKey).drivers || [];
                const activeDrivers = dData.filter((d) => d && d.trim().length > 0);

                return (
                  <div
                    key={mKey}
                    onClick={() => onOpenDriverRoster && onOpenDriverRoster(vehicle, mKey)}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer transition-all hover:shadow-xs group"
                  >
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                        {cfg.label}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          activeDrivers.length > 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                        }`}
                      >
                        {activeDrivers.length > 0 ? `${activeDrivers.length}/3 คน` : 'ยังไม่ระบุ'}
                      </span>
                    </div>

                    {activeDrivers.length > 0 ? (
                      <div className="space-y-1">
                        {activeDrivers.map((name, sIdx) => (
                          <div key={sIdx} className="text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                              {sIdx + 1}
                            </span>
                            <span className="truncate font-medium">{name}</span>
                            {sIdx === 0 && (
                              <span className="text-[9px] px-1 bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 rounded font-semibold">
                                หลัก
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        + คลิกเพื่อระบุคนขับประจำเดือนนี้
                      </p>
                    )}
                  </div>
                );
              })}
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
              *หมายเหตุ: ท่านสามารถสลับดูข้อมูลปี 2569 (มิ.ย.-ธ.ค.) และปี 2570 (ม.ค.-ธ.ค.) หรือกดปุ่ม <b>"แก้ไขข้อมูลรถ"</b> ด้านล่างเพื่อบันทึกข้อมูลเดือนใหม่และอัปเดตย้อนหลังได้ทันที ข้อมูลจะซิงค์กับฐานข้อมูล Firebase แบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEdit(vehicle);
              }}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-xs flex items-center gap-2"
            >
              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>แก้ไขข้อมูลรถ (Edit Data)</span>
            </button>

            {onOpenDriverRoster && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDriverRoster(vehicle);
                }}
                className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-xs flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>จัดการคนขับ (Driver Roster)</span>
              </button>
            )}
          </div>

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
