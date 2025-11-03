# 🚀 Image Storage - Quick Start

## ⚡ 3-Minute Setup

### 1️⃣ Run Migration
```bash
cd /Users/matias/Documents/projects/imb/back
./scripts/run-migration-003.sh
```

### 2️⃣ Create Upload Folder
```bash
mkdir -p /Users/matias/Documents/projects/imb/back/uploads/properties
```

### 3️⃣ Restart Backend
```bash
npm run dev
```

### 4️⃣ Done! 🎉
Open any property → Click "Imágenes" tab → Upload!

---

## 📖 Full Documentation

- **Setup Guide**: `IMAGE_STORAGE_SETUP.md`
- **Summary**: `SUMMARY.md`

---

## 🔄 Switch to Cloud Storage (5 min)

```bash
# 1. Install
npm install @aws-sdk/client-s3

# 2. Add to .env
STORAGE_PROVIDER=r2
R2_BUCKET_NAME=your-bucket
# ... (see IMAGE_STORAGE_SETUP.md for full config)

# 3. Uncomment R2 code in:
# back/src/services/storageService.ts

# 4. Restart
npm run dev
```

Done! All new images go to cloud. 🌩️

---

## 💡 What You Got

✅ Upload multiple images per property  
✅ Automatic thumbnails  
✅ Set primary image  
✅ Delete images  
✅ Works with ANY storage provider  
✅ Switch providers in 5 minutes  

---

## 📁 Key Files

```
back/src/services/storageService.ts  ← Change provider here
back/src/routes/images.ts            ← API endpoints
front/src/components/PropertyImageUpload.tsx  ← UI
```

---

**Questions?** See `IMAGE_STORAGE_SETUP.md` → Troubleshooting section

