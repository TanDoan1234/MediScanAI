import React, { useEffect, useRef } from "react";
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
  Info,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../locales/translations";

export default function ScanResultModal({ onClose, result }) {
  const { language } = useLanguage();
  const hasSpokenRef = useRef(false);
  const voicesLoadedRef = useRef(false);

  // Hàm dịch các text thường gặp từ tiếng Việt sang tiếng Anh
  const translateContent = (text) => {
    if (!text || language === "vi") return text;

    // Dictionary cho các từ/cụm từ thường gặp (sắp xếp theo độ dài, dài trước)
    const translations = {
      // Full phrases (dài nhất trước)
      "Thuốc giảm đau hạ sốt nên uống sau khi ăn để tránh kích ứng dạ dày":
        "Pain and fever reducing medicine should be taken after meals to avoid stomach irritation",
      "Nếu có bất kỳ dấu hiệu bất thường nào, hãy ngừng sử dụng và tham khảo ý kiến bác sĩ":
        "If there are any abnormal signs, stop using and consult a doctor",
      "bất kỳ dấu hiệu bất thường nào": "any abnormal signs",
      "ngừng sử dụng và tham khảo ý kiến bác sĩ":
        "stop using and consult a doctor",
      "Thuốc giảm đau hạ sốt": "Pain and fever reducing medicine",
      "nên uống sau khi ăn": "should be taken after meals",
      "để tránh kích ứng dạ dày": "to avoid stomach irritation",
      "Giảm đau; hạ sốt": "Pain relief; fever reduction",
      "Thuốc giải độc paracetamol": "Paracetamol antidote",
      "Thuốc kê đơn": "Prescription medicine",
      "Không kê đơn": "Over-the-counter",

      // Category translations
      "Giảm đau": "Pain relief",
      "hạ sốt": "fever reduction",
      "Giảm đau hạ sốt": "Pain and fever relief",

      // Common medical terms
      "được dùng": "used",
      "dưới dạng": "in the form of",
      "muối natri": "sodium salt",
      "sau khi ăn": "after meals",
      "tránh kích ứng": "avoid irritation",
      "dạ dày": "stomach",
      "ngừng sử dụng": "stop using",
      "tham khảo ý kiến bác sĩ": "consult a doctor",
      "Chưa có thông tin": "No information available",
      "N/A": "N/A",

      // Common words
      nên: "should",
      để: "to",
      tránh: "avoid",
      nếu: "if",
      có: "have",
      và: "and",
    };

    // Thử tìm exact match trước
    if (translations[text.trim()]) {
      return translations[text.trim()];
    }

    // Thử tìm partial match và thay thế (theo thứ tự từ dài đến ngắn)
    let translatedText = text;
    const sortedKeys = Object.keys(translations).sort(
      (a, b) => b.length - a.length
    );

    sortedKeys.forEach((key) => {
      const regex = new RegExp(
        key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      translatedText = translatedText.replace(regex, translations[key]);
    });

    return translatedText;
  };

  // Đảm bảo voices được load khi component mount
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoadedRef.current = true;
      }
    };

    // Thử load ngay
    loadVoices();

    // Lắng nghe event voiceschanged
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Hàm phát hiện text tiếng Anh (chứa chữ cái Latin không dấu)
  const isEnglishText = (text) => {
    if (!text || text.trim().length === 0) return false;

    // Loại bỏ số và dấu câu để kiểm tra
    const cleanText = text.replace(/[0-9.,;:!?()%\-]/g, "").trim();
    if (cleanText.length === 0) return false;

    // Kiểm tra nếu text chứa chữ cái Latin và không có dấu tiếng Việt
    const vietnamesePattern =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;
    const hasLatinLetters = /[a-z]/i.test(cleanText);
    const hasVietnameseAccents = vietnamesePattern.test(text);

    // Nếu có chữ Latin nhưng không có dấu tiếng Việt, có thể là tiếng Anh
    // Nhưng cần kiểm tra thêm: nếu toàn bộ là chữ hoa và dài > 3, có thể là tên thuốc tiếng Anh
    const isAllCaps =
      cleanText === cleanText.toUpperCase() && cleanText.length > 2;
    const hasMixedCase = /[a-z]/.test(cleanText) && /[A-Z]/.test(cleanText);

    return (
      hasLatinLetters &&
      !hasVietnameseAccents &&
      (isAllCaps || hasMixedCase || cleanText.length > 4)
    );
  };

  // Hàm tách text thành các phần tiếng Việt và tiếng Anh
  const splitMixedText = (text) => {
    const parts = [];
    // Regex để tách text: giữ nguyên khoảng trắng và dấu câu
    // Cải thiện: tách theo từ, giữ nguyên số và ký tự đặc biệt đi kèm
    const words = text.split(/(\s+|[,.;:!?()%])/);
    let currentPart = { text: "", isEnglish: false };

    words.forEach((word) => {
      const trimmedWord = word.trim();
      if (!trimmedWord) {
        // Khoảng trắng hoặc dấu câu - thêm vào phần hiện tại
        currentPart.text += word;
        return;
      }

      // Kiểm tra nếu là số hoặc ký tự đặc biệt đơn lẻ
      if (/^[0-9%.,;:!?()]+$/.test(trimmedWord)) {
        currentPart.text += word;
        return;
      }

      const wordIsEnglish = isEnglishText(trimmedWord);

      if (currentPart.isEnglish === wordIsEnglish) {
        // Cùng loại, thêm vào phần hiện tại
        currentPart.text += word;
      } else {
        // Khác loại, lưu phần cũ và bắt đầu phần mới
        if (currentPart.text.trim()) {
          parts.push(currentPart);
        }
        currentPart = { text: word, isEnglish: wordIsEnglish };
      }
    });

    // Thêm phần cuối cùng
    if (currentPart.text.trim()) {
      parts.push(currentPart);
    }

    return parts;
  };

  // Hàm tìm voice tốt nhất cho ngôn ngữ
  const getBestVoice = (lang) => {
    if (!("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Ưu tiên các voice có tên chứa từ khóa phù hợp
    const preferredKeywords = {
      "vi-VN": ["vietnamese", "vi", "vietnam"],
      "en-US": ["english", "en", "us", "american", "google", "microsoft"],
    };

    const keywords = preferredKeywords[lang] || [];

    // Tìm voice phù hợp với ngôn ngữ
    let bestVoice = voices.find(
      (voice) =>
        voice.lang.startsWith(lang.split("-")[0]) &&
        keywords.some((keyword) =>
          voice.name.toLowerCase().includes(keyword.toLowerCase())
        )
    );

    // Nếu không tìm thấy, tìm voice có lang phù hợp
    if (!bestVoice) {
      bestVoice = voices.find((voice) =>
        voice.lang.startsWith(lang.split("-")[0])
      );
    }

    // Nếu vẫn không tìm thấy, tìm voice có lang gần nhất
    if (!bestVoice) {
      const langPrefix = lang.split("-")[0];
      bestVoice = voices.find((voice) => voice.lang.startsWith(langPrefix));
    }

    // Fallback: chọn voice đầu tiên có sẵn
    return bestVoice || voices[0];
  };

  // Hàm đọc text hỗn hợp với ngôn ngữ phù hợp
  const speakMixedText = (text, options = {}) => {
    if (!("speechSynthesis" in window)) return;

    // Đảm bảo voices đã được load
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Nếu chưa có voices, đợi một chút rồi thử lại
        setTimeout(loadVoices, 100);
        return;
      }
      performSpeak();
    };

    const performSpeak = () => {
      // Dừng bất kỳ lời nói nào đang phát
      window.speechSynthesis.cancel();

      // Nếu ngôn ngữ web là tiếng Anh, đọc tất cả bằng tiếng Anh
      if (language === "en") {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";

        // Tìm voice tốt nhất cho tiếng Anh
        const bestVoice = getBestVoice("en-US");
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        // Điều chỉnh tham số để giọng nói tự nhiên hơn
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        window.speechSynthesis.speak(utterance);
        return;
      }

      // Nếu ngôn ngữ web là tiếng Việt, phân biệt phần tiếng Việt và tiếng Anh
      // Tách text thành các phần
      const parts = splitMixedText(text);

      if (parts.length === 0) return;

      // Nếu chỉ có 1 phần, đọc trực tiếp
      if (parts.length === 1) {
        const part = parts[0];
        const lang = part.isEnglish ? "en-US" : "vi-VN";
        const utterance = new SpeechSynthesisUtterance(part.text);
        utterance.lang = lang;

        // Tìm voice tốt nhất
        const bestVoice = getBestVoice(lang);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        // Điều chỉnh tham số để giọng nói tự nhiên hơn
        utterance.rate = options.rate || 0.9; // Chậm hơn một chút để rõ ràng
        utterance.pitch = options.pitch || 1.0; // Cao độ tự nhiên
        utterance.volume = options.volume || 1.0; // Âm lượng đầy đủ

        window.speechSynthesis.speak(utterance);
        return;
      }

      // Đọc từng phần với ngôn ngữ phù hợp
      let currentIndex = 0;

      const speakNext = () => {
        if (currentIndex >= parts.length) return;

        const part = parts[currentIndex];
        // Phần tiếng Anh đọc tiếng Anh, phần tiếng Việt đọc tiếng Việt
        const lang = part.isEnglish ? "en-US" : "vi-VN";
        const utterance = new SpeechSynthesisUtterance(part.text);
        utterance.lang = lang;

        // Tìm voice tốt nhất cho mỗi phần
        const bestVoice = getBestVoice(lang);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        // Điều chỉnh tham số để giọng nói tự nhiên hơn
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        utterance.onend = () => {
          currentIndex++;
          if (currentIndex < parts.length) {
            // Đợi một chút trước khi đọc phần tiếp theo
            setTimeout(speakNext, 100);
          }
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNext();
    };

    // Kiểm tra xem voices đã sẵn sàng chưa
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      performSpeak();
    } else {
      // Nếu chưa có voices, đợi event voiceschanged
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  };

  // Hàm đọc text đơn giản (backward compatible)
  const speakText = (text, options = {}) => {
    // Sử dụng speakMixedText để tự động phát hiện ngôn ngữ
    speakMixedText(text, options);
  };

  // Tự động đọc khi modal mở với kết quả scan
  useEffect(() => {
    // Reset khi result thay đổi
    hasSpokenRef.current = false;

    if (!result) return;

    // Xử lý trường hợp thuốc kê đơn
    if (result.error === "PRESCRIPTION_REQUIRED" && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      setTimeout(() => {
        const warningText =
          language === "en"
            ? `Warning. This is a prescription drug. ${
                result.drug_name || "This medicine"
              } should be used as directed by your doctor.`
            : `Cảnh báo. Đây là thuốc kê đơn. ${
                result.drug_name || "Thuốc này"
              } cần được sử dụng theo chỉ định của bác sĩ.`;
        speakText(warningText);
      }, 500);
    }
    // Xử lý trường hợp scan thành công
    else if (result.success && !hasSpokenRef.current) {
      hasSpokenRef.current = true;

      // Tạo thông báo đầy đủ: Tên, Phân loại, Khuyến nghị
      const drugName =
        result.drug_name || (language === "en" ? "Unknown" : "Không xác định");
      const category = result.category
        ? language === "en"
          ? `Category: ${result.category}`
          : `Phân loại: ${result.category}`
        : "";
      const recommendations = result.recommendations || [];

      // Tạo text để đọc theo ngôn ngữ web hiện tại
      let fullText =
        language === "en"
          ? `Drug name: ${drugName}.`
          : `Tên thuốc: ${drugName}.`;

      if (category) {
        fullText += ` ${category}.`;
      }

      if (recommendations.length > 0) {
        // Đọc 2 khuyến nghị đầu tiên
        const recText = recommendations.slice(0, 2).join(" ");
        fullText +=
          language === "en"
            ? ` Recommendations: ${recText}.`
            : ` Khuyến nghị: ${recText}.`;
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
  if (result && result.error === "PRESCRIPTION_REQUIRED") {
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
              <h2 className="text-2xl font-bold text-center mb-2">
                {getTranslation("prescription", language)}
              </h2>
              <p className="text-center text-red-50 text-sm">
                {result.message ||
                  getTranslation("prescriptionRequired", language)}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {getTranslation("drugName", language).toUpperCase()}
                </span>
                <p className="text-sm font-bold text-gray-800">
                  {result.drug_name || getTranslation("drugNotFound", language)}
                </p>
              </div>

              {result.active_ingredient && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {getTranslation("activeIngredient", language).toUpperCase()}
                  </span>
                  <p className="text-sm font-bold text-gray-800">
                    {result.active_ingredient}
                  </p>
                </div>
              )}

              {result.category && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {getTranslation("category", language).toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-700">
                    {translateContent(result.category)}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition shadow-lg"
            >
              {getTranslation("confirm", language)}
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
            <h2 className="text-2xl font-bold mb-2">
              {getTranslation("drugNotFound", language)}
            </h2>
            <p className="text-gray-600 mb-6">
              {result?.message || getTranslation("drugNotFound", language)}
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition"
            >
              {getTranslation("close", language)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const drugName =
    result.drug_name || (language === "en" ? "Unknown" : "Không xác định");
  const activeIngredient =
    result.active_ingredient ||
    (language === "en" ? "No information" : "Chưa có thông tin");
  const pageNumber = result.page_number || "";
  const rxStatus = result.rx_status || "OTC";

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-400 relative max-h-[90vh] flex flex-col">
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
                {rxStatus === "OTC"
                  ? language === "vi"
                    ? "AN TOÀN (OTC)"
                    : "SAFE (OTC)"
                  : language === "vi"
                  ? "CẦN ĐƠN (RX)"
                  : "PRESCRIPTION (RX)"}
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
                {language === "vi"
                  ? `Đã đối chiếu: Dược thư QG 2018 - Trang ${pageNumber}`
                  : `Verified: National Formulary 2018 - Page ${pageNumber}`}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mb-6 px-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {language === "vi" ? "Vừa xong" : "Just now"}
              </span>
            </div>
            <button
              onClick={() => {
                const category = result.category
                  ? `${getTranslation("category", language)}: ${
                      result.category
                    }`
                  : "";
                const recommendations = result.recommendations || [];

                let text = `${getTranslation(
                  "drugName",
                  language
                )}: ${drugName}.`;
                if (category) text += ` ${category}.`;
                if (recommendations.length > 0) {
                  text += ` ${getTranslation(
                    "recommendations",
                    language
                  )}: ${recommendations.slice(0, 2).join(" ")}.`;
                }
                speakText(text);
              }}
              className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full font-bold text-xs hover:bg-teal-100 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              {language === "vi" ? "Đọc to" : "Read Aloud"}
            </button>
          </div>

          <div className="space-y-4 mb-6 max-h-[400px] lg:max-h-[500px] xl:max-h-[600px] overflow-y-auto">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                {getTranslation("activeIngredient", language).toUpperCase()}
              </span>
              <p className="text-sm font-bold text-gray-800">
                {activeIngredient}
              </p>
            </div>

            {result.category && (
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  {getTranslation("category", language).toUpperCase()}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {translateContent(result.category)}
                </p>
              </div>
            )}

            {result.composition && (
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {getTranslation("composition", language).toUpperCase()}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {translateContent(result.composition)}
                </p>
              </div>
            )}

            {result.indications && (
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {getTranslation("indications", language).toUpperCase()}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {translateContent(result.indications)}
                </p>
              </div>
            )}

            {result.contraindications && (
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {getTranslation("contraindications", language).toUpperCase()}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {translateContent(result.contraindications)}
                </p>
              </div>
            )}

            {result.dosage && (
              <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100">
                <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {getTranslation("dosage", language).toUpperCase()}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {translateContent(result.dosage)}
                </p>
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  {getTranslation("recommendations", language).toUpperCase()}
                </span>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-yellow-600 font-bold mt-0.5">
                        •
                      </span>
                      <span>{translateContent(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.extracted_text && (
              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1">
                  {getTranslation("recognizedText", language).toUpperCase()}
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
            {getTranslation("confirm", language)}
          </button>
        </div>
      </div>
    </div>
  );
}
