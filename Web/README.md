# MediScan AI - Hướng dẫn chạy ứng dụng

## 📋 Yêu cầu

- Node.js >= 16.x
- npm hoặc yarn hoặc pnpm

## 🚀 Cách chạy

### 1. Cài đặt dependencies

```bash
cd Web
npm install
```

hoặc

```bash
cd Web
yarn install
```

hoặc

```bash
cd Web
pnpm install
```

### 2. Chạy development server

```bash
npm run dev
```

hoặc

```bash
yarn dev
```

hoặc

```bash
pnpm dev
```

Ứng dụng sẽ tự động mở tại: **http://localhost:3000**

### 3. Build cho production

```bash
npm run build
```

File build sẽ được tạo trong thư mục `dist/`

### 4. Preview production build

```bash
npm run preview
```

## 📁 Cấu trúc dự án

```
Web/
├── src/
│   ├── components/     # React components
│   ├── data/           # Data và constants
│   ├── hooks/          # Custom hooks
│   ├── styles/         # CSS files
│   ├── App.jsx         # Component chính
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite config
├── tailwind.config.js  # Tailwind CSS config
└── postcss.config.js   # PostCSS config
```

## 🛠️ Công nghệ sử dụng

- **React 18** - UI framework
- **Vite** - Build tool (nhanh hơn Create React App)
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## 📝 Scripts có sẵn

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run preview` - Preview production build

## ⚠️ Lưu ý

- Đảm bảo đã cài đặt Node.js trước khi chạy
- Port mặc định là 3000, nếu bị chiếm sẽ tự động chuyển sang port khác
- Hot reload tự động khi thay đổi code

