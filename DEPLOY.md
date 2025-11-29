# Hướng dẫn Deploy lên Vercel

## 📋 Yêu cầu

- Tài khoản Vercel (miễn phí tại [vercel.com](https://vercel.com))
- Git repository (GitHub, GitLab, hoặc Bitbucket)
- Dự án đã được push lên Git

## 🚀 Cách Deploy

### Phương pháp 1: Deploy qua Vercel Dashboard (Khuyến nghị)

1. **Đăng nhập Vercel**
   - Truy cập [vercel.com](https://vercel.com)
   - Đăng nhập bằng GitHub/GitLab/Bitbucket

2. **Import Project**
   - Click "Add New..." → "Project"
   - Chọn repository của bạn
   - Vercel sẽ tự động detect cấu hình

3. **Cấu hình Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root của project)
   - **Build Command**: `cd Web && npm install && npm run build`
   - **Output Directory**: `Web/dist`
   - **Install Command**: `cd Web && npm install`

4. **Environment Variables** (nếu cần)
   - Không cần thiết cho setup hiện tại

5. **Deploy**
   - Click "Deploy"
   - Chờ quá trình build hoàn tất
   - Ứng dụng sẽ được deploy tại URL: `https://your-project.vercel.app`

### Phương pháp 2: Deploy qua Vercel CLI

1. **Cài đặt Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy Production**
   ```bash
   vercel --prod
   ```

## 📁 Cấu trúc Files cho Vercel

```
MediScanAI/
├── api/                    # Vercel serverless functions
│   ├── health.py
│   ├── scan.py
│   ├── drugs/
│   │   └── search.py
│   └── utils.py
├── Web/                    # Frontend React app
│   ├── src/
│   ├── dist/              # Build output
│   └── package.json
├── Crawldata/             # Drug database
│   └── drug_index.csv
├── vercel.json           # Vercel configuration
├── requirements.txt       # Python dependencies
└── package.json          # (optional)
```

## ⚙️ Cấu hình Vercel

File `vercel.json` đã được cấu hình với:
- Frontend build từ `Web/`
- API routes từ `api/`
- Rewrites để route đúng paths

## 🔍 Kiểm tra sau khi Deploy

1. **Frontend**: Truy cập URL chính
2. **API Health**: `https://your-project.vercel.app/api/health`
3. **API Scan**: `https://your-project.vercel.app/api/scan` (POST)
4. **API Search**: `https://your-project.vercel.app/api/drugs/search?q=panadol`

## 🐛 Xử lý lỗi thường gặp

### Lỗi: "Module not found"
- Đảm bảo `requirements.txt` có đầy đủ dependencies
- Kiểm tra imports trong `api/utils.py`

### Lỗi: "Database not found"
- Đảm bảo file `Crawldata/drug_index.csv` được commit vào Git
- Kiểm tra đường dẫn trong `api/utils.py`

### Lỗi: Build failed
- Kiểm tra Node.js version (>= 16)
- Kiểm tra Python version (>= 3.8)
- Xem build logs trong Vercel dashboard

### Lỗi: CORS
- API đã được cấu hình CORS headers
- Nếu vẫn lỗi, kiểm tra browser console

## 📝 Lưu ý

1. **File Size Limits**:
   - Vercel có giới hạn 50MB cho serverless functions
   - File `drug_index.csv` nên < 50MB

2. **Cold Start**:
   - Serverless functions có thể mất vài giây khi cold start
   - Database được cache sau lần load đầu tiên

3. **Environment Variables**:
   - Có thể thêm trong Vercel dashboard → Settings → Environment Variables

4. **Custom Domain**:
   - Vercel cho phép thêm custom domain miễn phí
   - Settings → Domains

## 🔄 Update sau khi Deploy

Mỗi khi push code lên Git, Vercel sẽ tự động:
1. Detect changes
2. Build lại project
3. Deploy version mới

Hoặc có thể trigger manual deploy từ Vercel dashboard.

## 📊 Monitoring

- Xem logs: Vercel Dashboard → Deployments → [Deployment] → Functions
- Xem analytics: Vercel Dashboard → Analytics
- Xem errors: Vercel Dashboard → Logs

## 🎉 Hoàn thành!

Sau khi deploy thành công, ứng dụng sẽ có:
- ✅ Frontend tại: `https://your-project.vercel.app`
- ✅ API tại: `https://your-project.vercel.app/api/*`
- ✅ HTTPS tự động
- ✅ CDN global
- ✅ Auto-scaling

