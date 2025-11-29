# MediScan AI - Cấu trúc dự án

## 📁 Cấu trúc thư mục

```
src/
├── components/          # Các React components
│   ├── Header.jsx       # Header với menu và notifications
│   ├── NavItem.jsx     # Component navigation item
│   ├── ScanOverlay.jsx # Overlay khi quét thuốc
│   ├── BannerSlider.jsx # Slider banner tự động
│   ├── CategoryGrid.jsx # Grid danh mục thuốc
│   ├── HealthInfoCards.jsx # Cards thông tin sức khỏe
│   ├── tabs/           # Các tab components
│   │   ├── HomeTab.jsx
│   │   ├── SearchTab.jsx
│   │   ├── FavoritesTab.jsx
│   │   └── ProfileTab.jsx
│   └── modals/         # Modal components
│       └── ScanResultModal.jsx
├── data/               # Data và constants
│   ├── banners.js      # Dữ liệu banners
│   ├── categories.js   # Danh mục thuốc
│   └── healthInfos.js  # Thông tin sức khỏe
├── hooks/              # Custom React hooks
│   └── useBannerAutoScroll.js
├── styles/             # CSS và animations
│   └── animations.css
└── App.jsx             # Component chính
```

## 🎯 Lợi ích của cấu trúc này

1. **Separation of Concerns**: Mỗi component có trách nhiệm riêng
2. **Reusability**: Components có thể tái sử dụng
3. **Maintainability**: Dễ bảo trì và mở rộng
4. **Testability**: Dễ test từng component riêng lẻ
5. **Readability**: Code dễ đọc và hiểu hơn

## 📝 Cách sử dụng

Import component chính:
```jsx
import App from './App';
```

Hoặc import các component riêng lẻ:
```jsx
import Header from './components/Header';
import HomeTab from './components/tabs/HomeTab';
```

## 🔄 Các bước tiếp theo

1. Tạo file `index.js` để export tất cả components (optional)
2. Thêm PropTypes hoặc TypeScript cho type safety
3. Tạo context/store cho state management (nếu cần)
4. Thêm unit tests cho các components

