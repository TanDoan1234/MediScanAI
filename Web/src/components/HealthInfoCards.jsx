import React from 'react';
import { healthInfos } from '../data/healthInfos.jsx';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';

export default function HealthInfoCards() {
  const { language } = useLanguage();
  
  return (
    <div className="mb-4 lg:mb-6">
      <div className="flex justify-between items-end mb-3 px-1">
        <h3 className="text-base lg:text-lg font-bold text-gray-800">{getTranslation('usefulHealthInfo', language)}</h3>
        <span className="text-[11px] lg:text-sm text-teal-600 font-semibold cursor-pointer hover:text-teal-700 transition">{getTranslation('viewAll', language)}</span>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 lg:pb-6 -mx-4 sm:-mx-5 lg:mx-0 px-4 sm:px-5 lg:px-0 scrollbar-hide snap-x overscroll-x-contain">
        {healthInfos.map((info) => (
          <div key={info.id} className="min-w-[240px] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm snap-center flex flex-col justify-between h-[130px]">
            <div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block ${info.tagColor}`}>
                {getTranslation(info.tagKey, language)}
              </span>
              <h4 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2">
                {getTranslation(info.titleKey, language)}
              </h4>
              <p className="text-[11px] text-gray-500 line-clamp-1">{getTranslation(info.descKey, language)}</p>
            </div>
            <div className="flex justify-end">
              {info.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

