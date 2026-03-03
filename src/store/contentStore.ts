import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VocabItem {
  id: string;
  word: string;
  lesson: string;
  ascii: string;
  audioFile?: string; 
  choices: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
}

interface ContentState {
  vocabs: VocabItem[];
  addVocab: (vocab: Omit<VocabItem, 'id'>) => void;
  updateVocab: (id: string, vocab: Omit<VocabItem, 'id'>) => void;
  deleteVocab: (id: string) => void;
  renameLesson: (oldName: string, newName: string) => void;
  deleteLesson: (lessonName: string) => void; // 🌟 เพิ่มฟังก์ชันลบหมวดหมู่
}

const INITIAL_DATA: VocabItem[] = [
  { id: '1', word: 'CAT', lesson: 'Animals', ascii: ' /\\_/\\\n( o.o )\n > ^ <', audioFile: 'cat.mp3', choices: { A: 'Cat', B: 'Dog', C: 'Rat', D: 'Bat' }, correct: 'A' },
  { id: '2', word: 'HOUSE', lesson: 'Daily Life', ascii: '  /\\ \n /  \\ \n/____\\\n|    |\n| [] |\n------', audioFile: 'house.mp3', choices: { A: 'Car', B: 'Tree', C: 'House', D: 'School' }, correct: 'C' },
  { id: '3', word: 'TABLE', lesson: 'Daily Life', ascii: '  ======\n   |  | \n   |  | \n  _|_ _|_', audioFile: 'table.mp3', choices: { A: 'Chair', B: 'Table', C: 'Bed', D: 'Desk' }, correct: 'B' },
  { id: '4', word: 'CHAIR', lesson: 'Daily Life', ascii: '   | \n   |--+\n   |  |\n  -+- -+-', audioFile: 'chair.mp3', choices: { A: 'Table', B: 'Sofa', C: 'Stool', D: 'Chair' }, correct: 'D' },
  { id: '5', word: 'BED', lesson: 'Daily Life', ascii: ' |---|\n |___|\n |   |\n |   |', audioFile: 'bed.mp3', choices: { A: 'Bed', B: 'Sofa', C: 'Table', D: 'Rug' }, correct: 'A' },
  { id: '6', word: 'CLOCK', lesson: 'Daily Life', ascii: '  (--) \n ( 12 )\n (  . )\n (  6 )', audioFile: 'clock.mp3', choices: { A: 'Watch', B: 'Clock', C: 'Time', D: 'Alarm' }, correct: 'B' },
  { id: '7', word: 'SHIRT', lesson: 'Daily Life', ascii: '  /---\\\n  |   |\n  |   |\n  |___|', audioFile: 'shirt.mp3', choices: { A: 'Pants', B: 'Shoes', C: 'Shirt', D: 'Hat' }, correct: 'C' }
];

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      vocabs: INITIAL_DATA,
      addVocab: (vocab) => set((state) => ({ vocabs: [...state.vocabs, { ...vocab, id: `vocab_${Date.now()}` }] })),
      updateVocab: (id, updatedVocab) => set((state) => ({ vocabs: state.vocabs.map((v) => (v.id === id ? { ...updatedVocab, id } : v)) })),
      deleteVocab: (id) => set((state) => ({ vocabs: state.vocabs.filter((v) => v.id !== id) })),
      renameLesson: (oldName, newName) => set((state) => ({ vocabs: state.vocabs.map((v) => (v.lesson === oldName ? { ...v, lesson: newName } : v)) })),
      // 🌟 สั่งกรองคำศัพท์ เอาเฉพาะคำที่ "ไม่ได้อยู่ในหมวดหมู่ที่ถูกลบ" เก็บไว้
      deleteLesson: (lessonName) => set((state) => ({ vocabs: state.vocabs.filter((v) => v.lesson !== lessonName) })),
    }),
    { name: 'vocab-content-storage-v2' } 
  )
);