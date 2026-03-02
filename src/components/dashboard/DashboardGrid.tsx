import React, { useState, useEffect } from 'react';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useDashboardStore } from '../../store/dashboardStore';
import { useMqttStore } from '../../store/mqttDataStore';
import { 
  Trash2, Thermometer, Droplets, Zap, SlidersHorizontal, Settings, 
  GripHorizontal, AlertTriangle, Copy, AlignLeft 
} from 'lucide-react';

// ==========================================
// 🎨 1. COMPONENT พื้นฐาน (Header & Style)
// ==========================================
const WidgetHeader = ({ title, onEdit, onDelete, onDuplicate }: { title: string, onEdit: () => void, onDelete: () => void, onDuplicate: () => void }) => (
  <div className="drag-handle group/header px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center cursor-grab active:cursor-grabbing transition-colors hover:bg-slate-100/50">
    <div className="flex items-center gap-3 overflow-hidden">
      <GripHorizontal size={16} className="text-slate-300 group-hover/header:text-slate-400 flex-shrink-0" />
      <span className="text-slate-700 font-semibold text-[13px] tracking-wider uppercase truncate select-none">{title}</span>
    </div>
    <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
      <button onMouseDown={(e) => e.stopPropagation()} onClick={onDuplicate} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Duplicate"><Copy size={16} /></button>
      <button onMouseDown={(e) => e.stopPropagation()} onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Settings"><Settings size={16} /></button>
      <button onMouseDown={(e) => e.stopPropagation()} onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button>
    </div>
  </div>
);

const evaluateAlert = (value: string | undefined, min?: number, max?: number) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (max !== undefined && num >= max) return true;
  if (min !== undefined && num <= min) return true;
  return false;
};

const getCardClass = (isAlert: boolean = false) => `h-full w-full rounded-[20px] border flex flex-col transition-all duration-300 overflow-hidden ${
  isAlert ? 'bg-red-50/30 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-[pulse_2s_ease-in-out_infinite]' : 'bg-white border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)]'
}`;

// ==========================================
// 🧩 2. WIDGET COMPONENTS (ทั้ง 7 แบบ)
// ==========================================

// 🌟 Switch แบบ Modern รองรับ Payload On/Off
const SwitchTile = ({ data, onEdit, onDelete, onDuplicate }: any) => {
  const publish = useMqttStore(state => state.publish);
  const payloadOn = data.config.payloadOn || 'ON';
  const payloadOff = data.config.payloadOff || 'OFF';
  const isOn = useMqttStore(state => state.messages[data.config.mqttTopic]) === payloadOn;

  return (
    <div className={getCardClass(false)}>
      <WidgetHeader title={data.config.title} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
      <div className="cancel-drag p-6 flex-1 flex flex-col justify-between cursor-default" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-colors ${isOn ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isOn ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
            {isOn ? 'ACTIVE' : 'STANDBY'}
          </div>
          <button 
            type="button"
            onClick={() => publish(data.config.commandTopic || data.config.mqttTopic, isOn ? payloadOff : payloadOn)} 
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner hover:scale-105 active:scale-95 ${isOn ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] ring-0 transition-transform duration-300 ease-in-out flex items-center justify-center ${isOn ? 'translate-x-6' : 'translate-x-0'}`}>
              <div className={`w-0.5 h-3 rounded-full transition-colors ${isOn ? 'bg-blue-100' : 'bg-slate-200'}`} />
            </span>
          </button>
        </div>
        <div className="mt-4">
          <div className="text-[13px] font-medium text-slate-400 uppercase tracking-wide mb-1">Sent Payload</div>
          <div className={`text-2xl font-bold tracking-tight ${isOn ? 'text-slate-900' : 'text-slate-400'}`}>
            {isOn ? payloadOn : payloadOff}
          </div>
        </div>
      </div>
    </div>
  );
};

const SensorTile = ({ data, onEdit, onDelete, onDuplicate }: any) => {
  const value = useMqttStore(state => state.messages[data.config.mqttTopic]);
  const isTemp = data.config.unit?.includes('C') || data.config.title.includes('อุณหภูมิ') || data.config.title.toLowerCase().includes('temp');
  const isAlert = evaluateAlert(value, data.config.alertMin, data.config.alertMax);
  return (
    <div className={getCardClass(isAlert)}>
      <WidgetHeader title={data.config.title} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
      <div className="cancel-drag p-6 flex-1 flex flex-col justify-between relative cursor-default" onMouseDown={(e) => e.stopPropagation()}>
        <div className={`absolute top-6 right-6 p-2.5 rounded-xl transition-colors ${isAlert ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : (isTemp ? 'bg-orange-50/80 text-orange-500' : 'bg-blue-50/80 text-blue-500')}`}>{isAlert ? <AlertTriangle size={22} strokeWidth={2.5} /> : (isTemp ? <Thermometer size={22} strokeWidth={2.5} /> : <Droplets size={22} strokeWidth={2.5} />)}</div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5"><span className={`text-5xl font-extrabold tracking-tight transition-colors ${isAlert ? 'text-red-600' : 'text-slate-900'}`}>{value !== undefined ? value : '--'}</span><span className={`text-xl font-semibold ${isAlert ? 'text-red-400' : 'text-slate-400'}`}>{data.config.unit}</span></div>
          {isAlert && <div className="text-red-500 text-xs font-bold mt-2 uppercase tracking-wider flex items-center gap-1">⚠ Threshold Exceeded</div>}
        </div>
      </div>
    </div>
  );
};

// 🌟 Button รองรับ Button Label แยกกับ Payload
const ButtonTile = ({ data, onEdit, onDelete, onDuplicate }: any) => {
  const publish = useMqttStore(state => state.publish);
  const [isPressed, setIsPressed] = useState(false);
  const handlePress = () => { 
    publish(data.config.commandTopic || data.config.mqttTopic, data.config.pushPayload || 'PUSH'); 
    setIsPressed(true); 
    setTimeout(() => setIsPressed(false), 200); 
  };
  return (
    <div className={getCardClass(false)}>
      <WidgetHeader title={data.config.title} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
      <div className="cancel-drag p-6 flex-1 flex flex-col items-center justify-center cursor-default" onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={handlePress} className={`group flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-bold tracking-wide transition-all duration-200 active:scale-[0.97] ${isPressed ? 'bg-blue-700 text-white shadow-inner scale-[0.97]' : 'bg-blue-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'}`}>
          <Zap size={18} className={`${isPressed ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} />
          {data.config.buttonLabel || data.config.pushPayload || 'EXECUTE'}
        </button>
      </div>
    </div>
  );
};

const SliderTile = ({ data, onEdit, onDelete, onDuplicate }: any) => {
  const publish = useMqttStore(state => state.publish);
  const mqttValue = useMqttStore(state => state.messages[data.config.mqttTopic]);
  const [localValue, setLocalValue] = useState<number>(Number(mqttValue) || 0);
  useEffect(() => { if (mqttValue !== undefined) setLocalValue(Number(mqttValue)); }, [mqttValue]);
  const handleRelease = (e: any) => publish(data.config.commandTopic || data.config.mqttTopic, e.target.value);
  return (
    <div className={getCardClass(false)}>
      <WidgetHeader title={data.config.title} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
      <div className="cancel-drag px-6 pb-6 pt-4 flex-1 flex flex-col justify-end cursor-default" onMouseDown={(e) => e.stopPropagation()}>
         <div className="flex justify-between items-end mb-4"><span className="text-3xl font-extrabold text-slate-900 tracking-tight">{localValue}</span><span className="text-sm font-medium text-slate-400 mb-1">{data.config.unit}</span></div>
         <div className="relative w-full flex items-center h-6"><input type="range" min={data.config.min||0} max={data.config.max||100} value={localValue} onChange={e => setLocalValue(Number(e.target.value))} onMouseUp={handleRelease} onTouchEnd={handleRelease} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer focus:outline-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110" /><div className="absolute left-0 h-1.5 bg-blue-600 rounded-full pointer-events-none" style={{ width: `${((localValue - (data.config.min || 0)) / ((data.config.max || 100) - (data.config.min || 0))) * 100}%` }} /></div>
      </div>
    </div>
  );
};

const ChartTile = ({ data, onEdit, onDelete, onDuplicate }: any) => {
  const history = useMqttStore(state => state.history[data.config.mqttTopic]) || [];
  const currentValue = history.length > 0 ? history[history.length - 1].value.toString() : undefined;
  const isAlert = evaluateAlert(currentValue, data.config.alertMin, data.config.alertMax);
  return (
    <div className={getCardClass(isAlert)}>
      <WidgetHeader title={data.config.title} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
      <div className="cancel-drag px-4 pb-4 pt-2 flex-1 flex flex-col cursor-default" onMouseDown={(e) => e.stopPropagation()}>
        <div className="px-2 mb-2 flex items-baseline gap-2"><span className={`text-3xl font-extrabold transition-colors ${isAlert ? 'text-red-600' : 'text-slate-900'}`}>{currentValue ?? '--'}</span><span className={`text-sm font-medium ${isAlert ? 'text-red-400' : 'text-slate-400'}`}>{data.config.unit}</span></div>
        <div className="flex-1 w-full min-h-[80px]">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={history}><YAxis domain={['auto', 'auto']} hide /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} labelStyle={{ display: 'none' }} /><Line type="monotone" dataKey="value" stroke={isAlert ? '#ef4444' : '#2563eb'} strokeWidth={3} dot={false} activeDot={{ r: 6, fill: isAlert ? '#ef4444' : '#2563eb', stroke: '#fff', strokeWidth: 2 }} /></LineChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const SelectorTile = ({ data, onEdit, onDelete, onDuplicate }: any) => {
  const publish = useMqttStore(state => state.publish);
  const currentValue = useMqttStore(state => state.messages[data.config.mqttTopic]);
  const options = data.config.options ? data.config.options.split(',').map((s: string) => s.trim()) : ['Option 1', 'Option 2'];
  return (
    <div className={getCardClass(false)}>
      <WidgetHeader title={data.config.title} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
      <div className="cancel-drag p-6 flex-1 flex flex-col justify-center cursor-default relative" onMouseDown={(e) => e.stopPropagation()}>
        <select value={currentValue || ''} onChange={(e) => publish(data.config.commandTopic || data.config.mqttTopic, e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-lg font-semibold rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer"><option value="" disabled>Select Mode...</option>{options.map((opt: string, idx: number) => <option key={idx} value={opt}>{opt}</option>)}</select>
        <div className="absolute right-10 top-[55%] pointer-events-none text-slate-400">▼</div>
      </div>
    </div>
  );
};

// 🌟 TextTile แสดงข้อความ Static
const TextTile = ({ data, onEdit, onDelete, onDuplicate }: any) => {
  const textValue = useMqttStore(state => state.messages[data.config.mqttTopic]);
  return (
    <div className={getCardClass(false)}>
      <WidgetHeader title={data.config.title} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
      <div className="cancel-drag p-6 flex-1 flex flex-col justify-center items-center cursor-default relative" onMouseDown={(e) => e.stopPropagation()}>
        <div className="absolute top-4 left-4"><AlignLeft size={20} className="text-slate-300" /></div>
        <div className="text-center w-full px-2">
          {textValue !== undefined ? (
            <span className="text-2xl font-bold text-slate-800 break-words line-clamp-3">{textValue}</span>
          ) : (
            <span className="text-base font-medium text-slate-400 italic">Waiting for data...</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 3. THE MAIN GRID (ระบบ Layout หลัก)
// ==========================================
export default function DashboardGrid({ onEditTile }: { onEditTile: (id: string) => void }) {
  const { tiles, updateLayouts, removeTile, duplicateTile } = useDashboardStore(); 
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef} className="min-h-[60vh]">
      {tiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 backdrop-blur-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4"><SlidersHorizontal size={28} className="text-slate-400" /></div>
          <p className="text-xl font-semibold text-slate-600">Your dashboard is empty</p>
          <p className="text-sm mt-2">Click the floating <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full mx-1 text-xs">+</span> button to add your first widget.</p>
        </div>
      ) : (
        mounted && (
          <Responsive
            width={width}
            className="layout"
            layouts={{ lg: tiles.map(t => t.layout) }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={160} 
            onLayoutChange={updateLayouts}
            isDraggable={true} 
            isResizable={true} 
            margin={[24, 24]} 
            draggableHandle=".drag-handle" 
            draggableCancel=".cancel-drag, input, button, select" 
          >
            {tiles.map((tile) => {
              const props = { 
                data: tile, 
                onEdit: () => onEditTile(tile.id), 
                onDelete: () => removeTile(tile.id),
                onDuplicate: () => duplicateTile(tile.id) 
              };
              return (
                <div key={tile.id} data-grid={tile.layout} className="group/widget h-full">
                  {tile.type === 'SwitchTile' && <SwitchTile {...props} />}
                  {tile.type === 'SensorTile' && <SensorTile {...props} />}
                  {tile.type === 'ButtonTile' && <ButtonTile {...props} />}
                  {tile.type === 'SliderTile' && <SliderTile {...props} />}
                  {tile.type === 'ChartTile' && <ChartTile {...props} />}
                  {tile.type === 'SelectorTile' && <SelectorTile {...props} />}
                  {tile.type === 'TextTile' && <TextTile {...props} />}
                </div>
              );
            })}
          </Responsive>
        )
      )}
    </div>
  );
}