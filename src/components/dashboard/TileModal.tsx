import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import type { TileType } from '../../store/dashboardStore';
import { 
  Power, Activity, Zap, SlidersHorizontal, X, 
  LineChart as ChartIcon, ListFilter, LayoutDashboard, 
  RadioReceiver, Settings2, BellRing, Type, GripHorizontal,
  Thermometer, Droplets, AlignLeft, Sparkles
} from 'lucide-react';

interface TileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTileId?: string; 
}

const TILE_OPTIONS = [
  { type: 'SwitchTile' as TileType, label: 'Toggle Switch', desc: 'On/Off control', icon: <Power size={20} /> },
  { type: 'ButtonTile' as TileType, label: 'Push Button', desc: 'Trigger an action', icon: <Zap size={20} /> },
  { type: 'SliderTile' as TileType, label: 'Range Slider', desc: 'Adjust numeric values', icon: <SlidersHorizontal size={20} /> },
  { type: 'SelectorTile' as TileType, label: 'Mode Selector', desc: 'Dropdown options', icon: <ListFilter size={20} /> },
  { type: 'SensorTile' as TileType, label: 'Sensor Value', desc: 'Display current state', icon: <Activity size={20} /> },
  { type: 'ChartTile' as TileType, label: 'Real-time Chart', desc: 'Historical data graph', icon: <ChartIcon size={20} /> },
  { type: 'TextTile' as TileType, label: 'Static Text', desc: 'Display raw string data', icon: <Type size={20} className="text-teal-500" /> },
];

const DEFAULT_FORM = { 
  title: '', mqttTopic: '', commandTopic: '', unit: '', 
  pushPayload: 'PUSH', buttonLabel: 'EXECUTE', 
  payloadOn: 'ON', payloadOff: 'OFF',
  min: 0, max: 100, options: '', alertMin: '', alertMax: '' 
};

// ==========================================
// 🎨 Interactive Live Preview Component
// ==========================================
const LivePreview = ({ type, formData }: { type: TileType, formData: any }) => {
  const title = formData.title || 'Widget Title';
  const unit = formData.unit || '';
  const isTemp = unit.includes('C') || title.includes('อุณหภูมิ') || title.toLowerCase().includes('temp');
  
  const [isOn, setIsOn] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [sliderVal, setSliderVal] = useState(formData.min || 0);

  useEffect(() => { setSliderVal(formData.min || 0); }, [type, formData.min, formData.max]);

  const maxWidth = type === 'ChartTile' ? 'max-w-[450px]' : (type === 'TextTile' ? 'max-w-[320px]' : 'max-w-[260px]');

  return (
    <div className="bg-slate-100/60 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 mb-8 relative group">
      <div className="absolute top-3 left-4 text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm transition-transform group-hover:scale-105">
        <Sparkles size={12} /> Interactive Preview
      </div>
      
      <div className={`w-full h-[160px] bg-white rounded-[20px] border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden transition-all duration-300 select-none ${maxWidth}`}>
        
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
          <GripHorizontal size={14} className="text-slate-300" />
          <span className="text-slate-700 font-semibold text-[12px] tracking-wider uppercase truncate">{title}</span>
        </div>

{type === 'SwitchTile' && (
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              {/* 🌟 ป้ายสถานะแบบ Modern */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-colors ${isOn ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOn ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                {isOn ? 'ACTIVE' : 'STANDBY'}
              </div>

              {/* 🌟 สวิตช์สไตล์ Modern (แก้เป็นปุ่ม button เพื่อให้กดโต้ตอบได้ 100%) */}
              <button
                type="button" // สำคัญมาก ป้องกันการ Submit Form
                onClick={() => setIsOn(!isOn)}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner hover:scale-105 active:scale-95 ${isOn ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] ring-0 transition-transform duration-300 ease-in-out flex items-center justify-center ${isOn ? 'translate-x-6' : 'translate-x-0'}`}>
                  {/* รอยบากตรงกลางให้ดูเหมือนสวิตช์ฮาร์ดแวร์ */}
                  <div className={`w-0.5 h-3 rounded-full transition-colors ${isOn ? 'bg-blue-100' : 'bg-slate-200'}`} />
                </span>
              </button>
            </div>
            <div className="mt-2">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">Payload Data</div>
              <div className={`text-xl font-bold tracking-tight transition-colors ${isOn ? 'text-slate-900' : 'text-slate-400'}`}>
                {isOn ? (formData.payloadOn || 'ON') : (formData.payloadOff || 'OFF')}
              </div>
            </div>
          </div>
        )}

        {type === 'SensorTile' && (
          <div className="p-5 flex-1 flex flex-col justify-between relative cursor-default">
            <div className={`absolute top-4 right-4 p-2 rounded-xl ${isTemp ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>{isTemp ? <Thermometer size={18} /> : <Droplets size={18} />}</div>
            <div className="mt-auto flex items-baseline gap-1.5"><span className="text-4xl font-extrabold tracking-tight text-slate-900">24</span><span className="text-lg font-semibold text-slate-400">{unit}</span></div>
          </div>
        )}

        {type === 'ButtonTile' && (
          <div className="p-5 flex-1 flex flex-col items-center justify-center">
            <button 
              onMouseDown={() => setIsPressed(true)} onMouseUp={() => setIsPressed(false)} onMouseLeave={() => setIsPressed(false)}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${isPressed ? 'bg-blue-700 text-white shadow-inner scale-[0.97]' : 'bg-blue-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              <Zap size={16} className={isPressed ? 'animate-pulse' : ''} /> 
              {formData.buttonLabel || 'EXECUTE'}
            </button>
          </div>
        )}

        {type === 'SliderTile' && (
          <div className="px-5 pb-5 pt-3 flex-1 flex flex-col justify-end">
            <div className="flex justify-between items-end mb-3">
              <span className="text-2xl font-extrabold text-slate-900">{sliderVal}</span>
              <span className="text-xs font-medium text-slate-400 mb-1">{unit}</span>
            </div>
            <div className="relative w-full flex items-center h-6">
              <input type="range" min={formData.min || 0} max={formData.max || 100} value={sliderVal} onChange={e => setSliderVal(Number(e.target.value))} 
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer focus:outline-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110" />
              <div className="absolute left-0 h-1.5 bg-blue-600 rounded-full pointer-events-none" style={{ width: `${((sliderVal - (formData.min || 0)) / ((formData.max || 100) - (formData.min || 0))) * 100}%` }} />
            </div>
          </div>
        )}

        {type === 'ChartTile' && (
          <div className="px-4 pb-4 pt-2 flex-1 flex flex-col cursor-default">
            <div className="px-2 mb-2 flex items-baseline gap-2"><span className="text-2xl font-extrabold text-slate-900">24.5</span><span className="text-xs font-medium text-slate-400">{unit}</span></div>
            <div className="flex-1 w-full relative overflow-hidden flex items-end">
              <svg className="w-full h-[50px]" preserveAspectRatio="none" viewBox="0 0 100 50">
                <path d="M0,50 L0,20 Q20,40 50,15 T100,5 L100,50 Z" fill="#eff6ff" />
                <path d="M0,20 Q20,40 50,15 T100,5" fill="none" stroke="#2563eb" strokeWidth="3" />
              </svg>
            </div>
          </div>
        )}

        {type === 'SelectorTile' && (
          <div className="p-5 flex-1 flex flex-col justify-center relative">
            <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer">
              {formData.options ? formData.options.split(',').map((opt: string, i: number) => <option key={i}>{opt.trim()}</option>) : <option>Select Mode...</option>}
            </select>
            <div className="absolute right-10 top-[55%] pointer-events-none text-slate-400">▼</div>
          </div>
        )}

        {type === 'TextTile' && (
          <div className="p-5 flex-1 flex flex-col justify-center items-center relative cursor-default">
            <div className="absolute top-4 left-4"><AlignLeft size={16} className="text-slate-300" /></div>
            <span className="text-lg font-bold text-slate-800 text-center px-4 truncate w-full">Sample Static Text</span>
          </div>
        )}

      </div>
    </div>
  );
};

// ==========================================
// 🚀 Main Modal Component
// ==========================================
export default function TileModal({ isOpen, onClose, editTileId }: TileModalProps) {
  const { addTile, updateTile, tiles } = useDashboardStore();

  const [selectedType, setSelectedType] = useState<TileType>('SwitchTile');
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (isOpen && editTileId) {
      const tileToEdit = tiles.find(t => t.id === editTileId);
      if (tileToEdit) {
        setSelectedType(tileToEdit.type);
        setFormData({
          title: tileToEdit.config.title || '',
          mqttTopic: tileToEdit.config.mqttTopic || '',
          commandTopic: tileToEdit.config.commandTopic || '',
          unit: tileToEdit.config.unit || '',
          pushPayload: tileToEdit.config.pushPayload || 'PUSH',
          buttonLabel: tileToEdit.config.buttonLabel || 'EXECUTE',
          payloadOn: tileToEdit.config.payloadOn || 'ON',
          payloadOff: tileToEdit.config.payloadOff || 'OFF',
          min: tileToEdit.config.min ?? 0,
          max: tileToEdit.config.max ?? 100,
          options: tileToEdit.config.options || '',
          alertMin: tileToEdit.config.alertMin?.toString() ?? '',
          alertMax: tileToEdit.config.alertMax?.toString() ?? '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const configData = {
      title: formData.title || 'Untitled',
      mqttTopic: formData.mqttTopic,
      commandTopic: formData.commandTopic || undefined,
      unit: ['SensorTile', 'SliderTile', 'ChartTile'].includes(selectedType) ? formData.unit : undefined,
      pushPayload: selectedType === 'ButtonTile' ? formData.pushPayload : undefined,
      buttonLabel: selectedType === 'ButtonTile' ? (formData.buttonLabel || 'EXECUTE') : undefined,
      payloadOn: selectedType === 'SwitchTile' ? (formData.payloadOn || 'ON') : undefined,
      payloadOff: selectedType === 'SwitchTile' ? (formData.payloadOff || 'OFF') : undefined,
      min: selectedType === 'SliderTile' ? Number(formData.min) : undefined,
      max: selectedType === 'SliderTile' ? Number(formData.max) : undefined,
      options: selectedType === 'SelectorTile' ? formData.options : undefined,
      alertMin: ['SensorTile', 'ChartTile'].includes(selectedType) && formData.alertMin !== '' ? Number(formData.alertMin) : undefined,
      alertMax: ['SensorTile', 'ChartTile'].includes(selectedType) && formData.alertMax !== '' ? Number(formData.alertMax) : undefined,
    };

    if (editTileId) updateTile(editTileId, configData); 
    else addTile(selectedType, configData);  
    
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all duration-300" onClick={handleClose}>
      <div className="bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-6xl h-[85vh] md:max-h-[85vh] flex flex-col md:flex-row relative animate-in fade-in zoom-in-[0.98] duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={handleClose} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors z-20">
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* --- Sidebar (ซ้าย) --- */}
        <div className="w-full h-[35%] md:h-full md:w-[30%] lg:w-[25%] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200/60 flex flex-col shrink-0">
          <div className="p-5 sm:p-7 pb-3 sm:pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm"><LayoutDashboard size={20} /></div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{editTileId ? 'Edit Widget' : 'New Widget'}</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Select a widget type</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 pb-6 custom-scrollbar">
            <div className="space-y-3">
              {TILE_OPTIONS.map((option) => {
                const isSelected = selectedType === option.type;
                return (
                  <button key={option.type} type="button" onClick={() => !editTileId && setSelectedType(option.type)} disabled={!!editTileId && !isSelected} 
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3 ${isSelected ? 'bg-white border-blue-600 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.15)] ring-4 ring-blue-50' : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-200/50 hover:border-slate-200/50'} ${!!editTileId && !isSelected ? 'opacity-30 cursor-not-allowed hidden md:flex' : ''}`}
                  >
                    <div className={`p-2 rounded-xl transition-colors shrink-0 ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-white shadow-sm border border-slate-200/60 text-slate-500'}`}>{option.icon}</div>
                    <div className="mt-0.5"><div className={`font-bold text-[13px] ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{option.label}</div><div className="text-[11px] text-slate-500 font-medium mt-0.5">{option.desc}</div></div>
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

            <form id="widget-form" onSubmit={handleSubmit} className="space-y-8 pb-4">
              
              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4"><Settings2 size={18} className="text-slate-400" /><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">General Configuration</h3></div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Display Name</label>
                  <input type="text" required placeholder="e.g., Temperature, Device Mode..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" />
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4"><RadioReceiver size={18} className="text-slate-400" /><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Data Binding</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">
                      {['SensorTile', 'ChartTile', 'TextTile'].includes(selectedType) ? 'Subscribe Topic (Read)' : 'Status Topic (State Read)'}
                    </label>
                    <input type="text" required placeholder="esp32/device/status" value={formData.mqttTopic} onChange={(e) => setFormData({ ...formData, mqttTopic: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm" />
                  </div>
                  {['SwitchTile', 'ButtonTile', 'SliderTile', 'SelectorTile'].includes(selectedType) && (
                    <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">Command Topic <span className="text-slate-400 font-medium ml-1">(Publish)</span></label>
                      <input type="text" placeholder="Defaults to Status Topic if left blank" value={formData.commandTopic} onChange={(e) => setFormData({ ...formData, commandTopic: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm" />
                    </div>
                  )}
                </div>
              </section>

              {!['TextTile', 'SensorTile', 'ChartTile'].includes(selectedType) && (
                <section className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4"><SlidersHorizontal size={18} className="text-slate-400" /><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Widget Properties</h3></div>
                  <div className="grid grid-cols-2 gap-5">
                    
                    {selectedType === 'SwitchTile' && (
                      <>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[13px] font-bold text-slate-700 mb-2">Payload (Turn ON) <span className="text-slate-400 font-medium ml-1">e.g., 1, true</span></label>
                          <input type="text" required placeholder="ON" value={formData.payloadOn} onChange={(e) => setFormData({ ...formData, payloadOn: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[13px] font-bold text-slate-700 mb-2">Payload (Turn OFF) <span className="text-slate-400 font-medium ml-1">e.g., 0, false</span></label>
                          <input type="text" required placeholder="OFF" value={formData.payloadOff} onChange={(e) => setFormData({ ...formData, payloadOff: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm" />
                        </div>
                      </>
                    )}

                    {selectedType === 'ButtonTile' && (
                      <>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[13px] font-bold text-slate-700 mb-2">Button Label <span className="text-slate-400 font-medium ml-1">(Display Text)</span></label>
                          <input type="text" placeholder="e.g., START GAME" value={formData.buttonLabel} onChange={(e) => setFormData({ ...formData, buttonLabel: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[13px] font-bold text-slate-700 mb-2">Payload <span className="text-slate-400 font-medium ml-1">(Data to send)</span></label>
                          <input type="text" required placeholder="e.g., 1" value={formData.pushPayload} onChange={(e) => setFormData({ ...formData, pushPayload: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm" />
                        </div>
                      </>
                    )}

                    {selectedType === 'SliderTile' && (
                      <>
                        <div className="col-span-1"><label className="block text-[13px] font-bold text-slate-700 mb-2">Min Value</label><input type="number" required value={formData.min} onChange={(e) => setFormData({ ...formData, min: Number(e.target.value) })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" /></div>
                        <div className="col-span-1"><label className="block text-[13px] font-bold text-slate-700 mb-2">Max Value</label><input type="number" required value={formData.max} onChange={(e) => setFormData({ ...formData, max: Number(e.target.value) })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" /></div>
                      </>
                    )}

                    {selectedType === 'SelectorTile' && (
                      <div className="col-span-2"><label className="block text-[13px] font-bold text-slate-700 mb-2">Dropdown Options</label><input type="text" required placeholder="Low, Medium, High" value={formData.options} onChange={(e) => setFormData({ ...formData, options: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" /></div>
                    )}
                  </div>
                </section>
              )}
              
              {['SensorTile', 'SliderTile', 'ChartTile'].includes(selectedType) && (
                <div className="col-span-2">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Unit <span className="text-slate-400 font-medium ml-1">(Optional)</span></label>
                  <input type="text" placeholder="e.g., °C, %" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                </div>
              )}

              {['SensorTile', 'ChartTile'].includes(selectedType) && (
                <section className="bg-red-50/50 border border-red-100 rounded-2xl p-5 shrink-0 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-red-100/60"><BellRing size={18} className="text-red-500" /><h3 className="text-sm font-bold text-red-700 uppercase tracking-wider">Alert Thresholds <span className="text-red-400 normal-case font-medium ml-1">(Optional)</span></h3></div>
                  <div className="grid grid-cols-2 gap-5">
                    <div><label className="block text-[13px] font-bold text-red-900 mb-2">Min Alert</label><input type="number" placeholder="e.g., 20" value={formData.alertMin} onChange={(e) => setFormData({ ...formData, alertMin: e.target.value })} className="w-full bg-white border border-red-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all" /></div>
                    <div><label className="block text-[13px] font-bold text-red-900 mb-2">Max Alert</label><input type="number" placeholder="e.g., 35" value={formData.alertMax} onChange={(e) => setFormData({ ...formData, alertMax: e.target.value })} className="w-full bg-white border border-red-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all" /></div>
                  </div>
                </section>
              )}
            </form>
          </div>

          {/* 🌟 Footer Actions */}
          <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0 z-10">
            <button type="button" onClick={handleClose} className="px-6 py-3 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-all">Cancel</button>
            <button type="submit" form="widget-form" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-bold tracking-wide shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all active:scale-[0.97]">{editTileId ? 'Save Changes' : 'Create Widget'}</button>
          </div>

        </div>
      </div>
    </div>
  );
}