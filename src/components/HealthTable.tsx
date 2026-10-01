import React, { useState, useMemo } from 'react';
import {
  Car,
  MousePointerClick,
  Edit3,
  Flame,
  Paintbrush,
  Check,
  Search,
  Filter,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { Vehicle } from '../types';
import { numFormat } from '../utils/calculations';
import { exportFleetToCsv } from '../utils/exportCsv';

interface HealthTableProps {
  vehicles: Vehicle[];
  onSelectCar: (vehicle: Vehicle) => void;
  onEditCar: (vehicle: Vehicle) => void;
}

export const HealthTable: React.FC<HealthTableProps> = ({
  vehicles,
  onSelectCar,
  onEditCar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((car) => {
      const matchSearch =
        car.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.recommendation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPlan = planFilter === 'all' || car.plan === planFilter;

      return matchSearch && matchPlan;
    });
  }, [vehicles, searchTerm, planFilter]);

  const getHealthBadge = (v: Vehicle) => {
    if (v.healthStatus === 'na' || v.healthScore === 0) {
      return (
        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold shadow-xs">
          ➖ N/A
        </span>
      );
    }
    if (v.healthScore >= 90) {
      return (
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded text-xs font-bold shadow-xs">
          🏆 {v.healthScore}/100
        </span>
      );
    }
    if (v.healthScore >= 70) {
      return (
        <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 rounded text-xs font-bold shadow-xs">
          🏅 {v.healthScore}/100
        </span>
      );
    }
    if (v.healthScore >= 60) {
      return (
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 rounded text-xs font-bold shadow-xs">
          ⭐ {v.healthScore}/100
        </span>
      );
    }
    if (v.healthScore >= 40) {
      return (
        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 rounded text-xs font-bold shadow-xs">
          ⚠️ {v.healthScore}/100
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 rounded text-xs font-bold shadow-xs">
        💀 {v.healthScore}/100
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'urgent_sell':
        return (
          <span className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-[11px] font-bold shadow-xs">
            <Flame className="w-3 h-3" /> ขายด่วน P1
          </span>
        );
      case 'sell':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 px-2 py-1 rounded text-[11px] font-bold shadow-xs border border-orange-200 dark:border-orange-800">
            ทยอยขาย P2
          </span>
        );
      case 'rebrand':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-2 py-1 rounded text-[11px] font-bold shadow-xs">
            <Paintbrush className="w-3 h-3" /> รอ Re-brand
          </span>
        );
      case 'keep':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 px-2 py-1 rounded text-[11px] font-bold shadow-xs border border-blue-200 dark:border-blue-800">
            <Check className="w-3 h-3" /> เก็บไว้ใช้
          </span>
        );
    }
  };

  return (
    <div
      id="healthSection"
      className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden relative z-10 transition-colors"
    >
      {/* Table Header Bar */}
      <div className="p-3.5 bg-slate-800 dark:bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Car className="w-4 h-4 text-orange-400" />
          <span>ตารางที่ 1: การประเมินสภาพและคะแนนสุขภาพรถ (Health Score)</span>
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => exportFleetToCsv(vehicles)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="ส่งออกรายงานทั้งหมดเป็นไฟล์ Excel (CSV)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ส่งออก Excel</span>
          </button>
          <p className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full text-white animate-pulse hidden md:flex items-center gap-1">
            <MousePointerClick className="w-3 h-3 text-orange-300" /> คลิกที่ทะเบียนเพื่อดู / แก้ไข
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาทะเบียน, สาขา หรือคำสำคัญ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Plan Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> แผน:
          </span>
          {[
            { id: 'all', label: `ทั้งหมด (${vehicles.length})` },
            { id: 'urgent_sell', label: `ขายด่วน P1 (${vehicles.filter(v => v.plan === 'urgent_sell').length})` },
            { id: 'sell', label: `ทยอยขาย P2 (${vehicles.filter(v => v.plan === 'sell').length})` },
            { id: 'rebrand', label: `Re-brand (${vehicles.filter(v => v.plan === 'rebrand').length})` },
            { id: 'keep', label: `เก็บไว้ใช้ (${vehicles.filter(v => v.plan === 'keep').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPlanFilter(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium ${
                planFilter === tab.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Loss Executive Note */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/60 px-4 py-2 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          <b>สรุปต้นทุนแฝง (Opportunity Loss):</b> หากชะลอการตัดจำหน่ายกลุ่มขายด่วน (P1) ออกไปอีก 6 เดือน บริษัทจะสูญเสียเงินประมาณ <b>275,000 บาท</b> จากค่าน้ำมันส่วนเกินและค่าบำรุงรักษา
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="fleetTable">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-3 font-semibold text-center min-w-[50px]">ลำดับ</th>
              <th className="px-3 py-3 font-semibold min-w-[110px]">
                ทะเบียน <span className="text-[10px] text-orange-500">👆</span>
              </th>
              <th className="px-3 py-3 font-semibold text-center">อายุ(ปี)</th>
              <th className="px-3 py-3 font-semibold text-center min-w-[110px]">ไมล์(กม.)</th>
              <th className="px-3 py-3 font-semibold min-w-[120px]">สังกัด/สาขา</th>
              <th className="px-3 py-3 font-semibold text-center min-w-[110px]">Health Score</th>
              <th className="px-3 py-3 font-semibold min-w-[240px]">ข้อเสนอแนะเชิงลึก</th>
              <th className="px-3 py-3 font-semibold text-right min-w-[110px]">ราคาประเมิน(บ.)</th>
              <th className="px-3 py-3 font-semibold text-center min-w-[120px]">แผนจัดการ</th>
              <th className="px-3 py-3 font-semibold text-center min-w-[70px]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                  ไม่พบข้อมูลรถที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            ) : (
              filteredVehicles.map((car) => {
                const isUrgent = car.plan === 'urgent_sell';
                return (
                  <tr
                    key={car.id || car.order}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors ${
                      isUrgent ? 'bg-red-50/30 dark:bg-red-950/15' : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-slate-400 text-center font-bold">
                      {car.order}
                    </td>
                    <td
                      onClick={() => onSelectCar(car)}
                      className="px-3 py-3 font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline flex items-center gap-1.5"
                    >
                      <span>{car.plate}</span>
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-bold ${
                        car.age >= 10 ? 'text-red-600 dark:text-red-400' : car.age >= 8 ? 'text-orange-500' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {car.age}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-bold ${
                        car.mileage >= 250000
                          ? 'text-red-600 dark:text-red-400'
                          : car.mileage >= 200000
                          ? 'text-orange-500'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {numFormat(car.mileage, 0, 0)}
                    </td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400 text-xs">
                      {car.branch}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {getHealthBadge(car)}
                    </td>
                    <td
                      className={`px-3 py-3 text-xs ${
                        isUrgent
                          ? 'text-red-600 dark:text-red-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {car.recommendation}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold">
                      {car.estimatedPrice > 0 ? `~${numFormat(car.estimatedPrice, 0, 0)}` : '-'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {getPlanBadge(car.plan)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => onEditCar(car)}
                        title="แก้ไขข้อมูล (Edit Data)"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
