import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Layout } from 'react-grid-layout';

export type TileType = 'SwitchTile' | 'SensorTile' | 'ButtonTile' | 'SliderTile' | 'ChartTile' | 'SelectorTile' | 'TextTile';

export interface TileConfig {
  title: string;
  mqttTopic: string;
  commandTopic?: string; 
  unit?: string;
  pushPayload?: string; 
  buttonLabel?: string; 
  payloadOn?: string;  // 🌟 เพิ่ม Payload สำหรับสถานะเปิด
  payloadOff?: string; // 🌟 เพิ่ม Payload สำหรับสถานะปิด
  min?: number;         
  max?: number; 
  options?: string;
  alertMin?: number;
  alertMax?: number;
}

export interface TileData {
  id: string; type: TileType; layout: Layout; config: TileConfig;
}

interface DashboardState {
  tiles: TileData[];
  addTile: (type: TileType, config: TileConfig) => void;
  updateLayouts: (newLayouts: Layout[]) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, config: TileConfig) => void; 
  duplicateTile: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      tiles: [],
      addTile: (type, config) => set((state) => {
        const maxY = state.tiles.reduce((max, tile) => Math.max(max, tile.layout.y + tile.layout.h), 0);
        const defaultW = type === 'ChartTile' ? 4 : (type === 'TextTile' ? 3 : 2);
        return { tiles: [...state.tiles, { id: `tile_${Date.now()}`, type, config, layout: { i: `tile_${Date.now()}`, x: 0, y: maxY, w: defaultW, h: 2 } }] };
      }),
      updateLayouts: (newLayouts) => set((state) => ({
        tiles: state.tiles.map((tile) => ({ ...tile, layout: newLayouts.find((l) => l.i === tile.id) || tile.layout }))
      })),
      removeTile: (id) => set((state) => ({ tiles: state.tiles.filter((t) => t.id !== id) })),
      updateTile: (id, config) => set((state) => ({ tiles: state.tiles.map((tile) => tile.id === id ? { ...tile, config } : tile) })),
      duplicateTile: (id) => set((state) => {
        const tileToCopy = state.tiles.find(t => t.id === id);
        if (!tileToCopy) return state;
        const maxY = state.tiles.reduce((max, tile) => Math.max(max, tile.layout.y + tile.layout.h), 0);
        const newId = `tile_${Date.now()}`;
        const newTile: TileData = {
          ...tileToCopy, id: newId,
          config: { ...tileToCopy.config, title: `${tileToCopy.config.title} (Copy)` },
          layout: { ...tileToCopy.layout, i: newId, x: 0, y: maxY }
        };
        return { tiles: [...state.tiles, newTile] };
      }),
    }),
    { name: 'mqtt-dashboard-storage' }
  )
);