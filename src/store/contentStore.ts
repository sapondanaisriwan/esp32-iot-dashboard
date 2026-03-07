import { INITIAL_DATA } from './../../config/vocab';
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VocabItem {
  id: string;
  word: string;
  lesson: string;
  ascii: string;
  audioFile?: string;
  choices: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
}

interface ContentState {
  vocabs: VocabItem[];
  addVocab: (vocab: Omit<VocabItem, "id">) => void;
  updateVocab: (id: string, vocab: Omit<VocabItem, "id">) => void;
  deleteVocab: (id: string) => void;
  renameLesson: (oldName: string, newName: string) => void;
  deleteLesson: (lessonName: string) => void; // 🌟 เพิ่มฟังก์ชันลบหมวดหมู่
}


export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      vocabs: INITIAL_DATA,
      addVocab: (vocab) =>
        set((state) => ({
          vocabs: [...state.vocabs, { ...vocab, id: `vocab_${Date.now()}` }],
        })),
      updateVocab: (id, updatedVocab) =>
        set((state) => ({
          vocabs: state.vocabs.map((v) =>
            v.id === id ? { ...updatedVocab, id } : v,
          ),
        })),
      deleteVocab: (id) =>
        set((state) => ({ vocabs: state.vocabs.filter((v) => v.id !== id) })),
      renameLesson: (oldName, newName) =>
        set((state) => ({
          vocabs: state.vocabs.map((v) =>
            v.lesson === oldName ? { ...v, lesson: newName } : v,
          ),
        })),
      // 🌟 สั่งกรองคำศัพท์ เอาเฉพาะคำที่ "ไม่ได้อยู่ในหมวดหมู่ที่ถูกลบ" เก็บไว้
      deleteLesson: (lessonName) =>
        set((state) => ({
          vocabs: state.vocabs.filter((v) => v.lesson !== lessonName),
        })),
    }),
    { name: "vocab-content-storage-v2" },
  ),
);
