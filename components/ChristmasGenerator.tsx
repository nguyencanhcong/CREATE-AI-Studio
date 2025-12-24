import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Download, RefreshCw, Snowflake, MapPin, Church } from 'lucide-react';
import { generateArtFromPhoto } from '../services/geminiService';

export const ChristmasGenerator: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [style, setStyle] = useState('Tả thực');
  const [idea, setIdea] = useState("Mặc áo len đỏ, khăn choàng len trắng, đội mũ Noel xinh xắn, khuôn mặt rạng rỡ hạnh phúc");
  const [context, setContext] = useState("Nhà thờ Lớn Hà Nội - Giáng sinh lung linh");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = ['Tả thực', 'Tranh sơn dầu', '3D Render', 'Anime', 'Màu nước', 'Cổ điển', 'Phác thảo chì'];
  
  const contexts = [
    "Nhà thờ Lớn Hà Nội - Giáng sinh lung linh",
    "Nhà thờ Đức Bà Sài Gòn - Rực rỡ ánh đèn",
    "Đường phố Châu Âu tuyết rơi trắng xóa",
    "Phòng khách ấm cúng bên cây thông Noel",
    "Chợ Giáng sinh nhộn nhịp tại Đức",
    "Bên lò sưởi bập bùng lửa ấm",
    "Rừng thông tuyết rơi lãng mạn",
    "Quảng trường trung tâm rực rỡ pháo hoa",
    "Cửa hàng đồ chơi Giáng sinh rực rỡ",
    "Cảnh đêm phố đi bộ trang hoàng Noel"
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
      // Prompt đặc biệt nhấn mạnh giữ nguyên các nét khuôn mặt
      const fullPrompt = `Christmas Theme: ${idea}. 
      STRICT REQUIREMENT: Preserve the exact facial features, eyes, nose, lips, cheeks, and smile of the person from the uploaded photo. 
      Place them naturally in the ${context} environment. High quality, festive lighting.`;
      
      const art = await generateArtFromPhoto(selectedImage, style, context, fullPrompt);
      setResult(art);
    } catch (err: any) {
      setError(err.message || "Không thể tạo ảnh Giáng sinh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-green-500 flex items-center gap-2">
            <Snowflake className="text-blue-300 animate-pulse" />
            Sáng tạo Ảnh Giáng sinh
          </h2>
          <p className="text-slate-400 mt-1">Hóa thân vào không gian Noel lung linh, giữ trọn nét đẹp cá nhân.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-green-900/30 shadow-lg shadow-green-900/10">
            
            {/* Upload Area */}
            <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${selectedImage ? 'border-green-500 bg-green-500/5' : 'border-slate-700 hover:border-green-400 hover:bg-slate-800'}`}
                onClick={() => fileInputRef.current?.click()}
            >
                {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="h-48 object-contain rounded-lg shadow-lg" />
                ) : (
                    <>
                        <Upload className="text-green-400 mb-3" size={32} />
                        <p className="text-slate-300 font-medium">Tải ảnh chân dung của bạn</p>
                        <p className="text-slate-500 text-sm mt-1">Rõ nét khuôn mặt để có kết quả tốt nhất</p>
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
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phong cách</label>
                    <div className="grid grid-cols-3 gap-2">
                        {styles.map(s => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${
                                    style === s 
                                    ? 'bg-green-600 border-green-500 text-white' 
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
                        <MapPin size={16} className="text-red-500" />
                        Bối cảnh Noel
                    </label>
                    <select 
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                    >
                        {contexts.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Ý tưởng trang phục / Hành động</label>
                    <textarea 
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none resize-none h-24 text-sm"
                        placeholder="Ví dụ: Cầm cốc ca cao nóng, đội mũ len, cười tươi..."
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
                    : 'bg-gradient-to-r from-green-700 to-red-600 hover:from-green-600 hover:to-red-500 text-white shadow-lg shadow-green-900/50'
                }`}
            >
                {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                {loading ? 'Đang tạo phép màu Noel...' : 'Tạo ảnh Giáng sinh'}
            </button>

            {error && <p className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded">{error}</p>}
        </div>

        {/* Result Area */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden shadow-inner">
             {/* Decorative snowflakes */}
             <div className="absolute top-4 right-4 text-white/5"><Snowflake size={120} /></div>
             <div className="absolute bottom-4 left-4 text-white/5"><Church size={120} /></div>

            {result ? (
                <div className="relative group w-full z-10">
                    <img src={result} alt="Generated Christmas Art" className="w-full rounded-xl shadow-2xl border-4 border-slate-800" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <a 
                            href={result} 
                            download={`christmas-ncc-ai-${Date.now()}.png`}
                            className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-green-50 transition-colors"
                        >
                            <Download size={18} />
                            Tải ảnh về
                        </a>
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-500 z-10">
                    <Snowflake size={64} className="mx-auto mb-4 opacity-20 text-blue-400" />
                    <p className="text-lg font-medium">Bức tranh Noel đang chờ bạn</p>
                    <p className="text-sm mt-2">Đăng ảnh để AI đưa bạn đến không gian Giáng sinh tuyệt vời</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};