import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  CheckCircle2,
  MonitorPlay,
  Save,
  X,
  FileAudio,
  PlayCircle,
  Folder,
  ArrowLeft,
  FolderPlus,
  Edit3,
  Shuffle,
  ListOrdered
} from "lucide-react";
import { useContentStore, type VocabItem } from "../../store/contentStore";
import { useMqttStore } from "../../store/mqttDataStore";

const EMPTY_VOCAB: Omit<VocabItem, "id"> = {
  word: "",
  lesson: "",
  ascii: "",
  audioFile: "",
  choices: { A: "", B: "", C: "", D: "" },
  correct: "A",
};

export default function ContentManager() {
  const {
    vocabs,
    addVocab,
    updateVocab,
    deleteVocab,
    renameLesson,
    deleteLesson,
  } = useContentStore();
  const publish = useMqttStore((state) => state.publish);

  const [isRandom, setIsRandom] = useState(false);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // States สำหรับ Word Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<VocabItem, "id">>(EMPTY_VOCAB);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // States สำหรับ Lesson Modal
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonModalType, setLessonModalType] = useState<"create" | "edit">(
    "create",
  );
  const [targetLessonName, setTargetLessonName] = useState("");
  const [lessonInputName, setLessonInputName] = useState("");

  // ==========================================
  // 🗂️ LOGIC: หมวดหมู่
  // ==========================================
  const lessonStats = useMemo(() => {
    const stats = new Map<string, number>();
    vocabs.forEach((v) => {
      const lessonName = v.lesson || "Uncategorized";
      stats.set(lessonName, (stats.get(lessonName) || 0) + 1);
    });
    return Array.from(stats.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [vocabs]);

  const availableLessonsForDropdown = Array.from(
    new Set([
      ...lessonStats.map((l) => l.name),
      ...(activeLesson && activeLesson !== "Uncategorized"
        ? [activeLesson]
        : []),
    ]),
  );

  const openCreateLessonModal = () => {
    setLessonModalType("create");
    setLessonInputName("");
    setIsLessonModalOpen(true);
  };

  const openEditLessonModal = (oldName: string) => {
    setLessonModalType("edit");
    setTargetLessonName(oldName);
    setLessonInputName(oldName);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = () => {
    const newName = lessonInputName.trim();
    if (!newName) {
      alert("Please enter a category name.");
      return;
    }

    if (lessonModalType === "create") {
      setActiveLesson(newName);
    } else if (lessonModalType === "edit") {
      renameLesson(targetLessonName, newName);
      if (activeLesson === targetLessonName) setActiveLesson(newName);
    }
    setIsLessonModalOpen(false);
  };

  const handleDeleteLessonDirect = (name: string) => {
    const wordsCount = vocabs.filter((v) => v.lesson === name).length;
    const confirmMessage = `Are you sure you want to delete the folder "${name}"?\n\nThis will permanently delete ${wordsCount} word(s) inside it.`;

    if (window.confirm(confirmMessage)) {
      deleteLesson(name);
      if (activeLesson === name) setActiveLesson(null);
      setIsLessonModalOpen(false);
    }
  };

  // ==========================================
  // 📝 LOGIC: คำศัพท์
  // ==========================================
  const currentLessonVocabs = vocabs.filter((v) => {
    const isMatchLesson =
      activeLesson === "Uncategorized" ? !v.lesson : v.lesson === activeLesson;
    const isMatchSearch = v.word
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return isMatchLesson && isMatchSearch;
  });

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_VOCAB,
      lesson: activeLesson !== "Uncategorized" ? activeLesson || "" : "",
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (vocab: VocabItem) => {
    setEditingId(vocab.id);
    setFormData({
      word: vocab.word,
      lesson: vocab.lesson,
      ascii: vocab.ascii,
      audioFile: vocab.audioFile || "",
      choices: { ...vocab.choices },
      correct: vocab.correct,
    });
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this word?")) {
      deleteVocab(id);
    }
  };

  const handleSave = () => {
    if (!formData.word.trim()) {
      alert("Please enter a vocabulary word.");
      return;
    }
    if (!formData.lesson.trim()) {
      alert("Please select a lesson category.");
      return;
    }
    if (editingId) updateVocab(editingId, formData);
    else addVocab(formData);
    setIsEditorOpen(false);
  };

  const handleStartGame = () => {
    if (currentLessonVocabs.length === 0) {
      alert("ไม่มีคำศัพท์ในหมวดนี้ กรุณาเพิ่มคำศัพท์ก่อนเริ่มเกมครับ");
      return;
    }

    const shuffled = [...currentLessonVocabs].sort(() => 0.5 - Math.random());
    const selectedWords = isRandom
      ? shuffled.slice(0, 10)
      : currentLessonVocabs.slice(0, 10);
    const payload = {
      cmd: "START_GAME",
      total: selectedWords.length,
      questions: selectedWords.map((v) => ({
        wordId: v.id,
        word: v.word,
        ascii: v.ascii,
        audioFile: v.audioFile,
        choices: v.choices,
        correct: v.correct,
      })),
    };
    console.log(JSON.stringify(payload));
    publish("vocabgame/control", JSON.stringify(payload));
    alert(
      `ส่งโจทย์ ${selectedWords.length} ข้อในหมวด "${activeLesson}" ไปยังตู้เกมแล้ว!`,
    );
  };

  const handlePlaySingleWord = (vocab: VocabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    publish(
      "vocabgame/control",
      JSON.stringify({
        cmd: "START_ROUND",
        data: {
          wordId: vocab.id,
          word: vocab.word,
          ascii: vocab.ascii,
          audioFile: vocab.audioFile,
          choices: vocab.choices,
          correct: vocab.correct,
        },
      }),
    );
    setPlayingId(vocab.id);
    setTimeout(() => setPlayingId(null), 1000);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 animate-in fade-in duration-300 relative">
      {/* ========================================== */}
      {/* 🚀 MODALS */}
      {/* ========================================== */}

      {/* 1. Modal จัดการหมวดหมู่ */}
      {isLessonModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsLessonModalOpen(false)}
        >
          <div
            className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FolderPlus size={20} className="text-indigo-600" />
                {lessonModalType === "create"
                  ? "New Category"
                  : "Rename Category"}
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-[13px] font-bold text-slate-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g., Animals, Fruits, Verbs..."
                value={lessonInputName}
                onChange={(e) => setLessonInputName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveLesson()}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-200/60 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[14px] font-bold shadow-md active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal จัดการคำศัพท์ (Word Editor) */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            className="bg-white rounded-[24px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 size={18} className="text-blue-600" />{" "}
                {editingId ? "Edit Vocabulary" : "Create New Word"}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                    Vocabulary Word
                  </label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        word: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                    Lesson / Category
                  </label>
                  <select
                    value={formData.lesson}
                    onChange={(e) =>
                      setFormData({ ...formData, lesson: e.target.value })
                    }
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700"
                  >
                    <option value="" disabled>
                      Select a category...
                    </option>
                    {availableLessonsForDropdown.map((lessonName) => (
                      <option key={lessonName} value={lessonName}>
                        {lessonName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-indigo-700 mb-1.5">
                    Audio (SD Card)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g., word.mp3"
                      value={formData.audioFile || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, audioFile: e.target.value })
                      }
                      className="w-full bg-indigo-50/50 border border-indigo-200 text-indigo-900 rounded-xl pl-4 pr-10 py-2.5 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                    <FileAudio
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="block text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                    <MonitorPlay size={16} /> ASCII Art (For 8 LCDs)
                  </label>
                </div>
                <textarea
                  rows={6}
                  value={formData.ascii}
                  onChange={(e) =>
                    setFormData({ ...formData, ascii: e.target.value })
                  }
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-sm leading-relaxed border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-inner resize-none whitespace-pre"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">
                  Quiz Choices (For 4 LCDs)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <div
                      key={opt}
                      className={`relative rounded-xl border-2 transition-all p-1 flex items-center gap-2 ${formData.correct === opt ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-white"}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, correct: opt })
                        }
                        className={`w-10 h-10 shrink-0 rounded-lg font-extrabold flex items-center justify-center transition-colors ${formData.correct === opt ? "bg-emerald-500 text-white shadow-md" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                      >
                        {formData.correct === opt ? (
                          <CheckCircle2 size={20} strokeWidth={3} />
                        ) : (
                          opt
                        )}
                      </button>
                      <input
                        type="text"
                        value={formData.choices[opt]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            choices: {
                              ...formData.choices,
                              [opt]: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-transparent border-none focus:outline-none font-bold text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-200/60 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[14px] font-bold shadow-md active:scale-95 transition-all"
              >
                <Save size={16} /> Save Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🖼️ RENDER VIEW 1: หน้าเลือกหมวดหมู่ */}
      {/* ========================================== */}
      {!activeLesson ? (
        <div className="animate-in fade-in duration-300">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen size={32} className="text-blue-600" /> Vocabulary
              Library
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              Select a lesson category to manage words or start a game.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <button
              onClick={openCreateLessonModal}
              className="flex flex-col items-center justify-center h-40 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-[24px] hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 group-hover:scale-110 transition-transform mb-3">
                <FolderPlus size={24} />
              </div>
              <span className="font-bold text-blue-700 tracking-wide">
                New Lesson
              </span>
            </button>

            {lessonStats.map((lesson) => (
              <div
                key={lesson.name}
                onClick={() => setActiveLesson(lesson.name)}
                className="relative flex flex-col items-start justify-between h-40 bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all text-left group cursor-pointer"
              >
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditLessonModal(lesson.name);
                    }}
                    className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                    title="Edit Category"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLessonDirect(lesson.name);
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    title="Delete Category"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Folder
                    size={24}
                    fill="currentColor"
                    className="opacity-20 absolute"
                  />
                  <Folder size={24} className="relative z-10" />
                </div>
                <div className="w-full pr-4">
                  <h3 className="font-extrabold text-slate-900 text-lg line-clamp-1">
                    {lesson.name}
                  </h3>
                  <p className="text-slate-400 font-medium text-sm mt-0.5">
                    {lesson.count} {lesson.count === 1 ? "word" : "words"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================== */
        /* 🖼️ RENDER VIEW 2: หน้าตารางคำศัพท์ */
        /* ========================================== */
        <div className="animate-in slide-in-from-right-8 duration-300">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
            <div>
              <button
                onClick={() => setActiveLesson(null)}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-blue-600 mb-2 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Library
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Folder
                    size={24}
                    className="text-indigo-500"
                    fill="currentColor"
                    fillOpacity={0.2}
                  />{" "}
                  {activeLesson}
                </h2>
                <button
                  onClick={() => openEditLessonModal(activeLesson)}
                  className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Category"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap w-full xl:w-auto items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search in this lesson..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200/80 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium shadow-sm"
                />
              </div>

              {/* 🌟 ชุด Control สไตล์ Modern (Toggle + Play Button) */}
              <div className="flex items-center gap-2 p-1.5 pl-4 bg-white rounded-[16px] border border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex-1 sm:flex-none justify-between sm:justify-start">
                
                {/* ปุ่ม Toggle Switch แบบใหม่ */}
                <label className="flex items-center gap-3 cursor-pointer group mr-2">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isRandom}
                      onChange={(e) => setIsRandom(e.target.checked)}
                    />
                    {/* พื้นหลัง Toggle */}
                    <div className={`w-[44px] h-6 rounded-full transition-all duration-300 ease-in-out shadow-inner ${isRandom ? "bg-indigo-500" : "bg-slate-200 group-hover:bg-slate-300"}`}></div>
                    {/* วงกลมลูกกลิ้ง พร้อม Icon เปลี่ยนตามสถานะ */}
                    <div className={`absolute left-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ease-out shadow-sm flex items-center justify-center ${isRandom ? "translate-x-[20px] scale-110" : "translate-x-0"}`}>
                      {isRandom ? (
                        <Shuffle size={10} strokeWidth={3} className="text-indigo-500" />
                      ) : (
                        <ListOrdered size={10} strokeWidth={3} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                  {/* ข้อความบอกสถานะ */}
                  <div className={`text-[13px] font-extrabold tracking-wide transition-colors duration-300 select-none hidden sm:block ${isRandom ? "text-indigo-600" : "text-slate-400"}`}>
                    RANDOM
                  </div>
                </label>

                {/* เส้นคั่นตรงกลาง */}
                <div className="w-px h-6 bg-slate-100 hidden sm:block"></div>

                {/* ปุ่ม PLAY LESSON */}
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold tracking-wide shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all active:scale-[0.97] shrink-0"
                >
                  <PlayCircle size={18} />{" "}
                  <span className="hidden sm:inline">PLAY LESSON</span>
                </button>
              </div>

              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold tracking-wide shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all active:scale-[0.97] shrink-0"
              >
                <Plus size={18} />{" "}
                <span className="hidden sm:inline">Add Word</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden w-full">
            <div className="overflow-x-auto max-h-[70vh] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-sm">
                  <tr>
                    <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                      Word
                    </th>
                    <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                      Options Preview
                    </th>
                    <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentLessonVocabs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-10 text-center text-slate-400 font-medium"
                      >
                        This lesson is empty. Click "Add Word" to begin.
                      </td>
                    </tr>
                  ) : (
                    currentLessonVocabs.map((item) => (
                      <tr
                        key={item.id}
                        className="group transition-colors border-b border-slate-50 last:border-0 hover:bg-slate-50/80 cursor-pointer"
                        onClick={() => handleEdit(item)}
                      >
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900 tracking-wide text-base">
                            {item.word}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono font-semibold uppercase tracking-wider">
                              {item.ascii ? "ASCII" : "No ASCII"}
                            </span>
                            {item.audioFile && (
                              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono font-semibold tracking-wider flex items-center gap-1">
                                <FileAudio size={10} /> {item.audioFile}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            {["A", "B", "C", "D"].map((opt) => (
                              <span
                                key={opt}
                                className={`px-2 py-0.5 rounded ${item.correct === opt ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                              >
                                {opt}:{" "}
                                {item.choices[opt as keyof typeof item.choices]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handlePlaySingleWord(item, e)}
                              className={`p-2 rounded-lg transition-all flex items-center gap-1 font-bold text-xs ${playingId === item.id ? "bg-emerald-500 text-white shadow-md" : "text-emerald-500 hover:bg-emerald-50"}`}
                            >
                              <PlayCircle size={18} />{" "}
                              {playingId === item.id ? "SENT" : "TEST"}
                            </button>
                            <div className="w-px h-6 bg-slate-200 mx-1"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}