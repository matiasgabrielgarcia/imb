# 🚀 SUPABASE SETUP - QUICK START (15 minutes)

Follow these steps IN ORDER to set up your Supabase database.

---

## ✅ CHECKLIST

- [ ] **Step 1**: Create Supabase account
- [ ] **Step 2**: Create new project
- [ ] **Step 3**: Run SQL migration
- [ ] **Step 4**: Create storage bucket
- [ ] **Step 5**: Get connection strings
- [ ] **Step 6**: Test locally

---

## 🔥 STEP 1: Create Supabase Account (2 min)

1. Go to: **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with **GitHub** (fastest) or email
4. Verify your email if needed

✅ **Done? Move to Step 2**

---

## 🔥 STEP 2: Create New Project (3 min)

1. Click **"New project"**
2. Fill in:
   - **Name**: `imb-property-management`
   - **Database Password**: Click generate → **⚠️ SAVE THIS PASSWORD!**
   - **Region**: Select closest to you (e.g., `South America (São Paulo)`)
   - **Pricing Plan**: **Free**

3. Click **"Create new project"**
4. ⏳ Wait ~2 minutes for setup

✅ **Done? Move to Step 3**

---

## 🔥 STEP 3: Run Database Migration (3 min)

1. In your project, click **"SQL Editor"** (left menu)
2. Click **"+ New query"**
3. Open file: `supabase-setup/01-complete-schema.sql` in your computer
4. **Copy ALL content** from that file
5. **Paste** into Supabase SQL Editor
6. Click **"Run"** button (bottom right)
7. ✅ Should see: **"Success. No rows returned"**

### 🧪 Verify it worked:

1. Click **"Table Editor"** (left menu)
2. You should see tables like:
   - users
   - properties
   - property_images
   - sales
   - rentals
   - opportunities
   - whatsapp_messages

✅ **Done? Move to Step 4**

---

## 🔥 STEP 4: Create Storage Bucket (2 min)

### 4.1 Create Bucket

1. Click **"Storage"** (left menu)
2. Click **"Create a new bucket"**
3. Settings:
   - **Name**: `property-images` (exactly this!)
   - **Public bucket**: ✅ **CHECK THIS BOX**
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Click **"Create bucket"**

### 4.2 Set Policies (Important!)

1. In **SQL Editor**, click **"+ New query"**
2. Open file: `supabase-setup/02-storage-helper.sql`
3. **Copy ALL content**
4. **Paste** into SQL Editor
5. Click **"Run"**
6. ✅ Should see: **"Success"**

✅ **Done? Move to Step 5**

---

## 🔥 STEP 5: Get Connection Strings (3 min)

### 5.1 Get Database Connection

1. Click **"Project Settings"** (⚙️ gear icon, bottom left)
2. Click **"Database"** (left submenu)
3. Scroll to **"Connection string"**
4. Select **"URI"** tab
5. Copy the string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **⚠️ Important**: Replace `[YOUR-PASSWORD]` with your actual password from Step 2

### 5.2 Get API Keys

1. Still in **"Project Settings"**
2. Click **"API"** (left submenu)
3. Copy these three values:

   **a) Project URL:**
   ```
   https://xxxxx.supabase.co
   ```

   **b) anon public key:**
   ```
   eyJhbGc... (long string)
   ```

   **c) service_role key:**
   ```
   eyJhbGc... (different long string)
   ```

### 5.3 Create Environment Files

**For Backend (`back/.env`):**

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_from_step_2

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

JWT_SECRET=any_random_long_string_32_chars_min

PORT=3001
NODE_ENV=development
```

**For WhatsApp Service (`wapp/.env`):**

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_from_step_2

PORT=3002
NODE_ENV=development
WEBHOOK_VERIFY_TOKEN=any_random_string
```

✅ **Done? Move to Step 6**

---

## 🔥 STEP 6: Test Connection (2 min)

### 6.1 Install Dependencies (if not already done)

```bash
cd back
npm install pg
```

### 6.2 Run Test Script

```bash
cd supabase-setup
node 03-test-connection.js
```

### ✅ Expected Output:

```
✅ Database connection successful!

📊 PostgreSQL Version:
  PostgreSQL 15.x

📋 Tables found in database:
  ✓ users
  ✓ properties
  ✓ property_images
  ...

🎉 SUCCESS! All required tables exist.
✅ Your Supabase database is ready to use!
```

### ❌ If it fails:

1. Check your `.env` file has correct values
2. Verify password is correct (no spaces, exact copy)
3. Make sure you ran the SQL migration (Step 3)

✅ **Done? You're ready!**

---

## 🎉 SUCCESS! What's Next?

Your Supabase is now fully configured with:
- ✅ Database with all tables
- ✅ Storage bucket for property images
- ✅ Connection working locally

### 📋 Next Steps:

1. **Test your local apps** with Supabase
   ```bash
   cd back
   npm run dev
   ```

2. **Deploy to Railway** (Step 2 of deployment)
3. **Deploy to Vercel** (Step 3 of deployment)

---

## 📊 What You Got (Free Tier)

- ✅ 500 MB database (plenty for 30 users)
- ✅ 1 GB storage (for ~200-400 property images)
- ✅ 2 GB bandwidth/month
- ✅ Automatic backups (7 days)
- ✅ Global CDN for images (fast loading!)

---

## 🆘 Need Help?

- **Connection issues**: Check `README.md` troubleshooting section
- **Missing tables**: Re-run `01-complete-schema.sql`
- **Storage not working**: Re-run `02-storage-helper.sql`
- **Supabase docs**: https://supabase.com/docs

---

## 💾 Save These Values!

Create a secure note with:
- ✅ Database password
- ✅ Supabase project URL
- ✅ API keys (anon & service_role)
- ✅ Project name

You'll need these for Railway/Vercel deployment!

---

**⏱️ Total time: ~15 minutes**

Ready to deploy? Let's move to **Step 2: Railway Setup!** 🚀

