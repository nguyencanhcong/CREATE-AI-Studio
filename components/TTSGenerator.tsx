
import React, { useState } from 'react';
import { Mic, Play, Download, StopCircle, Volume2, Info, Check, MapPin, User, Headphones } from 'lucide-react';
import { generateSpeech, playAudio, downloadAudioFile } from '../services/geminiService';
import { VoiceProfile } from '../types';

interface ExtendedVoiceProfile extends VoiceProfile {
    description: string;
    promptInstruction: string;
}

const voices: ExtendedVoiceProfile[] = [
  // MIỀN BẮC
  { 
    id: 'nb-kt', 
    name: 'NSƯT Kim Tiến', 
    region: 'North', 
    gender: 'Female', 
    style: 'News', 
    geminiVoiceName: 'Kore', 
    description: 'Giọng đọc huyền thoại "Thuê bao quý khách vừa gọi...", mực thước và sang trọng.',
    promptInstruction: 'Hãy đóng vai NSƯT Kim Tiến, giọng phát thanh viên huyền thoại của VTV. Đọc văn bản sau với ngữ điệu điềm đạm, sang trọng, phát âm cực kỳ chuẩn mực và rõ ràng: '
  },
  { 
    id: 'nb-1', 
    name: 'Mạnh Cường', 
    region: 'North', 
    gender: 'Male', 
    style: 'News', 
    geminiVoiceName: 'Puck', 
    description: 'Giọng Nam Hà Nội chuẩn, chững chạc, phù hợp đọc tin tức, phóng sự.',
    promptInstruction: 'Hãy đọc văn bản sau bằng giọng Nam Hà Nội chuẩn, phát âm rõ ràng, phong thái chuyên nghiệp: '
  },
  { 
    id: 'nb-2', 
    name: 'Mai Lan', 
    region: 'North', 
    gender: 'Female', 
    style: 'Story', 
    geminiVoiceName: 'Kore', 
    description: 'Giọng Nữ Hà Nội nhẹ nhàng, truyền cảm, phù hợp kể chuyện, tâm sự.',
    promptInstruction: 'Hãy đọc văn bản sau bằng giọng Nữ Hà Nội dịu dàng, truyền cảm, nhịp điệu chậm rãi: '
  },
  // MIỀN TRUNG
  { 
    id: 'mt-1', 
    name: 'Quốc Bảo', 
    region: 'Central', 
    gender: 'Male', 
    style: 'Promo', 
    geminiVoiceName: 'Fenrir', 
    description: 'Giọng Nam miền Trung hào sảng, mạnh mẽ, phù hợp quảng cáo.',
    promptInstruction: 'Hãy đọc văn bản sau với ngữ điệu Nam miền Trung (Đà Nẵng/Quảng Nam) hào sảng, đầy năng lượng: '
  },
  { 
    id: 'mt-2', 
    name: 'Anh Phương', 
    region: 'Central', 
    gender: 'Female', 
    style: 'News', 
    geminiVoiceName: 'Kore', 
    description: 'Giọng Nữ Huế ngọt ngào, sang trọng, chuẩn phát thanh viên.',
    promptInstruction: 'Hãy đọc văn bản sau bằng giọng Nữ Huế ngọt ngào, tinh tế, giữ được nét đặc trưng của cố đô: '
  },
  // MIỀN NAM
  { 
    id: 'mn-1', 
    name: 'Minh Tuấn', 
    region: 'South', 
    gender: 'Male', 
    style: 'Story', 
    geminiVoiceName: 'Zephyr', 
    description: 'Giọng Nam Sài Gòn chân chất, ấm áp, gần gũi.',
    promptInstruction: 'Hãy đọc văn bản sau bằng giọng Nam Sài Gòn chân chất, ấm áp, phong cách trò chuyện tự nhiên: '
  },
  { 
    id: 'mn-2', 
    name: 'Ngọc Bích', 
    region: 'South', 
    gender: 'Female', 
    style: 'Promo', 
    geminiVoiceName: 'Kore', 
    description: 'Giọng Nữ Sài Gòn rạng rỡ, trẻ trung, phù hợp giới trẻ.',
    promptInstruction: 'Hãy đọc văn bản sau bằng giọng Nữ Sài Gòn rạng rỡ, trẻ trung, tốc độ nhanh vừa phải: '
  },
];

export const TTSGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(voices[0].id);
  const [loading, setLoading] = useState(false);
  const [audioResult, setAudioResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentVoice = voices.find(v => v.id === selectedVoiceId) || voices[0];

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Kết hợp chỉ dẫn vùng miền vào prompt để Gemini xử lý âm sắc tốt hơn
      const regionalPrompt = `${currentVoice.promptInstruction}"${text}"`;
      const base64Audio = await generateSpeech(regionalPrompt, currentVoice.geminiVoiceName);
      setAudioResult(base64Audio);
      await playAudio(base64Audio);
    } catch (err: any) {
      setError("Không thể tổng hợp giọng nói. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioResult) {
      const fileName = `giọng-${currentVoice.name}-${Date.now()}.mp3`;
      downloadAudioFile(audioResult, fileName);
    }
  };

  const regions = [
    { key: 'North', label: 'Miền Bắc', icon: <MapPin size={14} className="text-red-500" /> },
    { key: 'Central', label: 'Miền Trung', icon: <MapPin size={14} className="text-amber-500" /> },
    { key: 'South', label: 'Miền Nam', icon: <MapPin size={14} className="text-green-500" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
            <div className="p-2 bg-brand-500 rounded-xl shadow-lg shadow-brand-900/40">
                <Mic className="text-white" size={24} />
            </div>
            Giọng nói AI Đa Vùng Miền
          </h2>
          <p className="text-stone-400 mt-2 font-medium">Chuyển văn bản thành giọng đọc tự nhiên với kỹ thuật Regional Prompting cao cấp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Voice Selection */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-stone-900/50 p-6 rounded-[32px] border border-stone-800 shadow-2xl h-fit">
                <h3 className="text-xs font-black text-stone-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Headphones size={16} className="text-brand-500" /> Danh mục nghệ sĩ
                </h3>

                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {regions.map(region => (
                        <div key={region.key} className="space-y-3">
                            <div className="flex items-center gap-2 px-2">
                                {region.icon}
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{region.label}</span>
                                <div className="flex-1 h-px bg-stone-800 ml-2"></div>
                            </div>
                            
                            <div className="space-y-2">
                                {voices.filter(v => v.region === region.key).map(voice => (
                                    <button 
                                        key={voice.id}
                                        onClick={() => setSelectedVoiceId(voice.id)}
                                        className={`w-full p-4 rounded-2xl text-left transition-all duration-300 border ${
                                            selectedVoiceId === voice.id 
                                            ? 'bg-brand-500/10 border-brand-500 shadow-lg shadow-brand-900/20 scale-[1.02]' 
                                            : 'bg-stone-900/40 border-stone-800 hover:border-stone-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${selectedVoiceId === voice.id ? 'bg-brand-500 animate-pulse' : 'bg-stone-700'}`}></div>
                                                <span className={`font-black text-sm ${selectedVoiceId === voice.id ? 'text-brand-400' : 'text-stone-200'}`}>
                                                    {voice.name}
                                                </span>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                                                voice.gender === 'Male' 
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                                            }`}>
                                                {voice.gender === 'Male' ? 'Nam' : 'Nữ'}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-stone-500 leading-relaxed line-clamp-2">{voice.description}</p>
                                        
                                        {selectedVoiceId === voice.id && (
                                            <div className="mt-3 pt-3 border-t border-brand-500/20 flex items-center justify-between">
                                                <span className="text-[8px] font-bold text-brand-500 uppercase tracking-widest">Đang chọn</span>
                                                <Check size={12} className="text-brand-500" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 flex flex-col h-full">
            <div className="bg-stone-900/50 rounded-[32px] border border-stone-800 p-8 flex flex-col flex-1 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Biên tập nội dung</label>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-400">{text.length} ký tự</span>
                            {text.length > 0 && (
                                <button onClick={() => setText('')} className="text-[10px] font-black text-accent-500 hover:text-accent-400 uppercase tracking-widest">Xóa tất cả</button>
                            )}
                        </div>
                    </div>

                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Nhập hoặc dán nội dung văn bản bạn muốn chuyển đổi tại đây..."
                        className="w-full flex-1 bg-stone-950/40 border border-stone-800 rounded-3xl p-6 text-stone-100 focus:ring-2 focus:ring-brand-500 outline-none resize-none min-h-[400px] text-lg leading-relaxed shadow-inner placeholder:text-stone-700"
                    />
                    
                    <div className="mt-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <User size={20} className="text-brand-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest">Nghệ sĩ thể hiện</p>
                                <p className="text-white font-black">{currentVoice.name} <span className="text-stone-500 font-normal">({currentVoice.region === 'North' ? 'Bắc' : currentVoice.region === 'Central' ? 'Trung' : 'Nam'})</span></p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                            {audioResult && (
                                <>
                                    <button 
                                        onClick={() => playAudio(audioResult)}
                                        className="flex-1 sm:flex-none bg-stone-800 hover:bg-stone-700 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-stone-700 transition-all shadow-xl"
                                    >
                                        <Volume2 size={18} /> Nghe lại
                                    </button>
                                    <button 
                                        onClick={handleDownload}
                                        className="flex-1 sm:flex-none bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-brand-500/30 transition-all shadow-xl"
                                    >
                                        <Download size={18} /> Tải MP3
                                    </button>
                                </>
                            )}
                            <button
                                disabled={!text.trim() || loading}
                                onClick={handleGenerate}
                                className={`flex-1 sm:flex-none px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                                    !text.trim() || loading
                                    ? 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'
                                    : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-2xl shadow-brand-900/40 active:scale-95'
                                }`}
                            >
                                {loading ? <StopCircle className="animate-pulse" size={18} /> : <Play size={18} fill="currentColor" />}
                                {loading ? 'Đang tổng hợp...' : 'Chuyển đổi ngay'}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="mt-4 p-4 bg-accent-500/10 border border-accent-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                            <Info size={16} className="text-accent-500 shrink-0" />
                            <p className="text-accent-500 text-[10px] font-bold uppercase">{error}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 p-6 bg-brand-900/10 rounded-[24px] border border-brand-500/20 border-dashed flex items-start gap-4">
                <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
                    <Info size={18} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Mẹo sử dụng hiệu quả</h4>
                    <p className="text-[10px] text-stone-500 leading-relaxed italic">
                        Để giọng nói diễn cảm hơn, bạn có thể thêm các dấu chấm câu <span className="text-stone-300 font-bold">.</span> để ngắt nghỉ lâu hơn, hoặc dấu phẩy <span className="text-stone-300 font-bold">,</span> để ngắt nghỉ ngắn. Hệ thống sử dụng mô hình Gemini 2.5 Flash Native Audio có khả năng bắt chước cảm xúc cực tốt thông qua chỉ dẫn prompt ẩn.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
