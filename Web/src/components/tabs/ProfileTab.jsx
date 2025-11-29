import React from 'react';
import { User, History, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../locales/translations';

export default function ProfileTab() {
  const { language } = useLanguage();
  const menuItems = [
    { icon: <User className="w-5 h-5 text-gray-400" />, label: getTranslation('healthProfile', language) },
    { icon: <History className="w-5 h-5 text-gray-400" />, label: getTranslation('scanHistory', language) },
    { icon: <Settings className="w-5 h-5 text-gray-400" />, label: getTranslation('settings', language) },
    { icon: <LogOut className="w-5 h-5" />, label: getTranslation('logout', language), isDanger: true }
  ];

  return (
    <div className="animate-in fade-in duration-300 py-4">
      <div className="flex items-center gap-4 mb-8 px-2">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-2xl font-bold border-4 border-white shadow-md flex-shrink-0">
          MK
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-gray-800 truncate">Minh Khôi</h2>
          <p className="text-xs text-gray-500 bg-gray-200 w-fit px-2 py-0.5 rounded-full mt-1">
            {getTranslation('premiumMember', language)}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className={`p-4 ${index < menuItems.length - 1 ? 'border-b border-gray-50' : ''} flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition ${item.isDanger ? 'hover:bg-red-50 text-red-500' : ''}`}
          >
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            <span className={`text-sm font-medium flex-1 ${item.isDanger ? 'text-red-500' : 'text-gray-700'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

