import React, { useState } from 'react';
import { Mic, Play, Download, StopCircle, Volume2, Info } from 'lucide-react';
import { generateSpeech, playAudio } from '../services/geminiService';
import { VoiceProfile } from '../types';

interface ExtendedVoiceProfile extends VoiceProfile {
    description: string;
}

const voices: ExtendedVoiceProfile[] = [
  { id: '1', name: 'Mạnh Cường', region: 'North', gender: 'Male', style: 'News', geminiVoiceName: 'Puck', description: 'Giọng Nam Bắc bộ chuẩn, chững chạc.' },
  { id: '2', name: 'Mai Lan', region: 'North', gender: 'Female', style: 'Story', geminiVoiceName: 'Kore', description: 'Giọng Nữ Bắc bộ nhẹ nhàng, truyền cảm.' },
  { id: '3', name: 'Quốc Bảo', region: 'Central', gender: 'Male', style: 'Promo', geminiVoiceName: 'Fenrir', description: 'Giọng Nam Trung bộ hào sảng.' },
  { id: '4', name: 'BTV Anh Phương', region: 'Central', gender: 'Female', style: 'News', geminiVoiceName: 'Kore', description: 'Giọng Nữ Huế chuẩn VTV1, sang trọng.' },
  { id: '5', name: 'Minh Tuấn', region: 'South', gender: 'Male', style: 'Story', geminiVoiceName: 'Zephyr', description: 'Giọng Nam Nam bộ chân chất.' },
  { id: '6', name: 'Ngọc Bích', region: 'South', gender: 'Female', style: 'Promo', geminiVoiceName: 'Kore', description: 'Giọng Nữ Nam bộ năng động.' },
];

export const TTSGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].id);
  const [loading, setLoading] = useState(false);
  const [audioResult, setAudioResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentVoice = voices.find(v => v.id === selectedVoice) || voices[0];

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const base64Audio = await generateSpeech(text, currentVoice.geminiVoiceName);
      setAudioResult(base64Audio);
      await playAudio(base64Audio);
    } catch (err: any) {
      setError("Không thể tạo giọng nói. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Giọng nói AI</h2>
          <p className="text-stone-400 mt-1">Chuyển văn bản thành giọng đọc truyền cảm với đa dạng vùng miền.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-stone-200 flex items-center gap-2">
                <Mic size={20} className="text-brand-500" /> Chọn giọng đọc
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {voices.map(voice => (
                    <div 
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                            selectedVoice === voice.id 
                            ? 'bg-brand-500/10 border-brand-500 ring-1 ring-brand-500' 
                            : 'bg-stone-900 border-stone-800 hover:border-brand-500/30'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold text-base ${selectedVoice === voice.id ? 'text-brand-400' : 'text-white'}`}>
                                {voice.name}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                voice.gender === 'Male' ? 'bg-brand-500/10 text-brand-400' : 'bg-accent-500/10 text-accent-400'
                            }`}>
                                {voice.gender === 'Male' ? 'Nam' : 'Nữ'}
                            </span>
                        </div>
                        <p className="text-xs text-stone-500 italic">{voice.description}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <div className="bg-stone-900/50 rounded-2xl border border-stone-800 p-6 flex flex-col h-full shadow-xl">
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập nội dung chuyển đổi..."
                    className="w-full flex-1 bg-stone-800/50 border border-stone-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none min-h-[350px] text-lg"
                />
                
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-stone-800 gap-4">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Info size={14} className="text-brand-400" />
                        <span>Đang dùng: <b>{currentVoice.name}</b></span>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                        {audioResult && (
                            <button 
                                onClick={() => playAudio(audioResult)}
                                className="flex-1 sm:flex-none bg-stone-800 hover:bg-stone-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-stone-700 transition-all"
                            >
                                <Volume2 size={18} /> Nghe lại
                            </button>
                        )}
                        <button
                            disabled={!text.trim() || loading}
                            onClick={handleGenerate}
                            className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                !text.trim() || loading
                                ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-xl shadow-brand-500/20'
                            }`}
                        >
                            {loading ? <StopCircle className="animate-pulse" size={20} /> : <Play size={20} fill="currentColor" />}
                            {loading ? 'Đang tổng hợp...' : 'Bắt đầu đọc'}
                        </button>
                    </div>
                </div>
                {error && <p className="mt-4 text-accent-400 text-sm text-center">{error}</p>}
            </div>
        </div>
      </div>
    </div>
  );
};