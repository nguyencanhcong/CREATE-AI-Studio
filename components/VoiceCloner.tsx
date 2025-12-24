
import React, { useState, useRef } from 'react';
import { Upload, Mic2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateSpeech, playAudio } from '../services/geminiService';

export const VoiceCloner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLegalAccepted, setIsLegalAccepted] = useState(false);
  const [cloningStatus, setCloningStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [demoText, setDemoText] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setCloningStatus('idle');
    }
  };

  const startCloning = () => {
    if (!file || !isLegalAccepted) return;
    
    setCloningStatus('processing');
    
    // Simulate training process time
    setTimeout(() => {
        setCloningStatus('success');
    }, 3000);
  };

  const handleTestClone = async () => {
      if(!demoText) return;
      setDemoLoading(true);
      try {
          // Since we can't do real voice cloning in this frontend-only demo with standard Gemini keys,
          // we will use a high quality standard voice to "simulate" the result for the prototype flow.
          // In a real production app, this would send the model ID from the cloning step.
          // Fix: Removed extra arguments to match generateSpeech signature (text, voiceName)
          const audio = await generateSpeech(demoText, 'Fenrir');
          await playAudio(audio);
      } catch (e) {
          alert('Lỗi khi tạo giọng mẫu.');
      } finally {
          setDemoLoading(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Nhân bản giọng nói</h2>
          <p className="text-slate-400 mt-1">Tạo bản sao kỹ thuật số giọng nói của bạn để sáng tạo nội dung.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Setup Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Mic2 className="text-brand-500" />
                Bước 1: Tải lên mẫu giọng
            </h3>

            <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-brand-500 bg-brand-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                onClick={() => fileRef.current?.click()}
            >
                {file ? (
                    <div className="text-center">
                        <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                        <p className="font-medium text-slate-300">Tải lên MP3/WAV</p>
                        <p className="text-xs text-slate-500 mt-1">Tối thiểu 30s, rõ tiếng, không tạp âm</p>
                    </div>
                )}
                <input type="file" ref={fileRef} onChange={handleUpload} accept="audio/*" className="hidden" />
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-start gap-3">
                    <input 
                        type="checkbox" 
                        id="legal" 
                        checked={isLegalAccepted}
                        onChange={(e) => setIsLegalAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-600 text-brand-500 focus:ring-brand-500 bg-slate-800"
                    />
                    <label htmlFor="legal" className="text-sm text-slate-400 cursor-pointer">
                        Tôi xác nhận rằng tôi có quyền sử dụng giọng nói này và tôi đồng ý tạo bản sao giọng nói. 
                        Tôi hiểu công cụ này chỉ dành cho mục đích cá nhân hoặc công việc hợp pháp.
                    </label>
                </div>
            </div>

            <button
                onClick={startCloning}
                disabled={!file || !isLegalAccepted || cloningStatus === 'success' || cloningStatus === 'processing'}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                    !file || !isLegalAccepted || cloningStatus !== 'idle'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-500 text-white'
                }`}
            >
                {cloningStatus === 'processing' ? 'Đang xử lý mô hình giọng nói...' : 
                 cloningStatus === 'success' ? 'Nhân bản thành công!' : 'Bắt đầu nhân bản'}
            </button>
        </div>

        {/* Testing Card */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 transition-opacity ${cloningStatus !== 'success' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                Bước 2: Sử dụng giọng đã nhân bản
            </h3>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <Mic2 size={20} />
                </div>
                <div>
                    <p className="font-bold text-white">Giọng tùy chỉnh #1</p>
                    <p className="text-xs text-green-400">Sẵn sàng sử dụng</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Thử giọng nói mới của bạn</label>
                <textarea 
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    placeholder="Nhập nội dung để AI nói..."
                    className="w-full h-32 bg-slate-800 border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
            </div>

            <button 
                onClick={handleTestClone}
                disabled={!demoText || demoLoading}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
                {demoLoading ? 'Đang tổng hợp...' : 'Tạo giọng nói'}
            </button>

            {cloningStatus === 'success' && (
                 <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <AlertCircle size={14} />
                    <span>Lưu ý: Đây là bản mô phỏng. Việc nhân bản giọng nói thực tế yêu cầu xác thực nâng cao và thời gian xử lý lâu hơn.</span>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
