import { create } from "zustand";

interface MqttDataState {
  status: "Disconnected" | "Connecting" | "Connected";
  messages: Record<string, string>;
  // 🌟 เพิ่มที่เก็บประวัติข้อมูลสำหรับทำกราฟ
  history: Record<string, { time: string; value: number }[]>;

  publish: (topic: string, message: string) => void;
  setPublishFunc: (fn: (topic: string, message: string) => void) => void;
  setStatus: (status: MqttDataState["status"]) => void;
  setMessage: (topic: string, message: string) => void;
}

export const useMqttStore = create<MqttDataState>((set) => ({
  status: "Disconnected",
  messages: {},
  history: {}, // เริ่มต้นประวัติว่างเปล่า

  publish: () => console.warn("⚠️ MQTT is not connected."),
  setPublishFunc: (fn) => set({ publish: fn }),
  setStatus: (status) => set({ status }),

  setMessage: (topic, message) =>
    set((state) => {
      // 🌟 พยายามแปลงข้อความเป็นตัวเลขเพื่อเก็บลงกราฟ
      const numValue = Number(message);
      const now = new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // ดึงประวัติเดิมมา ถ้าไม่มีให้เป็น array ว่าง
      const currentHistory = state.history[topic] || [];

      // ถ้าแปลงเป็นตัวเลขได้ ให้เพิ่มลงประวัติ (เก็บสูงสุด 20 ค่าล่าสุด ป้องกันเว็บอืด)
      const newHistory = !isNaN(numValue)
        ? [...currentHistory.slice(-19), { time: now, value: numValue }]
        : currentHistory;

      return {
        messages: { ...state.messages, [topic]: message },
        history: { ...state.history, [topic]: newHistory },
      };
    }),
}));
