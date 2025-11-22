# ✅ DEPLOYMENT CHECKLIST

Quick checklist to track your deployment progress.

---

## 📋 PRE-DEPLOYMENT

- [ ] Supabase project created and active
- [ ] Database migration completed (all tables exist)
- [ ] Storage bucket `property-images` created
- [ ] Supabase API keys saved securely
- [ ] Database password saved securely
- [ ] GitHub repository ready (or create one)

---

## 🚂 RAILWAY - Backend Deployment

- [ ] Railway account created
- [ ] New project created from GitHub repo
- [ ] Backend service configured (`back` folder)
- [ ] Environment variables added:
  - [ ] `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - [ ] `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `PORT=3001`, `NODE_ENV=production`
  - [ ] `CORS_ORIGIN` (update after frontend deployment)
  - [ ] Storage configuration variables
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Domain generated
- [ ] Backend URL saved: `https://________________.railway.app`
- [ ] Health check passed: `curl https://your-backend-url/health`

---

## 🚂 RAILWAY - WhatsApp Service Deployment

- [ ] New service added to Railway project
- [ ] WhatsApp service configured (`wapp` folder)
- [ ] Environment variables added:
  - [ ] Database connection variables
  - [ ] `SUPABASE_URL`, `SUPABASE_SECRET_KEY`
  - [ ] `WEBHOOK_VERIFY_TOKEN` (secure random string)
  - [ ] `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
  - [ ] `PORT=3005`, `NODE_ENV=production`
  - [ ] `CORS_ORIGIN` (update after frontend deployment)
- [ ] Start command: `node server.js`
- [ ] Domain generated
- [ ] WhatsApp service URL saved: `https://________________.railway.app`

---

## ▲ VERCEL - Frontend Deployment

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Framework: Vite
- [ ] Root directory: `front`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added:
  - [ ] `VITE_API_URL=https://your-backend-url.railway.app/api`
  - [ ] `VITE_WHATSAPP_SERVICE_URL=https://your-wapp-url.railway.app`
- [ ] Deployment successful
- [ ] Frontend URL saved: `https://________________.vercel.app`
- [ ] Updated `CORS_ORIGIN` in Railway backend

---

## 📱 WHATSAPP WEBHOOK CONFIGURATION

- [ ] Meta Developer Console accessed
- [ ] WhatsApp Business app selected
- [ ] Webhook URL configured: `https://your-wapp-url.railway.app/webhook`
- [ ] Verify token matches Railway `WEBHOOK_VERIFY_TOKEN`
- [ ] Webhook verified and saved
- [ ] Test message sent and received

---

## 🧪 TESTING

- [ ] Backend health check: ✅
- [ ] Frontend loads: ✅
- [ ] Login works: ✅
- [ ] API calls work: ✅
- [ ] Property CRUD operations work: ✅
- [ ] WhatsApp messages received: ✅
- [ ] Notifications appear in frontend: ✅

---

## 📝 POST-DEPLOYMENT

- [ ] All URLs documented
- [ ] Environment variables backed up securely
- [ ] Team members have access (if applicable)
- [ ] Monitoring set up (optional)
- [ ] Custom domain configured (optional)

---

## 🎉 DEPLOYMENT COMPLETE!

**Frontend:** `https://________________.vercel.app`  
**Backend:** `https://________________.railway.app`  
**WhatsApp:** `https://________________.railway.app`  
**Database:** Supabase Dashboard

---

**Date Completed:** _______________  
**Deployed By:** _______________

