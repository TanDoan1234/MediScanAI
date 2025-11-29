import React, { useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Volume2, 
  ShieldCheck,
  AlertCircle,
  Pill,
  Heart,
  AlertTriangle,
  FileText,
  Lightbulb,
  Info
} from 'lucide-react';

export default function ScanResultModal({ onClose, result }) {
  const hasSpokenRef = useRef(false);

  const speakText = (text, options = {}) => {
    if ('speechSynthesis' in window) {
      // Dừng bất kỳ lời nói nào đang phát
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'vi-VN';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Tự động đọc khi modal mở với kết quả scan
  useEffect(() => {
    // Reset khi result thay đổi
    hasSpokenRef.current = false;
    
    if (!result) return;
    
    // Xử lý trường hợp thuốc kê đơn
    if (result.error === 'PRESCRIPTION_REQUIRED' && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      setTimeout(() => {
        const warningText = `Cảnh báo. Đây là thuốc kê đơn. ${result.drug_name || 'Thuốc này'} cần được sử dụng theo chỉ định của bác sĩ.`;
        speakText(warningText);
      }, 500);
    }
    // Xử lý trường hợp scan thành công
    else if (result.success && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      
      // Tạo thông báo đầy đủ: Tên, Phân loại, Cách dùng, Khuyến nghị
      const drugName = result.drug_name || 'Không xác định';
      const category = result.category ? `Phân loại: ${result.category}` : '';
      const usage = result.usage || result.dosage || '';
      const notes = result.notes || '';
      const recommendations = result.recommendations || [];
      
      // Tạo text để đọc
      let fullText = `Tên thuốc: ${drugName}.`;
      
      if (category) {
        fullText += ` ${category}.`;
      }
      
      if (usage) {
        // Rút ngắn cách dùng nếu quá dài
        const usageShort = usage.length > 150 ? usage.substring(0, 150) + '...' : usage;
        fullText += ` Cách dùng: ${usageShort}.`;
      }
      
      if (notes) {
        // Rút ngắn lưu ý nếu quá dài
        const notesShort = notes.length > 150 ? notes.substring(0, 150) + '...' : notes;
        fullText += ` Lưu ý: ${notesShort}.`;
      }
      
      if (recommendations.length > 0) {
        // Đọc 2 khuyến nghị đầu tiên
        const recText = recommendations.slice(0, 2).join(' ');
        fullText += ` Khuyến nghị: ${recText}.`;
      }
      
      // Đợi một chút để modal hiển thị xong rồi mới nói
      setTimeout(() => {
        speakText(fullText);
      }, 500);
    }
    
    // Cleanup: Dừng speech khi component unmount hoặc result thay đổi
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [result]);

  // Xử lý trường hợp thuốc kê đơn
  if (result && result.error === 'PRESCRIPTION_REQUIRED') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-300">
        <div className="bg-white w-full rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-400 relative">
          <div className="px-6 pt-6 pb-10">
            <div className="bg-red-500 px-6 pt-6 pb-10 text-white relative -mx-6 -mt-6 mb-6">
              <button 
                onClick={onClose} 
                className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 rounded-full p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-center mb-2">Thuốc Kê Đơn</h2>
              <p className="text-center text-red-50 text-sm">{result.message || '⚠️ Đây là thuốc kê đơn. Vui lòng sử dụng theo chỉ định của bác sĩ.'}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  TÊN THUỐC
                </span>
                <p className="text-sm font-bold text-gray-800">{result.drug_name || 'Không xác định'}</p>
              </div>
              
              {result.active_ingredient && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    HOẠT CHẤT
                  </span>
                  <p className="text-sm font-bold text-gray-800">{result.active_ingredient}</p>
                </div>
              )}
              
              {result.category && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    PHÂN LOẠI
                  </span>
                  <p className="text-sm text-gray-700">{result.category}</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={onClose}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition shadow-lg"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result || !result.success) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-300">
        <div className="bg-white w-full rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-400 relative">
          <div className="px-6 pt-6 pb-10 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Không tìm thấy</h2>
            <p className="text-gray-600 mb-6">{result?.message || 'Không thể nhận diện thuốc từ ảnh'}</p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const drugName = result.drug_name || 'Không xác định';
  const activeIngredient = result.active_ingredient || 'Chưa có thông tin';
  const pageNumber = result.page_number || '';
  const rxStatus = result.rx_status || 'OTC';

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
                {rxStatus === 'OTC' ? 'AN TOÀN (OTC)' : 'CẦN ĐƠN (RX)'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{drugName}</h2>
            <div className="flex items-center gap-1.5 text-emerald-50 text-xs">
              <Activity className="w-3.5 h-3.5" />
              <span className="font-medium">{activeIngredient}</span>
            </div>
          </div>
        </div>

        {/* Result Body */}
        <div className="px-5 py-6 -mt-6 bg-white rounded-t-[28px] relative z-10">
          {pageNumber && (
            <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-100 p-3 rounded-xl mb-5 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-cyan-600 flex-shrink-0" />
              <span className="text-[11px] font-medium text-cyan-800 leading-tight">
                Đã đối chiếu: Dược thư QG 2018 - Trang {pageNumber}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6 px-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Vừa xong</span>
            </div>
            <button 
              onClick={() => {
                const category = result.category ? `Phân loại: ${result.category}` : '';
                const usage = result.usage || result.dosage || '';
                const notes = result.notes || '';
                const recommendations = result.recommendations || [];
                
                let text = `Tên thuốc: ${drugName}.`;
                if (category) text += ` ${category}.`;
                if (usage) {
                  const usageShort = usage.length > 150 ? usage.substring(0, 150) + '...' : usage;
                  text += ` Cách dùng: ${usageShort}.`;
                }
                if (notes) {
                  const notesShort = notes.length > 150 ? notes.substring(0, 150) + '...' : notes;
                  text += ` Lưu ý: ${notesShort}.`;
                }
                if (recommendations.length > 0) {
                  text += ` Khuyến nghị: ${recommendations.slice(0, 2).join(' ')}.`;
                }
                speakText(text);
              }}
              className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full font-bold text-xs hover:bg-teal-100 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Đọc to
            </button>
          </div>

          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                HOẠT CHẤT
              </span>
              <p className="text-sm font-bold text-gray-800">{activeIngredient}</p>
            </div>
            
            {result.category && (
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  PHÂN LOẠI
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{result.category}</p>
              </div>
            )}
            
            {result.composition && (
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  THÀNH PHẦN
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{result.composition}</p>
              </div>
            )}
            
            {result.indications && (
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  CÔNG DỤNG / CHỈ ĐỊNH
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{result.indications}</p>
              </div>
            )}
            
            {result.contraindications && (
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  CHỐNG CHỈ ĐỊNH
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{result.contraindications}</p>
              </div>
            )}
            
            {result.dosage && (
              <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100">
                <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  LIỀU DÙNG
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{result.dosage}</p>
              </div>
            )}
            
            {result.usage && (
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  CÁCH DÙNG
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{result.usage}</p>
              </div>
            )}
            
            {result.notes && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  LƯU Ý
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{result.notes}</p>
              </div>
            )}
            
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  KHUYẾN NGHỊ
                </span>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.extracted_text && (
              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1">
                  TEXT NHẬN DIỆN ĐƯỢC
                </span>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {result.extracted_text}
                </p>
              </div>
            )}
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

