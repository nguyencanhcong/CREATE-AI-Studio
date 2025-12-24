import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Download, Sparkles, RefreshCw, MessageSquare, Plus, Trash2, Volume2, Info, AlertCircle, GraduationCap, Key, ExternalLink } from 'lucide-react';
import { generateVideo, generateMultiSpeakerSpeech, playAudio } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  voice: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';
}

export const VideoGenerator: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Chuyển động mượt mà, nhân vật mỉm cười và nói chuyện tự nhiên.');
  const [dialogue, setDialogue] = useState<DialogueLine[]>([
    { id: '1', speaker: 'Nhân vật 1', text: 'Chào mừng bạn đến với CREATE AI Studio.', voice: 'Kore' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const active = await window.aistudio.hasSelectedApiKey();
        setHasKey(active);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;
    setLoading(true);
    setError(null);
    try {
      setStatusMessage('Đang khởi tạo Video với mô hình Veo 3.1...');
      const vUrl = await generateVideo(prompt, selectedImage);
      setVideoUrl(vUrl);

      const validDialogue = dialogue.filter(d => d.text.trim().length > 0);
      if (validDialogue.length > 0) {
        setStatusMessage('Đang tổng hợp giọng nói...');
        const audio = await generateMultiSpeakerSpeech(validDialogue);
        setAudioBase64(audio);
      }
      setStatusMessage('Hoàn tất!');
    } catch (err: any) {
      setError(err.message || "Lỗi tạo video.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in p-6">
        <div className="w-24 h-24 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-400">
          <Video size={48} />
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-bold text-white">Yêu cầu xác thực mô hình Veo</h2>
          <p className="text-stone-400">Vui lòng chọn API Key có thiết lập thanh toán (Paid Project) để sử dụng tính năng video cao cấp.</p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all"
          >
            <Key size={20} /> Chọn API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Video className="text-brand-500" /> Veo 3.1 Video Lab
        </h2>
        <button onClick={() => setHasKey(false)} className="text-xs text-stone-500 hover:text-brand-400 flex items-center gap-1">
          <RefreshCw size={12} /> Đổi Key
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-6 shadow-xl">
                <div>
                    <label className="block text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">1. Ảnh nguồn</label>
                    <div 
                        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-brand-500 bg-brand-500/5' : 'border-stone-700 hover:border-brand-500 hover:bg-stone-800'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {selectedImage ? (
                            <img src={selectedImage} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                        ) : (
                            <div className="py-4 text-center">
                                <Upload className="text-stone-500 mb-2 mx-auto" size={32} />
                                <p className="text-xs text-stone-400">Tải ảnh mẫu (PNG/JPG)</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if(file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setSelectedImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-400 mb-3 uppercase tracking-wider">2. Chuyển động</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
                    />
                </div>

                <button
                    disabled={!selectedImage || loading}
                    onClick={handleGenerate}
                    className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                    {loading ? 'Đang tạo...' : 'Tạo Video'}
                </button>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl min-h-[400px] flex items-center justify-center relative">
                {loading ? (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-white font-bold">{statusMessage}</p>
                    </div>
                ) : videoUrl ? (
                    <div className="w-full space-y-4">
                        <video src={videoUrl} controls className="w-full rounded-xl bg-black aspect-video" autoPlay loop />
                        <div className="flex gap-4">
                            {audioBase64 && (
                                <button onClick={() => playAudio(audioBase64)} className="flex-1 bg-stone-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Volume2 size={18}/> Nghe tiếng</button>
                            )}
                            <a href={videoUrl} download="video-ai.mp4" className="flex-1 bg-white text-stone-950 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"><Download size={18}/> Tải xuống</a>
                        </div>
                    </div>
                ) : (
                    <p className="text-stone-500">Video sẽ hiển thị tại đây.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};