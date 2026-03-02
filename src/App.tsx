import React, { useState } from "react";
import DashboardGrid from "./components/dashboard/DashboardGrid";
import TileModal from "./components/dashboard/TileModal";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard"; // 🌟 Import หน้า Analytics ที่เราเพิ่งสร้าง
import { useMqtt } from "./hooks/useMqtt";
import { useMqttStore } from "./store/mqttDataStore";
import { useDashboardStore } from "./store/dashboardStore";
import {
  Plus,
  Wifi,
  WifiOff,
  Loader2,
  Bell,
  BarChart3,
  Sliders,
  BookOpen,
} from "lucide-react"; // 🌟 เพิ่มไอคอนสำหรับเมนู
import ContentManager from "./components/content/ContentManager";

type TabType = "analytics" | "devices" | "content";

export default function App() {
  useMqtt();
  const mqttStatus = useMqttStore((state) => state.status);
  const messages = useMqttStore((state) => state.messages);
  const tiles = useDashboardStore((state) => state.tiles);

  // 🌟 State ควบคุมว่าตอนนี้อยู่หน้าไหน (ค่าเริ่มต้นให้เปิดมาเจอหน้า Analytics เลย)
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    editId?: string;
  }>({ isOpen: false });

  // ฟังก์ชันคำนวณ Alert สำหรับกระดิ่ง
  const activeAlertsCount = tiles.reduce((count, tile) => {
    if (tile.type === "SensorTile" || tile.type === "ChartTile") {
      const val = Number(messages[tile.config.mqttTopic]);
      if (!isNaN(val)) {
        if (tile.config.alertMax !== undefined && val >= tile.config.alertMax)
          return count + 1;
        if (tile.config.alertMin !== undefined && val <= tile.config.alertMin)
          return count + 1;
      }
    }
    return count;
  }, 0);

  const getStatusDisplay = () => {
    switch (mqttStatus) {
      case "Connected":
        return (
          <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-sm font-semibold">
            <Wifi size={16} /> Online
          </span>
        );
      case "Connecting":
        return (
          <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-semibold">
            <Loader2 size={16} className="animate-spin" /> Connecting...
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm font-semibold">
            <WifiOff size={16} /> Offline
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 font-sans selection:bg-blue-500/30 pb-24">
      {/* ========================================== */}
      {/* 🌟 1. GLOBAL HEADER & NAVIGATION */}
      {/* ========================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md">
        {/* ส่วนบน: โลโก้ และสถานะ */}
        <div className="px-6 py-4 flex justify-between items-center max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <BookOpen size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight hidden sm:block">
              Magic English Box
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {getStatusDisplay()}

            <div
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 hover:text-slate-800"
              title="Alerts"
            >
              <Bell size={22} />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1 right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ส่วนล่าง: Navigation Tabs */}
        <div className="px-6 max-w-[1600px] mx-auto flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "analytics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <BarChart3 size={18} /> Gameplay Analytics
          </button>

          <button
            onClick={() => setActiveTab("devices")}
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "devices"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <Sliders size={18} /> Device Control
          </button>

          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 pb-3 pt-1 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "content"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <BookOpen size={18} /> Content Manager
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* 🌟 2. MAIN CONTENT AREA (แสดงตาม Tab ที่เลือก) */}
      {/* ========================================== */}
      <main>
        {activeTab === "analytics" && <AnalyticsDashboard />}

        {activeTab === "devices" && (
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
            <DashboardGrid
              onEditTile={(id) => setModalConfig({ isOpen: true, editId: id })}
            />
          </div>
        )}

        {activeTab === "content" && <ContentManager />}
      </main>

      {/* ========================================== */}
      {/* 🌟 3. FAB (ปุ่มเพิ่ม Widget ลอยมาเฉพาะหน้า Device) */}
      {/* ========================================== */}
      {activeTab === "devices" && (
        <button
          onClick={() => setModalConfig({ isOpen: true, editId: undefined })}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.6)] transition-all duration-200 flex items-center justify-center z-40 hover:scale-105 active:scale-95 animate-in zoom-in"
          title="Add New Widget"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Modal เพิ่ม/แก้ไข Widget สำหรับหน้า Device Control */}
      <TileModal
        isOpen={modalConfig.isOpen}
        editTileId={modalConfig.editId}
        onClose={() => setModalConfig({ isOpen: false, editId: undefined })}
      />
    </div>
  );
}
