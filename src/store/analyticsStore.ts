import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameTelemetry {
  wordId: string;
  word: string;
  isCorrect: boolean;
  responseTime: number;
}

interface WordStat {
  word: string;
  attempts: number;
  errors: number;
  errorRate: number;
}

interface TrendPoint {
  round: string;
  accuracy: number;
  responseTime: number;
}

interface AnalyticsState {
  totalGames: number;
  correctAnswers: number;
  accuracy: number;
  avgResponseTime: number;
  currentStreak: number;
  trendData: TrendPoint[];
  wordStats: Record<string, WordStat>;
  processTelemetry: (data: GameTelemetry) => void;
  resetStats: () => void;
}

// ==========================================
// 📊 1. ชุดข้อมูลจำลอง (Mock Data) สำหรับพรีเซนต์
// ==========================================
const MOCK_TREND_DATA: TrendPoint[] = [
  { round: 'Q1', accuracy: 100, responseTime: 5.2 },
  { round: 'Q2', accuracy: 50, responseTime: 6.8 },
  { round: 'Q3', accuracy: 66.7, responseTime: 5.5 },
  { round: 'Q4', accuracy: 75, responseTime: 4.1 },
  { round: 'Q5', accuracy: 60, responseTime: 8.4 },
  { round: 'Q6', accuracy: 66.7, responseTime: 4.8 },
  { round: 'Q7', accuracy: 71.4, responseTime: 3.9 },
  { round: 'Q8', accuracy: 75, responseTime: 3.2 },
  { round: 'Q9', accuracy: 77.8, responseTime: 2.8 },
  { round: 'Q10', accuracy: 80, responseTime: 2.5 },
  { round: 'Q11', accuracy: 72.7, responseTime: 6.5 },
  { round: 'Q12', accuracy: 75, responseTime: 3.6 },
  { round: 'Q13', accuracy: 76.9, responseTime: 3.1 },
  { round: 'Q14', accuracy: 78.6, responseTime: 2.9 },
  { round: 'Q15', accuracy: 80, responseTime: 2.4 },
  { round: 'Q16', accuracy: 81.3, responseTime: 2.1 },
  { round: 'Q17', accuracy: 76.5, responseTime: 5.5 },
  { round: 'Q18', accuracy: 77.8, responseTime: 3.8 },
  { round: 'Q19', accuracy: 78.9, responseTime: 3.2 },
  { round: 'Q20', accuracy: 80, responseTime: 2.6 },
];

const MOCK_WORD_STATS: Record<string, WordStat> = {
  "CHAMELEON": { word: "CHAMELEON", attempts: 14, errors: 9, errorRate: 64 },
  "HIPPOPOTAMUS": { word: "HIPPOPOTAMUS", attempts: 10, errors: 6, errorRate: 60 },
  "SQUIRREL": { word: "SQUIRREL", attempts: 18, errors: 8, errorRate: 44 },
  "KANGAROO": { word: "KANGAROO", attempts: 15, errors: 5, errorRate: 33 },
  "ELEPHANT": { word: "ELEPHANT", attempts: 22, errors: 4, errorRate: 18 },
};

// ==========================================
// 🧠 2. สมองกลจัดการสถิติ
// ==========================================
export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      // 🌟 โหลด Mock Data เป็นค่าเริ่มต้น
      totalGames: 20,
      correctAnswers: 16,
      accuracy: 80.0,
      avgResponseTime: 3.8,
      currentStreak: 4,
      trendData: MOCK_TREND_DATA,
      wordStats: MOCK_WORD_STATS,

      processTelemetry: (data) => set((state) => {
        const newTotal = state.totalGames + 1;
        const newCorrect = state.correctAnswers + (data.isCorrect ? 1 : 0);
        const newAccuracy = Number(((newCorrect / newTotal) * 100).toFixed(1));
        
        const newAvgTime = Number((((state.avgResponseTime * state.totalGames) + data.responseTime) / newTotal).toFixed(1));
        const newStreak = data.isCorrect ? state.currentStreak + 1 : 0;

        const currentWordStat = state.wordStats[data.word] || { word: data.word, attempts: 0, errors: 0, errorRate: 0 };
        const newWordAttempts = currentWordStat.attempts + 1;
        const newWordErrors = currentWordStat.errors + (data.isCorrect ? 0 : 1);
        const updatedWordStats = {
          ...state.wordStats,
          [data.word]: {
            word: data.word,
            attempts: newWordAttempts,
            errors: newWordErrors,
            errorRate: Number(((newWordErrors / newWordAttempts) * 100).toFixed(0))
          }
        };

        const newTrendPoint = {
          round: `Q${newTotal}`,
          accuracy: newAccuracy,
          responseTime: data.responseTime
        };
        const newTrendData = [...state.trendData, newTrendPoint].slice(-20); 

        return {
          totalGames: newTotal,
          correctAnswers: newCorrect,
          accuracy: newAccuracy,
          avgResponseTime: newAvgTime,
          currentStreak: newStreak,
          wordStats: updatedWordStats,
          trendData: newTrendData
        };
      }),

      // 🌟 กดปุ่ม Reset เมื่อไหร่ จะล้างค่าให้กลับเป็น 0 ทันที (พร้อมใช้งานจริง)
      resetStats: () => set({
        totalGames: 0, correctAnswers: 0, accuracy: 0, avgResponseTime: 0, currentStreak: 0, trendData: [], wordStats: {}
      })
    }),
    { 
      // 🌟 เปลี่ยนชื่อไฟล์เซฟ เพื่อบังคับให้โหลด Mock Data ชุดใหม่แทนที่ของเดิม
      name: 'gameplay-analytics-mock-v1' 
    }
  )
);