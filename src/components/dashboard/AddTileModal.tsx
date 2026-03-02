import React, { useState } from 'react';
import { type TileType, useDashboardStore } from '../../store/dashboardStore';
import { Power, Activity, Zap, SlidersHorizontal } from 'lucide-react';

interface AddTileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 🌟 เพิ่มตัวเลือกให้เมนู
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
    title: '', mqttTopic: '', commandTopic: '', unit: '', pushPayload: 'PUSH', min: 0, max: 100
  });

  const handleClose = () => {
    setFormData({ title: '', mqttTopic: '', commandTopic: '', unit: '', pushPayload: 'PUSH', min: 0, max: 100 });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTile(selectedType, {
      title: formData.title || 'New Component',
      mqttTopic: formData.mqttTopic,
      commandTopic: formData.commandTopic || undefined,
      unit: (selectedType === 'SensorTile' || selectedType === 'SliderTile') ? formData.unit : undefined,
      pushPayload: selectedType === 'ButtonTile' ? formData.pushPayload : undefined,
      min: selectedType === 'SliderTile' ? Number(formData.min) : undefined,
      max: selectedType === 'SliderTile' ? Number(formData.max) : undefined,
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
        
        {/* เมนูซ้าย */}
        <div className="w-full md:w-5/12 bg-slate-800/50 p-6 border-r border-slate-700 h-full overflow-y-auto">
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
        <div className="w-full md:w-7/12 p-6 flex flex-col h-full overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-6">Configuration</h2>
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
            
            {/* 1. ชื่อ */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
              <input type="text" required placeholder="เช่น ไฟหน้าบ้าน, เปิดประตู" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            {/* 2. Topic หลัก */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {selectedType === 'SensorTile' ? 'MQTT Topic (Subscribe)' : 'Status Topic (รับสถานะปัจจุบัน)'}
              </label>
              <input type="text" required placeholder="เช่น esp32/device/..." value={formData.mqttTopic} onChange={(e) => setFormData({ ...formData, mqttTopic: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            {/* 3. Command Topic (สำหรับตัวที่ส่งคำสั่งได้) */}
            {['SwitchTile', 'ButtonTile', 'SliderTile'].includes(selectedType) && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-sm font-medium text-slate-400 mb-1">Command Topic (ส่งคำสั่ง) <span className="text-slate-500 font-normal">- Optional</span></label>
                <input type="text" placeholder="ถ้าไม่ระบุ จะส่งไปที่ Status Topic ด้านบนแทน" value={formData.commandTopic} onChange={(e) => setFormData({ ...formData, commandTopic: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
              </div>
            )}

            {/* 4. การตั้งค่าเฉพาะตัว (Dynamic Fields) */}
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              
              {selectedType === 'ButtonTile' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Payload (ข้อความที่จะส่งเมื่อกดปุ่ม)</label>
                  <input type="text" required value={formData.pushPayload} onChange={(e) => setFormData({ ...formData, pushPayload: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                </div>
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

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-600/20">Add Widget</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}