import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Heart, Download, RefreshCw, Camera, ShieldCheck, MapPin, Landmark, Palmtree, Users, Sun, Trash2, User } from 'lucide-react';
import { generateWeddingPhoto } from '../services/geminiService';

export const WeddingGenerator: React.FC = () => {
  const [brideImage, setBrideImage] = useState<string | null>(null);
  const [groomImage, setGroomImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Khoảnh khắc hạnh phúc, nụ cười rạng rỡ, ánh mắt yêu thương.');
  const [style, setStyle] = useState('Studio Professional Photography');
  const [theme, setTheme] = useState('Hiện đại sang trọng');
  const [location, setLocation] = useState('Hội An - Quảng Nam');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const brideInputRef = useRef<HTMLInputElement>(null);
  const groomInputRef = useRef<HTMLInputElement>(null);

  const themes = [
    { label: 'Cổ trang Việt Nam', value: 'Áo dài Nhật Bình, áo tấc truyền thống, phong cách cung đình Huế, họa tiết rồng phượng.' },
    { label: 'Hiện đại sang trọng', value: 'Váy cưới công chúa lộng lẫy hoặc bộ Vest lịch lãm, phong cách High-fashion Studio.' },
    { label: 'Nông thôn bình dị', value: 'Trang phục dân dã, áo bà ba hoặc áo dài đơn giản, khung cảnh làng quê thanh bình.' },
    { label: 'Hoàng gia Châu Âu', value: 'Váy cưới đuôi dài, vương miện lấp lánh, kiến trúc lâu đài cổ điển tráng lệ.' },
    { label: 'Minimalist (Tối giản)', value: 'Trang phục trắng tinh khôi, đường nét tinh tế, phông nền đơn sắc tập trung vào biểu cảm.' },
  ];

  const locations = [
    { label: 'Hội An (Quảng Nam)', value: 'Phố cổ Hội An rực rỡ đèn lồng, bên dòng sông Hoài thơ mộng.' },
    { label: 'Đà Lạt (Lâm Đồng)', value: 'Rừng thông Đà Lạt mờ sương, hồ Tuyền Lâm, thung lũng tình yêu.' },
    { label: 'Hạ Long (Quảng Ninh)', value: 'Trên du thuyền 5 sao giữa kỳ quan vịnh Hạ Long hùng vĩ.' },
    { label: 'Sapa (Lào Cai)', value: 'Ruộng bậc thang bản Cát Cát, mây mù đỉnh Fansipan, Fansipan Legend.' },
    { label: 'Ninh Bình (Tràng An)', value: 'Quần thể danh thắng Tràng An, Tam Cốc Bích Động, Hang Múa.' },
    { label: 'Huế (Cố Đô)', value: 'Đại Nội Huế cổ kính, lăng tẩm hoàng gia, cầu Trường Tiền sông Hương.' },
    { label: 'Phú Quốc (Kiên Giang)', value: 'Bãi Sao cát trắng, hoàng hôn Bãi Trường, resort sang trọng Phú Quốc.' },
    { label: 'Nha Trang (Khánh Hòa)', value: 'Bãi biển Nha Trang xanh ngắt, tháp Bà Ponagar, Vinpearl Land.' },
    { label: 'Mũi Né (Phan Thiết)', value: 'Đồi cát bay đỏ rực, Bàu Trắng, làng chài Mũi Né.' },
    { label: 'Đà Nẵng (Bà Nà Hills)', value: 'Cầu Vàng Bà Nà Hills, bán đảo Sơn Trà, biển Mỹ Khê.' },
    { label: 'Hà Giang (Đồng Văn)', value: 'Cao nguyên đá Đồng Văn, đèo Mã Pì Lèng, hoa tam giác mạch.' },
    { label: 'Cao Bằng (Bản Giốc)', value: 'Thác Bản Giốc hùng vĩ giữa biên giới, động Ngườm Ngao.' },
    { label: 'Côn Đảo (Vũng Tàu)', value: 'Biển Côn Đảo xanh trong vắt, bãi Đầm Trầu hoang sơ.' },
    { label: 'Vũng Tàu (Bãi Sau)', value: 'Tượng Chúa Kitô Vua, ngọn hải đăng Vũng Tàu, biển Bãi Sau.' },
    { label: 'Tây Ninh (Tòa Thánh)', value: 'Tòa Thánh Cao Đài Tây Ninh lộng lẫy, núi Bà Đen hùng vĩ.' },
    { label: 'Phong Nha (Quảng Bình)', value: 'Động Phong Nha, hang Sơn Đoòng huyền bí, sông Son xanh biếc.' },
    { label: 'Cần Thơ (Cái Răng)', value: 'Chợ nổi Cái Răng nhộn nhịp, bến Ninh Kiều lung linh về đêm.' },
    { label: 'Đồng Tháp (Sa Đéc)', value: 'Làng hoa Sa Đéc rực rỡ, nhà cổ Huỳnh Thủy Lê.' },
    { label: 'Pleiku (Gia Lai)', value: 'Biển Hồ (Ianuêng) trong xanh, hàng thông trăm tuổi.' },
    { label: 'Buôn Ma Thuột (Đắk Lắk)', value: 'Bảo tàng Cà phê thế giới, thác Dray Nur, Dray Sap.' },
    { label: 'Hà Nội (Hồ Gươm)', value: 'Hồ Gươm tháp Rùa, phố cổ Hà Nội, lăng Bác trang nghiêm.' },
  ];

  const handleUpload = (type: 'bride' | 'groom') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'bride') setBrideImage(reader.result as string);
        else setGroomImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: 'bride' | 'groom', e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'bride') setBrideImage(null);
    else setGroomImage(null);
    setResult(null);
  };

  const handleGenerate = async () => {
    if (!brideImage && !groomImage) {
      setError("Vui lòng tải lên ít nhất một tấm ảnh (Cô dâu hoặc Chú rể).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const modePrompt = brideImage && groomImage ? "Cặp đôi đứng cạnh nhau hạnh phúc" : 
                         brideImage ? "Cô dâu đứng một mình rạng rỡ" : "Chú rể đứng một mình lịch lãm";
      
      const combinedPrompt = `${modePrompt}. ${prompt}`;
      
      const art = await generateWeddingPhoto(brideImage, groomImage, style, theme, location, combinedPrompt);
      setResult(art);
    } catch (err: any) {
      setError(err.message || "Không thể tạo ảnh đám cưới. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Heart className="text-pink-500" fill="currentColor" />
            Wedding AI - Khoảnh Khắc Hạnh Phúc
          </h2>
          <p className="text-slate-400 mt-1">Giữ nguyên khuôn mặt 100%, solo hoặc cặp đôi, hiệu ứng Flash chuyên nghiệp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel: Controls */}
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-y-auto max-h-[80vh] custom-scrollbar">
          {/* Couple Upload Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-pink-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Camera size={14} /> 1. Ảnh Cô dâu
              </label>
              <div 
                className={`group relative aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${brideImage ? 'border-pink-500 bg-pink-500/5' : 'border-slate-700 hover:border-pink-500 hover:bg-slate-800'}`}
                onClick={() => brideInputRef.current?.click()}
              >
                {brideImage ? (
                  <>
                    <img src={brideImage} alt="Bride" className="w-full h-full object-cover rounded-xl" />
                    <button 
                      onClick={(e) => removeImage('bride', e)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <User className="text-slate-500 mb-2 mx-auto" size={24} />
                    <p className="text-slate-400 text-[10px] font-bold">CHỌN ẢNH NỮ</p>
                  </div>
                )}
                <input type="file" ref={brideInputRef} className="hidden" accept="image/*" onChange={handleUpload('bride')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Camera size={14} /> 2. Ảnh Chú rể
              </label>
              <div 
                className={`group relative aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${groomImage ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800'}`}
                onClick={() => groomInputRef.current?.click()}
              >
                {groomImage ? (
                  <>
                    <img src={groomImage} alt="Groom" className="w-full h-full object-cover rounded-xl" />
                    <button 
                      onClick={(e) => removeImage('groom', e)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <User className="text-slate-500 mb-2 mx-auto" size={24} />
                    <p className="text-slate-400 text-[10px] font-bold">CHỌN ẢNH NAM</p>
                  </div>
                )}
                <input type="file" ref={groomInputRef} className="hidden" accept="image/*" onChange={handleUpload('groom')} />
              </div>
            </div>
          </div>

          <div className="bg-brand-900/10 border border-brand-500/20 p-3 rounded-lg flex items-start gap-2">
            <ShieldCheck size={18} className="text-brand-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-tight">
              <b>TÙY CHỌN CHẾ ĐỘ:</b> Tải 1 ảnh để tạo ảnh cưới đơn (Solo Bride/Groom). Tải 2 ảnh để tạo ảnh cưới cặp đôi (Couple).
            </p>
          </div>

          {/* Theme Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Landmark size={16} className="text-amber-400" /> Phong cách & Trang phục
            </label>
            <div className="grid grid-cols-1 gap-2">
                {themes.map((t) => (
                    <button
                        key={t.label}
                        onClick={() => setTheme(t.value)}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                            theme === t.value 
                            ? 'bg-brand-500/20 border-brand-500 text-brand-400 shadow-inner' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
          </div>

          {/* Location Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <MapPin size={16} className="text-red-400" /> 20+ Địa danh Việt Nam
            </label>
            <div className="grid grid-cols-2 gap-2">
                {locations.map((l) => (
                    <button
                        key={l.label}
                        onClick={() => setLocation(l.value)}
                        className={`text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all border ${
                            location === l.value 
                            ? 'bg-brand-500/20 border-brand-500 text-brand-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                        {l.label}
                    </button>
                ))}
            </div>
          </div>

          {/* Custom Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400">3. Ý tưởng sáng tạo bổ sung</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ví dụ: Đang nắm tay nhau, xung quanh có hoa rơi..."
              className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm resize-none"
            />
          </div>

          {/* Action Button */}
          <button
            disabled={(!brideImage && !groomImage) || loading}
            onClick={handleGenerate}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              (!brideImage && !groomImage) || loading 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-xl shadow-pink-900/20 active:scale-95'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
            {loading ? 'Đang tạo phép màu AI...' : `Tạo Ảnh ${brideImage && groomImage ? 'Cặp Đôi' : 'Cưới Solo'}`}
          </button>

          {error && <p className="text-red-400 text-xs text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}
        </div>

        {/* Right Panel: Result */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-2xl">
          {result ? (
            <div className="w-full space-y-5 animate-fade-in z-10">
              <div className="relative group">
                <img src={result} alt="Wedding AI Result" className="w-full rounded-2xl shadow-2xl border border-slate-800" />
                <div className="absolute top-4 left-4 bg-pink-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <ShieldCheck size={12} fill="white" /> 100% FACE PRESERVED
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
                >
                  Tạo bối cảnh mới
                </button>
                <a 
                  href={result} 
                  download={`wedding-ai-ncc-${Date.now()}.png`}
                  className="flex-1 bg-white text-slate-950 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-50 transition-all shadow-lg"
                >
                  <Download size={18} /> Tải ảnh Project
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-600 z-10">
              <div className="relative mb-6">
                 <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                    <Users size={48} className="opacity-20" />
                 </div>
                 <Heart size={20} className="absolute bottom-0 right-1/2 translate-x-8 text-pink-500/30" fill="currentColor" />
              </div>
              <p className="text-sm font-bold text-slate-400 text-center uppercase tracking-widest">Tác phẩm nghệ thuật</p>
              <p className="text-xs mt-3 opacity-50 px-12 leading-relaxed italic text-center">
                Mô hình AI sẽ khóa khuôn mặt thật và áp dụng ánh sáng Flash Studio chuyên nghiệp để khuôn mặt luôn sáng và rạng rỡ.
              </p>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
              <div className="relative mb-6">
                <div className="w-28 h-28 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
                <Camera className="absolute inset-0 m-auto text-pink-500 animate-pulse" size={32} />
              </div>
              <p className="text-white font-bold text-xl animate-pulse text-center">Đang thực hiện phép màu AI...</p>
              <p className="text-slate-400 text-sm mt-3 px-10 text-center">Đang áp dụng hiệu ứng Flash Studio và bảo tồn khuôn mặt 100%.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};