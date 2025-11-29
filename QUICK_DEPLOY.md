# 🚀 Quick Deploy Guide - Vercel

## Bước 1: Chuẩn bị

Đảm bảo code đã được commit và push lên Git:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

## Bước 2: Deploy qua Vercel Dashboard

1. Truy cập [vercel.com](https://vercel.com) và đăng nhập
2. Click **"Add New..."** → **"Project"**
3. Import repository của bạn
4. Vercel sẽ tự động detect:
   - ✅ Framework: Vite
   - ✅ Build Command: `cd Web && npm install && npm run build`
   - ✅ Output Directory: `Web/dist`

5. **KHÔNG CẦN** thay đổi gì, click **"Deploy"**

## Bước 3: Kiểm tra

Sau khi deploy xong, kiểm tra:
- Frontend: `https://your-project.vercel.app`
- API Health: `https://your-project.vercel.app/api/health`
- API Scan: `https://your-project.vercel.app/api/scan` (POST)

## ⚠️ Lưu ý quan trọng

1. **File CSV phải được commit**: Đảm bảo `Crawldata/drug_index.csv` đã được commit vào Git
2. **Python dependencies**: Vercel sẽ tự động install từ `requirements.txt`
3. **Build time**: Lần đầu build có thể mất 3-5 phút

## 🐛 Nếu gặp lỗi

### Lỗi: "Cannot find module"
- Kiểm tra `requirements.txt` có đầy đủ packages
- Xem logs trong Vercel dashboard

### Lỗi: "Database not found"
- Đảm bảo `Crawldata/drug_index.csv` đã được commit
- Kiểm tra file size < 50MB

### Lỗi: Build failed
- Kiểm tra Node.js version (cần >= 16)
- Xem build logs để biết lỗi cụ thể

## ✅ Hoàn thành!

Sau khi deploy thành công, bạn sẽ có:
- 🌐 URL production: `https://your-project.vercel.app`
- 🔒 HTTPS tự động
- 🌍 CDN global
- 🔄 Auto-deploy khi push code mới

---

**Chi tiết hơn**: Xem file `DEPLOY.md`

