import React, { useEffect, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
} from "recharts";
import {
  Target,
  Clock,
  Flame,
  Gamepad2,
  AlertOctagon,
  Trash2,
  Activity,
} from "lucide-react";
import { useAnalyticsStore } from "../../store/analyticsStore";
import { useMqttStore } from "../../store/mqttDataStore";

// ==========================================
// 🎨 SUB-COMPONENTS: การ์ดแสดงสถิติ (KPI Card)
// ==========================================
const StatCard = ({ title, value, unit, icon, isGood }: any) => (
  <div className="bg-white rounded-[24px] p-6 border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-2xl ${isGood ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"}`}
      >
        {icon}
      </div>
    </div>
    <div>
      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
        {value}{" "}
        <span className="text-lg text-slate-400 font-semibold">{unit}</span>
      </div>
      <div className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mt-1">
        {title}
      </div>
    </div>
  </div>
);

// ==========================================
// 🚀 MAIN DASHBOARD COMPONENT
// ==========================================
export default function AnalyticsDashboard() {
  // ดึงค่าสถิติจาก Zustand Store (สมองกลคำนวณ)
  const {
    totalGames,
    accuracy,
    avgResponseTime,
    currentStreak,
    trendData,
    wordStats,
    processTelemetry,
    resetStats,
  } = useAnalyticsStore();

  // ดึงข้อความล่าสุดจาก MQTT
  const mqttMessages = useMqttStore((state) => state.messages);
  const telemetryRaw = mqttMessages["vocabgame/telemetry"];

  // 🌟 ดักจับข้อมูล MQTT: ทันทีที่มี JSON ส่งมาที่ Topic นี้ จะสั่งคำนวณใหม่ทันที!
  useEffect(() => {
    if (telemetryRaw) {
      try {
        const data = JSON.parse(telemetryRaw);
        // เช็คว่ามีข้อมูลคำศัพท์และเวลาตอบครบถ้วน ถึงจะนำไปคำนวณ
        if (data && data.word && data.responseTime !== undefined) {
          processTelemetry(data);
        }
      } catch (error) {
        console.error("Invalid JSON telemetry from ESP32:", error);
      }
    }
  }, [telemetryRaw, processTelemetry]);

  // 🌟 จัดอันดับคำศัพท์ที่เด็กตอบผิดบ่อยที่สุด 5 อันดับแรก (เรียงจากผิดมากไปน้อย)
  const wrongWordsRanking = useMemo(() => {
    return Object.values(wordStats)
      .filter((stat) => stat.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5);
  }, [wordStats]);

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      {/* --- ส่วนหัว (Header & Reset Button) --- */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Live Gameplay Analytics
          </h2>
          <p className="text-sm text-slate-500">
            {totalGames > 0
              ? "Analyzing real-time player data..."
              : "Waiting for ESP32 telemetry data..."}
          </p>
        </div>
        <button
          onClick={resetStats}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm font-bold shadow-sm active:scale-95"
          title="Clear all data"
        >
          <Trash2 size={16} />{" "}
          <span className="hidden sm:inline">Reset Stats</span>
        </button>
      </div>

      {/* --- Section 1: KPI Cards (สถิติภาพรวม) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Accuracy"
          value={accuracy}
          unit="%"
          icon={<Target size={24} />}
          isGood={accuracy >= 50}
        />
        <StatCard
          title="Avg Response Time"
          value={avgResponseTime}
          unit="s"
          icon={<Clock size={24} />}
          isGood={avgResponseTime < 5 && avgResponseTime > 0}
        />
        <StatCard
          title="Current Streak"
          value={currentStreak}
          unit="words"
          icon={
            <Flame
              size={24}
              className={
                currentStreak >= 3 ? "text-orange-500 fill-orange-500" : ""
              }
            />
          }
          isGood={currentStreak > 0}
        />
        <StatCard
          title="Questions Answered"
          value={totalGames}
          unit=""
          icon={<Gamepad2 size={24} />}
          isGood={totalGames > 0}
        />
      </div>

      {/* --- Section 2: Real-time Charts (กราฟวิเคราะห์แนวโน้ม) --- */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Live Performance Tracker{" "}
              <span className="text-slate-400 font-medium text-sm ml-1">
                (Last 20 Questions)
              </span>
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Real-time accuracy vs response time
            </p>
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="h-[300px] w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">
            <Activity size={32} className="mb-3 text-slate-300" />
            Waiting for players to answer...
          </div>
        ) : (
          <div className="h-[300px] w-full animate-in fade-in duration-700">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorAccuracy"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="round"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                  domain={[0, 100]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                  domain={[0, "auto"]}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{
                    fontWeight: "bold",
                    color: "#0f172a",
                    marginBottom: "8px",
                  }}
                />

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy (%)"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#colorAccuracy)"
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="responseTime"
                  name="Response Time (s)"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* --- Section 3: Most Frequently Incorrect Words (ตารางคำศัพท์ที่ผิดบ่อย) --- */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
            <AlertOctagon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Critical Learning Gaps
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Top 5 words with the highest error rate
            </p>
          </div>
        </div>

        {wrongWordsRanking.length === 0 ? (
          <div className="py-10 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
            <Target size={32} className="mb-3 text-emerald-400" />
            No errors recorded yet. Perfect score! 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 pt-2 px-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="pb-4 pt-2 px-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                    Vocabulary Word
                  </th>
                  <th className="pb-4 pt-2 px-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Attempts
                  </th>
                  <th className="pb-4 pt-2 px-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                    Error Rate
                  </th>
                  <th className="pb-4 pt-2 px-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {wrongWordsRanking.map((item, index) => (
                  <tr
                    key={item.word}
                    className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <td className="py-4 px-4">
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? "bg-rose-100 text-rose-600" : index === 1 ? "bg-orange-100 text-orange-600" : index === 2 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 tracking-wide">
                      {item.word}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {item.attempts}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 w-10">
                          {item.errorRate}%
                        </span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${item.errorRate > 60 ? "bg-rose-500" : item.errorRate > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${item.errorRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${item.errorRate > 60 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        {item.errorRate > 60 ? "Needs Review" : "Monitor"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
