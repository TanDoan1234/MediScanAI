import React from 'react';
import { X, Pill, Tablets, Activity, Leaf, Droplet, Stethoscope, Wind, Home, Search, Heart, User } from 'lucide-react';
import { categories } from '../data/categories.jsx';

export default function Sidebar({ isOpen, onClose, onCategoryClick, onTabClick, currentTab, isDesktop = false }) {
  // Desktop: always visible, Mobile: overlay
  if (isDesktop) {
    return (
      <div className="w-full h-full bg-gray-50 overflow-y-auto scrollbar-hide">
        <div className="p-6 xl:p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">MediScan AI</h2>
            <p className="text-sm text-gray-500">Quản lý thuốc thông minh</p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Điều hướng
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => { onTabClick('home'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  currentTab === 'home' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Trang chủ</span>
              </button>
              <button
                onClick={() => { onTabClick('search'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  currentTab === 'search' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">Tìm kiếm</span>
              </button>
              <button
                onClick={() => { onTabClick('heart'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  currentTab === 'heart' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Yêu thích</span>
              </button>
              <button
                onClick={() => { onTabClick('user'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  currentTab === 'user' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Tài khoản</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Danh mục thuốc
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { onCategoryClick(cat); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition group"
                >
                  <div className="bg-teal-500 p-2 rounded-lg group-hover:bg-teal-600 transition">
                    {React.cloneElement(cat.icon, { className: "w-5 h-5 text-white" })}
                  </div>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile: overlay sidebar
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-hide">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Điều hướng
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => { onTabClick('home'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  currentTab === 'home' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Trang chủ</span>
              </button>
              <button
                onClick={() => { onTabClick('search'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  currentTab === 'search' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">Tìm kiếm</span>
              </button>
              <button
                onClick={() => { onTabClick('heart'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  currentTab === 'heart' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="font-medium">Yêu thích</span>
              </button>
              <button
                onClick={() => { onTabClick('user'); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  currentTab === 'user' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Tài khoản</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Danh mục thuốc
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { onCategoryClick(cat); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition group"
                >
                  <div className="bg-teal-500 p-2 rounded-lg group-hover:bg-teal-600 transition">
                    {React.cloneElement(cat.icon, { className: "w-5 h-5 text-white" })}
                  </div>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

