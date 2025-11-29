import React from 'react';
import { 
  Pill, 
  User, 
  EyeOff, 
  BrainCircuit, 
  MessageSquare, 
  Stethoscope 
} from 'lucide-react';

export const banners = [
  // Banner 1: "Đôi mắt thứ hai" (New Design)
  <div key="banner1" className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-3xl p-5 lg:p-8 xl:p-10 text-white shadow-md relative overflow-hidden h-full flex items-center select-none">
    <div className="relative z-10 w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 lg:gap-8">
      <div className="flex-1 text-center lg:text-left">
        <h2 className="text-lg lg:text-3xl xl:text-4xl font-bold leading-tight mb-2 lg:mb-4 drop-shadow-sm">
          Đôi mắt thứ hai<br/>cho tủ thuốc gia đình
        </h2>
        <p className="text-[10px] lg:text-base xl:text-lg opacity-90 mb-3 lg:mb-4 font-medium">
          Chế độ "Không cần kính" • Tự động đọc kết quả
        </p>
        <button className="text-[10px] lg:text-sm xl:text-base bg-white text-teal-600 px-4 py-1.5 lg:px-6 lg:py-2 xl:px-8 xl:py-3 rounded-full font-bold shadow-sm hover:bg-teal-50 transition transform active:scale-95">
          Tìm hiểu thêm
        </button>
      </div>
      <div className="hidden lg:block relative w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 opacity-90 flex-shrink-0">
        <div className="absolute top-4 right-4 bg-white/20 w-20 h-20 lg:w-32 lg:h-32 rounded-full blur-xl"></div>
        <Pill className="w-24 h-24 lg:w-40 lg:h-40 xl:w-48 xl:h-48 text-white drop-shadow-lg transform -rotate-45" fill="white" fillOpacity="0.2" />
      </div>
    </div>
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full mix-blend-overlay"></div>
  </div>,

  // Banner 2: Founder & 3 "KHÔNG" (Compact)
  <div key="banner2" className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-4 lg:p-6 xl:p-7 text-white shadow-md relative overflow-hidden h-full flex flex-col justify-center select-none">
    <div className="relative z-10 w-full">
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-3 lg:mb-4">
        <div className="flex items-center justify-center lg:justify-start gap-1.5 mb-2 lg:mb-3 bg-white/20 w-fit mx-auto lg:mx-0 px-2 py-0.5 lg:px-3 lg:py-1 rounded-full backdrop-blur-sm">
          <User className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
          <span className="text-[9px] lg:text-xs xl:text-sm font-bold uppercase">Founder: Minh Tân & Tuấn Khải</span>
        </div>
        <h2 className="text-base lg:text-xl xl:text-2xl font-bold leading-tight">
          Giải quyết 3 "KHÔNG"<br/>cho người cao tuổi
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:gap-3 xl:gap-4 text-center">
        {[
          { icon: <EyeOff className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />, text: "Không thấy" },
          { icon: <BrainCircuit className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />, text: "Không hiểu" },
          { icon: <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />, text: "Quên lời dặn" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white/10 rounded-lg p-1.5 lg:p-2 xl:p-2.5 flex flex-col items-center justify-center backdrop-blur-sm border border-white/5">
            {item.icon}
            <span className="text-[9px] lg:text-xs xl:text-sm mt-1 lg:mt-1.5 opacity-90">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="absolute top-0 right-0 w-32 h-32 lg:w-40 lg:h-40 bg-teal-300 opacity-20 rounded-full blur-2xl"></div>
  </div>,

  // Banner 3: AI Doctor
  <div key="banner3" className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-5 lg:p-8 xl:p-10 text-white shadow-md relative overflow-hidden h-full flex items-center justify-center lg:justify-between select-none">
    <div className="z-10 w-full lg:w-2/3 flex flex-col items-center lg:items-start text-center lg:text-left">
      <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-4">
        <div className="p-1 lg:p-2 bg-white/20 rounded-md">
          <BrainCircuit className="w-4 h-4 lg:w-6 lg:h-6 xl:w-8 xl:h-8" />
        </div>
        <span className="text-[10px] lg:text-base xl:text-lg font-bold uppercase tracking-wider opacity-90">AI Support</span>
      </div>
      <h2 className="text-lg lg:text-3xl xl:text-4xl font-bold leading-tight mb-2 lg:mb-4">
        Bác sĩ gia đình<br/>trực tuyến 24/7
      </h2>
      <button className="text-[10px] lg:text-sm xl:text-base bg-white text-teal-600 px-3 py-1.5 lg:px-6 lg:py-2 xl:px-8 xl:py-3 rounded-full font-bold shadow-sm hover:bg-teal-50 transition">
        Chat ngay
      </button>
    </div>
    <div className="hidden lg:flex w-1/3 justify-center relative">
      <div className="absolute inset-0 bg-teal-400 blur-2xl opacity-40 rounded-full"></div>
      <Stethoscope className="w-20 h-20 lg:w-32 lg:h-32 xl:w-40 xl:h-40 text-white/20 -rotate-12 transform translate-x-4" />
    </div>
  </div>
];

