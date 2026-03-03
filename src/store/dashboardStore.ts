import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Layout } from "react-grid-layout";

export type TileType =
  | "SwitchTile"
  | "SensorTile"
  | "ButtonTile"
  | "SliderTile"
  | "ChartTile"
  | "SelectorTile"
  | "TextTile";

export interface TileConfig {
  title: string;
  mqttTopic: string;
  commandTopic?: string;
  unit?: string;
  pushPayload?: string;
  buttonLabel?: string;
  payloadOn?: string;
  payloadOff?: string;
  min?: number;
  max?: number;
  options?: string;
  alertMin?: number;
  alertMax?: number;
}

export interface TileData {
  id: string;
  type: TileType;
  layout: Layout;
  config: TileConfig;
}

interface DashboardState {
  tiles: TileData[];
  addTile: (type: TileType, config: TileConfig) => void;
  updateLayouts: (newLayouts: Layout[]) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, config: TileConfig) => void;
  duplicateTile: (id: string) => void;
}

// ==========================================
// 🚀 1. ชุดควบคุมเริ่มต้นสำหรับ Game Master
// ==========================================
const INITIAL_DASHBOARD: TileData[] = [
  {
    id: "tile_status",
    type: "TextTile",
    config: {
      title: "ESP32 System Health",
      mqttTopic: "vocabgame/status",
    },
    layout: { i: "tile_status", x: 0, y: 0, w: 4, h: 2 },
  },
  {
    id: "tile_volume",
    type: "SliderTile",
    config: {
      title: "Speaker Volume",
      mqttTopic: "vocabgame/volume",
      commandTopic: "vocabgame/volume/set",
      min: 0,
      max: 100,
      unit: "%",
    },
    layout: { i: "tile_volume", x: 4, y: 0, w: 4, h: 2 },
  },
  {
    id: "tile_test_sound",
    type: "ButtonTile",
    config: {
      title: "Hardware Test",
      mqttTopic: "vocabgame/control",
      // 🌟 ส่ง JSON สั่งให้เล่นเสียงทดสอบ
      pushPayload: '{"cmd":"PLAY_SOUND","audioFile":"correct.mp3"}',
      buttonLabel: "TEST AUDIO",
    },
    layout: { i: "tile_test_sound", x: 8, y: 0, w: 4, h: 2 },
  },
  {
    id: "tile_reset",
    type: "ButtonTile",
    config: {
      title: "Emergency Control",
      mqttTopic: "vocabgame/control",
      // 🌟 ส่ง JSON สั่งให้บอร์ดรีเซ็ตตัวเอง
      pushPayload: '{"cmd":"RESET_GAME"}',
      buttonLabel: "REBOOT SYSTEM",
    },
    layout: { i: "tile_reset", x: 0, y: 2, w: 4, h: 2 },
  },
  {
    id: "tile_game_mode",
    type: "SwitchTile",
    config: {
      title: "Game Mode",
      mqttTopic: "vocabgame/mode",
      commandTopic: "vocabgame/mode/set",
      payloadOn: "AUTO",
      payloadOff: "MANUAL",
    },
    layout: { i: "tile_game_mode", x: 4, y: 2, w: 4, h: 2 },
  },
];

// ==========================================
// 🧠 2. สมองกลจัดการ Widget
// ==========================================
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      tiles: INITIAL_DASHBOARD, // 🌟 โหลดข้อมูลเริ่มต้นเข้าไป

      addTile: (type, config) =>
        set((state) => {
          const maxY = state.tiles.reduce(
            (max, tile) => Math.max(max, tile.layout.y + tile.layout.h),
            0,
          );
          const defaultW =
            type === "ChartTile" ? 4 : type === "TextTile" ? 3 : 2;
          return {
            tiles: [
              ...state.tiles,
              {
                id: `tile_${Date.now()}`,
                type,
                config,
                layout: {
                  i: `tile_${Date.now()}`,
                  x: 0,
                  y: maxY,
                  w: defaultW,
                  h: 2,
                },
              },
            ],
          };
        }),
      updateLayouts: (newLayouts) =>
        set((state) => ({
          tiles: state.tiles.map((tile) => ({
            ...tile,
            layout: newLayouts.find((l) => l.i === tile.id) || tile.layout,
          })),
        })),
      removeTile: (id) =>
        set((state) => ({ tiles: state.tiles.filter((t) => t.id !== id) })),
      updateTile: (id, config) =>
        set((state) => ({
          tiles: state.tiles.map((tile) =>
            tile.id === id ? { ...tile, config } : tile,
          ),
        })),
      duplicateTile: (id) =>
        set((state) => {
          const tileToCopy = state.tiles.find((t) => t.id === id);
          if (!tileToCopy) return state;
          const maxY = state.tiles.reduce(
            (max, tile) => Math.max(max, tile.layout.y + tile.layout.h),
            0,
          );
          const newId = `tile_${Date.now()}`;
          const newTile: TileData = {
            ...tileToCopy,
            id: newId,
            config: {
              ...tileToCopy.config,
              title: `${tileToCopy.config.title} (Copy)`,
            },
            layout: { ...tileToCopy.layout, i: newId, x: 0, y: maxY },
          };
          return { tiles: [...state.tiles, newTile] };
        }),
    }),
    {
      name: "mqtt-dashboard-vocabgame-v1", // 🌟 เปลี่ยนชื่อคีย์เพื่อให้โหลดค่าใหม่
    },
  ),
);
