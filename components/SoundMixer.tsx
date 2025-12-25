
import React, { useState, useRef, useEffect } from 'react';
import { 
  Music4, 
  Volume2, 
  Play, 
  Pause, 
  Trash2, 
  Upload, 
  Wind, 
  CloudRain, 
  Bird, 
  Car, 
  PhoneCall, 
  Users2,
  Settings2,
  VolumeX,
  Sparkles,
  Info,
  Download,
  Loader2,
  AlertCircle,
  Headphones,
  Waves,
  Zap,
  Plus,
  Scissors,
  Clock,
  ChevronRight,
  MoveHorizontal,
  RefreshCcw,
  Maximize2
} from 'lucide-react';

interface AudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  isPlaying: boolean;
  category: string;
  error?: boolean;
  startTime: number;    
  trimStart: number;    
  trimEnd: number;      
  fileDuration: number; 
  showTrim?: boolean; // Trạng thái hiển thị bộ cắt
}

const SOUND_IDEAS = [
  { 
    category: 'Thiên nhiên',
    items: [
      { id: 'rain', name: 'Tiếng mưa rơi', icon: CloudRain, color: 'text-blue-400', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
      { id: 'wind', name: 'Tiếng gió rít', icon: Wind, color: 'text-stone-300', url: 'https://actions.google.com/sounds/v1/weather/wind_howl.ogg' },
      { id: 'birds', name: 'Chim hót', icon: Bird, color: 'text-green-400', url: 'https://actions.google.com/sounds/v1/ambient/morning_birds.ogg' },
    ]
  },
  {
    category: 'Đô thị & Đời sống',
    items: [
      { id: 'traffic', name: 'Xe cộ giao thông', icon: Car, color: 'text-amber-400', url: 'https://actions.google.com/sounds/v1/transportation/car_passing_fast.ogg' },
      { id: 'meeting', name: 'Hội họp (Tiếng ồn)', icon: Users2, color: 'text-indigo-400', url: 'https://actions.google.com/sounds/v1/crowds/bar_crowd.ogg' },
      { id: 'phone', name: 'Chuông điện thoại', icon: PhoneCall, color: 'text-red-400', url: 'https://actions.google.com/sounds/v1/office/phone_ring_old.ogg' },
    ]
  }
];

export const SoundMixer: React.FC = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isExporting, setIsExporting] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tracks.forEach(track => {
      const audio = audioRefs.current[track.id];
      if (audio && !track.error) {
        audio.volume = track.volume * masterVolume;
        
        const handleTimeUpdate = () => {
          if (audio.currentTime >= track.trimEnd) {
            audio.currentTime = track.trimStart;
          }
        };
        audio.ontimeupdate = handleTimeUpdate;

        if (track.isPlaying) {
          if (audio.currentTime < track.trimStart || audio.currentTime > track.trimEnd) {
            audio.currentTime = track.trimStart;
          }
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      }
    });
  }, [tracks, masterVolume]);

  const addTrack = (name: string, url: string, category: string) => {
    const tempAudio = new Audio();
    tempAudio.crossOrigin = "anonymous";
    tempAudio.src = url;
    
    tempAudio.onloadedmetadata = () => {
      const duration = tempAudio.duration;
      const newTrack: AudioTrack = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        url,
        volume: 0.5,
        isPlaying: true,
        category,
        startTime: 0,
        trimStart: 0,
        trimEnd: duration,
        fileDuration: duration,
        showTrim: false
      };
      setTracks(prev => [...prev, newTrack]);
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const url = URL.createObjectURL(file);
        addTrack(file.name, url, 'Cá nhân');
      });
    }
  };

  const updateTrack = (id: string, updates: Partial<AudioTrack>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTrack = (id: string) => {
    if (audioRefs.current[id]) {
      audioRefs.current[id].pause();
      delete audioRefs.current[id];
    }
    setTracks(prev => prev.filter(t => t.id !== id));
  };

  // Fix: Added missing retryTrack function to handle audio loading errors
  const retryTrack = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (track && audioRefs.current[id]) {
      updateTrack(id, { error: false });
      audioRefs.current[id].load();
    }
  };

  const handleExportMix = async () => {
    if (tracks.length === 0) return;
    setIsExporting(true);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffers = await Promise.all(tracks.map(async (track) => {
        try {
          const resp = await fetch(track.url, { mode: 'cors' });
          const arrayBuffer = await resp.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          return { ...track, buffer: audioBuffer };
        } catch (e) { return null; }
      }));

      const validTracks = buffers.filter(b => b !== null) as (AudioTrack & { buffer: AudioBuffer })[];
      const totalDuration = Math.max(...validTracks.map(t => t.startTime + (t.trimEnd - t.trimStart)));
      const offlineCtx = new OfflineAudioContext(2, 44100 * Math.min(totalDuration, 120), 44100);

      validTracks.forEach((t) => {
        const source = offlineCtx.createBufferSource();
        source.buffer = t.buffer;
        const gain = offlineCtx.createGain();
        gain.gain.value = t.volume * masterVolume;
        source.connect(gain);
        gain.connect(offlineCtx.destination);
        source.start(t.startTime, t.trimStart, t.trimEnd - t.trimStart);
      });

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(wavBlob);
      link.download = `NCC-Studio-Mix-${Date.now()}.wav`;
      link.click();
    } catch (err) { alert("Lỗi trộn âm thanh."); } finally { setIsExporting(false); }
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    let pos = 0;
    const setUint32 = (d: number) => { view.setUint32(pos, d, true); pos += 4; };
    const setUint16 = (d: number) => { view.setUint16(pos, d, true); pos += 2; };
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164);
    setUint32(length - pos - 4);
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        let sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += 2;
      }
    }
    return new Blob([bufferArray], { type: 'audio/wav' });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Studio Header Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-stone-900/60 p-8 rounded-[40px] border border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 rotate-3">
            <Music4 className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Audio AI Lab</h2>
            <p className="text-stone-500 font-bold text-xs tracking-widest uppercase">NCC Digital Creative</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-stone-950/80 p-5 rounded-3xl border border-stone-800/50 shadow-inner">
          <div className="flex items-center gap-4 px-4 border-r border-stone-800">
            <Volume2 size={20} className="text-brand-500" />
            <input 
              type="range" min="0" max="1" step="0.01" value={masterVolume} 
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-40 h-1.5 bg-stone-800 rounded-full appearance-none accent-brand-500 cursor-pointer"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setTracks(prev => prev.map(t => ({...t, isPlaying: true})))} className="p-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg active:scale-95"><Play size={24} fill="currentColor"/></button>
            <button onClick={() => setTracks(prev => prev.map(t => ({...t, isPlaying: false})))} className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-500 border border-stone-800 transition-all"><VolumeX size={24}/></button>
            {tracks.length > 0 && (
              <button onClick={handleExportMix} disabled={isExporting} className="bg-white text-stone-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-brand-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50">
                {isExporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                {isExporting ? 'Đang Mix...' : 'Tải bản Mix'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Library Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-stone-900/40 p-6 rounded-[32px] border border-stone-800/50 shadow-2xl space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={16} className="text-brand-500" />
                <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em]">Kho âm thanh mẫu</h3>
              </div>
              <div className="space-y-6">
                {SOUND_IDEAS.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-3">
                    <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest px-2">{group.category}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {group.items.map(item => (
                        <button key={item.id} onClick={() => addTrack(item.name, item.url, group.category)} className="group flex items-center gap-3 p-3 bg-stone-950/40 border border-stone-800/50 rounded-2xl text-left hover:border-brand-500/50 hover:bg-brand-500/5 transition-all">
                          <div className={`w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center ${item.color} shadow-lg transition-transform group-hover:scale-110`}><item.icon size={20} /></div>
                          <span className="text-xs font-black text-stone-300 group-hover:text-white flex-1">{item.name}</span>
                          <Plus size={16} className="text-stone-700 group-hover:text-brand-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-stone-800">
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-10 border-2 border-dashed border-stone-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-brand-500 hover:bg-brand-500/5 transition-all group">
                <Upload size={24} className="text-stone-600 group-hover:text-brand-400" />
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Tải tệp cá nhân</span>
              </button>
              <input type="file" ref={fileInputRef} multiple accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>
        </div>

        {/* Main Timeline Workspace */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-stone-900/40 rounded-[40px] border border-stone-800/50 p-8 min-h-[650px] shadow-2xl relative overflow-hidden flex flex-col backdrop-blur-md">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Waves size={20} className="text-brand-500" />
                  <label className="text-xs font-black text-stone-400 uppercase tracking-[0.3em]">Bàn phối âm đa lớp ({tracks.length})</label>
                </div>
                {tracks.length > 0 && (
                  <button onClick={() => setTracks([])} className="text-[10px] font-black text-accent-500 hover:text-accent-400 uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-accent-500/5 rounded-full border border-accent-500/20">
                    <Trash2 size={14} /> Reset Studio
                  </button>
                )}
              </div>

              {tracks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-40 text-center">
                  <div className="w-24 h-24 bg-stone-950/50 rounded-3xl flex items-center justify-center text-stone-800 mb-8 border border-stone-800/50 shadow-inner">
                    <Settings2 size={48} />
                  </div>
                  <h3 className="text-stone-500 font-black text-2xl uppercase tracking-[0.3em]">Studio đang đợi bạn</h3>
                  <p className="text-stone-600 text-xs mt-3 max-w-sm leading-relaxed italic">Hãy thêm các lớp âm thanh từ thư viện để bắt đầu phối trộn nội dung AI đa phương tiện.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {tracks.map(track => (
                    <div key={track.id} className="bg-stone-950/90 p-8 rounded-[40px] border border-stone-800/60 shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500/20 group-hover:bg-brand-500 transition-colors"></div>
                      
                      <div className="flex flex-col lg:flex-row gap-8">
                        {/* Track Identity & Main Player */}
                        <div className="flex-shrink-0 w-full lg:w-48 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                           <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-brand-500 shadow-2xl border border-white/5 mb-2 group-hover:scale-110 transition-transform">
                              <Music4 size={32} />
                           </div>
                           <div className="min-w-0 space-y-1">
                              <p className="text-sm font-black text-white truncate w-40">{track.name}</p>
                              <p className="text-[10px] text-brand-500 uppercase font-black tracking-widest">{track.category}</p>
                           </div>
                           <div className="flex items-center gap-3 pt-4">
                              <button 
                                onClick={() => updateTrack(track.id, { isPlaying: !track.isPlaying })}
                                className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center shadow-lg ${track.isPlaying ? 'bg-brand-500 text-white' : 'bg-stone-900 text-stone-600 border border-stone-800'}`}
                              >
                                {track.isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                              </button>
                              <button onClick={() => removeTrack(track.id)} className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-700 hover:text-accent-500 hover:bg-accent-500/10 transition-all border border-stone-800 flex items-center justify-center">
                                <Trash2 size={20} />
                              </button>
                           </div>
                        </div>

                        {/* Stacked Controls Section */}
                        <div className="flex-1 space-y-6">
                          {/* Row 1: Volume */}
                          <div className="space-y-3 bg-stone-900/40 p-5 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between px-2">
                               <div className="flex items-center gap-3">
                                  <Volume2 size={16} className="text-brand-500" />
                                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Âm lượng</span>
                               </div>
                               <span className="text-xs font-black text-white">{Math.round(track.volume * 100)}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="1" step="0.01" value={track.volume} 
                                onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-stone-800 rounded-full appearance-none accent-brand-500 cursor-pointer"
                            />
                          </div>

                          {/* Row 2: Start Delay */}
                          <div className="space-y-3 bg-stone-900/40 p-5 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between px-2">
                               <div className="flex items-center gap-3">
                                  <Clock size={16} className="text-indigo-400" />
                                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Độ trễ (Delay)</span>
                               </div>
                               <span className="text-xs font-black text-indigo-400">{track.startTime.toFixed(1)}s</span>
                            </div>
                            <input 
                                type="range" min="0" max="60" step="0.1" value={track.startTime} 
                                onChange={(e) => updateTrack(track.id, { startTime: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-stone-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                            />
                          </div>

                          {/* Row 3: Trim Expandable */}
                          <div className={`space-y-4 transition-all duration-300 ${track.showTrim ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.98]'}`}>
                             <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                   <Scissors size={16} className="text-amber-400" />
                                   <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Bộ cắt (Trim Segment)</span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-500">{track.trimStart.toFixed(1)}s - {track.trimEnd.toFixed(1)}s</span>
                             </div>
                             
                             {/* Vertical Trim Sliders */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-stone-900/60 p-4 rounded-2xl border border-white/5">
                                   <p className="text-[8px] font-black text-stone-600 uppercase mb-2">Bắt đầu cắt</p>
                                   <input 
                                      type="range" min="0" max={track.fileDuration} step="0.1" value={track.trimStart} 
                                      onChange={(e) => updateTrack(track.id, { trimStart: Math.min(parseFloat(e.target.value), track.trimEnd - 0.1) })}
                                      className="w-full h-1 bg-stone-800 rounded appearance-none accent-amber-500"
                                   />
                                </div>
                                <div className="bg-stone-900/60 p-4 rounded-2xl border border-white/5">
                                   <p className="text-[8px] font-black text-stone-600 uppercase mb-2">Kết thúc cắt</p>
                                   <input 
                                      type="range" min="0" max={track.fileDuration} step="0.1" value={track.trimEnd} 
                                      onChange={(e) => updateTrack(track.id, { trimEnd: Math.max(parseFloat(e.target.value), track.trimStart + 0.1) })}
                                      className="w-full h-1 bg-stone-800 rounded appearance-none accent-amber-500"
                                   />
                                </div>
                             </div>
                          </div>
                        </div>

                        {/* Special Action: Trim Toggle on Right */}
                        <div className="flex items-center justify-center lg:border-l lg:border-stone-800 lg:pl-8">
                           <button 
                             onClick={() => updateTrack(track.id, { showTrim: !track.showTrim })}
                             className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[32px] transition-all min-w-[100px] border-2 ${track.showTrim ? 'bg-amber-500 border-amber-400 text-stone-950 shadow-2xl' : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-amber-500/50 hover:text-amber-500'}`}
                           >
                              <Scissors size={28} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{track.showTrim ? 'Đóng cắt' : 'Cắt ghép'}</span>
                           </button>
                        </div>
                      </div>

                      <audio 
                        ref={el => { if (el) audioRefs.current[track.id] = el; }}
                        src={track.url}
                        crossOrigin="anonymous"
                        onError={() => updateTrack(track.id, { error: true })}
                      />

                      {track.error && (
                        <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-8 text-center rounded-[40px] animate-fade-in z-20">
                          <AlertCircle size={48} className="text-accent-500 mb-3" />
                          <p className="text-sm font-black text-white uppercase tracking-[0.2em]">Lỗi kết nối âm thanh</p>
                          <div className="flex gap-4 mt-8">
                            <button onClick={() => retryTrack(track.id)} className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest"><RefreshCcw size={14} /> Thử lại</button>
                            <button onClick={() => removeTrack(track.id)} className="text-xs font-black text-stone-500 hover:text-white uppercase tracking-widest">Gỡ bỏ</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-900/10 border border-brand-500/20 p-8 rounded-[40px] flex items-start gap-6 max-w-4xl mx-auto shadow-xl">
        <div className="p-4 bg-brand-500/20 rounded-2xl text-brand-400">
          <Headphones size={32} />
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-black text-brand-400 uppercase tracking-widest">Tư duy thiết kế âm thanh</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <p className="text-xs font-black text-stone-300">Phối trộn đa tầng</p>
               <p className="text-[11px] text-stone-500 leading-relaxed font-medium">Sử dụng thanh <span className="text-brand-500 font-bold">Delay</span> để tạo các lớp âm thanh kế tiếp nhau hoặc xen kẽ. Chỉnh <span className="text-brand-500 font-bold">Âm lượng</span> riêng cho từng track để tạo hiệu ứng không gian 3D.</p>
            </div>
            <div className="space-y-2">
               <p className="text-xs font-black text-stone-300">Chỉnh sửa chuẩn xác</p>
               <p className="text-[11px] text-stone-500 leading-relaxed font-medium">Kích hoạt nút <span className="text-amber-500 font-bold">Cắt (Trim)</span> bên phải mỗi track để lấy đoạn âm thanh tâm đắc nhất từ tệp gốc mà không cần dùng phần mềm bên ngoài.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
