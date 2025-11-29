import React from 'react';
import { Heart, Pill, Droplet } from 'lucide-react';

export default function FavoritesTab() {
  const favorites = [
    {
      id: 1,
      name: 'Panadol Extra',
      desc: 'Còn 4 viên • Hết hạn 12/2025',
      icon: <Pill />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 2,
      name: 'Nước muối sinh lý',
      desc: 'Còn 1 chai • Dùng hàng ngày',
      icon: <Droplet />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="animate-in fade-in duration-300 py-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Tủ thuốc của bạn</h2>
      <div className="grid gap-3">
        {favorites.length > 0 ? (
          favorites.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 overflow-hidden">
              <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center ${item.iconColor} flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                <p className="text-xs text-gray-500 truncate">{item.desc}</p>
              </div>
              <button className="p-2 text-red-500 flex-shrink-0">
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Chưa có thuốc yêu thích</p>
            <p className="text-sm text-gray-400 mt-2">Thêm thuốc vào tủ thuốc của bạn</p>
          </div>
        )}
      </div>
    </div>
  );
}

