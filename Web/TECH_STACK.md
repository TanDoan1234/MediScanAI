# 🛠️ Tech Stack - MediScan AI Web

## 📦 Core Framework & Libraries

### **Frontend Framework**
- **React 18.2.0** - UI framework chính
  - React Hooks (useState, useEffect, useRef)
  - Component-based architecture
  - JSX syntax

### **Build Tool**
- **Vite 5.0.8** - Build tool và dev server
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - ES modules support

### **Styling**
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
  - Responsive design
  - Custom animations
  - Dark mode ready

- **PostCSS 8.4.32** - CSS processing
- **Autoprefixer 10.4.16** - Auto vendor prefixes

### **Icons**
- **Lucide React 0.294.0** - Icon library
  - 1000+ icons
  - Tree-shakeable
  - TypeScript support

## 🏗️ Architecture

### **Project Structure**
```
Web/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── data/           # Static data
│   ├── styles/         # CSS files
│   └── App.jsx         # Main component
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # Tailwind configuration
```

### **Component Pattern**
- Functional Components
- Hooks-based state management
- Props drilling (có thể nâng cấp lên Context API hoặc Redux)

## 🎨 Styling Approach

### **Tailwind CSS Classes**
- Utility classes: `flex`, `grid`, `bg-*`, `text-*`
- Responsive: `md:`, `lg:`, `xl:`
- Custom animations trong `styles/animations.css`

### **CSS Features**
- Custom animations
- Gradient backgrounds
- Shadow effects
- Transitions

## 🔌 API Integration

### **HTTP Client**
- Native `fetch` API
- Dynamic API URL (dev/prod)
- JSON request/response

### **API Endpoints**
- `/api/health` - Health check
- `/api/scan` - Scan drug from image
- `/api/drugs/search` - Search drugs

## 📱 Features

### **Camera Integration**
- `getUserMedia` API
- Video stream handling
- Image capture from video
- Base64 encoding

### **State Management**
- React useState hooks
- Local component state
- Props passing

### **Routing**
- Client-side routing (có thể nâng cấp lên React Router)

## 🚀 Development

### **Scripts**
```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
```

### **Dev Server**
- Port: 3000
- Auto-open browser
- Hot reload enabled

## 📦 Dependencies Summary

### **Production Dependencies**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^0.294.0"
}
```

### **Development Dependencies**
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32",
  "tailwindcss": "^3.3.6",
  "vite": "^5.0.8"
}
```

## 🎯 Key Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | React | 18.2.0 | UI Library |
| Build Tool | Vite | 5.0.8 | Build & Dev Server |
| CSS | Tailwind CSS | 3.3.6 | Styling |
| Icons | Lucide React | 0.294.0 | Icons |
| CSS Processor | PostCSS | 8.4.32 | CSS Processing |
| Browser API | getUserMedia | - | Camera Access |
| HTTP | Fetch API | - | API Calls |

## 🔄 Modern JavaScript Features

- ES6+ Modules (`import/export`)
- Arrow Functions
- Destructuring
- Template Literals
- Async/Await
- Optional Chaining

## 📝 Code Style

- Functional Components
- JSX syntax
- Hooks pattern
- Component composition
- Props-based communication

## 🚀 Performance

- Vite's fast build times
- Code splitting (automatic)
- Tree shaking
- Optimized production builds
- Lazy loading ready

## 🔮 Potential Upgrades

Có thể nâng cấp thêm:
- **React Router** - Client-side routing
- **Context API / Redux** - Global state management
- **React Query** - Server state management
- **TypeScript** - Type safety
- **React Testing Library** - Unit testing
- **PWA** - Progressive Web App features

