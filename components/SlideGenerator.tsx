
import React, { useState, useRef, useEffect } from 'react';
import { Presentation, Sparkles, Download, RefreshCw, Layers, Palette, Printer, Type, FileUp, FileText, Loader2, CheckCircle2, AlertTriangle, BarChart3, TrendingUp, Image as ImageIcon, X, FileBox, Settings2, ImagePlus, Trash2, Circle, Square, Move } from 'lucide-react';
import { generateSlideContent } from '../services/geminiService';
import mammoth from 'mammoth';
import { Chart, registerables } from 'chart.js';
import JSZip from 'jszip';

Chart.register(...registerables);

type ThemeStyle = 'corporate' | 'creative' | 'minimal' | 'modern' | 'custom';

const VisualChart: React.FC<{ data: any, type: string, color: string }> = ({ data, type, color }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current && data && data.datasets && Array.isArray(data.datasets)) {
      if (chartInstance.current) chartInstance.current.destroy();
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels || [],
            datasets: data.datasets.map((ds: any) => ({
              ...ds,
              backgroundColor: color + 'CC',
              borderColor: color,
              borderWidth: 2,
              borderRadius: 8
            }))
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { 
                display: data.datasets.length > 1,
                labels: { color: '#fff', font: { size: 12, family: 'Times New Roman' } } 
              } 
            },
            scales: {
              x: { ticks: { color: '#fff', font: { size: 10, family: 'Times New Roman' } }, grid: { color: 'rgba(255,255,255,0.1)' } },
              y: { ticks: { color: '#fff', font: { size: 10, family: 'Times New Roman' } }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
          }
        });
      }
    }
  }, [data, color]);

  return <div className="h-40 w-full flex items-center justify-center mt-2 shrink-0"><canvas ref={chartRef}></canvas></div>;
};

export const SlideGenerator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeStyle>('corporate');

  // Customization States
  const [headerFontSize, setHeaderFontSize] = useState<number>(24);
  const [contentFontSize, setContentFontSize] = useState<number>(22);
  const [footerFontSize, setFooterFontSize] = useState<number>(10);
  const [footerText, setFooterText] = useState<string>('CREATE AI Studio - NCC');
  
  // Background Colors
  const [headerBgColor, setHeaderBgColor] = useState<string>('rgba(0,0,0,0.4)');
  const [contentBgColor, setContentBgColor] = useState<string>('rgba(0,0,0,0)');
  const [footerBgColor, setFooterBgColor] = useState<string>('rgba(255,255,255,0.1)');
  
  // Text Colors
  const [headerTextColor, setHeaderTextColor] = useState<string>('#FFFFFF');
  const [contentTextColor, setContentTextColor] = useState<string>('#FFFFFF');
  const [footerTextColor, setFooterTextColor] = useState<string>('#FFFFFF');
  
  // Logo State with Global Position & Scale
  const [logo, setLogo] = useState<{ 
    data: string | null, 
    shape: 'square' | 'circle',
    x: number, 
    y: number, 
    scale: number 
  }>({ 
    data: null, 
    shape: 'circle', 
    x: 92, 
    y: 8, 
    scale: 1.0 
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const themes = [
    { id: 'corporate', label: 'Doanh nghiệp', hex: '#0ea5e9' },
    { id: 'creative', label: 'Sáng tạo', hex: '#a855f7' },
    { id: 'minimal', label: 'Tối giản', hex: '#64748b' },
    { id: 'modern', label: 'Hiện đại', hex: '#10b981' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Dung lượng tối đa 50MB.");
      return;
    }
    setFileLoading(true);
    setError(null);
    try {
      const type = file.name.split('.').pop()?.toLowerCase();
      if (type === 'docx' || type === 'doc') {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
          setInputText(result.value);
        } catch (mErr) {
          if (type === 'doc') {
            throw new Error("Tệp .doc (legacy) không thể đọc trực tiếp. Vui lòng lưu thành .docx để có kết quả tốt nhất.");
          }
          throw mErr;
        }
      } else if (type === 'pdf') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        let text = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 100); i++) {
          const content = await (await pdf.getPage(i)).getTextContent();
          text += content.items.map((it: any) => it.str).join(" ") + "\n";
        }
        setInputText(text);
      } else {
        setError("Định dạng file không hỗ trợ (.doc, .docx, .pdf)");
      }
    } catch (err: any) { 
      setError(err.message || "Lỗi đọc file. Vui lòng kiểm tra lại tệp."); 
    }
    finally { setFileLoading(false); }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(prev => ({ ...prev, data: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Fix: Removed second argument to match generateSlideContent signature (text)
      const data = await generateSlideContent(inputText);
      setSlides(Array.isArray(data) ? data : []);
    } catch (err: any) { 
      setError(err.message || "Không thể tạo slide. Có thể tài liệu quá dài để xử lý một lần."); 
    }
    finally { setLoading(false); }
  };

  const handleDownloadPptx = async () => {
    if (!slides || slides.length === 0) return;
    const pptxgen = (await import('pptxgenjs')).default;
    const pptx = new pptxgen();
    
    const processColor = (colorStr: string) => {
      if (colorStr.startsWith('#')) {
        return colorStr.replace('#', '').toUpperCase();
      }
      const parts = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!parts) return '000000';
      const r = parseInt(parts[1]).toString(16).padStart(2, '0');
      const g = parseInt(parts[2]).toString(16).padStart(2, '0');
      const b = parseInt(parts[3]).toString(16).padStart(2, '0');
      return (r + g + b).toUpperCase();
    };

    slides.forEach((s, idx) => {
      const slide = pptx.addSlide();
      const slideThemeColor = s.themeColor ? s.themeColor.replace('#', '') : (themes.find(t => t.id === theme)?.hex.replace('#','') || '0f172a');
      slide.background = { fill: slideThemeColor };
      
      // Header Section
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '16.6%', fill: { color: processColor(headerBgColor) } });

      // Logo in Header (Calculated from global percentage)
      if (logo.data) {
        const baseSize = 0.8;
        const actualSize = baseSize * logo.scale;
        const xPos = (logo.x / 100) * 10 - (actualSize / 2); // 10 inches is default PPT width
        const yPos = (logo.y / 100) * 5.625 - (actualSize / 2); // 5.625 inches is default 16:9 PPT height
        
        slide.addImage({ 
          data: logo.data, 
          x: xPos, y: yPos, w: actualSize, h: actualSize, 
          rounding: logo.shape === 'circle' ? true : false 
        });
      }

      // Title
      slide.addText(s.title || `Slide ${idx + 1}`, { 
        x: '5%', y: 0, w: '80%', h: '16.6%',
        fontSize: headerFontSize, bold: true, color: processColor(headerTextColor),
        fontFace: 'Times New Roman', align: 'center', valign: 'middle'
      });
      
      // Footer Section
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: '92.85%', w: '100%', h: '7.15%', fill: { color: processColor(footerBgColor) } });

      // Footer Text
      slide.addText(`${footerText} | Trang ${idx + 1}`, { 
        x: 0, y: '92.85%', w: '100%', h: '7.15%',
        fontSize: footerFontSize, color: processColor(footerTextColor), fontFace: 'Times New Roman',
        align: 'center', valign: 'middle'
      });

      // Content Area Background
      if (!contentBgColor.includes('rgba(0,0,0,0)')) {
        slide.addShape(pptx.ShapeType.rect, { x: 0, y: '16.6%', w: '100%', h: '76.25%', fill: { color: processColor(contentBgColor) } });
      }

      // Content Points - FIXED FOR BULLETS
      if (Array.isArray(s.points) && s.points.length > 0) {
        const textObjects = s.points.map((p: string) => ({
          text: p,
          options: {
            bullet: true,
            fontSize: contentFontSize,
            color: processColor(contentTextColor),
            fontFace: 'Times New Roman',
            align: 'justify',
            breakLine: true
          }
        }));

        slide.addText(textObjects, { 
          x: '7.5%', y: '18%', w: '85%', h: '65%',
          valign: 'top',
          lineSpacing: contentFontSize * 1.2
        });
      }
    });
    
    pptx.writeFile({ fileName: `create-ai-slides-${Date.now()}.pptx` });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Presentation className="text-brand-400" /> Slide AI Generator - NCC
          </h2>
          <p className="text-slate-400 mt-1">Hệ thống tạo slide đầy đủ, chi tiết, không giới hạn số lượng slides.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 no-print">
        <div className="lg:col-span-1 space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl h-fit overflow-y-auto max-h-[85vh] custom-scrollbar">
          
          {/* Main Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-400">Nội dung / Tài liệu (50MB)</label>
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-brand-400 font-bold bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20 hover:bg-brand-500/20 transition-all">
                {fileLoading ? <Loader2 className="animate-spin inline" /> : <FileUp className="inline" size={12}/>} Tải File
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".docx,.doc,.pdf" className="hidden" />
            </div>
            <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Dán nội dung hoặc tải tài liệu (.doc, .docx, .pdf)..." className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none transition-all" />
          </div>

          {/* Logo & Global Position Settings */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <ImageIcon size={16} /> Logo & Vị trí
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Logo đồng bộ</span>
                {logo.data && <button onClick={() => setLogo({ ...logo, data: null })} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={12}/></button>}
              </div>
              
              {!logo.data ? (
                <button onClick={() => logoInputRef.current?.click()} className="w-full py-6 border border-dashed border-slate-700 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-800 transition-colors">
                  <ImagePlus size={24} className="text-slate-500" />
                  <span className="text-xs text-slate-500">Tải Logo</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={logo.data} className={`w-14 h-14 object-contain bg-slate-800 p-1 border border-slate-700 ${logo.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} />
                    <div className="flex bg-slate-800 p-1 rounded-lg flex-1 border border-slate-700">
                      <button onClick={() => setLogo({...logo, shape: 'square'})} className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${logo.shape === 'square' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><Square size={12} className="inline mr-1"/> Vuông</button>
                      <button onClick={() => setLogo({...logo, shape: 'circle'})} className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${logo.shape === 'circle' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><Circle size={12} className="inline mr-1"/> Tròn</button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800/50">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                        <span>KÍCH THƯỚC</span>
                        <span>{Math.round(logo.scale * 100)}%</span>
                      </div>
                      <input type="range" min="0.2" max="2.5" step="0.1" value={logo.scale} onChange={(e) => setLogo({...logo, scale: parseFloat(e.target.value)})} className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                          <span>VỊ TRÍ X</span>
                          <span>{logo.x}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={logo.x} onChange={(e) => setLogo({...logo, x: parseInt(e.target.value)})} className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                          <span>VỊ TRÍ Y</span>
                          <span>{logo.y}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={logo.y} onChange={(e) => setLogo({...logo, y: parseInt(e.target.value)})} className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500" />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-600 italic leading-tight">* Thay đổi này sẽ áp dụng tức thì cho toàn bộ slide.</p>
                  </div>
                </div>
              )}
              <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          {/* Theme & Font Selection */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-sm mb-2">
              <Settings2 size={16} /> Font & Màu sắc
            </div>
            
            <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              {/* Header Group */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Tiêu đề (Header)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div title="Cỡ chữ">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Size</span>
                    <input type="number" value={headerFontSize} onChange={(e) => setHeaderFontSize(parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-500" />
                  </div>
                  <div title="Màu nền">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Nền</span>
                    <input type="color" value={headerBgColor.startsWith('rgba') ? '#000000' : headerBgColor} onChange={(e) => setHeaderBgColor(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded cursor-pointer" />
                  </div>
                  <div title="Màu chữ">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Chữ</span>
                    <input type="color" value={headerTextColor} onChange={(e) => setHeaderTextColor(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Content Group */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Nội dung (Content)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div title="Cỡ chữ">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Size</span>
                    <input type="number" value={contentFontSize} onChange={(e) => setContentFontSize(parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-500" />
                  </div>
                  <div title="Màu nền">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Nền</span>
                    <input type="color" value={contentBgColor.startsWith('rgba') ? '#00000000' : contentBgColor} onChange={(e) => setContentBgColor(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded cursor-pointer" />
                  </div>
                  <div title="Màu chữ">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Chữ</span>
                    <input type="color" value={contentTextColor} onChange={(e) => setContentTextColor(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Footer Group */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Chân trang (Footer)</label>
                <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white mb-2 outline-none focus:border-brand-500" />
                <div className="grid grid-cols-3 gap-2">
                  <div title="Cỡ chữ">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Size</span>
                    <input type="number" value={footerFontSize} onChange={(e) => setFooterFontSize(parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-500" />
                  </div>
                  <div title="Màu nền">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Nền</span>
                    <input type="color" value={footerBgColor.startsWith('rgba') ? '#ffffff33' : footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded cursor-pointer" />
                  </div>
                  <div title="Màu chữ">
                    <span className="text-[8px] text-amber-400 mb-1 block font-bold">Màu Chữ</span>
                    <input type="color" value={footerTextColor} onChange={(e) => setFooterTextColor(e.target.value)} className="w-full h-7 bg-slate-800 border border-slate-700 rounded cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {themes.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id as ThemeStyle)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${theme === t.id ? 'bg-brand-500/20 border-brand-500 text-brand-400 shadow-inner' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}>{t.label}</button>
              ))}
            </div>
          </div>

          <button disabled={!inputText.trim() || loading} onClick={handleGenerate} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!inputText.trim() || loading ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-900/40 active:scale-95'}`}>
            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />} 
            {loading ? 'Đang tạo nội dung...' : 'Tạo Trọn Bộ Slide'}
          </button>
          
          {error && <div className="text-red-400 text-xs p-3 bg-red-400/10 border border-red-400/20 rounded-xl flex items-start gap-2 animate-shake"><AlertTriangle size={14} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3 space-y-8 overflow-y-auto max-h-[85vh] pr-2 custom-scrollbar print-area">
          {slides && slides.length > 0 ? (
            <>
              <div className="flex justify-between items-center no-print sticky top-0 z-50 bg-slate-950/80 backdrop-blur p-4 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><p className="text-sm font-bold text-slate-200">Đã hoàn thành {slides.length} Slides</p></div>
                <div className="flex gap-2">
                  <button onClick={handleDownloadPptx} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95"><FileText size={16} /> PowerPoint</button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold border border-slate-700 shadow-lg transition-all active:scale-95"><Printer size={16} /> In / PDF</button>
                </div>
              </div>

              {slides.map((s, idx) => (
                <div key={idx} className={`aspect-[16/9] w-full rounded-3xl relative overflow-hidden shadow-2xl transition-all border border-slate-700/50 bg-gradient-to-br flex flex-col`} style={{ backgroundImage: s.themeColor ? `linear-gradient(to bottom right, ${s.themeColor}, #000)` : undefined, backgroundColor: !s.themeColor ? (themes.find(t => t.id === theme)?.hex || '#0f172a') : undefined }}>
                  <svg className="absolute inset-0 opacity-10 pointer-events-none" width="100%" height="100%"><pattern id={`pattern-${idx}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#fff" /></pattern><rect width="100%" height="100%" fill={`url(#pattern-${idx})`} /></svg>
                  
                  {/* Header Section */}
                  <div className="h-1/6 w-full flex items-center justify-center shrink-0 border-b border-white/5 relative" style={{ backgroundColor: headerBgColor }}>
                    {/* Logo Overlay - Managed by Global Position & Scale */}
                    {logo.data && (
                      <div 
                        className="absolute z-50 pointer-events-none transition-all duration-300"
                        style={{
                          left: `${logo.x}%`,
                          top: `${logo.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: `${8 * logo.scale}%`, // Base size 8% relative to header
                        }}
                      >
                        <img 
                          src={logo.data} 
                          className={`w-full h-auto object-contain bg-white/10 drop-shadow-lg ${logo.shape === 'circle' ? 'rounded-full' : 'rounded'}`} 
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4 font-serif absolute top-2 left-8 opacity-50 z-10"><span className="text-[10px] uppercase tracking-widest font-black text-white/40">Mục {idx + 1}</span></div>
                    <h3 className="font-serif leading-tight drop-shadow-xl font-bold text-center w-full px-12 z-10" style={{ fontSize: `${headerFontSize}pt`, color: headerTextColor }}>{s.title || 'Untitled Slide'}</h3>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 w-full relative flex flex-col items-center overflow-hidden p-6 lg:p-8" style={{ backgroundColor: contentBgColor }}>
                    <div className="w-full px-12 h-full overflow-hidden flex flex-col items-center z-10">
                      <div className="w-full h-full overflow-y-auto custom-scrollbar">
                        <ul className="space-y-4 w-full">
                          {(s.points || []).map((p: string, pIdx: number) => (
                            <li key={pIdx} className="animate-fade-in font-serif text-justify list-disc list-inside leading-none" style={{ fontSize: `${contentFontSize}pt`, color: contentTextColor, animationDelay: `${pIdx * 0.1}s` }}><span className="font-medium">{p}</span></li>
                          ))}
                        </ul>
                        {s.visualType === 'chart' && s.chartData && <div className="w-full max-w-xl mt-4 mx-auto"><VisualChart data={s.chartData} type="bar" color={s.themeColor || (themes.find(t => t.id === theme)?.hex || '#0ea5e9')} /></div>}
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="h-[7.15%] w-full flex items-center justify-between px-12 border-t border-white/5 shrink-0 relative" style={{ backgroundColor: footerBgColor }}>
                    <div className="font-serif italic z-10" style={{ fontSize: `${footerFontSize}pt`, color: footerTextColor }}>{footerText}</div>
                    <div className="flex items-center gap-6 font-serif font-bold uppercase tracking-widest z-10" style={{ fontSize: `${footerFontSize}pt`, color: footerTextColor }}><span className="bg-white/20 px-3 py-1 rounded">Trang {idx + 1}</span></div>
                  </div>
                </div>
              ))}
              
              <div className="no-print text-center py-10 opacity-30">
                <p className="text-sm italic font-medium">--- Hết tài liệu ---</p>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed p-12 flex flex-col items-center justify-center h-full min-h-[550px]">
              <div className="relative mb-10"><div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div><Layers size={90} className="text-slate-800 relative z-10" /><TrendingUp size={36} className="absolute -top-4 -right-4 text-brand-500 animate-bounce" /></div>
              <h3 className="text-slate-400 font-black text-2xl uppercase tracking-[0.2em] text-center">Slide AI Lab - NCC</h3>
              <p className="text-slate-600 text-sm mt-6 italic text-center max-w-xl leading-loose font-medium">Sẵn sàng xử lý tài liệu lớn. AI sẽ tự động bóc tách nội dung, tạo biểu đồ và đảm bảo không đè chữ khi trình chiếu.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-area { overflow: visible !important; max-height: none !important; }
          .rounded-3xl { border-radius: 0 !important; }
          .shadow-2xl { shadow: none !important; }
          .aspect-[16/9] { margin-bottom: 0; page-break-after: always; height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; box-sizing: border-box; }
        }
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};
