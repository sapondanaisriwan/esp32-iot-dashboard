import { useEffect, useRef } from "react";
import mqtt, { type MqttClient } from "mqtt";
import { useMqttStore } from "../store/mqttDataStore";

// ⚠️ อย่าลืมเปลี่ยน IP ตรงนี้ให้เป็น IP ของเครื่องคอมพิวเตอร์คุณเอง
// และเช็คว่า Broker ของคุณเปิด Port 8083 สำหรับ WebSocket หรือยัง
// const BROKER_URL = "ws://10.120.34.135:8083/mqtt";
const BROKER_URL = "ws://localhost:8083/mqtt";

export const useMqtt = () => {
  const clientRef = useRef<MqttClient | null>(null);

  // ดึงฟังก์ชันสำหรับอัปเดตกระดานดำ (Store)
  const setStatus = useMqttStore((state) => state.setStatus);
  const setMessage = useMqttStore((state) => state.setMessage);
  const setPublishFunc = useMqttStore((state) => state.setPublishFunc);

  useEffect(() => {
    setStatus("Connecting");

    // ตั้งค่าการเชื่อมต่อ
    const client = mqtt.connect(BROKER_URL, {
      clientId: `dashboard_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 3000, // ถ้าหลุด ให้พยายามต่อใหม่ทุกๆ 3 วินาที
      connectTimeout: 5000,
    });

    clientRef.current = client;

    // --- 1. เมื่อเชื่อมต่อสำเร็จ ---
    client.on("connect", () => {
      console.log("✅ MQTT Connected to", BROKER_URL);
      setStatus("Connected");

      // Subscribe รับข้อมูลทุก Topic ภายใต้ esp32/
      // (ถ้าคุณใช้ชื่ออื่น เช่น home/ ให้เปลี่ยนตรงนี้นะครับ)
      client.subscribe("#", (err) => {
        if (!err) {
          console.log("📡 Subscribed to esp32/#");
        } else {
          console.error("❌ Subscription error:", err);
        }
      });

      // เอาฟังก์ชัน publish ไปฝากไว้ที่ Store ให้ปุ่มต่างๆ เรียกใช้
      setPublishFunc((topic: string, message: string) => {
        if (client.connected) {
          client.publish(topic, message);
          console.log(`📤 Published: [${topic}] ${message}`);
        } else {
          console.warn("⚠️ Cannot publish: MQTT not connected");
        }
      });
    });

    // --- 2. เมื่อได้รับข้อความจาก ESP32 ---
    client.on("message", (topic, message) => {
      const payload = message.toString();
      // console.log(`📥 Received: [${topic}] ${payload}`); // เปิดคอมเมนต์บรรทัดนี้ได้ถ้าอยากดู Log

      // อัปเดตค่าลง Store (เดี๋ยว UI จะขยับตามเองอัตโนมัติ)
      setMessage(topic, payload);
    });

    // --- 3. ดักจับสถานะอื่นๆ ---
    client.on("reconnect", () => {
      console.log("🔄 MQTT Reconnecting...");
      setStatus("Connecting");
    });

    client.on("close", () => {
      console.log("🔌 MQTT Disconnected");
      setStatus("Disconnected");
    });

    client.on("error", (err) => {
      console.error("❌ MQTT Error:", err);
      setStatus("Disconnected");
    });

    // Cleanup: ปิดการเชื่อมต่อเมื่อปิดหน้าเว็บ
    return () => {
      if (clientRef.current) {
        console.log("🛑 Closing MQTT connection");
        clientRef.current.end();
      }
    };
  }, []); // Run ครั้งเดียวตอน Component Mount
};
