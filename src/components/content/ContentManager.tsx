import React, { useState } from 'react';
import { 
  Search, Plus, Edit2, Trash2, BookOpen, CheckCircle2, MonitorPlay, Save, X
} from 'lucide-react';
import { useContentStore, type VocabItem } from '../../store/contentStore';

const EMPTY_VOCAB: Omit<VocabItem, 'id'> = {
  word: '', lesson: '', ascii: '', choices: { A: '', B: '', C: '', D: '' }, correct: 'A'
};

export default function ContentManager() {
  // 🌟 ดึงข้อมูลและฟังก์ชันจาก Store
  const { vocabs, addVocab, updateVocab, deleteVocab } = useContentStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<VocabItem, 'id'>>(EMPTY_VOCAB);

  // ระบบค้นหา (กรองคำศัพท์ตามที่พิมพ์)
  const filteredVocabs = vocabs.filter(v => 
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.lesson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(EMPTY_VOCAB);
    setIsEditorOpen(true);
  };

  const handleEdit = (vocab: VocabItem) => {
    setEditingId(vocab.id);
    setFormData({
      word: vocab.word, lesson: vocab.lesson, ascii: vocab.ascii, 
      choices: { ...vocab.choices }, correct: vocab.correct
    });
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this word?')) {
      deleteVocab(id);
      if (editingId === id) setIsEditorOpen(false);
    }
  };

  const handleSave = () => {
    if (!formData.word.trim()) {
      alert("Please enter a vocabulary word.");
      return;
    }
    
    if (editingId) {
      updateVocab(editingId, formData);
    } else {
      addVocab(formData);
    }
    setIsEditorOpen(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 animate-in fade-in duration-500">
      
      {/* --- Header & Toolbar --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600" /> Vocabulary Library
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage words, ASCII arts, and quiz choices.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Search words..." 
              className="w-full bg-white border border-slate-200/80 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium shadow-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold tracking-wide shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all active:scale-[0.97] shrink-0">
            <Plus size={18} /> <span className="hidden sm:inline">Add Word</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6 relative items-start">
        
        {/* 📚 ตารางคำศัพท์ */}
        <div className={`bg-white rounded-[24px] border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 ${isEditorOpen ? 'hidden xl:block xl:w-[45%]' : 'w-full'}`}>
          <div className="overflow-x-auto max-h-[70vh] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-sm">
                <tr>
                  <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Word</th>
                  <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Lesson</th>
                  <th className={`py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider ${isEditorOpen ? 'hidden' : 'table-cell'}`}>Options Preview</th>
                  <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVocabs.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-slate-400 font-medium">No words found. Click "Add Word" to create one.</td></tr>
                ) : (
                  filteredVocabs.map((item) => (
                    <tr key={item.id} className={`group transition-colors border-b border-slate-50 last:border-0 cursor-pointer ${editingId === item.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`} onClick={() => handleEdit(item)}>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 tracking-wide text-base">{item.word}</div>
                        <div className="text-[12px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">{item.ascii ? 'ASCII included' : 'No ASCII'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[12px] font-bold tracking-wide">{item.lesson || 'Uncategorized'}</span>
                      </td>
                      <td className={`py-4 px-6 ${isEditorOpen ? 'hidden' : 'table-cell'}`}>
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <span key={opt} className={`px-2 py-0.5 rounded ${item.correct === opt ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {opt}: {item.choices[opt as keyof typeof item.choices]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} strokeWidth={2.5}/></button>
                          <button onClick={(e) => handleDelete(item.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} strokeWidth={2.5}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 📝 The Editor */}
        {isEditorOpen && (
          <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] w-full xl:w-[55%] flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 size={18} className="text-blue-600" /> {editingId ? 'Edit Vocabulary' : 'Create New Word'}
              </h3>
              <button onClick={() => setIsEditorOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Vocabulary Word</label>
                  <input type="text" placeholder="e.g., LION" value={formData.word} onChange={e => setFormData({...formData, word: e.target.value.toUpperCase()})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Lesson / Category</label>
                  <input type="text" placeholder="e.g., Animals" value={formData.lesson} onChange={e => setFormData({...formData, lesson: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* 🎨 ASCII Art Studio */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="block text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><MonitorPlay size={16}/> ASCII Art (For 8 LCDs)</label>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Preview Area</span>
                </div>
                <textarea 
                  rows={7} placeholder="Paste your ASCII art here..." value={formData.ascii} onChange={e => setFormData({...formData, ascii: e.target.value})}
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-sm leading-relaxed border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-inner resize-none whitespace-pre" 
                />
              </div>

              {/* 🔠 The Choices (A,B,C,D) */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">Quiz Choices (For 4 LCDs)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <div key={opt} className={`relative rounded-xl border-2 transition-all p-1 flex items-center gap-2 ${formData.correct === opt ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
                      <button 
                        type="button" onClick={() => setFormData({...formData, correct: opt})}
                        className={`w-10 h-10 shrink-0 rounded-lg font-extrabold flex items-center justify-center transition-colors hover:scale-105 active:scale-95 ${formData.correct === opt ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        title={`Set ${opt} as correct answer`}
                      >
                        {formData.correct === opt ? <CheckCircle2 size={20} strokeWidth={3}/> : opt}
                      </button>
                      <input 
                        type="text" value={formData.choices[opt]} onChange={e => setFormData({...formData, choices: {...formData.choices, [opt]: e.target.value}})} 
                        placeholder={`Option ${opt}`} className="w-full bg-transparent border-none focus:outline-none font-bold text-slate-700" 
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-slate-400 font-medium mt-3 text-center">Click the letter icon (A/B/C/D) to set it as the correct answer.</p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <button onClick={() => setIsEditorOpen(false)} className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-slate-600 hover:bg-slate-200/60 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[14px] font-bold shadow-md active:scale-95 transition-all"><Save size={16}/> Save Content</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}