import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  User, 
  Download, 
  RefreshCw, 
  Camera, 
  ShieldCheck, 
  Briefcase, 
  Zap, 
  Globe, 
  Sprout, 
  Car, 
  Hammer, 
  Plane, 
  BookOpen, 
  Trophy,
  ImagePlus,
  Trash2,
  Layers,
  Info,
  ChevronRight,
  Briefcase as CaseIcon,
  Tag,
  PlusCircle,
  Users
} from 'lucide-react';
import { generateArtFromPhoto } from '../services/geminiService';

export const FaceGenerator: React.FC = () => {
  const [faces, setFaces] = useState<string[]>([]);
  const [personalItem, setPersonalItem] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState('');
  const [environmentDetails, setEnvironmentDetails] = useState('Góc nhìn nghệ thuật, ánh sáng studio sang trọng, phông nền mờ ảo đẳng cấp.');
  const [style, setStyle] = useState('8k Photorealistic Professional Portrait');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const faceInputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    { label: 'Doanh nhân', prompt: 'Mặc vest sang trọng, trong văn phòng hiện đại, ánh sáng chuyên nghiệp, phong thái lãnh đạo.', icon: Briefcase },
    { label: 'Nông dân', prompt: 'Đang đứng trên cánh đồng lúa chín vàng, mặc bộ đồ bà ba nâu giản dị, đội nón lá, ánh sáng bình minh ấm áp.', icon: Sprout },
    { label: 'Lái xe', prompt: 'Đang ngồi trong cabin xe hơi hạng sang, tay cầm vô lăng, trang phục lịch sự, phong cảnh phố xá lung linh ngoài cửa sổ.', icon: Car },
    { label: 'Xây dựng', prompt: 'Đứng tại công trường xây dựng hiện đại, mặc áo bảo hộ phản quang, đội mũ bảo hiểm trắng, cầm bản vẽ kỹ thuật.', icon: Hammer },
    { label: 'Phi công', prompt: 'Trong buồng lái máy bay phản lực, mặc đồng phục phi công chuyên nghiệp với quân hàm, đeo tai nghe, bầu trời mây trắng ngoài cửa sổ.', icon: Plane },
    { label: 'Giáo viên', prompt: 'Đang đứng trên bục giảng lớp học hiện đại, mặc áo dài hoặc vest thanh lịch, bảng xanh và sách vở phía sau.', icon: BookOpen },
    { label: 'Thể thao', prompt: 'Trong trang phục thể thao năng động, đang ở sân vận động hoặc phòng gym, mồ hôi lấp lánh, dáng vẻ khỏe khoắn đầy năng lượng.', icon: Trophy },
    { label: 'Cyberpunk', prompt: 'Trong thành phố tương lai ban đêm, ánh sáng neon tím và xanh, trang phục công nghệ high-tech.', icon: Zap },
    { label: 'Du lịch', prompt: 'Đang đứng trước tháp Eiffel Paris, phong cách dạo phố thanh lịch, trời nắng đẹp rực rỡ.', icon: Globe },
    { label: 'Điện ảnh', prompt: 'Phong cách chân dung phim Hollywood, ánh sáng dramatic, trang phục cổ điển sang trọng.', icon: Camera },
  ];

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && faces.length < 4) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaces([...faces, reader.result as string]);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFace = (index: number) => {
    setFaces(faces.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleAssetUpload = (type: 'item' | 'logo') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (type === 'item') setPersonalItem(dataUrl);
        else setCompanyLogo(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (faces.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const art = await generateArtFromPhoto(
        faces, 
        style, 
        environmentDetails, 
        prompt, 
        personalItem,
        companyLogo
      );
      setResult(art);
    } catch (err: any) {
      setError(err.message || "Không thể khởi tạo ảnh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <User className="text-brand-400" />
            Face Master AI - Đa nhân vật
          </h2>
          <p className="text-slate-400 mt-1">Xử lý diện mạo từng người một, giữ đúng 100% đường nét kể cả khi tạo ảnh nhóm.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-y-auto max-h-[85vh] custom-scrollbar">
          
          {/* Section 1: Faces List */}
          <div className="space-y-3">
             <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} className="text-green-500" />
                1. Danh sách diện mạo ({faces.length}/4)
             </label>
             <div className="grid grid-cols-4 gap-3">
                {faces.map((f, i) => (
                    <div key={i} className="relative aspect-square group border border-slate-700 rounded-xl overflow-hidden bg-slate-950">
                        <img src={f} className="w-full h-full object-cover" />
                        <button 
                            onClick={() => removeFace(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={10} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center font-bold text-white py-0.5 uppercase">Người mẫu {i+1}</div>
                    </div>
                ))}
                {faces.length < 4 && (
                    <button 
                        onClick={() => faceInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-slate-700 hover:border-brand-500 hover:bg-slate-800 flex flex-col items-center justify-center rounded-xl transition-all"
                    >
                        <PlusCircle className="text-slate-500 mb-1" size={20} />
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Thêm người</span>
                    </button>
                )}
             </div>
             <input type="file" ref={faceInputRef} className="hidden" accept="image/*" onChange={handleFaceUpload} />
          </div>

          {/* Section 2: Assets */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-amber-400 mb-1 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={12} /> 2. Vật phẩm riêng
                </label>
                <div 
                  className={`relative aspect-[2/1] border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${personalItem ? 'border-amber-500 bg-amber-500/5' : 'border-slate-700 hover:border-amber-500 hover:bg-slate-800'}`}
                  onClick={() => itemInputRef.current?.click()}
                >
                  {personalItem ? (
                    <div className="relative group w-full h-full p-2">
                      <img src={personalItem} alt="Item" className="w-full h-full object-contain" />
                      <button onClick={(e) => { e.stopPropagation(); setPersonalItem(null); }} className="absolute top-1 right-1 bg-red-500 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                    </div>
                  ) : (
                    <div className="text-center p-1"><ImagePlus className="text-slate-500 mb-1 mx-auto" size={18} /><p className="text-slate-300 font-bold text-[8px]">VẬT PHẨM</p></div>
                  )}
                  <input type="file" ref={itemInputRef} className="hidden" accept="image/*" onChange={handleAssetUpload('item')} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-widest flex items-center gap-1.5">
                  <CaseIcon size={12} /> 3. Logo thương hiệu
                </label>
                <div 
                  className={`relative aspect-[2/1] border border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${companyLogo ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800'}`}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {companyLogo ? (
                    <div className="relative group w-full h-full p-2">
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-contain" />
                      <button onClick={(e) => { e.stopPropagation(); setCompanyLogo(null); }} className="absolute top-1 right-1 bg-red-500 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                    </div>
                  ) : (
                    <div className="text-center p-1"><Upload className="text-slate-500 mb-1 mx-auto" size={18} /><p className="text-slate-300 font-bold text-[8px]">LOGO</p></div>
                  )}
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleAssetUpload('logo')} />
                </div>
              </div>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4 shadow-inner">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="text-brand-400" /> 4. Mô tả bối cảnh & Tương tác nhóm
                </label>
                <textarea 
                    value={environmentDetails}
                    onChange={(e) => setEnvironmentDetails(e.target.value)}
                    placeholder="Mô tả bối cảnh và cách mọi người tương tác với nhau... (Ví dụ: Nhóm bạn đang ngồi quây quần trong quán cafe, ánh sáng ấm, vui vẻ)"
                    className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-xs outline-none focus:ring-1 focus:ring-brand-500 resize-none transition-all placeholder:text-slate-700"
                />
            </div>

            <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">5. Nhân vật hóa thân nhanh</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {presets.map((p) => (
                    <button
                        key={p.label}
                        onClick={() => setPrompt(p.prompt)}
                        className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl transition-all border ${
                            prompt === p.prompt 
                            ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                    >
                        <p.icon size={16} />
                        <span className="text-[9px] font-bold truncate w-full text-center">{p.label}</span>
                    </button>
                ))}
                </div>
            </div>
          </div>

          <div className="space-y-3">
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Mô tả bổ sung về trang phục/phong thái</label>
             <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Người mẫu 1 mặc vest đen, người mẫu 2 mặc váy trắng, cả hai đang cười tươi..."
                className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs outline-none focus:ring-1 focus:ring-brand-500 resize-none transition-all"
             />
          </div>

          <button
            disabled={faces.length === 0 || loading}
            onClick={handleGenerate}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
              faces.length === 0 || loading 
              ? 'bg-slate-800 text-slate-600' 
              : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-900/40'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {loading ? `Đang xử lý ${faces.length} diện mạo...` : 'Hóa thân nhân vật ngay'}
          </button>
          
          <div className="p-3 bg-brand-400/5 border border-brand-400/10 rounded-lg flex gap-3 items-start">
              <Info size={16} className="text-brand-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  <b>Xử lý đa diện mạo:</b> Hệ thống sẽ phân tích và bảo tồn đường nét của từng chủ thể lần lượt một cách độc lập để đảm bảo độ chính xác 100% cho mỗi khuôn mặt trong ảnh nhóm.
              </p>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-2xl">
          {result ? (
            <div className="w-full space-y-5 animate-fade-in z-10">
              <div className="relative group rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                <img src={result} alt="Result" className="w-full h-auto" />
                <div className="absolute top-4 left-4 bg-brand-500/90 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                  <ShieldCheck size={12} fill="white" /> {faces.length} IDENTITIES PRESERVED
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={() => setResult(null)} 
                    className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw size={18} /> Phối cảnh mới
                </button>
                <a 
                    href={result} 
                    download={`multi-face-ncc-${Date.now()}.png`} 
                    className="flex-1 bg-white text-slate-950 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-50 transition-all shadow-xl"
                >
                    <Download size={18} /> Tải ảnh gốc
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-700 z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-inner">
                <Users size={48} className="opacity-10" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Phòng Lab Đa Nhân Vật</p>
              <p className="text-[10px] mt-4 opacity-40 px-16 leading-relaxed italic text-center">
                Mọi diện mạo sẽ được xử lý riêng biệt trong luồng AI để đảm bảo giữ trọn vẹn đường nét thật của từng người một.
              </p>
            </div>
          )}

          {/* Loading States */}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="relative mb-6">
                <div className="w-24 h-24 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-brand-500/50 animate-pulse" size={32} />
              </div>
              <p className="text-white font-bold text-xl animate-pulse tracking-wide">Đang hóa thân đa nhân vật...</p>
              <p className="text-slate-500 text-xs mt-3 italic px-12 text-center leading-relaxed">
                Hệ thống đang xử lý tuần tự từng người trong danh sách để đạt độ likeness tối đa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};