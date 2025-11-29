import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Volume2, 
  ShieldCheck 
} from 'lucide-react';

export default function ScanResultModal({ onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-300">
      <div className="bg-white w-full rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-400 relative">
        {/* Result Header */}
        <div className="bg-emerald-500 px-6 pt-6 pb-10 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 rounded-full p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full border-2 border-white/90 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="bg-emerald-600/50 border border-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                AN TOÀN (OTC)
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Panadol Extra</h2>
            <div className="flex items-center gap-1.5 text-emerald-50 text-xs">
              <Activity className="w-3.5 h-3.5" />
              <span className="font-medium">Paracetamol 500mg • Caffeine 65mg</span>
            </div>
          </div>
        </div>

        {/* Result Body */}
        <div className="px-5 py-6 -mt-6 bg-white rounded-t-[28px] relative z-10">
          <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-100 p-3 rounded-xl mb-5 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-cyan-600 flex-shrink-0" />
            <span className="text-[11px] font-medium text-cyan-800 leading-tight">
              Đã đối chiếu: Dược thư QG 2018 - Trang 1092
            </span>
          </div>

          <div className="flex justify-between items-center mb-6 px-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Vừa xong</span>
            </div>
            <button className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full font-bold text-xs hover:bg-teal-100 transition">
              <Volume2 className="w-3.5 h-3.5" />
              Đọc to
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                NHÓM THUỐC
              </span>
              <p className="text-sm font-bold text-gray-800">Giảm đau, hạ sốt</p>
            </div>
            
            <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1">
                CÔNG DỤNG CHÍNH
              </span>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                Điều trị đau nhẹ đến vừa: đau đầu, đau nửa đầu, đau cơ, đau bụng kinh, đau họng.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition shadow-lg shadow-gray-300 transform active:scale-[0.98]"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

