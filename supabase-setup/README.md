# Supabase Setup Guide - Step by Step

This guide will walk you through setting up Supabase for the IMB Property Management System.

## ✅ What You'll Set Up

1. **PostgreSQL Database** - All your tables and data
2. **Storage Bucket** - For property images (fast CDN delivery)
3. **Connection Strings** - For your backend services

---

## 📋 Step 1: Create Supabase Account & Project

### 1.1 Sign up for Supabase

1. Go to: **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email

### 1.2 Create a New Project

1. Click **"New project"**
2. Fill in the details:
   - **Name**: `imb-property-management` (or any name you prefer)
   - **Database Password**: Generate a strong password **⚠️ SAVE THIS!**
   - **Region**: Choose closest to your location (e.g., `South America (São Paulo)`)
   - **Pricing Plan**: Select **Free** tier

3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes for setup to complete

---

## 📋 Step 2: Run Database Migration

### 2.1 Open SQL Editor

1. In your Supabase project dashboard, click **"SQL Editor"** in the left menu
2. Click **"New query"**

### 2.2 Run the Schema

1. Open the file: `supabase-setup/01-complete-schema.sql`
2. Copy **ALL** the SQL content
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. ✅ You should see: "Success. No rows returned"

### 2.3 Verify Tables Were Created

1. Click **"Table Editor"** in the left menu
2. You should see all these tables:
   - users
   - properties
   - property_images
   - sales
   - rentals
   - opportunities
   - whatsapp_messages
   - (and more...)

---

## 📋 Step 3: Set Up Storage Bucket for Images

### 3.1 Create Storage Bucket

1. Click **"Storage"** in the left menu
2. Click **"Create a new bucket"**
3. Settings:
   - **Name**: `property-images`
   - **Public bucket**: ✅ **Check this** (for fast public access)
   - **File size limit**: 5 MB (you can adjust later)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Click **"Create bucket"**

### 3.2 Configure Bucket Policies

1. Click on your `property-images` bucket
2. Click **"Policies"** tab
3. Click **"New policy"**
4. Select **"Custom policy"**
5. Paste this policy:

```sql
-- Allow public READ access (anyone can view images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property-images' );

-- Allow authenticated users to UPLOAD
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to DELETE
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);
```

6. Click **"Review"** → **"Save policy"**

---

## 📋 Step 4: Get Your Connection Strings

### 4.1 Get Database Connection String

1. Click **"Project Settings"** (gear icon in left menu)
2. Click **"Database"** in the left submenu
3. Scroll down to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. ⚠️ **Replace `[YOUR-PASSWORD]`** with the password you created in Step 1.2

### 4.2 Get API Keys

1. Still in **"Project Settings"**
2. Click **"API"** in the left submenu
3. You'll need these two:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (another long string - ⚠️ keep secret!)

---

## 📋 Step 5: Create Environment Files

### 5.1 Backend Environment File

Create/update: `back/.env`

```env
# Database
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password_here
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_here

# Server
PORT=3001
```

### 5.2 WhatsApp Service Environment File

Create/update: `wapp/.env`

```env
# Database
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password_here
NODE_ENV=production

# WhatsApp Webhook
WEBHOOK_VERIFY_TOKEN=your_verify_token_here

# Server
PORT=3002
```

---

## 📋 Step 6: Test Connection Locally

### 6.1 Test Backend Connection

```bash
cd back
npm install
npm run dev
```

You should see:
```
✓ Connected to PostgreSQL database
Server running on port 3001
```

### 6.2 Test WhatsApp Service Connection

```bash
cd wapp
npm install
npm run dev
```

You should see:
```
✓ Database connected successfully
Server running on port 3002
```

---

## ✅ Setup Complete!

Your Supabase is now ready with:
- ✅ Database with all tables
- ✅ Storage bucket for images
- ✅ Connection strings for backend services
- ✅ Local testing confirmed

---

## 🔥 Next Steps

Now you're ready for:
- **Step 2**: Deploy Backend API to Railway
- **Step 3**: Deploy WhatsApp Service to Railway
- **Step 4**: Deploy Public Site to Vercel
- **Step 5**: Deploy Backoffice to Vercel

---

## 🆘 Troubleshooting

### Connection Refused Error
- Check your database password is correct
- Verify SSL is enabled: `ssl: { rejectUnauthorized: false }`

### Storage Upload Fails
- Verify bucket is public
- Check bucket policies are created
- Confirm bucket name is `property-images`

### Tables Not Showing
- Re-run the SQL script in SQL Editor
- Check for any error messages in the SQL output

---

## 📊 Supabase Free Tier Limits

- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ 7-day database backups

This is **more than enough** for 1-30 users!

---

Need help? Check the Supabase documentation: https://supabase.com/docs

