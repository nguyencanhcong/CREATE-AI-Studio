
import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Loader2, 
  Maximize2, 
  Type, 
  LayoutTemplate, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ImagePlus, 
  Trash2, 
  Circle, 
  Square,
  Settings,
  Layers,
  Sparkles,
  Plus,
  Type as TypeIcon,
  Lightbulb
} from 'lucide-react';
import { generateBackgroundImage } from '../services/geminiService';
import { AspectRatio } from '../types';

type FontFamily = 'Inter' | 'Playfair Display' | 'Dancing Script' | 'Patrick Hand' | 'Oswald';

interface TextLayer {
  id: string;
  content: string;
  fontFamily: FontFamily;
  fontSize: number;
  color: string;
  x: number; 
  y: number; 
}

interface PersonalAsset {
    id: string;
    image: string;
    x: number; 
    y: number; 
    scale: number; 
    shape: 'original' | 'circle' | 'square';
    label: string;
}

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
    { value: 'Inter', label: 'Hiện đại (Inter)' },
    { value: 'Playfair Display', label: 'Sang trọng (Serif)' },
    { value: 'Dancing Script', label: 'Nghệ thuật (Script)' },
    { value: 'Patrick Hand', label: 'Viết tay (Hand)' },
    { value: 'Oswald', label: 'Tiêu đề (Oswald)' },
];

export const BackgroundGenerator: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [prompt, setPrompt] = useState('');
  const [perspective, setPerspective] = useState('Góc nhìn chính diện, ánh sáng studio mềm mại');
  const [bgIdeaImage, setBgIdeaImage] = useState<string | null>(null);
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // States cho lớp văn bản mới
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  
  const [assets, setAssets] = useState<PersonalAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
  const assetInputRef = useRef<HTMLInputElement>(null);
  const bgIdeaInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);

  const addTextLayer = () => {
    const newLayer: TextLayer = {
        id: Date.now().toString(),
        content: 'Thông điệp mới',
        fontFamily: 'Inter',
        fontSize: 3,
        color: '#ffffff',
        x: 50,
        y: 50
    };
    setTextLayers(prev => [...prev, newLayer]);
    setSelectedTextId(newLayer.id);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTextLayer = (id: string) => {
    setTextLayers(prev => prev.filter(t => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleBgIdeaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgIdeaImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const newAsset: PersonalAsset = {
                id: Date.now().toString(),
                image: reader.result as string,
                x: 50,
                y: 50,
                scale: 1,
                shape: 'original',
                label: file.name.substring(0, 15)
            };
            setAssets(prev => [...prev, newAsset]);
            setSelectedAssetId(newAsset.id);
            setStep(2); 
        };
        reader.readAsDataURL(file);
    }
  };

  const updateAsset = (id: string, updates: Partial<PersonalAsset>) => {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeAsset = (id: string) => {
      setAssets(prev => prev.filter(a => a.id !== id));
      if (selectedAssetId === id) setSelectedAssetId(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !bgIdeaImage) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fullDescription = `${prompt || "Tạo phông nền dựa trên hình ảnh ý tưởng"}. Phối cảnh: ${perspective}.`;
      // Fix: Removed extra arguments to match generateBackgroundImage signature (prompt, ratio)
      const img = await generateBackgroundImage(fullDescription, ratio);
      setResult(img);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Không thể khởi tạo không gian. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadComposite = async () => {
    if (!result) return;
    setIsProcessingDownload(true);
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous"; 
        
        bgImg.onload = async () => {
            if (!ctx) return;
            canvas.width = bgImg.width; canvas.height = bgImg.height;
            ctx.drawImage(bgImg, 0, 0);

            // Vẽ Vật phẩm cá nhân
            for (const asset of assets) {
                await new Promise<void>((resolve) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        const baseWidth = canvas.width * 0.2;
                        const destW = baseWidth * asset.scale;
                        const destH = destW / (img.width / img.height);
                        const centerX = canvas.width * (asset.x / 100);
                        const centerY = canvas.height * (asset.y / 100);
                        const xPos = centerX - (destW / 2);
                        const yPos = centerY - (destH / 2);

                        ctx.save();
                        if (asset.shape === 'circle') {
                             ctx.beginPath();
                             ctx.arc(centerX, centerY, Math.min(destW, destH) / 2, 0, Math.PI * 2);
                             ctx.clip();
                        } else if (asset.shape === 'square') {
                             const side = Math.min(destW, destH);
                             ctx.beginPath();
                             ctx.rect(centerX - side/2, centerY - side/2, side, side);
                             ctx.clip();
                        }
                        ctx.drawImage(img, xPos, yPos, destW, destH);
                        ctx.restore();
                        resolve();
                    };
                    img.src = asset.image;
                });
            }

            // Vẽ Văn bản (Text Layers)
            for (const layer of textLayers) {
                if (!layer.content.trim()) continue;
                const baseFontSize = canvas.width / 40; 
                const fontSize = baseFontSize * layer.fontSize;
                const xPos = canvas.width * (layer.x / 100);
                const yPos = canvas.height * (layer.y / 100);
                
                ctx.font = `bold ${fontSize}px "${layer.fontFamily}", sans-serif`;
                ctx.textAlign = 'center'; 
                ctx.textBaseline = 'middle';
                
                ctx.fillStyle = layer.color;
                ctx.shadowColor = "rgba(0,0,0,0.5)"; 
                ctx.shadowBlur = fontSize / 5;
                ctx.fillText(layer.content, xPos, yPos);
            }
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png'); 
            link.download = `studio-ncc-${Date.now()}.png`; 
            link.click();
            setIsProcessingDownload(false);
        };
        bgImg.src = result;
    } catch (e) { 
        setIsProcessingDownload(false); 
        setError("Lỗi khi tải ảnh về. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-brand-400" size={28} />
            Không gian Sáng tạo AI
          </h2>
          <p className="text-slate-400 mt-1">
              Thiết kế phối cảnh chuyên nghiệp & Cá nhân hóa với vật phẩm và thông điệp của riêng bạn.
          </p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button onClick={() => setStep(1)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${step === 1 ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500'}`}>1. Thiết kế</button>
            <button onClick={() => setStep(2)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${step === 2 ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500'}`}>2. Tùy chỉnh</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Controls Panel */}
        <div className="w-full lg:w-1/3 space-y-6 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 h-full overflow-y-auto custom-scrollbar flex flex-col shadow-2xl">
            {step === 1 ? (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <label className="block text-sm font-bold text-brand-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Lightbulb size={16} /> Hình ảnh Ý tưởng (Tùy chọn)
                        </label>
                        <div 
                          onClick={() => bgIdeaInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${bgIdeaImage ? 'border-brand-500 bg-brand-500/5' : 'border-slate-700 hover:border-brand-500 hover:bg-slate-800'}`}
                        >
                          {bgIdeaImage ? (
                            <div className="relative group w-full h-32">
                              <img src={bgIdeaImage} alt="Idea" className="w-full h-full object-cover rounded-lg" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                <span className="text-white text-xs font-bold">Thay đổi ảnh ý tưởng</span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setBgIdeaImage(null); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-10"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="text-slate-500 mb-2" size={24} />
                              <p className="text-slate-400 text-xs text-center font-medium">Tải ảnh mẫu bối cảnh lên</p>
                            </>
                          )}
                          <input type="file" ref={bgIdeaInputRef} onChange={handleBgIdeaUpload} className="hidden" accept="image/*" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-brand-400 mb-2 uppercase tracking-wider">Mô tả phông nền</label>
                        <textarea 
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)} 
                            placeholder="Mô tả bối cảnh bạn muốn... (Ví dụ: Phòng khách hiện đại với nội thất gỗ cao cấp)" 
                            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-brand-400 mb-2 uppercase tracking-wider">Phối cảnh & Ánh sáng</label>
                        <textarea 
                            value={perspective} 
                            onChange={(e) => setPerspective(e.target.value)} 
                            placeholder="Ví dụ: Góc nhìn rộng từ trên xuống, ánh sáng nắng ban mai xuyên qua cửa sổ" 
                            className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-brand-400 mb-3 uppercase tracking-wider">Tỉ lệ khung hình</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['16:9', '9:16', '1:1', '4:3', '3:4'].map((r) => (
                                <button key={r} onClick={() => setRatio(r as AspectRatio)} className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${ratio === r ? 'bg-brand-500/20 border-brand-500 text-brand-400 shadow-inner' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}><span className="text-xs font-bold">{r}</span></button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={(!prompt && !bgIdeaImage) || loading} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all mt-auto shadow-xl ${(!prompt && !bgIdeaImage) || loading ? 'bg-slate-800 text-slate-600' : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:scale-[1.02]'}`}>
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />} 
                        {loading ? 'Đang khởi tạo...' : 'Bắt đầu sáng tạo'}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in flex flex-col h-full">
                    {/* Assets Management */}
                    <div className="pb-4 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-brand-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers size={16} /> Vật phẩm cá nhân
                            </h3>
                            <button onClick={() => assetInputRef.current?.click()} className="p-2 bg-brand-500/10 text-brand-400 rounded-lg hover:bg-brand-500/20 transition-all border border-brand-500/20">
                                <ImagePlus size={18} />
                            </button>
                            <input type="file" ref={assetInputRef} onChange={handleAssetUpload} className="hidden" accept="image/*" />
                        </div>

                        {assets.length > 0 && (
                            <div className="space-y-3">
                                {assets.map(asset => (
                                    <div key={asset.id} className={`p-3 rounded-xl border transition-all ${selectedAssetId === asset.id ? 'bg-slate-800 border-brand-500 ring-1 ring-brand-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setSelectedAssetId(asset.id === selectedAssetId ? null : asset.id)}>
                                            <div className="flex items-center gap-3">
                                                <img src={asset.image} className="w-8 h-8 object-contain bg-white/5 rounded border border-slate-700" />
                                                <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{asset.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                                                {selectedAssetId === asset.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                        
                                        {selectedAssetId === asset.id && (
                                            <div className="space-y-3 pt-3 border-t border-slate-800 animate-fade-in">
                                                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                                                    {(['original', 'circle', 'square'] as const).map(s => (
                                                        <button key={s} onClick={() => updateAsset(asset.id, { shape: s })} className={`flex-1 py-1 rounded text-[10px] font-bold capitalize ${asset.shape === s ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>{s === 'original' ? 'Gốc' : s === 'circle' ? 'Tròn' : 'Vuông'}</button>
                                                    ))}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Kích thước</span><span>{Math.round(asset.scale * 100)}%</span></div>
                                                    <input type="range" min="0.1" max="3" step="0.1" value={asset.scale} onChange={(e) => updateAsset(asset.id, { scale: parseFloat(e.target.value) })} className="w-full h-1 bg-slate-800 rounded appearance-none accent-brand-500" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Vị trí X</span>
                                                        <input type="range" min="0" max="100" value={asset.x} onChange={(e) => updateAsset(asset.id, { x: parseInt(e.target.value) })} className="w-full h-1 bg-slate-800 rounded appearance-none accent-brand-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Vị trí Y</span>
                                                        <input type="range" min="0" max="100" value={asset.y} onChange={(e) => updateAsset(asset.id, { y: parseInt(e.target.value) })} className="w-full h-1 bg-slate-800 rounded appearance-none accent-brand-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Text Layers Management */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-brand-400 uppercase tracking-widest flex items-center gap-2">
                                <TypeIcon size={16} /> Thông điệp / Slogan
                            </h3>
                            <button onClick={addTextLayer} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                                <Plus size={18} />
                            </button>
                        </div>
                        
                        <div className="space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar">
                            {textLayers.length === 0 ? (
                                <p className="text-[11px] text-slate-500 italic text-center py-4 bg-slate-950/50 rounded-lg border border-dashed border-slate-800">
                                    Chưa có thông điệp. Hãy nhấn dấu (+) để thêm.
                                </p>
                            ) : (
                                textLayers.map((layer) => (
                                    <div key={layer.id} className={`p-3 rounded-xl border transition-all ${selectedTextId === layer.id ? 'bg-slate-800 border-brand-500 ring-1 ring-brand-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                                        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setSelectedTextId(layer.id === selectedTextId ? null : layer.id)}>
                                            <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{layer.content || 'Nội dung...'}</span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); removeTextLayer(layer.id); }} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                                                {selectedTextId === layer.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                        
                                        {selectedTextId === layer.id && (
                                            <div className="space-y-4 pt-3 border-t border-slate-800 animate-fade-in">
                                                <div>
                                                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Nội dung</label>
                                                    <input 
                                                        type="text" 
                                                        value={layer.content} 
                                                        onChange={(e) => updateTextLayer(layer.id, { content: e.target.value })} 
                                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:ring-1 focus:ring-brand-500 outline-none" 
                                                        placeholder="Nhập slogan..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Phông chữ</label>
                                                        <select value={layer.fontFamily} onChange={(e) => updateTextLayer(layer.id, { fontFamily: e.target.value as FontFamily })} className="w-full h-8 bg-slate-900 border border-slate-700 rounded text-[10px] text-white px-2 outline-none">{FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Màu sắc</label>
                                                        <input type="color" value={layer.color} onChange={(e) => updateTextLayer(layer.id, { color: e.target.value })} className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer border-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase"><span>Cỡ chữ</span><span>{Math.round(layer.fontSize * 10)}</span></div>
                                                    <input type="range" min="0.5" max="10" step="0.1" value={layer.fontSize} onChange={(e) => updateTextLayer(layer.id, { fontSize: parseFloat(e.target.value) })} className="w-full h-1 bg-slate-800 rounded appearance-none accent-brand-500" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Vị trí X</span>
                                                        <input type="range" min="0" max="100" value={layer.x} onChange={(e) => updateTextLayer(layer.id, { x: parseInt(e.target.value) })} className="w-full h-1 bg-slate-800 rounded appearance-none accent-brand-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Vị trí Y</span>
                                                        <input type="range" min="0" max="100" value={layer.y} onChange={(e) => updateTextLayer(layer.id, { y: parseInt(e.target.value) })} className="w-full h-1 bg-slate-800 rounded appearance-none accent-brand-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Preview Canvas Area */}
        <div className="flex-1 bg-black/60 rounded-2xl border border-slate-800 flex items-center justify-center p-6 relative overflow-hidden shadow-inner">
            {result ? (
                <div className="relative max-w-full max-h-full flex flex-col items-center justify-center animate-fade-in">
                    <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-700">
                        <img src={result} alt="Space Preview" className="max-w-full max-h-[calc(100vh-280px)] object-contain" />
                        
                        {/* Interactive Overlays on Preview */}
                        <div className="absolute inset-0 pointer-events-none">
                            {assets.map(asset => (
                                <div key={asset.id} className="absolute transition-transform" style={{ left: `${asset.x}%`, top: `${asset.y}%`, transform: 'translate(-50%, -50%)', width: `${20 * asset.scale}%` }}>
                                    <div style={{ borderRadius: asset.shape === 'circle' ? '50%' : asset.shape === 'square' ? '0' : 'inherit', overflow: 'hidden' }}>
                                        <img src={asset.image} alt="Asset" className="w-full h-auto drop-shadow-2xl" />
                                    </div>
                                </div>
                            ))}
                            {textLayers.map((layer) => (
                                <div key={layer.id} className="absolute whitespace-nowrap" style={{ left: `${layer.x}%`, top: `${layer.y}%`, transform: 'translate(-50%, -50%)' }}>
                                    <h2 style={{ fontFamily: `"${layer.fontFamily}", sans-serif`, color: layer.color, textShadow: '2px 2px 4px rgba(0,0,0,0.6)', fontSize: `${layer.fontSize * 1.5}vmin` }} className="font-bold px-4 text-center">{layer.content}</h2>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 flex gap-3">
                        <button onClick={() => setStep(1)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold border border-slate-700 transition-all flex items-center gap-2 shadow-lg"><Settings size={18} /> Chỉnh phối cảnh</button>
                        <button onClick={handleDownloadComposite} disabled={isProcessingDownload} className="bg-white text-slate-950 hover:bg-brand-50 px-8 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 transition-all active:scale-95">
                            {isProcessingDownload ? <Loader2 className="animate-spin" /> : <Download size={20} />} 
                            {isProcessingDownload ? 'Đang xuất file...' : 'Tải tác phẩm'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-600 animate-pulse">
                    <ImageIcon size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="text-xl font-bold uppercase tracking-[0.2em] opacity-30">Phòng Lab Phối Cảnh AI</p>
                </div>
            )}
            {loading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-30 transition-all">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-white font-bold text-lg tracking-wide">Đang tính toán ánh sáng & phối cảnh...</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
