import React, { useState, useEffect } from 'react';
import { X, History, Clock, User, Car, FileSpreadsheet } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { AuditLog } from '../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    try {
      const q = query(
        collection(db, 'audit_logs'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: AuditLog[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              action: data.action || 'UPDATE',
              vehiclePlate: data.vehiclePlate || '-',
              details: data.details || '-',
              timestamp: data.timestamp || new Date().toISOString(),
              userId: data.userId || 'anonymous'
            });
          });
          setLogs(list);
          setLoading(false);
        },
        (error) => {
          console.warn('Audit trail listener note:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                ประวัติการแก้ไขและบันทึกข้อมูล (Audit Trail)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ระบบเก็บบันทึกประวัติการเปลี่ยนแปลงทุกรายการบนคลาวด์เพื่อความโปร่งใส
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">กำลังโหลดประวัติ...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>ยังไม่มีประวัติการแก้ไขข้อมูลล่าสุด</p>
              <p className="text-[11px] text-slate-400">
                เมื่อท่านทำการอัปเดตข้อมูลรถหรือบันทึกจำนวนงานย้อนหลัง ประวัติจะปรากฏที่นี่แบบเรียลไทม์
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 transition-all hover:border-purple-300 dark:hover:border-purple-600"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    ทะเบียน {log.vehiclePlate}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  {log.details}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>บันทึกโดย: {log.userId}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
