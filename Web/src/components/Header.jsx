import React from 'react';
import { Menu, Bell, Clock, ShieldCheck, ScanLine } from 'lucide-react';

export default function Header({ showNotifications, setShowNotifications, onMenuClick, onScanClick }) {
  const toggleNotifications = () => setShowNotifications(!showNotifications);

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
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tổng quan</span>
        <h1 className="text-lg font-extrabold text-teal-700 tracking-tight">MediScan AI</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* SCAN BUTTON - Desktop only */}
        {onScanClick && (
          <button
            onClick={onScanClick}
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-teal-400 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 font-semibold text-sm"
          >
            <ScanLine className="w-5 h-5" />
            <span>Quét thuốc</span>
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
              <span className="text-xs font-bold text-gray-500 uppercase">Thông báo</span>
              <span className="text-[10px] text-teal-600 font-semibold cursor-pointer">Đánh dấu đã đọc</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <div className="p-3 border-b border-gray-50 hover:bg-teal-50 transition cursor-pointer flex gap-3">
                <div className="bg-teal-100 p-1.5 rounded-full h-fit">
                  <Clock className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Đến giờ uống thuốc!</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Vitamin C - 1 viên sau ăn</p>
                  <span className="text-[9px] text-gray-400 mt-1 block">2 phút trước</span>
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

