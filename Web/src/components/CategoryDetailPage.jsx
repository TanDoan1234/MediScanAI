import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Pill } from 'lucide-react';
import { API_URL } from '../utils/api';

export default function CategoryDetailPage({ category, onBack }) {
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

      const searchTerm = categoryMap[category.name] || category.name;
      
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
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">{category.name}</h1>
            <p className="text-xs text-gray-500">{filteredDrugs.length} thuốc</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thuốc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide min-h-0">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải...</p>
            </div>
          </div>
        ) : filteredDrugs.length === 0 ? (
          <div className="text-center py-20">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Không tìm thấy thuốc nào</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Danh mục này chưa có thuốc'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDrugs.map((drug, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{drug.DrugName || 'N/A'}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {drug.ActiveIngredient || 'Chưa có thông tin'}
                    </p>
                    {drug.Category && (
                      <span className="inline-block px-2 py-1 bg-teal-50 text-teal-600 text-xs font-medium rounded-lg">
                        {drug.Category}
                      </span>
                    )}
                  </div>
                  {drug.Is_Prescription && (
                    <span className="ml-2 px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg">
                      Kê đơn
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

