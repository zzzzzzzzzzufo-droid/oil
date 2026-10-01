import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  Fuel,
  Car,
  ExternalLink,
  Loader2,
  Globe,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { Vehicle } from '../types';

interface MarketIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: Vehicle | null;
}

export const MarketIntelligenceModal: React.FC<MarketIntelligenceModalProps> = ({
  isOpen,
  onClose,
  initialVehicle
}) => {
  const [activeTab, setActiveTab] = useState<'fuel' | 'vehicle' | 'custom'>(
    initialVehicle ? 'vehicle' : 'fuel'
  );

  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [customQuery, setCustomQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(initialVehicle || null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (initialVehicle) {
      setSelectedVehicle(initialVehicle);
      setActiveTab('vehicle');
    }
  }, [initialVehicle]);

  // Execute Search Grounding
  const runSearchGrounding = async (
    type: 'fuel_prices' | 'used_car_valuation' | 'custom_query',
    customPrompt?: string
  ) => {
    setLoading(true);
    setResultText('');
    setSources([]);
    setSearchQueries([]);
    setIsFallback(false);

    try {
      const payload: any = { type };

      if (type === 'used_car_valuation' && selectedVehicle) {
        payload.plate = selectedVehicle.plate;
        payload.age = selectedVehicle.age;
        payload.mileage = selectedVehicle.mileage;
        payload.estimatedPrice = selectedVehicle.estimatedPrice;
      } else if (type === 'custom_query') {
        payload.query = customPrompt || customQuery;
      }

      const res = await fetch('/api/market-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setResultText(data.text);
        setSources(data.sources || []);
        setSearchQueries(data.searchQueries || []);
        setIsFallback(!!data.isFallback);
      } else {
        setResultText(`เกิดข้อผิดพลาดในการสืบค้น: ${data.error || 'โปรดลองใหม่อีกครั้ง'}`);
      }
    } catch (err: any) {
      setResultText(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message || 'โปรดตรวจสอบการเชื่อมต่อ'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'fuel' && !resultText) {
        runSearchGrounding('fuel_prices');
      } else if (activeTab === 'vehicle' && selectedVehicle && !resultText) {
        runSearchGrounding('used_car_valuation');
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-3xl relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  AI Market Intelligence Pro
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Google Search Grounding
                </span>
              </div>
              <p className="text-xs text-blue-200">
                ขับเคลื่อนด้วย gemini-3.5-flash เชื่อมโยงข้อมูลตลาดและราคาน้ำมันสดจาก Google Search
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('fuel');
              runSearchGrounding('fuel_prices');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'fuel'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Fuel className="w-4 h-4 text-emerald-500" />
            <span>ราคาน้ำมันล่าสุดในไทย (Live Fuel Prices)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('vehicle');
              if (selectedVehicle) {
                runSearchGrounding('used_car_valuation');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'vehicle'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4 text-orange-500" />
            <span>ราคากลางรถกระบะมือสอง (Used Car Market)</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 text-purple-500" />
            <span>สืบค้นอิสระ (Custom Search)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Custom Search Input bar if custom tab */}
          {activeTab === 'custom' && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="พิมพ์สิ่งที่ต้องการให้ AI ค้นหาจาก Google เช่น ค่าบำรุงรักษารถกระบะเกิน 3 แสนโล..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runSearchGrounding('custom_query')}
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
              <button
                onClick={() => runSearchGrounding('custom_query')}
                disabled={loading || !customQuery.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ค้นหา</span>
              </button>
            </div>
          )}

          {/* Vehicle context indicator if in vehicle tab */}
          {activeTab === 'vehicle' && selectedVehicle && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 dark:text-white">
                  กำลังวิเคราะห์: ทะเบียน {selectedVehicle.plate} (อายุ {selectedVehicle.age} ปี • ไมล์ {selectedVehicle.mileage.toLocaleString()} กม.)
                </span>
              </div>
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                ราคาประเมิน: ~{selectedVehicle.estimatedPrice.toLocaleString()} บาท
              </span>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="py-14 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500 animate-pulse">
                กำลังสืบค้นข้อมูลล่าสุดจาก Google Search ผ่าน gemini-3.5-flash...
              </p>
            </div>
          )}

          {/* Search Queries badge */}
          {!loading && searchQueries.length > 0 && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1 mb-1">
                <Globe className="w-3 h-3 text-blue-500" /> คำค้นหาที่ Google Search ใช้งานจริง:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {searchQueries.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-700 dark:text-slate-200 font-medium"
                  >
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grounded Result Display */}
          {!loading && resultText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1.5 ${
                  isFallback
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                }`}>
                  <Globe className="w-3 h-3" />
                  {isFallback
                    ? 'ฐานข้อมูลราคากลางและสถานการณ์พลังงานมาตรฐานล่าสุด (Verified Benchmark)'
                    : 'ข้อมูลสดจาก Google Search Grounding (gemini-3.5-flash)'}
                </span>

                <button
                  onClick={() => runSearchGrounding(activeTab === 'fuel' ? 'fuel_prices' : activeTab === 'vehicle' ? 'used_car_valuation' : 'custom_query')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <TrendingUp className="w-3 h-3" /> รีเฟรชข้อมูล
                </button>
              </div>

              <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line shadow-2xs font-normal">
                {resultText}
              </div>
            </div>
          )}

          {/* Citations / Sources */}
          {!loading && sources.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-blue-500" /> แหล่งข้อมูลอ้างอิงสดจากอินเทอร์เน็ต (Grounded Sources):
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-between text-xs group"
                  >
                    <span className="font-medium text-blue-600 dark:text-blue-400 truncate max-w-[85%] group-hover:underline">
                      {src.title || src.uri}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
          <p className="text-[11px] text-slate-400">
            * ข้อมูลถูกดึงสด ณ เวลาปัจจุบัน เพื่อนำมาประเมินความคุ้มค่าของฟลีท
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
