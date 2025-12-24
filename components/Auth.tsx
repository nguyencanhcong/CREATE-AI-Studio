
import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, ArrowRight, UserCircle2, Smartphone } from 'lucide-react';
import { logUserToSheet } from '../services/geminiService';

interface AuthProps {
  onLogin: (user: { email: string; name: string; photoURL: string }) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Detect In-App Browsers (Zalo, FB, TikTok...)
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isZalo = ua.indexOf("Zalo") > -1;
    const isFB = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
    const isTikTok = ua.indexOf("TikTok") > -1;
    
    if (isZalo || isFB || isTikTok) {
      setIsInAppBrowser(true);
    }
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const guestUser = {
        email: "user@create-ai.ncc",
        name: "Khách hàng CREATE AI",
        photoURL: "https://ui-avatars.com/api/?name=NCC&background=f59e0b&color=fff"
      };
      
      await logUserToSheet(guestUser.email, guestUser.name);
      onLogin(guestUser);
    } catch (err) { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor - Earth/Fire Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4 animate-pulse"></div>

      <div className="max-w-md w-full z-10 scale-up-center">
        <div className="bg-stone-900/80 backdrop-blur-3xl border border-brand-900/30 rounded-[40px] p-8 sm:p-12 shadow-2xl space-y-10 text-center relative overflow-hidden">
          
          {/* Logo Section */}
          <div className="space-y-6">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-20 h-20 bg-gradient-to-tr from-brand-600 to-accent-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative z-10 transform group-hover:rotate-12 transition-transform duration-500">
                <GraduationCap className="text-white" size={40} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                CREATE AI Studio
              </h1>
              <p className="text-brand-700 text-[10px] font-black tracking-[0.5em] uppercase">NCC Digital Hub</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-500/20">
                <Sparkles size={14} className="animate-pulse" /> Chào mừng bạn đã đến
             </div>
             <p className="text-stone-300 text-sm leading-relaxed font-medium">
               Khám phá không gian sáng tạo AI đa phương tiện dành cho riêng bạn, bạn có thể biến ý tưởng thành hiện thực bằng câu lệnh đơn giản
             </p>
          </div>

          {/* Action Button */}
          <div className="space-y-6">
              <button 
                onClick={handleContinue}
                disabled={loading}
                className="group relative w-full py-5 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-2xl shadow-brand-900/40 transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Đang khởi tạo...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Bấm vào đây để tiếp tục</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>

              <div className="flex items-center justify-center gap-2 text-stone-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                 <UserCircle2 size={12} /> Truy cập ẩn danh bảo mật
              </div>
          </div>

          {/* Mobile Browser Tip */}
          {isInAppBrowser && (
            <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl text-left flex gap-3 items-start animate-fade-in">
              <Smartphone className="text-brand-400 shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-stone-500 leading-relaxed italic">
                Để trải nghiệm mượt mà nhất và dễ dàng tải tệp về máy, hãy nhấn <span className="text-white font-bold">"..."</span> và chọn <span className="text-white font-bold">"Mở bằng trình duyệt"</span>.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 border-t border-stone-800/50">
             <div className="flex flex-col items-center">
                <p className="text-xs text-stone-400 font-bold">ThS. Nguyễn Cảnh Công</p>
                <p className="text-[9px] text-brand-500 font-black tracking-widest uppercase mt-1">Project Director</p>
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .scale-up-center { 
          animation: scale-up-center 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; 
        }
        @keyframes scale-up-center { 
          0% { transform: scale(0.9); opacity: 0; } 
          100% { transform: scale(1); opacity: 1; } 
        }
        @keyframes fade-in { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { 
          animation: fade-in 0.5s ease-out forwards; 
        }
      `}</style>
    </div>
  );
};
