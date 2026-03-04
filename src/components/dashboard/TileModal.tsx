import React, { useState, useEffect } from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import type { TileType } from "../../store/dashboardStore";
import {
  Power,
  Activity,
  Zap,
  SlidersHorizontal,
  X,
  LineChart as ChartIcon,
  ListFilter,
  LayoutDashboard,
  RadioReceiver,
  Settings2,
  BellRing,
  Type,
  GripHorizontal,
  Thermometer,
  Droplets,
  AlignLeft,
  Sparkles,
  Wand2,
} from "lucide-react";

interface TileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTileId?: string;
}

const TILE_OPTIONS = [
  {
    type: "SwitchTile" as TileType,
    label: "Toggle Switch",
    desc: "On/Off control",
    icon: <Power size={20} />,
  },
  {
    type: "ButtonTile" as TileType,
    label: "Push Button",
    desc: "Trigger an action",
    icon: <Zap size={20} />,
  },
  {
    type: "SliderTile" as TileType,
    label: "Range Slider",
    desc: "Adjust numeric values",
    icon: <SlidersHorizontal size={20} />,
  },
  {
    type: "SelectorTile" as TileType,
    label: "Mode Selector",
    desc: "Dropdown options",
    icon: <ListFilter size={20} />,
  },
  {
    type: "SensorTile" as TileType,
    label: "Sensor Value",
    desc: "Display current state",
    icon: <Activity size={20} />,
  },
  {
    type: "ChartTile" as TileType,
    label: "Real-time Chart",
    desc: "Historical data graph",
    icon: <ChartIcon size={20} />,
  },
  {
    type: "TextTile" as TileType,
    label: "Static Text",
    desc: "Display raw string data",
    icon: <Type size={20} className="text-teal-500" />,
  },
];

const DEFAULT_FORM = {
  title: "",
  mqttTopic: "",
  commandTopic: "",
  unit: "",
  pushPayload: "PUSH",
  buttonLabel: "EXECUTE",
  payloadOn: "ON",
  payloadOff: "OFF",
  payloadType: "raw" as "raw" | "json",
  min: 0,
  max: 100,
  options: "",
  alertMin: "",
  alertMax: "",
};

// ==========================================
// 🎨 Interactive Live Preview Component (คงเดิม)
// ==========================================
const LivePreview = ({ type, formData }: { type: TileType; formData: any }) => {
  const title = formData.title || "Widget Title";
  const unit = formData.unit || "";
  const isTemp =
    unit.includes("C") ||
    title.includes("อุณหภูมิ") ||
    title.toLowerCase().includes("temp");

  const [isOn, setIsOn] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [sliderVal, setSliderVal] = useState(formData.min || 0);

  useEffect(() => {
    setSliderVal(formData.min || 0);
  }, [type, formData.min, formData.max]);
  const maxWidth =
    type === "ChartTile"
      ? "max-w-[450px]"
      : type === "TextTile"
        ? "max-w-[320px]"
        : "max-w-[260px]";

  return (
    <div className="bg-slate-100/60 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 mb-8 relative group">
      <div className="absolute top-3 left-4 text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm transition-transform group-hover:scale-105">
        <Sparkles size={12} /> Interactive Preview
      </div>

      <div
        className={`w-full h-[160px] bg-white rounded-[20px] border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden transition-all duration-300 select-none ${maxWidth}`}
      >
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
          <GripHorizontal size={14} className="text-slate-300" />
          <span className="text-slate-700 font-semibold text-[12px] tracking-wider uppercase truncate">
            {title}
          </span>
        </div>

        {type === "SwitchTile" && (
          <div className="p-6 flex-1 flex items-center justify-between cursor-default">
            {/* 🌟 ด้านซ้าย: Label */}
            <div className="flex flex-col justify-center">
              <span
                className={`text-3xl font-extrabold tracking-tight transition-colors duration-300 ${isOn ? "text-blue-600" : "text-slate-300"}`}
              >
                {isOn ? "ON" : "OFF"}
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1 max-w-[100px] truncate">
                {isOn
                  ? formData.payloadOn || "ON"
                  : formData.payloadOff || "OFF"}
              </span>
            </div>

            {/* 🌟 ด้านขวา: Modern Minimal Switch */}
            <button
              type="button"
              onClick={() => setIsOn(!isOn)}
              className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${isOn ? "bg-blue-600" : "bg-slate-200 hover:bg-slate-300"}`}
            >
              <span
                className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] ring-0 transition-transform duration-300 ease-in-out ${isOn ? "translate-x-11" : "translate-x-1"}`}
              />
            </button>
          </div>
        )}

        {type === "SensorTile" && (
          <div className="p-5 flex-1 flex flex-col justify-between relative cursor-default">
            <div
              className={`absolute top-4 right-4 p-2 rounded-xl ${isTemp ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"}`}
            >
              {isTemp ? <Thermometer size={18} /> : <Droplets size={18} />}
            </div>
            <div className="mt-auto flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                24
              </span>
              <span className="text-lg font-semibold text-slate-400">
                {unit}
              </span>
            </div>
          </div>
        )}

        {type === "ButtonTile" && (
          <div className="p-5 flex-1 flex flex-col items-center justify-center">
            <button
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${isPressed ? "bg-blue-700 text-white shadow-inner scale-[0.97]" : "bg-blue-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"}`}
            >
              <Zap size={16} className={isPressed ? "animate-pulse" : ""} />{" "}
              {formData.buttonLabel || "EXECUTE"}
            </button>
          </div>
        )}

        {type === "SliderTile" && (
          <div className="px-5 pb-5 pt-3 flex-1 flex flex-col justify-end">
            <div className="flex justify-between items-end mb-3">
              <span className="text-2xl font-extrabold text-slate-900">
                {sliderVal}
              </span>
              <span className="text-xs font-medium text-slate-400 mb-1">
                {unit}
              </span>
            </div>
            <div className="relative w-full flex items-center h-6">
              <input
                type="range"
                min={formData.min || 0}
                max={formData.max || 100}
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer focus:outline-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110"
              />
              <div
                className="absolute left-0 h-1.5 bg-blue-600 rounded-full pointer-events-none"
                style={{
                  width: `${((sliderVal - (formData.min || 0)) / ((formData.max || 100) - (formData.min || 0))) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {type === "ChartTile" && (
          <div className="px-4 pb-4 pt-2 flex-1 flex flex-col cursor-default">
            <div className="px-2 mb-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                24.5
              </span>
              <span className="text-xs font-medium text-slate-400">{unit}</span>
            </div>
            <div className="flex-1 w-full relative overflow-hidden flex items-end">
              <svg
                className="w-full h-[50px]"
                preserveAspectRatio="none"
                viewBox="0 0 100 50"
              >
                <path
                  d="M0,50 L0,20 Q20,40 50,15 T100,5 L100,50 Z"
                  fill="#eff6ff"
                />
                <path
                  d="M0,20 Q20,40 50,15 T100,5"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
        )}

        {type === "SelectorTile" && (
          <div className="p-5 flex-1 flex flex-col justify-center relative">
            <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer">
              {formData.options ? (
                formData.options
                  .split(",")
                  .map((opt: string, i: number) => (
                    <option key={i}>{opt.trim()}</option>
                  ))
              ) : (
                <option>Select Mode...</option>
              )}
            </select>
            <div className="absolute right-10 top-[55%] pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        )}

        {type === "TextTile" && (
          <div className="p-5 flex-1 flex flex-col justify-center items-center relative cursor-default">
            <div className="absolute top-4 left-4">
              <AlignLeft size={16} className="text-slate-300" />
            </div>
            <span className="text-lg font-bold text-slate-800 text-center px-4 truncate w-full">
              Sample Static Text
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🚀 Main Modal Component
// ==========================================
export default function TileModal({
  isOpen,
  onClose,
  editTileId,
}: TileModalProps) {
  const { addTile, updateTile, tiles } = useDashboardStore();
  const [selectedType, setSelectedType] = useState<TileType>("SwitchTile");
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (isOpen && editTileId) {
      const tileToEdit = tiles.find((t) => t.id === editTileId);
      if (tileToEdit) {
        setSelectedType(tileToEdit.type);
        setFormData({
          ...DEFAULT_FORM,
          ...tileToEdit.config,
          payloadType: tileToEdit.config.payloadType || "raw",
        });
      }
    } else if (isOpen && !editTileId) {
      setFormData(DEFAULT_FORM);
    }
  }, [isOpen, editTileId, tiles]);

  const handleClose = () => {
    setFormData(DEFAULT_FORM);
    onClose();
  };

  // ✨ ฟังก์ชันสำหรับจัดฟอร์แมต JSON ให้สวยงาม
  const handleBeautify = (
    field: "pushPayload" | "payloadOn" | "payloadOff",
  ) => {
    try {
      const parsed = JSON.parse(formData[field]);
      const beautified = JSON.stringify(parsed, null, 2);
      setFormData({ ...formData, [field]: beautified });
    } catch (e) {
      alert(
        "❌ รูปแบบ JSON ไม่ถูกต้องครับ กรุณาตรวจสอบวงเล็บ ปีกกา หรือเครื่องหมายคำพูดให้ครบถ้วน",
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const configData = {
      ...formData,
      title: formData.title || "Untitled",
      alertMin:
        formData.alertMin !== "" ? Number(formData.alertMin) : undefined,
      alertMax:
        formData.alertMax !== "" ? Number(formData.alertMax) : undefined,
    };
    if (editTileId) updateTile(editTileId, configData);
    else addTile(selectedType, configData);
    handleClose();
  };

  if (!isOpen) return null;
  const canPublish = [
    "SwitchTile",
    "ButtonTile",
    "SliderTile",
    "SelectorTile",
  ].includes(selectedType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all duration-300"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-6xl h-[85vh] md:max-h-[85vh] flex flex-col md:flex-row relative animate-in fade-in zoom-in-[0.98] duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors z-20"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* --- Sidebar (ซ้าย) --- */}
        <div className="w-full h-[35%] md:h-full md:w-[30%] lg:w-[25%] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200/60 flex flex-col shrink-0">
          <div className="p-5 sm:p-7 pb-3 sm:pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {editTileId ? "Edit Widget" : "New Widget"}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Select a widget type
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 pb-6 custom-scrollbar">
            <div className="space-y-3">
              {TILE_OPTIONS.map((option) => {
                const isSelected = selectedType === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => !editTileId && setSelectedType(option.type)}
                    disabled={!!editTileId && !isSelected}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3 ${isSelected ? "bg-white border-blue-600 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.15)] ring-4 ring-blue-50" : "bg-transparent border-transparent text-slate-600 hover:bg-slate-200/50 hover:border-slate-200/50"} ${!!editTileId && !isSelected ? "opacity-30 cursor-not-allowed hidden md:flex" : ""}`}
                  >
                    <div
                      className={`p-2 rounded-xl transition-colors shrink-0 ${isSelected ? "bg-blue-50 text-blue-600" : "bg-white shadow-sm border border-slate-200/60 text-slate-500"}`}
                    >
                      {option.icon}
                    </div>
                    <div className="mt-0.5">
                      <div
                        className={`font-bold text-[13px] ${isSelected ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {option.label}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {option.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- Form & Preview (ขวา) --- */}
        <div className="w-full h-[65%] md:h-full md:w-[70%] lg:w-[75%] flex flex-col bg-white relative min-h-0">
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar min-h-0">
            <LivePreview type={selectedType} formData={formData} />

            <form
              id="widget-form"
              onSubmit={handleSubmit}
              className="space-y-8 pb-4"
            >
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                  <Settings2 size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    General Configuration
                  </h3>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Temperature, Device Mode..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                  <RadioReceiver size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Data Binding
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">
                      {["SensorTile", "ChartTile", "TextTile"].includes(
                        selectedType,
                      )
                        ? "Subscribe Topic (Read)"
                        : "Status Topic (State Read)"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="esp32/device/status"
                      value={formData.mqttTopic}
                      onChange={(e) =>
                        setFormData({ ...formData, mqttTopic: e.target.value })
                      }
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm"
                    />
                  </div>
                  {canPublish && (
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">
                        Command Topic{" "}
                        <span className="text-slate-400 font-medium ml-1">
                          (Publish)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Defaults to Status Topic if left blank"
                        value={formData.commandTopic}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            commandTopic: e.target.value,
                          })
                        }
                        className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm"
                      />
                    </div>
                  )}
                </div>
              </section>

              {!["TextTile", "SensorTile", "ChartTile"].includes(
                selectedType,
              ) && (
                <section className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                    <SlidersHorizontal size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Widget Properties & Payload
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    {/* 🌟 ButtonTile: 1 Large Textarea + Format Selector */}
                    {selectedType === "ButtonTile" && (
                      <>
                        <div className="col-span-2">
                          <label className="block text-[13px] font-bold text-slate-700 mb-2">
                            Button Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., START GAME"
                            value={formData.buttonLabel}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                buttonLabel: e.target.value,
                              })
                            }
                            className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                          />
                        </div>

                        <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                          <div className="px-4 py-3 bg-white border-b border-slate-200">
                            <span className="text-[13px] font-bold text-slate-700">
                              Payload Data
                            </span>
                          </div>
                          <textarea
                            required
                            rows={6}
                            placeholder={
                              formData.payloadType === "json"
                                ? '{\n  "cmd": "start"\n}'
                                : "PUSH"
                            }
                            value={formData.pushPayload}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pushPayload: e.target.value,
                              })
                            }
                            className="w-full bg-slate-900 text-emerald-400 px-4 py-4 font-mono text-[13px] focus:outline-none resize-y border-none"
                          />
                          <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              {(["raw", "json"] as const).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      payloadType: type,
                                    })
                                  }
                                  className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${formData.payloadType === type ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"}`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                            {formData.payloadType === "json" && (
                              <button
                                type="button"
                                onClick={() => handleBeautify("pushPayload")}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Wand2 size={14} /> Beautify JSON
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* 🌟 SwitchTile: 2 Textareas (ON/OFF) vertically stacked with Format Selector */}
                    {selectedType === "SwitchTile" && (
                      <div className="col-span-2 space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                          <div className="px-4 py-3 bg-white border-b border-slate-200">
                            <span className="text-[13px] font-bold text-slate-700">
                              Payload (Turn ON)
                            </span>
                          </div>
                          <textarea
                            required
                            rows={4}
                            placeholder={
                              formData.payloadType === "json"
                                ? '{\n  "status": "ON"\n}'
                                : "ON"
                            }
                            value={formData.payloadOn}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                payloadOn: e.target.value,
                              })
                            }
                            className="w-full bg-slate-900 text-emerald-400 px-4 py-4 font-mono text-[13px] focus:outline-none resize-y border-none"
                          />
                          {formData.payloadType === "json" && (
                            <div className="px-4 py-2 bg-white border-t border-slate-200 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleBeautify("payloadOn")}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Wand2 size={14} /> Beautify JSON
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                          <div className="px-4 py-3 bg-white border-b border-slate-200">
                            <span className="text-[13px] font-bold text-slate-700">
                              Payload (Turn OFF)
                            </span>
                          </div>
                          <textarea
                            required
                            rows={4}
                            placeholder={
                              formData.payloadType === "json"
                                ? '{\n  "status": "OFF"\n}'
                                : "OFF"
                            }
                            value={formData.payloadOff}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                payloadOff: e.target.value,
                              })
                            }
                            className="w-full bg-slate-900 text-red-400 px-4 py-4 font-mono text-[13px] focus:outline-none resize-y border-none"
                          />
                          {formData.payloadType === "json" && (
                            <div className="px-4 py-2 bg-white border-t border-slate-200 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleBeautify("payloadOff")}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Wand2 size={14} /> Beautify JSON
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Format Selector for Switch Tile */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                          <span className="text-[13px] font-bold text-slate-700">
                            Payload Format
                          </span>
                          <div className="flex items-center gap-2">
                            {(["raw", "json"] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    payloadType: type,
                                  })
                                }
                                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${formData.payloadType === type ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"}`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedType === "SliderTile" && (
                      <>
                        <div className="col-span-1">
                          <label className="block text-[13px] font-bold text-slate-700 mb-2">
                            Min Value
                          </label>
                          <input
                            type="number"
                            required
                            value={formData.min}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                min: Number(e.target.value),
                              })
                            }
                            className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[13px] font-bold text-slate-700 mb-2">
                            Max Value
                          </label>
                          <input
                            type="number"
                            required
                            value={formData.max}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                max: Number(e.target.value),
                              })
                            }
                            className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </>
                    )}

                    {selectedType === "SelectorTile" && (
                      <div className="col-span-2">
                        <label className="block text-[13px] font-bold text-slate-700 mb-2">
                          Dropdown Options (คั่นด้วยลูกน้ำ)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Low, Medium, High"
                          value={formData.options}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              options: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {["SensorTile", "SliderTile", "ChartTile"].includes(
                selectedType,
              ) && (
                <div className="col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">
                    Unit{" "}
                    <span className="text-slate-400 font-medium ml-1">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., °C, %"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              {["SensorTile", "ChartTile"].includes(selectedType) && (
                <section className="bg-red-50/50 border border-red-100 rounded-2xl p-5 shrink-0 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-red-100/60">
                    <BellRing size={18} className="text-red-500" />
                    <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider">
                      Alert Thresholds{" "}
                      <span className="text-red-400 normal-case font-medium ml-1">
                        (Optional)
                      </span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-bold text-red-900 mb-2">
                        Min Alert
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 20"
                        value={formData.alertMin}
                        onChange={(e) =>
                          setFormData({ ...formData, alertMin: e.target.value })
                        }
                        className="w-full bg-white border border-red-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-red-900 mb-2">
                        Max Alert
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 35"
                        value={formData.alertMax}
                        onChange={(e) =>
                          setFormData({ ...formData, alertMax: e.target.value })
                        }
                        className="w-full bg-white border border-red-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all"
                      />
                    </div>
                  </div>
                </section>
              )}
            </form>
          </div>

          {/* 🌟 Footer Actions */}
          <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="widget-form"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-bold tracking-wide shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all active:scale-[0.97]"
            >
              {editTileId ? "Save Changes" : "Create Widget"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
