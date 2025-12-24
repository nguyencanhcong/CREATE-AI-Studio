import React, { useState, useRef } from 'react';
import { GraduationCap, FileUp, Settings2, Download, RefreshCw, CheckCircle2, FileText, Shuffle, School } from 'lucide-react';
import mammoth from 'mammoth';
import * as docx from 'docx';
import { parseQuestionBank } from '../services/geminiService';
import { QuizQuestion } from '../types';

export const QuizGenerator: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuizzes, setGeneratedQuizzes] = useState<{ id: string; questions: QuizQuestion[] }[]>([]);
  
  const [faculty, setFaculty] = useState('NHẬP THÔNG TIN KHOA QUẢY LÝ');
  const [semester, setSemester] = useState('1');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('60');
  const [numPerQuiz, setNumPerQuiz] = useState<number>(10);
  const [numQuizzes, setNumQuizzes] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanOptionText = (text: string): string => text.replace(/^[A-Da-d][.\/)]\s*/, '').trim();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const rawData = await parseQuestionBank(result.value);
      
      const cleaned = rawData.map(q => ({
        question: String(q.question || ""),
        options: Array.isArray(q.options) ? q.options.map(o => cleanOptionText(String(o))) : [],
        correctAnswer: cleanOptionText(String(q.correctAnswer || ""))
      }));
      
      setQuestions(cleaned);
      setNumPerQuiz(Math.min(10, cleaned.length));
    } catch (err: any) {
      setError(err.message || "Lỗi xử lý file.");
    } finally {
      setLoading(false);
    }
  };

  const handleShuffle = () => {
    if (questions.length === 0) return;
    const quizzes = [];
    for (let i = 0; i < numQuizzes; i++) {
      const shuffled = [...questions].sort(() => 0.5 - Math.random()).slice(0, numPerQuiz);
      quizzes.push({ id: `DE${(i+1).toString().padStart(3, '0')}`, questions: shuffled });
    }
    setGeneratedQuizzes(quizzes);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="text-brand-400" size={32} /> Quiz Master AI
          </h2>
          <p className="text-stone-400 mt-1">Trộn đề thi trắc nghiệm nhanh chóng, chuyên nghiệp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 bg-stone-900/50 p-6 rounded-2xl border border-stone-800 shadow-xl overflow-y-auto max-h-[85vh] custom-scrollbar">
          <div className="space-y-4">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <FileUp size={14} /> 1. Ngân hàng câu hỏi
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${questions.length > 0 ? 'border-brand-500 bg-brand-500/5' : 'border-stone-700 hover:border-brand-500 hover:bg-stone-800'}`}
            >
              {loading ? <RefreshCw className="animate-spin text-brand-500 mb-2" /> : questions.length > 0 ? <CheckCircle2 className="text-green-500 mb-2" /> : <FileUp className="text-stone-500 mb-2" />}
              <p className="text-stone-300 font-bold text-xs">{loading ? 'Đang phân tích...' : questions.length > 0 ? `${questions.length} câu đã sẵn sàng` : 'Tải file Word'}</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".docx" onChange={handleFileUpload} />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-800">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2"><School size={14}/> 2. Thông tin hành chính</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Tên môn học" className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-white text-xs outline-none focus:ring-1 focus:ring-brand-500" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={numPerQuiz} onChange={(e) => setNumPerQuiz(parseInt(e.target.value))} className="bg-stone-950 border border-stone-800 rounded-lg p-2 text-white text-xs" title="Số câu/đề" />
              <input type="number" value={numQuizzes} onChange={(e) => setNumQuizzes(parseInt(e.target.value))} className="bg-stone-950 border border-stone-800 rounded-lg p-2 text-white text-xs" title="Số mã đề" />
            </div>
          </div>

          <button
            disabled={questions.length === 0 || loading}
            onClick={handleShuffle}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${questions.length === 0 || loading ? 'bg-stone-800 text-stone-600' : 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-xl'}`}
          >
            <Shuffle size={20} /> Trộn đề ngay
          </button>
        </div>

        <div className="lg:col-span-2 bg-stone-900/50 rounded-2xl border border-stone-800 p-6 min-h-[400px] shadow-xl">
            {generatedQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedQuizzes.map((quiz, idx) => (
                  <div key={idx} className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex items-center justify-between">
                    <div><p className="text-sm font-bold text-white">{quiz.id}</p><p className="text-[10px] text-stone-500">Bao gồm {quiz.questions.length} câu</p></div>
                    <button className="p-2 bg-stone-800 hover:bg-brand-600 text-white rounded-lg transition-colors"><Download size={18}/></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-600">
                <FileText size={80} className="opacity-10 mb-4" />
                <p className="text-sm uppercase tracking-widest font-black">Danh sách đề thi sẽ hiển thị ở đây</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};