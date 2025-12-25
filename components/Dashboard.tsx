
import React from 'react';
import { View } from '../types';
import { 
  Palette, 
  Mic, 
  Files, 
  Image as ImageIcon, 
  ArrowRight, 
  Flower, 
  UserCheck, 
  Gift, 
  Facebook, 
  Phone, 
  Heart, 
  Presentation, 
  Megaphone, 
  Zap, 
  GraduationCap, 
  Award,
  LayoutGrid,
  Sparkles,
  User as UserIcon,
  Camera
} from 'lucide-react';

interface DashboardProps {
  setView: (view: View) => void;
}

const ToolCard = ({ 
    title, 
    desc, 
    icon: Icon, 
    colorClass, 
    onClick,
    badge
}: { 
    title: string; 
    desc: string; 
    icon: any; 
    colorClass: string; 
    onClick: () => void;
    badge?: string;
}) => (
  <button 
    onClick={onClick}
    className="group relative overflow-hidden bg-stone-900 border border-stone-800 hover:border-brand-500/50 rounded-2xl p-5 text-left transition-all hover:shadow-2xl hover:shadow-brand-900/20 hover:-translate-y-1"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-5 rounded-bl-full group-hover:scale-125 transition-transform duration-700`} />
    
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.replace('from-', 'bg-').split(' ')[0]} bg-opacity-20 text-white shadow-lg`}>
        <Icon size={20} />
      </div>
      {badge && (
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase tracking-tighter">
          {badge}
        </span>
      )}
    </div>
    
    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors line-clamp-1">{title}</h3>
    <p className="text-stone-400 text-xs leading-relaxed mb-4 line-clamp-2">{desc}</p>
    
    <div className="flex items-center text-[10px] font-bold text-stone-500 group-hover:text-white uppercase tracking-widest transition-colors">
      Khám phá <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

const SectionHeader = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
  <div className="flex items-center gap-3 mb-6 mt-12 first:mt-0">
    <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-white`}>
      <Icon size={18} />
    </div>
    <h2 className="text-sm font-black text-stone-300 uppercase tracking-[0.3em]">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-stone-800 to-transparent ml-4"></div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="space-y-8 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-brand-900 via-stone-900 to-brand-950 rounded-[40px] p-8 lg:p-12 border border-brand-900/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 w-full">
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-500/20 shadow-inner">
                    <UserCheck size={14} /> AI Expert Partner
                </div>
                <div className="inline-flex items-center gap-2 bg-accent-500/10 text-accent-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-accent-500/20 shadow-inner">
                    <Zap size={14} className="animate-pulse" /> Unlimited Quota
                </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-none tracking-tighter">
                CREATE AI Studio
            </h1>
            <p className="text-brand-300 font-bold text-lg lg:text-xl mb-8 tracking-wide max-w-2xl">
                Nền tảng sáng tạo nội dung AI đa phương tiện dành riêng cho cộng đồng NCC.
            </p>

            <div className="space-y-4 pt-8 border-t border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div>
                  <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-2">Project Director</p>
                  <p className="text-xl font-black text-white">ThS. Nguyễn Cảnh Công</p>
                </div>
                <div className="h-10 w-px bg-stone-800 hidden sm:block"></div>
                <div>
                  <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-2">Hotline Support</p>
                  <div className="flex items-center gap-3 text-brand-500 font-bold">
                    <Phone size={16} /> 0914 678 368 • 0979 282 686
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Sự kiện & Mùa lễ hội */}
      <SectionHeader title="Sự kiện & Mùa lễ hội" icon={Sparkles} color="bg-accent-500" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ToolCard 
            title="Ảnh Xuân 2026" 
            desc="Trang hoàng diện mạo đón Tết Bính Ngọ với áo dài truyền thống và bối cảnh xuân rực rỡ."
            icon={Flower}
            colorClass="from-accent-600 to-brand-600"
            badge="Tết 2026"
            onClick={() => setView(View.TET_2026_GEN)}
        />
        <ToolCard 
            title="Ảnh Giáng sinh" 
            desc="Đưa bạn vào không gian Noel lung linh với tuyết trắng và không khí lễ hội ấm áp."
            icon={Gift}
            colorClass="from-brand-600 to-accent-700"
            onClick={() => setView(View.CHRISTMAS_GEN)}
        />
      </div>

      {/* Giáo dục & Công việc */}
      <SectionHeader title="Giáo dục & Công việc" icon={GraduationCap} color="bg-brand-500" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ToolCard 
            title="Chấm điểm AI" 
            desc="Chấm điểm phiếu trắc nghiệm tự động qua ảnh chụp, nhận diện mã đề và tính điểm ngay lập tức."
            icon={Award}
            colorClass="from-brand-500 to-accent-600"
            badge="Top Pick"
            onClick={() => setView(View.QUIZ_GRADER)}
        />
        <ToolCard 
            title="Quiz Master AI" 
            desc="Tự động bóc tách, trộn đề thi từ file Word và xuất bản đề thi chuyên nghiệp kèm bảng đáp án."
            icon={LayoutGrid}
            colorClass="from-brand-600 to-brand-700"
            onClick={() => setView(View.QUIZ_GEN)}
        />
        <ToolCard 
            title="Slide AI Generator" 
            desc="Thiết kế bài thuyết trình từ nội dung thô hoặc tài liệu DOCX/PDF với bố cục slide chuẩn mực."
            icon={Presentation}
            colorClass="from-accent-600 to-brand-500"
            badge="Advanced"
            onClick={() => setView(View.SLIDE_GEN)}
        />
        <ToolCard 
            title="Poster Quảng cáo" 
            desc="Sáng tạo ấn phẩm truyền thông chuyên nghiệp từ sản phẩm và người mẫu với phong cách Studio."
            icon={Megaphone}
            colorClass="from-brand-700 to-accent-600"
            onClick={() => setView(View.POSTER_GEN)}
        />
      </div>

      {/* Sáng tạo đa phương tiện */}
      <SectionHeader title="Sáng tạo đa phương tiện" icon={Palette} color="bg-accent-600" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ToolCard 
            title="Wedding AI" 
            desc="Lưu giữ khoảnh khắc hạnh phúc với ảnh cưới solo hoặc cặp đôi, giữ nguyên khuôn mặt thật."
            icon={Heart}
            colorClass="from-accent-600 to-brand-500"
            badge="Hot"
            onClick={() => setView(View.WEDDING_GEN)}
        />
        <ToolCard 
            title="Face Master AI" 
            desc="Xử lý đa diện mạo, giữ đúng 100% đường nét kể cả khi hóa thân vào các nhân vật khác nhau."
            icon={UserIcon}
            colorClass="from-brand-500 to-brand-700"
            onClick={() => setView(View.FACE_GEN)}
        />
        <ToolCard 
            title="Tạo phông nền" 
            desc="Thiết kế bối cảnh 3D chuyên nghiệp, phối sáng studio cho sản phẩm hoặc chân dung."
            icon={ImageIcon}
            colorClass="from-brand-600 to-accent-600"
            onClick={() => setView(View.BG_GEN)}
        />
        <ToolCard 
            title="Tạo ảnh nghệ thuật" 
            desc="Biến ảnh chụp thành tranh vẽ sơn dầu, anime hay phong cách cyberpunk đầy ấn tượng."
            icon={Camera}
            colorClass="from-accent-500 to-brand-600"
            onClick={() => setView(View.ART_GEN)}
        />
        <ToolCard 
            title="Giọng nói AI" 
            desc="Chuyển văn bản thành giọng đọc truyền cảm với đa dạng vùng miền Bắc - Trung - Nam."
            icon={Mic}
            colorClass="from-brand-500 to-accent-500"
            onClick={() => setView(View.TTS)}
        />
        <ToolCard 
            title="Nhân bản giọng nói" 
            desc="Tạo bản sao kỹ thuật số giọng nói của riêng bạn để ứng dụng trong sáng tạo nội dung số."
            icon={Files}
            colorClass="from-stone-700 to-brand-600"
            badge="Beta"
            onClick={() => setView(View.VOICE_CLONE)}
        />
      </div>

      {/* Footer Branding */}
      <div className="pt-20 border-t border-stone-900 text-center space-y-4">
        <a 
          href="https://fb.me/nguyencanhcong" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-2 text-stone-500 hover:text-brand-400 transition-colors font-bold text-xs bg-stone-900/50 px-6 py-3 rounded-2xl border border-stone-800"
        >
          <Facebook size={18} />
          <span>KẾT NỐI VỚI CHÚNG TÔI QUA FACEBOOK</span>
        </a>
        <p className="text-[10px] text-stone-700 font-black uppercase tracking-[0.4em]">
          Professional Content Creation Studio • NCC Digital Hub © 2025
        </p>
      </div>
    </div>
  );
};
