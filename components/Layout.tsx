
import React, { useMemo, useState } from 'react';
import { View, User } from '../types';
import { 
  Palette, 
  Mic, 
  Files, 
  Image as ImageIcon, 
  Menu,
  X,
  Flower,
  Gift,
  User as UserIcon,
  Heart,
  Presentation,
  Megaphone,
  GraduationCap,
  Award,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

const NavItem = React.memo(({ 
  view, 
  current, 
  icon: Icon, 
  label, 
  onClick 
}: { 
  view: View; 
  current: View; 
  icon: any; 
  label: string; 
  onClick: (v: View) => void 
}) => {
  const isActive = view === current;
  return (
    <button
      onClick={() => onClick(view)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50 scale-[1.02]' 
          : 'text-stone-400 hover:bg-stone-800/50 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="font-bold text-xs tracking-tight">{label}</span>
      </div>
      {isActive && <ChevronRight size={14} className="opacity-50" />}
    </button>
  );
});

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSetView = (view: View) => {
    setView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const NavContent = useMemo(() => () => (
    <div className="flex flex-col h-full bg-stone-900 overflow-hidden">
      <div className="p-6 shrink-0 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
           <GraduationCap className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-brand-600 tracking-tighter leading-none">
            CREATE AI
          </h1>
          <p className="text-[8px] text-stone-500 mt-0.5 uppercase font-black tracking-[0.2em]">NCC Digital Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar border-t border-stone-800/50 pt-4 pb-8">
        <NavItem view={View.DASHBOARD} current={currentView} icon={Menu} label="TỔNG QUAN" onClick={handleSetView} />
        
        <div className="pt-6 pb-2">
          <p className="px-4 text-[9px] font-black text-stone-600 uppercase tracking-[0.2em]">LỄ HỘI & SỰ KIỆN</p>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => handleSetView(View.TET_2026_GEN)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              currentView === View.TET_2026_GEN 
                ? 'bg-accent-600 text-white shadow-lg shadow-accent-900/50 scale-[1.02]' 
                : 'text-accent-400 hover:bg-accent-900/10 hover:text-accent-300'
            }`}
          >
            <Flower size={18} />
            <span className="font-bold text-xs">Ảnh Xuân 2026</span>
          </button>
          <button
            onClick={() => handleSetView(View.CHRISTMAS_GEN)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              currentView === View.CHRISTMAS_GEN 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50 scale-[1.02]' 
                : 'text-brand-400 hover:bg-brand-900/10 hover:text-brand-300'
            }`}
          >
            <Gift size={18} />
            <span className="font-bold text-xs">Ảnh Giáng sinh</span>
          </button>
        </div>

        <div className="pt-6 pb-2">
          <p className="px-4 text-[9px] font-black text-stone-600 uppercase tracking-[0.2em]">GIÁO DỤC & CÔNG VIỆC</p>
        </div>
        <div className="space-y-1">
          <NavItem view={View.QUIZ_GRADER} current={currentView} icon={Award} label="Chấm điểm AI" onClick={handleSetView} />
          <NavItem view={View.QUIZ_GEN} current={currentView} icon={GraduationCap} label="Quiz Master AI" onClick={handleSetView} />
          <NavItem view={View.SLIDE_GEN} current={currentView} icon={Presentation} label="Slide AI Generator" onClick={handleSetView} />
          <NavItem view={View.POSTER_GEN} current={currentView} icon={Megaphone} label="Poster Quảng cáo" onClick={handleSetView} />
        </div>

        <div className="pt-6 pb-2">
          <p className="px-4 text-[9px] font-black text-stone-600 uppercase tracking-[0.2em]">SÁNG TẠO ĐA PHƯƠNG TIỆN</p>
        </div>
        
        <div className="space-y-1">
          <NavItem view={View.WEDDING_GEN} current={currentView} icon={Heart} label="Wedding AI" onClick={handleSetView} />
          <NavItem view={View.FACE_GEN} current={currentView} icon={UserIcon} label="Face Master AI" onClick={handleSetView} />
          <NavItem view={View.BG_GEN} current={currentView} icon={ImageIcon} label="Tạo phông nền" onClick={handleSetView} />
          <NavItem view={View.ART_GEN} current={currentView} icon={Palette} label="Tạo ảnh nghệ thuật" onClick={handleSetView} />
          <NavItem view={View.TTS} current={currentView} icon={Mic} label="Giọng nói AI" onClick={handleSetView} />
          <NavItem view={View.VOICE_CLONE} current={currentView} icon={Files} label="Nhân bản giọng nói" onClick={handleSetView} />
        </div>
      </nav>
      
      <div className="p-4 border-t border-stone-800/50 bg-stone-900/50 shrink-0">
        <div className="bg-stone-800/50 p-3 rounded-2xl flex items-center gap-3 mb-2">
          <img 
            src={user?.photoURL || "https://ui-avatars.com/api/?name=User"} 
            className="w-9 h-9 rounded-xl border border-stone-700 shadow-md" 
            alt="User"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate">{user?.name || "Người dùng"}</p>
            <p className="text-[10px] text-stone-500 truncate font-medium">{user?.email}</p>
          </div>
          <button onClick={onLogout} title="Đăng xuất" className="text-stone-500 hover:text-accent-400 p-2 rounded-lg hover:bg-stone-700 transition-all">
             <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  ), [currentView, user, handleSetView]);

  return (
    <div className="flex bg-stone-950 text-stone-50 h-screen overflow-hidden">
      <div className="lg:hidden fixed top-0 w-full z-50 bg-stone-900/90 backdrop-blur-xl border-b border-stone-800 p-4 flex justify-between items-center safe-top shadow-xl">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-md">
               <GraduationCap className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">CREATE AI</h1>
         </div>
         <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-brand-500/10 text-brand-400 rounded-full text-[9px] font-black border border-brand-500/20 uppercase">Pro</div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2 hover:bg-stone-800 rounded-xl transition-all">
               {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
         </div>
      </div>

      <aside className="hidden lg:flex flex-col w-64 bg-stone-900 border-r border-stone-800 fixed h-full z-20">
        <NavContent />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-4/5 max-w-sm bg-stone-900 h-full flex flex-col shadow-2xl animate-slide-in safe-top safe-bottom">
                <NavContent />
            </div>
        </div>
      )}

      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-24 lg:pt-8 overflow-y-auto overflow-x-hidden safe-bottom h-full custom-scrollbar">
        <div className="max-w-6xl mx-auto animate-fade-in relative pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};
