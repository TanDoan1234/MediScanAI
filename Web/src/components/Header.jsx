import React, { useState } from 'react';
import { Menu, Bell, Clock, ShieldCheck, ScanLine, Mail, Github, Linkedin, X, Languages, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

export default function Header({ showNotifications, setShowNotifications, onMenuClick, onScanClick }) {
  const [showContact, setShowContact] = useState(false);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showContact) setShowContact(false); // Đóng contact khi mở notification
  };
  const toggleContact = () => {
    setShowContact(!showContact);
    if (showNotifications) setShowNotifications(false); // Đóng notification khi mở contact
  };
  
  const handleLanguageToggle = () => {
    setIsLoadingLanguage(true);
    toggleLanguage(() => setIsLoadingLanguage(true)); // onLoadingStart
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 lg:pt-6 pb-3 bg-white z-20 flex-shrink-0 border-b border-gray-100 lg:border-0">
      <button 
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-full transition active:scale-95"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="hidden lg:block"></div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{getTranslation('overview', language)}</span>
        <h1 className="text-lg font-extrabold text-teal-700 tracking-tight">MediScan AI</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* TRANSLATE BUTTON */}
        <button
          onClick={handleLanguageToggle}
          disabled={isLoadingLanguage}
          className={`p-2 rounded-full transition ${language === 'en' ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-100'} ${isLoadingLanguage ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Translate"
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          {isLoadingLanguage ? (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
          ) : (
            <Languages className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>
        
        {/* LOADING POPUP */}
        {isLoadingLanguage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col items-center text-center">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {language === 'vi' ? 'Đang chuyển sang tiếng Anh...' : 'Switching to Vietnamese...'}
                </h3>
                <p className="text-sm text-gray-500">
                  {language === 'vi' ? 'Vui lòng đợi trong giây lát' : 'Please wait a moment'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* CONTACT BUTTON */}
        <div className="relative">
          <button 
            onClick={toggleContact}
            className={`p-2 rounded-full transition ${showContact ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label="Liên hệ"
          >
            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          {/* Contact Popup */}
          {showContact && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/20 z-40 lg:bg-transparent"
                onClick={toggleContact}
              ></div>
              
              {/* Popup */}
              <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{getTranslation('contactUs', language)}</span>
                  <button
                    onClick={toggleContact}
                    className="p-1 rounded-full hover:bg-white/20 transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  {/* Leader Section */}
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                      👑 {getTranslation('leader', language)}
                    </div>
                    <div className="space-y-2">
                      <a
                        href="https://github.com/TanDoan1234"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl transition group border border-gray-100 hover:border-teal-200"
                        onClick={() => setShowContact(false)}
                      >
                        <div className="p-2 bg-gray-100 group-hover:bg-teal-100 rounded-lg transition">
                          <Github className="w-5 h-5 text-gray-700 group-hover:text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">GitHub</p>
                          <p className="text-xs text-gray-500 mt-0.5">github.com/TanDoan1234</p>
                        </div>
                      </a>
                      
                      <a
                        href="https://www.linkedin.com/in/t%C3%A2n-minh/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl transition group border border-gray-100 hover:border-teal-200"
                        onClick={() => setShowContact(false)}
                      >
                        <div className="p-2 bg-gray-100 group-hover:bg-teal-100 rounded-lg transition">
                          <Linkedin className="w-5 h-5 text-gray-700 group-hover:text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">LinkedIn</p>
                          <p className="text-xs text-gray-500 mt-0.5">linkedin.com/in/tân-minh</p>
                        </div>
                      </a>
                    </div>
                  </div>
                  
                  {/* Contributor Section */}
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                      🤝 {getTranslation('contributor', language)}
                    </div>
                    <div className="space-y-2">
                      <a
                        href="https://github.com/kai2202"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 rounded-xl transition group border border-gray-100 hover:border-teal-200"
                        onClick={() => setShowContact(false)}
                      >
                        <div className="p-2 bg-gray-100 group-hover:bg-teal-100 rounded-lg transition">
                          <Github className="w-5 h-5 text-gray-700 group-hover:text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">GitHub</p>
                          <p className="text-xs text-gray-500 mt-0.5">github.com/kai2202</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* SCAN BUTTON - Desktop only */}
        {onScanClick && (
          <button
            onClick={onScanClick}
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-teal-400 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 font-semibold text-sm"
          >
            <ScanLine className="w-5 h-5" />
            <span>{getTranslation('scanMedicine', language)}</span>
          </button>
        )}
        <div className="relative">
        <button 
          onClick={toggleNotifications}
          className={`p-2 rounded-full transition ${showNotifications ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
        
        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">{getTranslation('notifications', language)}</span>
              <span className="text-[10px] text-teal-600 font-semibold cursor-pointer">{getTranslation('markAsRead', language)}</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <div className="p-3 border-b border-gray-50 hover:bg-teal-50 transition cursor-pointer flex gap-3">
                <div className="bg-teal-100 p-1.5 rounded-full h-fit">
                  <Clock className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{getTranslation('timeToTakeMedicine', language)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Vitamin C - 1 {getTranslation('pills', language)} {getTranslation('afterMeal', language)}</p>
                  <span className="text-[9px] text-gray-400 mt-1 block">2 {getTranslation('minutesAgo', language)}</span>
                </div>
              </div>
              <div className="p-3 hover:bg-teal-50 transition cursor-pointer flex gap-3">
                <div className="bg-orange-100 p-1.5 rounded-full h-fit">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Cập nhật dữ liệu</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Dược thư Quốc gia đã cập nhật phiên bản mới.</p>
                  <span className="text-[9px] text-gray-400 mt-1 block">1 giờ trước</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

