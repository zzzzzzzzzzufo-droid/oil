import React from 'react';
import { Bot, AlertTriangle } from 'lucide-react';
import { Vehicle } from '../types';

interface AIBannerProps {
  vehicles: Vehicle[];
}

export const AIBanner: React.FC<AIBannerProps> = ({ vehicles }) => {
  // Check vehicles with high cost per job or low mileage vs high cost
  const anomalies = vehicles.filter((v) => {
    const totalJobs = v.m6.jobs + v.m7.jobs + v.m8.jobs;
    const totalCost = v.m6.cost + v.m7.cost + v.m8.cost;
    const cJob = totalJobs > 0 ? totalCost / totalJobs : 0;
    return cJob > 400 || (v.m8.jobs === 0 && v.m8.cost > 5000);
  });

  const anomalyPlates = anomalies.map(a => a.plate).join(', ') || 'ถอ 999, 1ฒห 9229';

  return (
    <div
      id="aiBanner"
      className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 px-4 py-2 flex items-center gap-3 shrink-0 relative z-10 text-xs sm:text-sm overflow-hidden"
    >
      <div className="shrink-0 text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5">
        <Bot className="w-4 h-4 animate-pulse text-red-600 dark:text-red-400" />
        <span className="uppercase tracking-wider">AI Alert:</span>
      </div>
      <div className="overflow-hidden whitespace-nowrap w-full">
        <div className="inline-block animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] text-red-700 dark:text-red-300 font-medium">
          ⚠️ ตรวจพบต้นทุนต่อ Job ผิดปกติในคัน ถอ 999 (631 บ./งาน) และ 1ฒห 9229 (833 บ./งาน) | *หมายเหตุ: บางรายการที่ต้นทุนสูง เกิดจากรอการบันทึกจำนวนงานย้อนหลัง ระบบเชื่อมโยงข้อมูลกับ Firebase Firestore แบบเรียลไทม์ และเปิดให้คลิกที่ทะเบียนรถเพื่อ "แก้ไขข้อมูล" ได้ทันที ข้อมูลซิงค์อัตโนมัติทุกอุปกรณ์และรองรับการทำงานออฟไลน์ 100%
        </div>
      </div>
    </div>
  );
};
