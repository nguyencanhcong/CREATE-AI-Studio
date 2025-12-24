import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Download, RefreshCw, Lightbulb } from 'lucide-react';
import { generateArtFromPhoto } from '../services/geminiService';

export const ArtGenerator: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [style, setStyle] = useState('Tranh sơn dầu');
  const [context, setContext] = useState('Studio');
  const [idea, setIdea] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = ['Tranh sơn dầu', 'Anime', 'Cyberpunk', 'Màu nước', '3D Render', 'Phác thảo chì', 'Cổ điển', 'Hoạt hình Disney', 'Tả thực'];
  const contexts = ['Studio', 'Thiên nhiên', 'Vũ trụ', 'Đô thị', 'Kỳ ảo', 'Tối giản', 'Vườn hoa', 'Biển cả'];

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
      const instruction = idea.trim() ? idea : "High quality, artistic masterpiece, detailed";
      const art = await generateArtFromPhoto(selectedImage, style, context, instruction);
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
          <h2 className="text-3xl font-bold text-white">Tạo ảnh nghệ thuật</h2>
          <p className="text-stone-400 mt-1">Biến đổi ảnh chụp thành tranh vẽ nghệ thuật, giữ nguyên khuôn mặt.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 bg-stone-900/50 p-6 rounded-2xl border border-stone-800 shadow-xl">
            <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${selectedImage ? 'border-brand-500 bg-brand-500/5' : 'border-stone-700 hover:border-brand-500 hover:bg-stone-800'}`}
                onClick={() => fileInputRef.current?.click()}
            >
                {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="h-48 object-contain rounded-lg shadow-lg" />
                ) : (
                    <>
                        <Upload className="text-stone-400 mb-3" size={32} />
                        <p className="text-stone-300 font-medium">Tải ảnh gốc lên</p>
                        <p className="text-stone-500 text-sm mt-1">Hỗ trợ JPG, PNG</p>
                    </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-stone-400 mb-2">Phong cách</label>
                    <select 
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        {styles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-400 mb-2">Bối cảnh</label>
                    <select 
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        {contexts.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-400 mb-2">
                        <Lightbulb size={16} className="text-brand-500" />
                        Ý tưởng sáng tạo (Tùy chọn)
                    </label>
                    <textarea 
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Mô tả chi tiết ý tưởng của bạn..."
                        className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none resize-none h-24 text-sm"
                    />
                </div>
            </div>

            <button
                disabled={!selectedImage || loading}
                onClick={handleGenerate}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    !selectedImage || loading 
                    ? 'bg-stone-700 text-stone-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-lg shadow-brand-900/50'
                }`}
            >
                {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                {loading ? 'Đang sáng tạo...' : 'Tạo tác phẩm'}
            </button>
            {error && <p className="text-accent-500 text-sm text-center bg-accent-500/10 p-2 rounded">{error}</p>}
        </div>

        <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 flex flex-col items-center justify-center min-h-[400px]">
            {result ? (
                <div className="relative group w-full">
                    <img src={result} alt="Generated Art" className="w-full rounded-xl shadow-2xl" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <a 
                            href={result} 
                            download={`create-ai-art-${Date.now()}.png`}
                            className="bg-white text-stone-950 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-brand-50 transition-colors"
                        >
                            <Download size={18} /> Tải về
                        </a>
                    </div>
                </div>
            ) : (
                <div className="text-center text-stone-500">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Tác phẩm của bạn sẽ xuất hiện ở đây</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};