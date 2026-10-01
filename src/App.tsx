/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle } from './types';
import {
  subscribeToFleetVehicles,
  updateVehicleData,
  resetFleetToDefault,
  testConnection
} from './firebase';
import { INITIAL_FLEET_DATA } from './initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AIBanner } from './components/AIBanner';
import { SummaryCards } from './components/SummaryCards';
import { HealthTable } from './components/HealthTable';
import { FuelTable } from './components/FuelTable';
import { AnalyticsSection } from './components/AnalyticsSection';
import { CarDetailModal } from './components/CarDetailModal';
import { EditCarModal } from './components/EditCarModal';
import { DisposalMemoModal } from './components/DisposalMemoModal';
import { SupportModal } from './components/SupportModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const [editingCar, setEditingCar] = useState<Vehicle | null>(null);
  const [memoOpen, setMemoOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  // Network & Sync States
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Vehicles Data State (initialized with authentic data from prompt)
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    INITIAL_FLEET_DATA.map((item) => ({
      ...item,
      id: `car-${item.order}`
    }))
  );

  // Toast Helper
  const addToast = useCallback(
    (type: 'success' | 'warning' | 'info', title: string, message: string) => {
      const id = Date.now().toString() + Math.random().toString().slice(2, 6);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('synced');
      addToast(
        'success',
        'เชื่อมต่อออนไลน์แล้ว',
        'ระบบกลับมาเชื่อมต่อคลาวด์และทำการซิงค์ข้อมูลเรียลไทม์อัตโนมัติ'
      );
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      addToast(
        'warning',
        'เข้าสู่โหมดออฟไลน์',
        'ข้อมูลจะถูกบันทึกอย่างปลอดภัยในเครื่อง และจะซิงค์กับคลาวด์อัตโนมัติเมื่อออนไลน์'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial test connection to Firestore as mandated by Firebase skill
    testConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // Subscribe to Firestore Real-time Updates
  useEffect(() => {
    setSyncStatus('syncing');
    const unsubscribe = subscribeToFleetVehicles(
      (updatedVehicles) => {
        if (updatedVehicles && updatedVehicles.length > 0) {
          setVehicles(updatedVehicles);
          setSyncStatus('synced');
        }
      },
      (error) => {
        console.warn('Real-time sync error, using cached records:', error);
        setSyncStatus('offline');
      }
    );

    return () => unsubscribe();
  }, []);

  // Update vehicle handler
  const handleSaveVehicle = async (
    id: string,
    updatedData: Partial<Vehicle>,
    reason: string
  ) => {
    setSyncStatus('syncing');

    // Optimistic UI update for instant zero-latency feedback
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedData } : v))
    );

    if (selectedCar && selectedCar.id === id) {
      setSelectedCar((prev) => (prev ? { ...prev, ...updatedData } : null));
    }

    try {
      await updateVehicleData(id, updatedData, reason);
      setSyncStatus('synced');
      addToast(
        'success',
        `อัปเดตข้อมูล ${updatedData.plate || ''} สำเร็จ`,
        'ข้อมูลถูกบันทึกลง Firebase เรียลไทม์ และพร้อมซิงค์ไปยังทุกอุปกรณ์'
      );
    } catch (error) {
      console.error('Save vehicle error:', error);
      addToast(
        'info',
        'บันทึกในแคชออฟไลน์แล้ว',
        'ข้อมูลถูกบันทึกในเครื่องเรียบร้อย และจะส่งขึ้นคลาวด์ทันทีที่มีการเชื่อมต่อ'
      );
    }
  };

  // Reset fleet to authentic initial state
  const handleResetData = async () => {
    if (
      window.confirm(
        'ต้องการรีเซ็ตข้อมูลฟลีททั้ง 16 คันกลับเป็นค่าตั้งต้นที่แม่นยำใช่หรือไม่?'
      )
    ) {
      try {
        setSyncStatus('syncing');
        await resetFleetToDefault();
        addToast(
          'success',
          'รีเซ็ตข้อมูลเรียบร้อย',
          'กู้คืนข้อมูลตั้งต้น 16 คันเสร็จสมบูรณ์'
        );
      } catch (e) {
        console.error('Reset error:', e);
      }
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 text-slate-800 dark:bg-[#0f172a] dark:text-slate-200 selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenMemo={() => setMemoOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full transition-all duration-300 relative">
        {/* Top Header */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenMemo={() => setMemoOpen(true)}
          onOpenSupport={() => setSupportOpen(true)}
          onResetData={handleResetData}
          isOnline={isOnline}
          syncStatus={syncStatus}
        />

        {/* AI Notification Marquee */}
        <AIBanner vehicles={vehicles} />

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" id="dashboardOverview">
          {/* Key Metric Summary Cards */}
          <SummaryCards vehicles={vehicles} />

          {/* Table 1: Health Score & Condition Assessment */}
          <HealthTable
            vehicles={vehicles}
            onSelectCar={(car) => setSelectedCar(car)}
            onEditCar={(car) => setEditingCar(car)}
          />

          {/* Table 2: Integrated Fuel, Job Costs & Benchmark Analysis */}
          <FuelTable
            vehicles={vehicles}
            onSelectCar={(car) => setSelectedCar(car)}
          />

          {/* Table 3: Executive Analytics & Multi-dimensional Ranking Suite */}
          <AnalyticsSection
            vehicles={vehicles}
            onSelectCar={(car) => setSelectedCar(car)}
          />

          {/* Enterprise Footer */}
          <footer className="pt-6 pb-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-500">BUG SOLUTIONS</span>
              <span>•</span>
              <span>ระบบบริหารจัดการฟลีทรถยนต์เชิงลึกระดับมืออาชีพ</span>
            </div>
            <div className="flex items-center gap-3">
              <span>ประสบการณ์กว่า 20 ปี</span>
              <span>•</span>
              <span>ฝ่ายสนับสนุน 24 ชั่วโมง</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Firebase Firestore Real-Time Active
              </span>
            </div>
          </footer>
        </div>
      </main>

      {/* Car Profile Modal */}
      <CarDetailModal
        vehicle={selectedCar}
        onClose={() => setSelectedCar(null)}
        onOpenEdit={(car) => {
          setSelectedCar(null);
          setEditingCar(car);
        }}
      />

      {/* Real-time Edit Modal */}
      <EditCarModal
        vehicle={editingCar}
        onClose={() => setEditingCar(null)}
        onSave={handleSaveVehicle}
      />

      {/* Disposal Request Memo (Printable) */}
      <DisposalMemoModal
        isOpen={memoOpen}
        onClose={() => setMemoOpen(false)}
        vehicles={vehicles}
      />

      {/* 24/7 Support & Quality Guarantee Modal */}
      <SupportModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
      />

      {/* Real-time Notification Toast */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
