import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Pill } from 'lucide-react';
import { API_URL } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';
import { getCategoryName } from '../data/categories';

export default function CategoryDetailPage({ category, onBack }) {
  const { language } = useLanguage();
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrugs, setFilteredDrugs] = useState([]);

  useEffect(() => {
    fetchDrugsByCategory();
  }, [category]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDrugs(drugs);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredDrugs(
        drugs.filter(drug => 
          drug.DrugName?.toLowerCase().includes(query) ||
          drug.ActiveIngredient?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, drugs]);

  const fetchDrugsByCategory = async () => {
    setLoading(true);
    try {
      // Map category name to search query
      // Get category name in Vietnamese for search (database uses Vietnamese)
      const categoryNameVi = getCategoryName(category, 'vi');
      const categoryMap = {
        'Thuốc kê đơn': 'Is_Prescription=true',
        'Không kê đơn': 'Is_Prescription=false',
        'Vitamin': 'Vitamin',
        'Thảo dược': 'Thảo dược',
        'Thuốc bôi': 'Bôi',
        'Dụng cụ y tế': 'Dụng cụ',
        'Tiêu hoá': 'Tiêu hóa',
        'Hô hấp': 'Hô hấp'
      };

      const searchTerm = categoryMap[categoryNameVi] || categoryNameVi;
      
      const response = await fetch(`${API_URL}/drugs/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      setDrugs(data.drugs || []);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm flex-shrink-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 xl:px-10 py-3 lg:py-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-xl font-bold text-gray-800 truncate">{getCategoryName(category, language)}</h1>
            <p className="text-xs lg:text-sm text-gray-500">{filteredDrugs.length} {getTranslation('drugs', language)}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pb-3 lg:pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={getTranslation('searchInCategory', language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm lg:text-base"
            />
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 lg:py-6 scrollbar-show min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">{getTranslation('loading', language)}</p>
            </div>
          </div>
        ) : filteredDrugs.length === 0 ? (
          <div className="text-center py-20">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{getTranslation('noDrugsFound', language)}</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchQuery ? getTranslation('tryDifferentSearch', language) : getTranslation('noDrugsFound', language)}
            </p>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
              {filteredDrugs.map((drug, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 lg:mb-2 text-sm lg:text-base truncate">{drug.DrugName || 'N/A'}</h3>
                      <p className="text-sm lg:text-base text-gray-600 mb-2 lg:mb-3 line-clamp-2">
                        {drug.ActiveIngredient || 'Chưa có thông tin'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {drug.Category && (
                          <span className="inline-block px-2 py-1 bg-teal-50 text-teal-600 text-xs lg:text-sm font-medium rounded-lg">
                            {drug.Category}
                          </span>
                        )}
                        {drug.Is_Prescription && (
                          <span className="inline-block px-2 py-1 bg-red-50 text-red-600 text-xs lg:text-sm font-bold rounded-lg">
                            Kê đơn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

