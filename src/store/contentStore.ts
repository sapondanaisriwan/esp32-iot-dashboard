import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VocabItem {
  id: string;
  word: string;
  lesson: string;
  ascii: string;
  choices: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
}

interface ContentState {
  vocabs: VocabItem[];
  addVocab: (vocab: Omit<VocabItem, "id">) => void;
  updateVocab: (id: string, vocab: Omit<VocabItem, "id">) => void;
  deleteVocab: (id: string) => void;
}

// ข้อมูลเริ่มต้นให้มีติดระบบไว้เทส
const INITIAL_DATA: VocabItem[] = [
  {
    id: "1",
    word: "CAT",
    lesson: "Animals (Basic)",
    ascii: " /\\_/\\\n( o.o )\n > ^ <",
    choices: { A: "Cat", B: "Dog", C: "Rat", D: "Bat" },
    correct: "A",
  },
  {
    id: "2",
    word: "HOUSE",
    lesson: "Daily Life",
    ascii: "  /\\ \n /  \\ \n/____\\\n|    |\n| [] |\n------",
    choices: { A: "Car", B: "Tree", C: "House", D: "School" },
    correct: "C",
  },
];

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
        set((state) => ({
          vocabs: state.vocabs.filter((v) => v.id !== id),
        })),
    }),
    { name: "vocab-content-storage" }, // บันทึกลง LocalStorage อัตโนมัติ
  ),
);
