import React, { useState } from 'react';
import { type TileType, useDashboardStore } from '../../store/dashboardStore';
import { Power, Activity, Zap, SlidersHorizontal, Code } from 'lucide-react';

interface AddTileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TILE_OPTIONS = [
  { type: 'SwitchTile' as TileType, label: 'Toggle Switch', icon: <Power className="text-emerald-400" />, desc: 'สวิตช์เปิด-ปิดไฟ (ON/OFF)' },
  { type: 'ButtonTile' as TileType, label: 'Push Button', icon: <Zap className="text-indigo-400" />, desc: 'ปุ่มกดจังหวะเดียว (ส่งคำสั่งทันที)' },
  { type: 'SliderTile' as TileType, label: 'Range Slider', icon: <SlidersHorizontal className="text-amber-400" />, desc: 'แถบเลื่อนปรับค่า 0-100 (PWM, หรี่ไฟ)' },
  { type: 'SensorTile' as TileType, label: 'Sensor Value', icon: <Activity className="text-blue-400" />, desc: 'แสดงค่าตัวเลข (อุณหภูมิ, ความชื้น)' },
];

export default function AddTileModal({ isOpen, onClose }: AddTileModalProps) {
  const addTile = useDashboardStore((state) => state.addTile);

  const [selectedType, setSelectedType] = useState<TileType>('SwitchTile');
  const [formData, setFormData] = useState({
    title: '', mqttTopic: '', commandTopic: '', unit: '', min: 0, max: 100,
    pushPayload: 'PUSH', payloadOn: 'ON', payloadOff: 'OFF',
    payloadType: 'raw' as 'raw' | 'json' 
  });

  const handleClose = () => {
    setFormData({ 
      title: '', mqttTopic: '', commandTopic: '', unit: '', min: 0, max: 100, 
      pushPayload: 'PUSH', payloadOn: 'ON', payloadOff: 'OFF', payloadType: 'raw' 
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTile(selectedType, {
      title: formData.title || 'New Component',
      mqttTopic: formData.mqttTopic,
      commandTopic: formData.commandTopic || undefined,
      unit: (selectedType === 'SensorTile' || selectedType === 'SliderTile') ? formData.unit : undefined,
      min: selectedType === 'SliderTile' ? Number(formData.min) : undefined,
      max: selectedType === 'SliderTile' ? Number(formData.max) : undefined,
      pushPayload: selectedType === 'ButtonTile' ? formData.pushPayload : undefined,
      payloadOn: selectedType === 'SwitchTile' ? formData.payloadOn : undefined,
      payloadOff: selectedType === 'SwitchTile' ? formData.payloadOff : undefined,
      payloadType: formData.payloadType 
    });
    handleClose();
  };

  if (!isOpen) return null;

  // ตรวจสอบว่าเป็น Widget ที่สามารถส่งข้อมูลได้หรือไม่
  const canPublish = ['SwitchTile', 'ButtonTile', 'SliderTile', 'SelectorTile'].includes(selectedType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* เมนูซ้าย */}
        <div className="w-full md:w-5/12 bg-slate-800/50 p-6 border-r border-slate-700 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Select Widget</h2>
          <div className="grid grid-cols-1 gap-3">
            {TILE_OPTIONS.map((option) => (
              <button
                key={option.type} type="button" onClick={() => setSelectedType(option.type)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                  selectedType === option.type ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <div className="p-2 bg-slate-900 rounded-lg">{option.icon}</div>
                <div>
                  <div className={`font-semibold ${selectedType === option.type ? 'text-indigo-400' : 'text-slate-300'}`}>{option.label}</div>
                  <div className="text-xs mt-1 text-slate-500">{option.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ฟอร์มขวา */}
        <div className="w-full md:w-7/12 p-6 flex flex-col overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold text-white mb-6">Configuration</h2>
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
              <input type="text" required placeholder="เช่น ไฟหน้าบ้าน, เปิดประตู" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {selectedType === 'SensorTile' ? 'MQTT Topic (Subscribe)' : 'Status Topic (รับสถานะปัจจุบัน)'}
              </label>
              <input type="text" required placeholder="เช่น esp32/device/..." value={formData.mqttTopic} onChange={(e) => setFormData({ ...formData, mqttTopic: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm" />
            </div>

            {canPublish && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-sm font-medium text-slate-400 mb-1">Command Topic (ส่งคำสั่ง) <span className="text-slate-500 font-normal">- Optional</span></label>
                <input type="text" placeholder="ถ้าไม่ระบุ จะส่งไปที่ Status Topic ด้านบนแทน" value={formData.commandTopic} onChange={(e) => setFormData({ ...formData, commandTopic: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm" />
              </div>
            )}

            {/* 🌟 Payload Format (Chip) แสดงให้ทุก Widget ที่ส่งคำสั่งได้ */}
            {canPublish && (
              <div className="animate-in fade-in duration-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mt-2">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Code size={16} className="text-indigo-400" /> Payload Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['raw', 'json'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, payloadType: type })}
                      className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                        formData.payloadType === type 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-500'
                      }`}
                    >
                      {type} String
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🌟 Textarea สำหรับใส่ Payload (แสดงเฉพาะ Button กับ Switch) */}
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              
              {selectedType === 'ButtonTile' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Payload Data</label>
                  <textarea 
                    required 
                    rows={4}
                    placeholder={formData.payloadType === 'json' ? '{\n  "cmd": "start",\n  "value": 1\n}' : 'PUSH'}
                    value={formData.pushPayload} 
                    onChange={(e) => setFormData({ ...formData, pushPayload: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-indigo-500 resize-y" 
                  />
                </div>
              )}

              {selectedType === 'SwitchTile' && (
                <>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Payload (Turn ON)</label>
                    <textarea 
                      required 
                      rows={4}
                      placeholder={formData.payloadType === 'json' ? '{"status": "ON"}' : 'ON'}
                      value={formData.payloadOn} 
                      onChange={(e) => setFormData({ ...formData, payloadOn: e.target.value })} 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-indigo-500 resize-y" 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Payload (Turn OFF)</label>
                    <textarea 
                      required 
                      rows={4}
                      placeholder={formData.payloadType === 'json' ? '{"status": "OFF"}' : 'OFF'}
                      value={formData.payloadOff} 
                      onChange={(e) => setFormData({ ...formData, payloadOff: e.target.value })} 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-red-400 font-mono text-sm focus:outline-none focus:border-indigo-500 resize-y" 
                    />
                  </div>
                </>
              )}

              {selectedType === 'SliderTile' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Min Value</label>
                    <input type="number" required value={formData.min} onChange={(e) => setFormData({ ...formData, min: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Max Value</label>
                    <input type="number" required value={formData.max} onChange={(e) => setFormData({ ...formData, max: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </>
              )}

              {['SensorTile', 'SliderTile'].includes(selectedType) && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Unit (หน่วย)</label>
                  <input type="text" placeholder="เช่น °C, %, PWM" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-800 sticky bottom-0 bg-slate-900">
              <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/20 transition-colors">Add Widget</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}