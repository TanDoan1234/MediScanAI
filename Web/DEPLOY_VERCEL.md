# 🚀 Hướng Dẫn Deploy Frontend Lên Vercel

## Cách 1: Deploy qua Vercel CLI (Khuyến nghị)

### Bước 1: Cài đặt Vercel CLI

```bash
npm install -g vercel
```

Hoặc sử dụng npx (không cần cài đặt):
```bash
npx vercel
```

### Bước 2: Đăng nhập Vercel

```bash
vercel login
```

### Bước 3: Deploy

Di chuyển vào thư mục Web:
```bash
cd Web
```

Chạy lệnh deploy:
```bash
vercel
```

Lần đầu tiên, Vercel sẽ hỏi:
- **Set up and deploy?** → Chọn `Y`
- **Which scope?** → Chọn account của bạn
- **Link to existing project?** → Chọn `N` (tạo project mới)
- **What's your project's name?** → Nhập tên project (ví dụ: `mediscan-ai-web`)
- **In which directory is your code located?** → Nhấn Enter (đã ở trong thư mục Web)
- **Override settings?** → Chọn `N`

### Bước 4: Deploy Production

Sau khi deploy preview thành công, deploy lên production:
```bash
vercel --prod
```

---

## Cách 2: Deploy qua GitHub (Tự động)

### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Bước 2: Kết nối với Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub
3. Click **"Add New Project"**
4. Chọn repository của bạn
5. Cấu hình:
   - **Framework Preset:** Vite
   - **Root Directory:** `Web` (nếu repo ở root, hoặc để trống nếu repo chỉ có Web)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Bước 3: Environment Variables (Nếu cần)

Nếu cần biến môi trường, thêm vào Vercel:
- Settings → Environment Variables
- Thêm các biến cần thiết

### Bước 4: Deploy

Click **"Deploy"** và đợi build xong.

---

## Cách 3: Deploy qua Vercel Dashboard

1. Truy cập [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Chọn **"Import Git Repository"** hoặc **"Upload"**
4. Nếu upload:
   - Kéo thả thư mục `Web` vào
   - Hoặc zip thư mục `Web` và upload
5. Cấu hình tương tự như Cách 2
6. Click **"Deploy"**

---

## ⚙️ Cấu Hình Quan Trọng

### 1. File `vercel.json` (Đã tạo sẵn)

File này đã được tạo trong thư mục `Web/` với cấu hình cơ bản.

**Lưu ý:** Nếu backend cũng deploy lên Vercel, cần cập nhật `rewrites` trong `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.vercel.app/api/$1"
    }
  ]
}
```

### 2. API URL Configuration

File `src/utils/api.js` đã được cấu hình để:
- Development: `http://localhost:5000/api`
- Production: `/api` (relative path)

Nếu backend deploy ở domain khác, cần cập nhật:

```javascript
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    // Thay bằng URL backend thực tế
    return 'https://your-backend-url.vercel.app/api';
  }
  return 'http://localhost:5000/api';
};
```

Hoặc dùng Environment Variable:

```javascript
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || '/api';
  }
  return 'http://localhost:5000/api';
};
```

Sau đó thêm `VITE_API_URL` vào Vercel Environment Variables.

---

## 📝 Checklist Trước Khi Deploy

- [ ] Đảm bảo `npm run build` chạy thành công
- [ ] Kiểm tra file `dist/` được tạo sau khi build
- [ ] Kiểm tra API URL đã được cấu hình đúng
- [ ] Kiểm tra tất cả dependencies đã được cài đặt
- [ ] Test local với `npm run preview` để đảm bảo build hoạt động

---

## 🔧 Troubleshooting

### Lỗi: "Build failed"

**Nguyên nhân:** Có thể do:
- Dependencies chưa được cài đặt
- Lỗi trong code
- Cấu hình build sai

**Giải pháp:**
1. Chạy `npm run build` local để kiểm tra lỗi
2. Xem log build trong Vercel dashboard
3. Kiểm tra `package.json` có đầy đủ dependencies

### Lỗi: "API calls failed"

**Nguyên nhân:** API URL chưa được cấu hình đúng

**Giải pháp:**
1. Kiểm tra `src/utils/api.js`
2. Cập nhật URL backend trong Vercel Environment Variables
3. Kiểm tra CORS settings ở backend

### Lỗi: "404 on routes"

**Nguyên nhân:** Vercel cần cấu hình rewrite cho SPA

**Giải pháp:** Thêm vào `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🎯 Sau Khi Deploy

1. **Kiểm tra URL:** Vercel sẽ cung cấp URL dạng `https://your-project.vercel.app`
2. **Custom Domain:** Có thể thêm domain tùy chỉnh trong Settings
3. **Auto Deploy:** Mỗi khi push code lên GitHub, Vercel sẽ tự động deploy

---

## 📚 Tài Liệu Tham Khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel CLI](https://vercel.com/docs/cli)

---

**Lưu ý:** Nếu backend cũng cần deploy, có thể deploy backend lên Vercel Serverless Functions hoặc một platform khác (Railway, Render, etc.)

