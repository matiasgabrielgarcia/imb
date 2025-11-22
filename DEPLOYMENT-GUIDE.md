# 🚀 DEPLOYMENT GUIDE - Railway & Vercel

Complete guide to deploy your IMB Property Management System to production.

---

## ✅ PREREQUISITES

Before starting, make sure you have:
- [x] ✅ Completed Supabase setup (Steps 1-6 from `supabase-setup/QUICK-START.md`)
- [x] ✅ Supabase project URL and API keys saved
- [x] ✅ Database password saved securely
- [x] ✅ GitHub account (for connecting repositories)

---

## 📋 DEPLOYMENT OVERVIEW

You'll deploy **3 services**:

1. **Backend API** → Railway (Node.js backend)
2. **WhatsApp Service** → Railway (WhatsApp webhook handler)
3. **Frontend** → Vercel (React app)

**Estimated time:** 30-45 minutes

---

## 🔥 STEP 1: Deploy Backend to Railway (15 min)

### 1.1 Create Railway Account

1. Go to: **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)
4. Authorize Railway to access your repositories

### 1.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (or create one if needed)
4. Select the **`back`** folder as the root directory

### 1.3 Configure Environment Variables

1. In your Railway project, click **"Variables"** tab
2. Add these environment variables (from your `back/.env-host.txt`):

```env
# Database Connection (Supabase)
DB_HOST=db.oqcmadftugczunnabjox.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE

# Supabase API
SUPABASE_URL=https://oqcmadftugczunnabjox.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_vWx16_p9OxwKPo1X1ehKww_rVJsJbp9
SUPABASE_SECRET_KEY=sb_secret_WQLDl32DvQxAPKQlsLapjw_wBVzao-l

# JWT Secret
JWT_SECRET=imb_jwt_secret_key_2025_minimum_32_characters_long

# Server Config
PORT=3001
NODE_ENV=production

# CORS Origins (update after frontend deployment)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Storage Configuration
STORAGE_PROVIDER=supabase
STORAGE_BASE_URL=https://oqcmadftugczunnabjox.supabase.co/storage/v1
STORAGE_BUCKET=property-images
MAX_FILE_SIZE=5242880
```

**⚠️ Important:**
- Replace `YOUR_DATABASE_PASSWORD_HERE` with your actual Supabase database password
- Update `CORS_ORIGIN` after deploying frontend (Step 3)

### 1.4 Configure Build Settings

1. Click **"Settings"** tab
2. Under **"Build Command"**, set:
   ```
   npm install && npm run build
   ```
3. Under **"Start Command"**, set:
   ```
   npm start
   ```
4. Under **"Root Directory"**, ensure it's set to: `back`

### 1.5 Deploy

1. Railway will automatically detect your project
2. Click **"Deploy"** or wait for auto-deployment
3. ⏳ Wait 2-3 minutes for build and deployment

### 1.6 Get Backend URL

1. After deployment, click **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://back-production-xxxx.up.railway.app`)
5. **Save this URL** - you'll need it for frontend configuration

✅ **Backend deployed!** Test it:
```bash
curl https://your-backend-url.railway.app/health
```

---

## 🔥 STEP 2: Deploy WhatsApp Service to Railway (10 min)

### 2.1 Create New Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** (same repository)
3. Select the **`wapp`** folder as root directory

### 2.2 Configure Environment Variables

Add these variables (from `wapp/.env-host.txt`):

```env
# Database Connection (Supabase)
DB_HOST=db.oqcmadftugczunnabjox.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE

# Supabase API
SUPABASE_URL=https://oqcmadftugczunnabjox.supabase.co
SUPABASE_SECRET_KEY=sb_secret_WQLDl32DvQxAPKQlsLapjw_wBVzao-l

# WhatsApp Business API
WEBHOOK_VERIFY_TOKEN=your_hosting_verify_token_secure_random_string
WHATSAPP_TOKEN=your_whatsapp_business_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# Server Config
PORT=3005
NODE_ENV=production

# CORS Origins
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# JWT (if needed)
JWT_SECRET=imb_jwt_secret_key_2025_minimum_32_characters_long
```

**⚠️ Important:**
- Replace `YOUR_DATABASE_PASSWORD_HERE` with your actual password
- Set `WEBHOOK_VERIFY_TOKEN` to a secure random string
- Add your WhatsApp Business API credentials

### 2.3 Configure Build Settings

1. **Build Command:** (leave empty or `npm install`)
2. **Start Command:** `node server.js`
3. **Root Directory:** `wapp`

### 2.4 Deploy & Get URL

1. Railway will auto-deploy
2. Generate a domain in **Settings → Domains**
3. Copy the URL (e.g., `https://wapp-production-xxxx.up.railway.app`)
4. **Save this URL** - you'll need it for WhatsApp webhook configuration

✅ **WhatsApp service deployed!**

---

## 🔥 STEP 3: Deploy Frontend to Vercel (15 min)

### 3.1 Create Vercel Account

1. Go to: **https://vercel.com**
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended)
4. Authorize Vercel to access your repositories

### 3.2 Import Project

1. Click **"Add New Project"**
2. Select your GitHub repository
3. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `front`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.3 Configure Environment Variables

Click **"Environment Variables"** and add:

```env
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_WHATSAPP_SERVICE_URL=https://your-wapp-url.railway.app
```

**⚠️ Replace with your actual Railway URLs from Steps 1 & 2**

### 3.4 Deploy

1. Click **"Deploy"**
2. ⏳ Wait 2-3 minutes for build
3. Vercel will provide a URL (e.g., `https://imb-frontend.vercel.app`)

### 3.5 Update CORS in Backend

1. Go back to Railway → Backend service
2. Click **"Variables"** tab
3. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://imb-frontend.vercel.app
   ```
4. Railway will automatically redeploy

✅ **Frontend deployed!**

---

## 🔥 STEP 4: Configure WhatsApp Webhook (5 min)

### 4.1 Get Webhook URL

Your WhatsApp webhook URL is:
```
https://your-wapp-url.railway.app/webhook
```

### 4.2 Configure in Meta Developer Console

1. Go to: **https://developers.facebook.com**
2. Select your WhatsApp Business app
3. Go to **"Configuration" → "Webhooks"**
4. Click **"Edit"** on your webhook
5. Set **Callback URL:** `https://your-wapp-url.railway.app/webhook`
6. Set **Verify Token:** (same as `WEBHOOK_VERIFY_TOKEN` in Railway)
7. Click **"Verify and Save"**

✅ **WhatsApp webhook configured!**

---

## 🔥 STEP 5: Test Everything (5 min)

### 5.1 Test Backend

```bash
curl https://your-backend-url.railway.app/health
```

Expected: `{"status":"ok"}`

### 5.2 Test Frontend

1. Visit: `https://your-frontend-url.vercel.app`
2. Try logging in
3. Check if API calls work

### 5.3 Test WhatsApp Service

1. Send a test message to your WhatsApp Business number
2. Check if it appears in the frontend notifications

---

## 🎉 SUCCESS! Your App is Live!

### 📊 What You've Deployed:

- ✅ **Backend API** → Railway (handles all API requests)
- ✅ **WhatsApp Service** → Railway (processes WhatsApp messages)
- ✅ **Frontend** → Vercel (React app)
- ✅ **Database** → Supabase (PostgreSQL)
- ✅ **Storage** → Supabase Storage (property images)

### 🔗 Your URLs:

- **Frontend:** `https://your-frontend-url.vercel.app`
- **Backend:** `https://your-backend-url.railway.app`
- **WhatsApp:** `https://your-wapp-url.railway.app`
- **Database:** Supabase Dashboard

---

## 🔧 OPTIONAL: Custom Domain Setup

### For Vercel (Frontend):

1. In Vercel project, go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `CORS_ORIGIN` in Railway backend

### For Railway (Backend/WhatsApp):

1. In Railway service, go to **Settings → Domains**
2. Add custom domain
3. Configure DNS records
4. Update frontend environment variables

---

## 📊 MONITORING & LOGS

### Railway Logs:

1. Go to Railway dashboard
2. Click on your service
3. View **"Deployments"** tab for logs
4. Click **"View Logs"** for real-time logs

### Vercel Logs:

1. Go to Vercel dashboard
2. Click on your project
3. View **"Deployments"** tab
4. Click on a deployment to see logs

---

## 🆘 TROUBLESHOOTING

### Backend not connecting to database:

- ✅ Check `DB_PASSWORD` is correct in Railway
- ✅ Verify Supabase project is active
- ✅ Check Railway logs for connection errors

### CORS errors:

- ✅ Update `CORS_ORIGIN` in Railway backend with exact frontend URL
- ✅ Include protocol (`https://`)
- ✅ No trailing slash

### Frontend can't reach backend:

- ✅ Check `VITE_API_URL` in Vercel environment variables
- ✅ Verify backend URL is correct
- ✅ Test backend health endpoint directly

### WhatsApp webhook not working:

- ✅ Verify webhook URL is accessible
- ✅ Check `WEBHOOK_VERIFY_TOKEN` matches Meta console
- ✅ View Railway logs for webhook requests

---

## 💰 COST ESTIMATE (Free Tier)

### Railway (Free Tier):
- ✅ $5/month credit (usually enough for 2 services)
- ✅ 500 hours/month compute time
- ✅ 100 GB bandwidth/month

### Vercel (Free Tier):
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL certificates

### Supabase (Free Tier):
- ✅ 500 MB database
- ✅ 1 GB storage
- ✅ 2 GB bandwidth/month

**Total: $0/month** (if within free tier limits)

---

## 📝 NEXT STEPS

1. **Set up monitoring** (optional):
   - Add error tracking (Sentry)
   - Set up uptime monitoring (UptimeRobot)

2. **Configure backups**:
   - Supabase has automatic backups (7 days)
   - Consider exporting database periodically

3. **Set up CI/CD**:
   - Railway and Vercel auto-deploy on git push
   - Configure branch protection

4. **Security hardening**:
   - Review environment variables
   - Enable rate limiting
   - Set up firewall rules if needed

---

**🎉 Congratulations! Your IMB Property Management System is now live in production!**

