import React from 'react';
import { categories } from '../data/categories.jsx';

export default function CategoryGrid({ onCategoryClick }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="text-base font-bold text-gray-800">Danh mục thuốc</h3>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-y-4 sm:gap-y-6 gap-x-2 sm:gap-x-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick && onCategoryClick(cat)}
            className="flex flex-col items-center cursor-pointer group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-xl p-1 transition"
          >
            <div className="bg-teal-500 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md shadow-teal-200 transition-all duration-300 ease-out group-hover:scale-105 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-teal-500/40 mb-2 group-active:scale-95">
              {cat.icon}
            </div>
            <span className="text-[10px] sm:text-[11px] text-center font-semibold text-gray-600 leading-tight px-1 line-clamp-2 min-h-[2.5em] flex items-center group-hover:text-teal-600 transition-colors">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

