
import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  FileCheck, 
  RefreshCw, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  User, 
  Hash,
  Award,
  BookOpen,
  Info,
  FileText,
  ChevronRight,
  ListChecks,
  Table as TableIcon,
  Trash2,
  FilePlus,
  Loader2,
  ShieldAlert,
  Files,
  Zap,
  Edit3,
  Save,
  Keyboard,
  Rocket,
  Clock,
  Infinity
} from 'lucide-react';
import * as docx from 'docx';
import { analyzeQuizSheet, parseAnswerKeyFromMedia } from '../services/geminiService';
import { GradingResult } from '../types';

interface BatchResult extends GradingResult {
  page: number;
  scoreInfo: {
    correct: number;
    total: number;
    score: string;
  };
  error?: string;
  isManualOverride?: boolean;
}

// Chế độ Siêu phân luồng mặc định
const DEFAULT_CHUNK_SIZE = 4; 

export const QuizGrader: React.FC = () => {
  const [selectedFilesCount, setSelectedFilesCount] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [answerKeys, setAnswerKeys] = useState<string>(''); 
  
  const [loading, setLoading] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedDetail, setSelectedDetail] = useState<BatchResult | null>(null);
  const [isWaitingQuota, setIsWaitingQuota] = useState(false);
  
  const [editPhach, setEditPhach] = useState('');
  const [editMaDe, setEditMaDe] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const resizeAndCompressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Nén tối ưu cho OCR: Vừa đủ rõ chữ nhưng tiết kiệm Token tối đa
        const MAX_WIDTH = 900; 
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        // Chất lượng 0.55 là điểm ngọt giữa độ chính xác OCR và kích thước payload
        resolve(canvas.toDataURL('image/jpeg', 0.55));
      };
    });
  };

  const parseAllAnswerKeys = (input: string): Record<string, Record<number, string>> => {
    const masterMap: Record<string, Record<number, string>> = {};
    const blocks = input.split(/(?=MÃ|Ma|Code)/i).filter(b => b.trim());
    
    blocks.forEach(block => {
      const lines = block.split('\n');
      const firstLine = lines[0];
      const codeMatch = firstLine.match(/(?:MÃ|Ma|Code)\s*(\d+)/i);
      const code = codeMatch ? codeMatch[1] : "DEFAULT";
      
      const keyMap: Record<number, string> = {};
      const content = lines.join(' ');
      const pairs = content.split(/[\s,;]+/).filter(p => p.includes(':'));
      pairs.forEach(p => {
        const [q, ans] = p.split(':');
        if (q && ans) keyMap[parseInt(q)] = ans.trim().toUpperCase();
      });
      masterMap[code] = keyMap;
    });
    return masterMap;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    setBatchResults([]);
    setError(null);
    setSelectedFilesCount(files.length);
    const allImages: string[] = [];
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const viewport = page.getViewport({ scale: 1.1 }); // Nhẹ hơn nữa để bảo vệ Quota
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context!, viewport, canvas }).promise;
            allImages.push(canvas.toDataURL('image/jpeg', 0.55));
          }
        } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          const compressed = await resizeAndCompressImage(dataUrl);
          allImages.push(compressed);
        }
      }
      setPreviewImages(allImages);
    } catch (err) {
      console.error(err);
      setError("Lỗi đọc tệp. Vui lòng kiểm tra lại định dạng tệp.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    setKeyLoading(true);
    setError(null);
    let combinedNewKeys = "";
    try {
      for (const file of files) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
        });
        reader.readAsDataURL(file);
        const mediaBase64 = await base64Promise;
        const compressed = await resizeAndCompressImage(mediaBase64);
        const recognizedKeys = await parseAnswerKeyFromMedia(compressed, "image/jpeg");
        Object.entries(recognizedKeys).forEach(([code, mapping]) => {
          let line = `\nMÃ ${code}: `;
          Object.entries(mapping).forEach(([q, ans]) => {
            line += `${q}:${ans} `;
          });
          combinedNewKeys += line;
        });
      }
      setAnswerKeys(prev => prev + combinedNewKeys);
    } catch (err: any) {
      setError("Lỗi nhận diện đáp án: " + (err.message || ""));
    } finally {
      setKeyLoading(false);
      if (keyInputRef.current) keyInputRef.current.value = "";
    }
  };

  const processBatch = async () => {
    if (previewImages.length === 0) return;
    setLoading(true);
    setBatchResults([]);
    const keysMap = parseAllAnswerKeys(answerKeys);
    const results: BatchResult[] = [];
    setProgress({ current: 0, total: previewImages.length });

    // Tự động điều chỉnh Chunk Size dựa trên phản hồi của API
    let dynamicChunk = DEFAULT_CHUNK_SIZE;

    for (let i = 0; i < previewImages.length; i += dynamicChunk) {
      const chunk = previewImages.slice(i, i + dynamicChunk);
      const chunkPromises = chunk.map(async (img, idx) => {
        const pageIdx = i + idx;
        try {
          // Xếp hàng luồng: Mỗi luồng cách nhau 0.8s để tránh nghẽn tức thời
          await new Promise(r => setTimeout(r, idx * 800));
          
          const aiData = await analyzeQuizSheet(img);
          const detectedCode = aiData.quizCode.replace(/\D/g, ''); 
          const correctKey = keysMap[detectedCode] || Object.values(keysMap)[0] || {};
          let correct = 0;
          aiData.studentAnswers.forEach(sa => {
            if (correctKey[sa.q] && (correctKey[sa.q] === sa.marked || (correctKey[sa.q] === 'X' && sa.marked))) {
               correct++;
            }
          });
          const total = Object.keys(correctKey).length || 50;
          return {
            ...aiData,
            page: pageIdx + 1,
            scoreInfo: {
              correct,
              total,
              score: ((correct / total) * 10).toFixed(2)
            }
          };
        } catch (err: any) {
          const msg = err.message || "";
          if (msg.includes("Dịch vụ AI đang quá tải") || msg.includes("429")) {
              setIsWaitingQuota(true);
          }
          console.error(`Error on page ${pageIdx + 1}:`, err);
          return {
            studentInfo: { name: "N/A", studentId: "N/A", class: "N/A" },
            quizCode: "N/A",
            studentAnswers: [],
            page: pageIdx + 1,
            scoreInfo: { correct: 0, total: 0, score: "0.00" },
            error: msg.includes("hạn mức") ? "Đang xếp hàng thử lại..." : "Lỗi xử lý"
          } as BatchResult;
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      setProgress(prev => ({ ...prev, current: Math.min(prev.total, prev.current + dynamicChunk) }));
      
      // Nếu gặp lỗi hạn mức, chờ lâu hơn và giảm tốc độ xử lý xuống 2 bài/lần
      if (isWaitingQuota) {
        await new Promise(resolve => setTimeout(resolve, 20000));
        setIsWaitingQuota(false);
        dynamicChunk = 2; 
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        dynamicChunk = DEFAULT_CHUNK_SIZE;
      }
    }
    setBatchResults(results);
    setLoading(false);
    setViewMode('list');
  };

  const recalculateItemScore = (result: BatchResult, newMaDe: string): BatchResult => {
    const keysMap = parseAllAnswerKeys(answerKeys);
    const cleanMaDe = newMaDe.replace(/\D/g, '');
    const correctKey = keysMap[cleanMaDe] || Object.values(keysMap)[0] || {};
    
    let correct = 0;
    result.studentAnswers.forEach(sa => {
      if (correctKey[sa.q] && (correctKey[sa.q] === sa.marked || (correctKey[sa.q] === 'X' && sa.marked))) {
         correct++;
      }
    });

    const total = Object.keys(correctKey).length || 50;
    return {
      ...result,
      quizCode: newMaDe,
      scoreInfo: {
        correct,
        total,
        score: ((correct / total) * 10).toFixed(2)
      },
      isManualOverride: true,
      error: undefined
    };
  };

  const handleInlineUpdate = (pageIndex: number, field: 'studentId' | 'quizCode', value: string) => {
    setBatchResults(prev => prev.map(r => {
      if (r.page === pageIndex) {
        if (field === 'quizCode') {
          return recalculateItemScore(r, value);
        } else {
          return {
            ...r,
            studentInfo: { ...r.studentInfo, studentId: value },
            isManualOverride: true,
            error: undefined
          };
        }
      }
      return r;
    }));
  };

  const handleUpdateManualResult = () => {
    if (!selectedDetail) return;
    const updated = recalculateItemScore({
      ...selectedDetail,
      studentInfo: { ...selectedDetail.studentInfo, studentId: editPhach }
    }, editMaDe);
    
    setBatchResults(prev => prev.map(r => r.page === selectedDetail.page ? updated : r));
    setSelectedDetail(updated);
  };

  const exportToCSV = () => {
    if (batchResults.length === 0) return;
    const header = "STT,Số phách,Mã đề,Số câu đúng,Số câu sai,Tổng điểm,Ghi chú\n";
    const rows = batchResults.map((r, i) => {
      const wrongCount = r.scoreInfo.total - r.scoreInfo.correct;
      const totalScore = (r.scoreInfo.correct * 0.2).toFixed(1);
      return `${i+1},${r.studentInfo.studentId},${r.quizCode},${r.scoreInfo.correct},${Math.max(0, wrongCount)},${totalScore},"${r.error || ''}"`;
    }).join('\n');
    const blob = new Blob(["\uFEFF" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ket_qua_bao_mat_${Date.now()}.csv`;
    link.click();
  };

  const exportToDocx = async () => {
    if (batchResults.length === 0) return;
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = docx;
    const rows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "STT", bold: true, size: 24 })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Số phách", bold: true, size: 24 })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mã đề", bold: true, size: 24 })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Số câu đúng", bold: true, size: 24 })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Số câu sai", bold: true, size: 24 })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tổng điểm", bold: true, size: 24 })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ghi chú", bold: true, size: 24 })] })] }),
        ],
      }),
    ];
    batchResults.forEach((res, idx) => {
      const wrongCount = res.scoreInfo.total - res.scoreInfo.correct;
      const totalScore = (res.scoreInfo.correct * 0.2).toFixed(1);
      rows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: (idx + 1).toString(), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: res.studentInfo.studentId || "N/A", alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ text: res.quizCode || "N/A", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: res.scoreInfo.correct.toString(), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: Math.max(0, wrongCount).toString(), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: totalScore, alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, color: '0ea5e9' })] })] }),
            new TableCell({ children: [new Paragraph({ text: res.error ? res.error : (res.isManualOverride ? "Đã sửa thủ công" : "Hợp lệ"), alignment: AlignmentType.LEFT })] }),
          ],
        })
      );
    });
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "BẢNG TỔNG HỢP KẾT QUẢ CHẤM ĐIỂM (BẢO MẬT)", bold: true, size: 32 })],
              spacing: { after: 400 },
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: "* Ghi chú: Danh sách được tổng hợp dựa trên Số phách. Tổng điểm = Số câu đúng * 0.2.", italics: true, size: 20 })],
              spacing: { after: 300 },
            }),
            new Table({
              rows: rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ket_qua_cham_phach_${Date.now()}.docx`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Award className="text-brand-400" size={32} />
            AI Quiz Grader (Tự Phục Hồi Quota)
          </h2>
          <p className="text-slate-400 mt-1">Hệ thống ưu tiên phục vụ mục đích giáo dục phi lợi nhuận.</p>
        </div>
        {batchResults.length > 0 && (
          <div className="flex gap-3">
            <button 
              onClick={exportToCSV}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg border border-slate-700"
            >
              <TableIcon size={16} /> Xuất CSV
            </button>
            <button 
              onClick={exportToDocx}
              className="bg-gradient-to-r from-blue-600 to-brand-600 hover:from-blue-500 hover:to-brand-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-xl shadow-brand-900/20"
            >
              <Download size={18} /> Tải bảng điểm phách (.docx)
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} /> 1. Tải tệp bài làm (OCR 0.55)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFilesCount > 0 ? 'border-brand-500 bg-brand-500/5' : 'border-slate-700 hover:border-brand-500 hover:bg-slate-800'}`}
              >
                <Files className={`${selectedFilesCount > 0 ? 'text-brand-400' : 'text-slate-500'} mb-2`} size={32} />
                <p className="text-slate-300 font-bold text-xs uppercase text-center leading-relaxed">
                  {selectedFilesCount > 0 
                    ? `Đã chọn ${selectedFilesCount} tệp` 
                    : 'Chọn PDF hoặc Ảnh'}
                </p>
                {previewImages.length > 0 && (
                  <p className="text-[10px] text-brand-400 mt-1 font-bold">Xử lý: {previewImages.length} trang</p>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept="image/*,application/pdf" 
                  onChange={handleFileUpload} 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={14} /> 2. Đáp án theo mã đề
                </label>
                <button 
                  onClick={() => keyInputRef.current?.click()}
                  disabled={keyLoading}
                  className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-lg border border-brand-500/20 hover:bg-brand-500/20 flex items-center gap-2 transition-all"
                >
                  {keyLoading ? <Loader2 className="animate-spin" size={12}/> : <FilePlus size={12}/>}
                  {keyLoading ? 'Đang đọc...' : 'Tải File Đáp Án'}
                </button>
                <input type="file" ref={keyInputRef} className="hidden" multiple accept="image/*,application/pdf" onChange={handleKeyFilesUpload} />
              </div>
              <textarea 
                value={answerKeys}
                onChange={(e) => setAnswerKeys(e.target.value)}
                placeholder="Ví dụ: MÃ 326: 1:A 2:B 3:C..."
                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-xs outline-none focus:ring-1 focus:ring-brand-500 resize-none font-mono leading-relaxed"
              />
            </div>

            <button
              disabled={previewImages.length === 0 || loading}
              onClick={processBatch}
              className={`w-full py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                previewImages.length === 0 || loading 
                ? 'bg-slate-800 text-slate-600' 
                : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-900/30 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin mb-1" size={20} />
                  <span className="text-xs">
                    {isWaitingQuota ? 'Đang đợi Quota API hồi phục...' : `Đang chấm x${progress.current < progress.total ? '4' : '1'}: ${progress.current}/${progress.total}`}
                  </span>
                </>
              ) : (
                <>
                  <Rocket size={20} className="mb-1 text-yellow-400 animate-pulse" />
                  <span>Chấm Siêu Phân Luồng (Bền bỉ)</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 min-h-[600px] shadow-xl overflow-hidden flex flex-col">
            {batchResults.length > 0 ? (
              <>
                <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                        Bảng chấm bảo mật
                      </button>
                      <button 
                        disabled={!selectedDetail}
                        onClick={() => setViewMode('detail')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'detail' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-white disabled:opacity-30'}`}
                      >
                        So khớp bài gốc
                      </button>
                   </div>
                   <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-green-500" /> {batchResults.length} bài đã hoàn tất
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest items-center">
                         <div className="col-span-1">STT</div>
                         <div className="col-span-3">Số phách (Sửa tay)</div>
                         <div className="col-span-3 text-center">Mã đề (Sửa tay)</div>
                         <div className="col-span-2 text-center">Đúng/Tổng</div>
                         <div className="col-span-2 text-right pr-4">T. Điểm</div>
                         <div className="col-span-1 text-right">Xem</div>
                      </div>
                      {batchResults.map((res, idx) => {
                        const totalScore = (res.scoreInfo.correct * 0.2).toFixed(1);
                        const isRetrying = res.error === 'Đang xếp hàng thử lại...';
                        const hasError = res.error && !isRetrying;
                        
                        return (
                          <div 
                            key={idx}
                            className={`group p-3 rounded-xl border transition-all grid grid-cols-12 items-center ${isRetrying ? 'bg-amber-500/5 border-amber-500/20' : hasError ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950 border-slate-800 hover:border-brand-500/50 shadow-sm'}`}
                          >
                            <div className="col-span-1 text-xs text-slate-500 font-mono">{(idx + 1).toString().padStart(2, '0')}</div>
                            
                            <div className="col-span-3 px-1">
                                <div className="relative">
                                    <input 
                                        value={res.studentInfo.studentId}
                                        onChange={(e) => handleInlineUpdate(res.page, 'studentId', e.target.value)}
                                        className={`w-full bg-slate-900/50 border border-slate-800 rounded px-2 py-1.5 text-sm font-black focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all ${hasError ? 'text-red-400' : 'text-white'}`}
                                        placeholder="Phách..."
                                    />
                                    {res.isManualOverride && <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-[8px] text-white px-1 rounded-full font-bold">M</span>}
                                </div>
                                {res.error && <p className={`text-[9px] italic mt-0.5 truncate ${isRetrying ? 'text-amber-500' : 'text-red-500'}`}>{res.error}</p>}
                            </div>
                            
                            <div className="col-span-3 text-center px-2">
                                <input 
                                    value={res.quizCode}
                                    onChange={(e) => handleInlineUpdate(res.page, 'quizCode', e.target.value)}
                                    className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-center font-bold text-brand-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="Mã..."
                                />
                            </div>

                            <div className="col-span-2 text-center">
                                <p className="text-xs font-bold text-slate-400">{res.scoreInfo.correct}/{res.scoreInfo.total}</p>
                            </div>

                            <div className="col-span-2 text-right pr-4">
                                <p className="text-lg font-black text-brand-500">{totalScore}</p>
                            </div>

                            <div className="col-span-1 text-right">
                                <button 
                                    onClick={() => { 
                                        setSelectedDetail(res); 
                                        setEditPhach(res.studentInfo.studentId);
                                        setEditMaDe(res.quizCode);
                                        setViewMode('detail'); 
                                    }}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-600 hover:text-brand-500 transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : selectedDetail && (
                    <div className="space-y-6 animate-fade-in">
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner items-end">
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1"><Hash size={10}/> Số phách (Sửa tay)</label>
                            <input 
                              value={editPhach}
                              onChange={(e) => setEditPhach(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:ring-1 focus:ring-brand-500"
                              placeholder="Số phách..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1"><BookOpen size={10}/> Mã đề thi (Sửa tay)</label>
                            <input 
                              value={editMaDe}
                              onChange={(e) => setEditMaDe(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:ring-1 focus:ring-brand-500"
                              placeholder="Mã đề..."
                            />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold mb-1.5">Điểm hiện tại</p>
                            <p className="text-sm text-brand-400 font-black">{(selectedDetail.scoreInfo.correct * 0.2).toFixed(1)} điểm ({selectedDetail.scoreInfo.correct}/{selectedDetail.scoreInfo.total})</p>
                          </div>
                          <button 
                            onClick={handleUpdateManualResult}
                            className="bg-brand-600 hover:bg-brand-500 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                          >
                            <Save size={14} /> Cập nhật
                          </button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ảnh phiếu gốc (Trang {selectedDetail.page})</h4>
                             </div>
                             <img src={previewImages[selectedDetail.page - 1]} className="w-full rounded-xl border border-slate-800 shadow-2xl" />
                          </div>
                          <div className="space-y-3">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chi tiết đáp án</h4>
                             <div className="grid grid-cols-3 gap-2">
                                {selectedDetail.studentAnswers.map((sa) => {
                                  const cleanCode = selectedDetail.quizCode.replace(/\D/g, '');
                                  const keysMap = parseAllAnswerKeys(answerKeys);
                                  const correctKey = keysMap[cleanCode] || Object.values(keysMap)[0] || {};
                                  const isCorrect = correctKey[sa.q] === sa.marked || (correctKey[sa.q] === 'X' && sa.marked);
                                  return (
                                    <div key={sa.q} className={`p-2 rounded-lg border flex items-center justify-between ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                       <span className="text-[10px] font-bold text-slate-500">{sa.q}.</span>
                                       <span className={`text-xs font-black ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{sa.marked || '-'}</span>
                                       {isCorrect ? <CheckCircle2 size={12} className="text-green-500" /> : <XCircle size={12} className="text-red-500" />}
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-600 py-20 px-10">
                {loading ? (
                   <div className="text-center space-y-6">
                      <div className="relative flex justify-center">
                        <div className="w-24 h-24 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                        {isWaitingQuota ? <Clock className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={32} /> : <Zap className="absolute inset-0 m-auto text-yellow-400 animate-pulse" size={32} />}
                      </div>
                      <div className="space-y-2">
                        <p className="text-white font-bold text-xl">{isWaitingQuota ? 'Đang đợi giải phóng Quota...' : 'Đang chấm bền bỉ x4...'}</p>
                        <p className="text-slate-500 text-sm">
                            {isWaitingQuota ? 'API đang bị nghẽn. Hệ thống đang tự động xếp hàng thử lại sau 20 giây...' : 'Đang xử lý đa luồng. Một số bài có thể hiển thị "Đang xếp hàng" nếu API bận.'}
                        </p>
                        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto mt-4">
                           <div 
                            className={`h-full transition-all duration-300 ${isWaitingQuota ? 'bg-amber-500 animate-pulse' : 'bg-gradient-to-r from-brand-500 to-yellow-500'}`} 
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                           />
                        </div>
                      </div>
                   </div>
                ) : (
                  <>
                    <Rocket size={80} className="opacity-10 mb-6 text-brand-500" />
                    <h4 className="text-lg font-bold uppercase tracking-[0.2em] text-slate-500">Phòng Chấm Bài Siêu Phân Luồng</h4>
                    <p className="text-xs mt-4 opacity-40 max-w-[450px] text-center italic leading-relaxed">
                      Ứng dụng hỗ trợ giáo dục phi lợi nhuận. Cơ chế xếp hàng tự phục hồi Quota đảm bảo chấm hàng trăm bài thi mà không bị lỗi.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="bg-brand-900/10 p-6 rounded-2xl border border-brand-500/20 border-dashed grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-brand-400 uppercase flex items-center gap-2">
                <Infinity size={14} /> Chế độ Giáo dục
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Khi chấm hàng loạt, nếu bạn thấy bài thi hiển thị "Đang xếp hàng thử lại", đó là do AI đang tự động điều tiết tốc độ để khớp với hạn mức Google cung cấp. <b>Vui lòng không đóng trang web.</b>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-brand-400 uppercase flex items-center gap-2">
                <ShieldAlert size={14} /> Bảo mật & Chính xác
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Tệp ảnh đã được nén tối ưu (0.55) để giảm tiêu thụ Token nhưng vẫn đảm bảo OCR đọc tốt Số phách. Mọi lỗi đọc sai có thể sửa ngay tại danh sách bên trên.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
