import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Download, RefreshCw, Flower, MapPin } from 'lucide-react';
import { generateArtFromPhoto } from '../services/geminiService';

export const TetGenerator: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [style, setStyle] = useState('Tả thực');
  
  // Changed from const to state for user editing
  const [idea, setIdea] = useState("Mặc áo dài truyền thống màu đỏ, cầm bao lì xì may mắn, nụ cười rạng rỡ, không khí vui tươi phấn khởi đón xuân");
  const [context, setContext] = useState("Vườn đào Nhật Tân");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = ['Tả thực', 'Tranh sơn dầu', '3D Render', 'Anime', 'Màu nước', 'Cổ điển', 'Hoạt hình Disney'];
  
  const contexts = [
    "Vườn đào Nhật Tân",
    "Vườn mai vàng rực rỡ",
    "Phố ông đồ - Văn Miếu",
    "Đường hoa Nguyễn Huệ",
    "Phòng khách ấm cúng ngày Tết",
    "Chùa cổ kính linh thiêng",
    "Chợ hoa Tết nhộn nhịp",
    "Bên nồi bánh chưng bếp lửa",
    "Pháo hoa đêm giao thừa",
    "Làng quê yên bình"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    try {
      // Use selected context and user idea
      // Prefix idea with Tet theme to ensure relevance if user types generic text
      const fullPrompt = `Chủ đề Tết Nguyên Đán 2026 (Năm Bính Ngọ): ${idea}`;
      const art = await generateArtFromPhoto(selectedImage, style, context, fullPrompt);
      setResult(art);
    } catch (err: any) {
      setError(err.message || "Không thể tạo ảnh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-red-500 flex items-center gap-2">
            <Flower className="text-yellow-500" />
            Tạo ảnh Xuân 2026
          </h2>
          <p className="text-slate-400 mt-1">Biến ảnh của bạn thành tác phẩm nghệ thuật chào đón Tết Bính Ngọ.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-red-900/30 shadow-lg shadow-red-900/10">
            
            {/* Upload Area */}
            <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${selectedImage ? 'border-red-500 bg-red-500/5' : 'border-slate-700 hover:border-red-400 hover:bg-slate-800'}`}
                onClick={() => fileInputRef.current?.click()}
            >
                {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="h-48 object-contain rounded-lg shadow-lg" />
                ) : (
                    <>
                        <Upload className="text-red-400 mb-3" size={32} />
                        <p className="text-slate-300 font-medium">Tải ảnh cá nhân lên</p>
                        <p className="text-slate-500 text-sm mt-1">Hỗ trợ JPG, PNG</p>
                    </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                />
            </div>

            {/* Settings */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phong cách nghệ thuật</label>
                    <div className="grid grid-cols-3 gap-2">
                        {styles.map(s => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                                    style === s 
                                    ? 'bg-red-600 border-red-500 text-white' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                        <MapPin size={16} className="text-red-400" />
                        Ngoại cảnh / Bối cảnh
                    </label>
                    <select 
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    >
                        {contexts.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Mô tả ý tưởng của bạn (Trang phục, hành động...)</label>
                    <textarea 
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none resize-none h-24 text-sm"
                        placeholder="Mô tả chi tiết..."
                    />
                </div>
            </div>

            {/* Action */}
            <button
                disabled={!selectedImage || loading}
                onClick={handleGenerate}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    !selectedImage || loading 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white shadow-lg shadow-red-900/50'
                }`}
            >
                {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                {loading ? 'Đang vẽ tranh Tết...' : 'Tạo tác phẩm Xuân 2026'}
            </button>

            {error && <p className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded">{error}</p>}
        </div>

        {/* Result Area */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
             {/* Decorative background elements */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-tr-full pointer-events-none"></div>

            {result ? (
                <div className="relative group w-full z-10">
                    <img src={result} alt="Generated Tet Art" className="w-full rounded-xl shadow-2xl border-4 border-slate-800" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <a 
                            href={result} 
                            download={`tet-2026-art-${Date.now()}.png`}
                            className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-yellow-50 transition-colors"
                        >
                            <Download size={18} />
                            Tải về máy
                        </a>
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-500 z-10">
                    <Flower size={64} className="mx-auto mb-4 opacity-20 text-red-500" />
                    <p className="text-lg font-medium">Khung tranh đang trống</p>
                    <p className="text-sm mt-2">Đăng ảnh của bạn để AI hóa thân vào không khí Tết</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};