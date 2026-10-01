import React from 'react';
import { X, Printer, Building2 } from 'lucide-react';
import { Vehicle } from '../types';
import { numFormat } from '../utils/calculations';

interface DisposalMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
}

export const DisposalMemoModal: React.FC<DisposalMemoModalProps> = ({
  isOpen,
  onClose,
  vehicles
}) => {
  if (!isOpen) return null;

  // Filter urgent sell Phase 1 vehicles (default 5 vehicles)
  const urgentCars = vehicles.filter((v) => v.plan === 'urgent_sell');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      {/* Outer wrapper */}
      <div className="bg-white text-black rounded-xl w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative my-auto p-8 sm:p-12 print:p-0 print:shadow-none print:w-full print:m-0 print:rounded-none">
        {/* Floating actions (hidden when printing) */}
        <div className="no-print absolute top-4 right-4 flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> พิมพ์เอกสาร / บันทึก PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" /> ปิด
          </button>
        </div>

        {/* Memo Content */}
        <div className="text-center mb-6 pt-2">
          <h1 className="text-2xl font-bold tracking-wide mb-3">บันทึกข้อความ</h1>
          <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-2 border border-slate-200">
            <Building2 className="w-7 h-7 text-slate-500" />
          </div>
          <p className="text-xs text-slate-500 font-semibold tracking-wider">
            BUG SOLUTIONS FLEET MANAGEMENT DIVISION
          </p>
        </div>

        <table className="w-full text-xs sm:text-sm mb-6 border-none">
          <tbody>
            <tr>
              <td className="w-32 font-bold py-1 text-slate-900">ส่วนงาน/แผนก:</td>
              <td className="py-1">ฝ่ายบริหารจัดการยานพาหนะและสินทรัพย์ (Fleet Optimization Team)</td>
            </tr>
            <tr>
              <td className="font-bold py-1 text-slate-900">ที่:</td>
              <td className="py-1">FM-2026/09/001</td>
              <td className="w-16 font-bold py-1 text-right text-slate-900">วันที่:</td>
              <td className="w-36 py-1 text-right font-medium">24 กันยายน 2569</td>
            </tr>
            <tr>
              <td className="font-bold py-1 text-slate-900">เรื่อง:</td>
              <td colSpan={3} className="py-1 font-semibold text-slate-900">
                ขออนุมัติตัดจำหน่ายรถยนต์เสื่อมสภาพ (เฟส 1) จำนวน {urgentCars.length} คัน
              </td>
            </tr>
          </tbody>
        </table>

        <div className="w-full h-px bg-slate-900 mb-6" />

        <p className="text-sm font-bold mb-3 text-slate-900">เรียน กรรมการผู้จัดการ</p>
        <p className="text-xs sm:text-sm mb-4 leading-relaxed indent-8 text-justify text-slate-800">
          ตามที่ฝ่ายบริหารจัดการยานพาหนะได้ทำการวิเคราะห์ประสิทธิภาพและต้นทุนค่าน้ำมันเชื้อเพลิงของรถยนต์ในสังกัด ประจำไตรมาสที่ 3 (มิถุนายน - สิงหาคม 2569) ผ่านระบบ <b>Fleet Optimization Pro (AI Enabled Real-Time Cloud)</b> พบว่ามีรถยนต์จำนวน {urgentCars.length} คัน มีสภาพเสื่อมโทรม อัตราสิ้นเปลืองน้ำมันเชื้อเพลิงต่ำกว่าเกณฑ์มาตรฐานที่บริษัทกำหนด (น้อยกว่า 9 กม./ลิตร) และมีต้นทุนการปฏิบัติงานต่อกิโลเมตรสูงผิดปกติ ซึ่งส่งผลให้บริษัทมีต้นทุนแฝงและสูญเสียโอกาสทางธุรกิจ (Opportunity Loss) รวมประมาณ <b>275,000 บาท</b> หากชะลอการตัดสินใจออกไปอีก 6 เดือน
        </p>

        <p className="text-xs sm:text-sm mb-3 font-semibold text-slate-900">
          จึงขอเสนอพิจารณาตัดจำหน่ายรถยนต์กลุ่ม <b>"ขายด่วน (Phase 1)"</b> จำนวน {urgentCars.length} คัน ดังรายการต่อไปนี้:
        </p>

        <table className="w-full text-xs sm:text-sm border-collapse border border-slate-900 mb-6">
          <thead>
            <tr className="bg-slate-100 text-slate-900">
              <th className="border border-slate-900 p-2 text-center w-12">ลำดับ</th>
              <th className="border border-slate-900 p-2 text-left w-24">ทะเบียน</th>
              <th className="border border-slate-900 p-2 text-center w-28">ไมล์ (กม.)</th>
              <th className="border border-slate-900 p-2 text-center w-32">ประเมิน (กม./ลิตร)</th>
              <th className="border border-slate-900 p-2 text-left">เหตุผลประกอบการตัดขาย</th>
            </tr>
          </thead>
          <tbody>
            {urgentCars.map((car, idx) => {
              const totalDist = car.m6.dist + car.m7.dist + car.m8.dist;
              const totalFuel = car.m6.fuel + car.m7.fuel + car.m8.fuel;
              const eff = totalFuel > 0 ? (totalDist / totalFuel).toFixed(2) : '-';
              return (
                <tr key={car.id || idx}>
                  <td className="border border-slate-900 p-2 text-center font-bold">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-900 p-2 font-bold text-slate-900">
                    {car.plate}
                  </td>
                  <td className="border border-slate-900 p-2 text-center font-semibold">
                    {numFormat(car.mileage, 0, 0)}
                  </td>
                  <td className="border border-slate-900 p-2 text-center text-red-600 font-bold">
                    {eff !== '-' ? `${eff} (ต่ำเกณฑ์)` : 'ต่ำเกณฑ์'}
                  </td>
                  <td className="border border-slate-900 p-2 text-xs text-slate-800">
                    {car.recommendation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="text-xs sm:text-sm mb-12 text-slate-800 leading-relaxed indent-8">
          จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติการตัดจำหน่ายรถยนต์ดังกล่าว เพื่อนำเงินสดหมุนเวียน (Cashflow คาดการณ์ ~{numFormat(urgentCars.reduce((s, c) => s + (c.estimatedPrice || 0), 0), 0, 0)} บาท) กลับเข้าสู่บริษัทและลดภาระค่าซ่อมบำรุงที่ไม่มีประสิทธิภาพต่อไป
        </p>

        {/* Signature Blocks */}
        <div className="flex justify-between mt-16 px-6 sm:px-12 text-slate-900">
          <div className="text-center">
            <p className="tracking-widest">.......................................................</p>
            <p className="text-xs sm:text-sm mt-2 font-medium">(นายสุรเชษฐ์ พัฒนาวิจิตร)</p>
            <p className="text-xs text-slate-600 mt-1">ผู้จัดการฝ่ายบริหารฟลีทยานพาหนะ</p>
          </div>
          <div className="text-center">
            <p className="tracking-widest">.......................................................</p>
            <p className="text-xs sm:text-sm mt-2 font-bold">(.......................................................)</p>
            <p className="text-xs text-slate-600 mt-1">ผู้อนุมัติ (กรรมการผู้จัดการ)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
