
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Megaphone, 
  Camera, 
  ShieldCheck, 
  Box, 
  Zap, 
  Image as ImageIcon,
  Trash2,
  Layout,
  CaseUpper,
  Info,
  Users,
  PlusCircle
} from 'lucide-react';
import { generatePoster } from '../services/geminiService';
import { AspectRatio } from '../types';

export const PosterGenerator: React.FC = () => {
  const [modelImages, setModelImages] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState('Trong studio chuyên nghiệp, ánh sáng high-key, phông nền tối giản đẳng cấp.');
  const [style, setStyle] = useState('Luxury High-Fashion');
  const [ratio, setRatio] = useState<AspectRatio>('9:16');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const modelInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const posterStyles = [
    { label: 'Sang trọng (Luxury)', value: 'Luxury High-Fashion Advertisement, elegant and expensive look' },
    { label: 'Đường phố (Streetwear)', value: 'Streetwear urban style, gritty lighting, hypebeast aesthetic' },
    { label: 'Tối giản (Minimalist)', value: 'Clean minimalist design, spacious layout, focus on product' },
    { label: 'Điện ảnh (Cinematic)', value: 'Cinematic dramatic lighting, movie poster quality, high contrast' },
    { label: 'Cyberpunk', value: 'Futuristic cyberpunk theme, neon lights, tech-inspired' },
  ];

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && modelImages.length < 3) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setModelImages([...modelImages, reader.result as string]);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeModel = (index: number) => {
    setModelImages(modelImages.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && productImages.length < 3) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImages([...productImages, reader.result as string]);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProduct = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleUpload = (type: 'logo') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (type === 'logo') setLogoImage(dataUrl);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: 'logo', e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'logo') setLogoImage(null);
    setResult(null);
  };

  const handleGenerate = async () => {
    if (modelImages.length === 0 && productImages.length === 0 && !logoImage) {
      setError("Vui lòng tải lên ít nhất một thành phần.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const art = await generatePoster(modelImages, productImages, prompt, style, ratio, logoImage);
      setResult(art);
    } catch (err: any) {
      setError(err.message || "Không thể tạo poster. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Megaphone className="text-brand-400" />
            Poster AI - Chuyên gia quảng cáo
          </h2>
          <p className="text-slate-400 mt-1">Sáng tạo bản thiết kế đa người mẫu và đa sản phẩm với sự bảo tồn diện mạo 100%.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-y-auto max-h-[85vh] custom-scrollbar">
          
          <div className="space-y-4">
             <label className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} /> 1. Danh sách người mẫu ({modelImages.length}/3)
             </label>
             <div className="grid grid-cols-3 gap-3">
                {modelImages.map((m, i) => (
                    <div key={i} className="relative aspect-[3/4] group border border-slate-700 rounded-xl overflow-hidden bg-slate-950 shadow-lg">
                        <img src={m} className="w-full h-full object-cover" />
                        <button onClick={() => removeModel(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                    </div>
                ))}
                {modelImages.length < 3 && (
                    <button 
                        onClick={() => modelInputRef.current?.click()}
                        className="aspect-[3/4] border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800 flex flex-col items-center justify-center rounded-xl transition-all"
                    >
                        <PlusCircle className="text-slate-500 mb-1" size={24} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Thêm mẫu</span>
                    </button>
                )}
             </div>
             <input type="file" ref={modelInputRef} className="hidden" accept="image/*" onChange={handleModelUpload} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Multi Product Upload */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Box size={14} /> 2. Danh sách sản phẩm ({productImages.length}/3)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {productImages.map((p, i) => (
                    <div key={i} className="relative aspect-square group border border-slate-700 rounded-xl overflow-hidden bg-slate-950 shadow-lg p-1">
                        <img src={p} className="w-full h-full object-contain" />
                        <button onClick={() => removeProduct(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                    </div>
                ))}
                {productImages.length < 3 && (
                    <button 
                        onClick={() => productInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-slate-700 hover:border-amber-500 hover:bg-slate-800 flex flex-col items-center justify-center rounded-xl transition-all"
                    >
                        <PlusCircle className="text-slate-500 mb-1" size={20} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase text-center leading-none px-1">Thêm SP</span>
                    </button>
                )}
              </div>
              <input type="file" ref={productInputRef} className="hidden" accept="image/*" onChange={handleProductUpload} />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} /> 3. Logo thương hiệu
              </label>
              <div 
                className={`group relative aspect-[3/2] border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${logoImage ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800'}`}
                onClick={() => logoInputRef.current?.click()}
              >
                {logoImage ? (
                  <>
                    <img src={logoImage} alt="Logo" className="w-full h-full object-contain p-4" />
                    <button onClick={(e) => removeImage('logo', e)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                  </>
                ) : (
                  <div className="text-center p-2"><Upload className="text-slate-500 mb-1 mx-auto" size={20} /><p className="text-slate-400 text-[9px] font-bold uppercase">TẢI LOGO</p></div>
                )}
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleUpload('logo')} />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-lg flex items-start gap-2">
            <Info size={16} className="text-brand-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-tight">
              <b>QUY TRÌNH:</b> AI sẽ xử lý diện mạo của từng người mẫu và đặc điểm của từng sản phẩm trong danh sách tuần tự để đảm bảo bản sắc cá nhân và chi tiết sản phẩm không bị trộn lẫn trong thiết kế tổng thể.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Phong cách thiết kế</label>
            <div className="grid grid-cols-2 gap-2">
              {posterStyles.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setStyle(s.value)}
                  className={`text-left px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${
                    style === s.value 
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">5. Tỉ lệ khung hình</label>
            <div className="flex gap-2">
              {(['9:16', '1:1', '16:9', '4:3'] as AspectRatio[]).map((r) => (
                <button key={r} onClick={() => setRatio(r)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${ratio === r ? 'bg-slate-800 border-brand-500 text-white shadow-inner' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>{r}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">6. Mô tả phối cảnh cụ thể</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ví dụ: Hai người mẫu đang đứng cạnh các sản phẩm được bày trí sang trọng, logo in trên bảng hiệu đèn neon..." className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-1 focus:ring-brand-500 outline-none text-xs resize-none transition-all placeholder:text-slate-700" />
          </div>

          <button
            disabled={(modelImages.length === 0 && productImages.length === 0 && !logoImage) || loading}
            onClick={handleGenerate}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
              (modelImages.length === 0 && productImages.length === 0 && !logoImage) || loading 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-900/30 active:scale-95'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
            {loading ? `Đang phối cảnh ${modelImages.length} mẫu & ${productImages.length} SP...` : 'Thiết kế Poster ngay'}
          </button>
          
          {error && <p className="text-red-400 text-[10px] text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}
        </div>

        {/* Preview Area */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-2xl">
          {result ? (
            <div className="w-full h-full flex flex-col items-center space-y-5 animate-fade-in z-10">
              <div className="relative group max-h-[650px] overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
                <img src={result} alt="Result" className="max-w-full h-auto" />
                <div className="absolute top-4 left-4 bg-brand-500/90 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                  <ShieldCheck size={12} fill="white" /> {modelImages.length} LIKENESSES PROTECTED
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button onClick={() => setResult(null)} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 transition-all">Thiết kế khác</button>
                <a href={result} download={`multi-poster-ncc-${Date.now()}.png`} className="flex-1 bg-white text-slate-950 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-50 transition-all shadow-xl"><Download size={18} /> Tải bản thiết kế 4K</a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-700 z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-inner">
                <Layout size={48} className="opacity-10" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Phòng Lab Thiết kế Đa Người Mẫu & Sản Phẩm</p>
              <p className="text-[10px] mt-4 opacity-40 px-16 leading-relaxed italic text-center">
                Bản sắc của mỗi người mẫu và chi tiết của từng sản phẩm sẽ được duy trì bằng cách phân tích và tái tạo tuần tự một cách tỉ mỉ.
              </p>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="relative mb-6">
                <div className="w-24 h-24 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin"></div>
                <Megaphone className="absolute inset-0 m-auto text-brand-500/50 animate-pulse" size={32} />
              </div>
              <p className="text-white font-bold text-xl animate-pulse tracking-wide">Đang lồng ghép đa mẫu, đa SP & thương hiệu...</p>
              <p className="text-slate-500 text-[10px] mt-3 italic px-12 text-center leading-relaxed">Hệ thống đang bảo tồn likeness cho từng người mẫu và chi tiết sản phẩm lần lượt để đảm bảo sự chuyên nghiệp tối đa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
