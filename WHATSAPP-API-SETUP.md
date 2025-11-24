# 📱 WhatsApp Business API Setup Guide

Complete guide to get WhatsApp Business API credentials for your phone number: **+54 9 249 420 6835**

---

## ⚠️ CRITICAL WARNING: WhatsApp Web vs API

**You CANNOT use the same phone number for both WhatsApp Web AND the API simultaneously.**

When you connect your number to the WhatsApp Business API:
- ❌ **WhatsApp Web will stop working** (browser)
- ❌ **WhatsApp Business mobile app will disconnect**
- ✅ **Only the API will work** (webhooks, sending messages via API)

**This is a WhatsApp limitation - one number can only have one active connection.**

### 💡 Solutions:
1. **Use API only** - Build a chat interface in your app (I can help!)
2. **Use two numbers** - Keep one for WhatsApp Web, one for API
3. **Use API for everything** - Send/receive via API, build chat UI

**👉 See `WHATSAPP-API-VS-WEB.md` for detailed solutions and recommendations.**

---

## ⚠️ IMPORTANT: Two WhatsApp Business Options

There are **two ways** to use WhatsApp Business:

### Option 1: WhatsApp Business API (Cloud API) - **RECOMMENDED** ✅
- **Free tier:** 1,000 conversations/month
- **Official Meta API** (what we'll set up)
- Requires Meta Business account
- Best for production apps

### Option 2: WhatsApp Business App (Mobile App)
- The app you have installed on your phone
- **Cannot** be used for API/webhooks
- Only for personal/small business use

**We need Option 1** - the Cloud API, not the mobile app.

---

## 📋 PREREQUISITES

Before starting, make sure you have:
- [ ] Facebook/Meta account (personal account is OK)
- [ ] Phone number: **+54 9 249 420 6835** (with WhatsApp Business app)
- [ ] Email address for Meta Business account
- [ ] Business name (can be your personal name)
- [ ] 15-30 minutes

---

## 🔥 STEP 1: Create Meta Business Account (5 min)

### 1.1 Go to Meta Business Suite

1. Visit: **https://business.facebook.com**
2. Click **"Create Account"** or **"Get Started"**
3. Enter your business information:
   - **Business Name:** (e.g., "IMB Property Management" or your name)
   - **Your Name:** Your full name
   - **Email:** Your email address
   - **Password:** Create a secure password

### 1.2 Verify Your Email

1. Check your email inbox
2. Click the verification link
3. Return to Meta Business Suite

### 1.3 Complete Business Profile (Optional)

- You can skip most fields for now
- Just fill in the minimum required information

✅ **Done? Move to Step 2**

---

## 🔥 STEP 2: Create Meta App (5 min)

### 2.1 Go to Meta for Developers

1. Visit: **https://developers.facebook.com**
2. Click **"My Apps"** (top right)
3. Click **"Create App"**

### 2.2 Choose App Type

1. Select **"Business"** as the app type
2. Click **"Next"**

### 2.3 Fill App Details

1. **App Name:** `IMB Property Management` (or your choice)
2. **App Contact Email:** Your email
3. **Business Account:** Select the business account you created in Step 1
4. Click **"Create App"**

### 2.4 Complete Security Check

- Meta may ask you to verify your identity
- Follow the prompts (usually phone or email verification)

✅ **Done? Move to Step 3**

---

## 🔥 STEP 3: Add WhatsApp Product (5 min)

### 3.1 Add WhatsApp to Your App

1. In your app dashboard, find **"Add Products"** or **"Products"** in the left menu
2. Look for **"WhatsApp"** in the product list
3. Click **"Set Up"** or **"Add"** next to WhatsApp

### 3.2 Choose WhatsApp API Type

**If you see these options (English interface):**
- **WhatsApp Business Platform (Cloud API)** ← **Choose this one!**
- **WhatsApp Business Platform (On-Premises API)** ← Skip this

Click **"Get Started"** on Cloud API.

**If you see these options (Spanish interface):**
- **"Personaliza el caso de uso"** (Customize the use case)
- **"Configuracion de la API"** (API Configuration)

**What to do:**
1. Click **"Configuracion de la API"** (API Configuration) ← **Choose this one!**
2. This will take you to the API setup page
3. You're looking for **"WhatsApp Business Platform (Cloud API)"** or **"Plataforma de Negocios de WhatsApp (API en la Nube)"**

**Note:** Meta's interface may have changed. If you don't see the Cloud API option directly:
- Look for **"API Setup"** or **"Configuración de API"** in the left menu
- Or proceed to **"Configuracion de la API"** and you'll find the Cloud API option there

### 3.3 Accept Terms

1. Read and accept the WhatsApp Business Platform Terms
2. Click **"Continue"** or **"Continuar"**

### 3.4 Select WhatsApp Business Account

**You'll see a screen asking you to select WhatsApp Business Accounts:**

**English:**
- "Choose the WhatsApp Business Accounts you want IMB Property Management to access"
- You'll see options like:
  - "Activate all current and future WhatsApp Business Accounts"
  - "Activate only current WhatsApp Business Accounts"

**Spanish:**
- "Elige los Cuentas de WhatsApp a los que quieras que acceda IMB Property Management"
- Verás opciones como:
  - "Activa todos los Cuentas de WhatsApp actuales y futuros"
  - "Activa solo los Cuentas de WhatsApp actuales"

**What to do:**

1. **If you see a test account** (like "Test WhatsApp Business Account"):
   - ✅ **Select it** by checking the box next to it
   - This is your test account for development

2. **If you have a real WhatsApp Business Account:**
   - ✅ **Select "Activate only current WhatsApp Business Accounts"** (Activa solo los Cuentas de WhatsApp actuales)
   - ✅ **Check the box** next to your WhatsApp Business Account
   - This gives you more control

3. **Click "Next"** or **"Siguiente"** to continue

**Note:** If you only see a test account, that's fine! You can add your real phone number later in Step 4.

✅ **Done? Move to Step 4**

---

## 🔥 STEP 4: Get Phone Number (10 min)

### 4.1 Access WhatsApp Manager

1. In your app dashboard, click **"WhatsApp"** in the left menu
2. You'll see **"Getting Started"** or **"API Setup"**

### 4.2 Add Phone Number

You have **two options**:

#### Option A: Use Your Existing Number (Recommended) ⭐

1. Click **"Add Phone Number"**
2. Select **"I want to use a phone number I already have"**
3. Enter your phone number: **+54 9 249 420 6835**
4. Choose verification method:
   - **SMS** (recommended)
   - **Voice Call**
5. Click **"Send Code"**
6. Enter the verification code you receive
7. Click **"Verify"**

**⚠️ Important:** 
- Your WhatsApp Business app on your phone will be **disconnected**
- You can only use the API version, not the mobile app
- This is normal and expected!

#### Option B: Get a New Test Number (Free)

1. Click **"Add Phone Number"**
2. Select **"I want to get a new phone number"**
3. Choose a number from the available list
4. This number is for testing only (24-hour messaging window)

**Recommendation:** Use Option A (your existing number) for production.

✅ **Done? Move to Step 5**

---

## 🔥 STEP 5: Get API Credentials (5 min)

### 5.1 Access API Setup

1. In your app dashboard, go to **"WhatsApp" → "API Setup"**
2. You'll see a page with your credentials

### 5.2 Get Your Credentials

You need to copy these **3 values**:

#### a) Phone Number ID
- Found in **"From"** section
- Looks like: `123456789012345` (long number)
- **Copy this!**

#### b) WhatsApp Business Account ID
- Found in **"Business Account ID"** section
- Looks like: `123456789012345` (long number)
- **Copy this!**

#### c) Access Token (Temporary)
- Found in **"Temporary access token"** section
- Click **"Copy"** to get the token
- **⚠️ This is temporary!** We'll get a permanent one next.

### 5.3 Get Permanent Access Token

1. In the left menu, go to **"WhatsApp" → "Configuration"**
2. Click **"Access Tokens"** tab
3. Click **"Generate Token"**
4. Select your **System User** (or create one if needed)
5. Select permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
6. Click **"Generate Token"**
7. **⚠️ Copy this token immediately!** You won't see it again.
8. Save it securely (this is your permanent token)

✅ **Done? Move to Step 6**

---

## 🔥 STEP 6: Configure Webhook (5 min)

### 6.1 Go to Webhook Configuration

1. In your app dashboard, go to **"WhatsApp" → "Configuration"**
2. Click **"Webhooks"** tab
3. Click **"Edit"** or **"Add Callback URL"**

### 6.2 Set Webhook URL

**If you've already deployed to Railway:**
- **Callback URL:** `https://your-wapp-url.railway.app/webhook`
- **Verify Token:** (use the same value as `WEBHOOK_VERIFY_TOKEN` in Railway)

**If not deployed yet:**
- We'll configure this after deployment
- For now, just note where to find this section

### 6.3 Subscribe to Webhook Fields

Make sure these are checked:
- ✅ `messages`
- ✅ `message_status`

Click **"Verify and Save"**

✅ **Done? Move to Step 7**

---

## 🔥 STEP 7: Save Your Credentials

Create a secure note with these values:

```
WhatsApp Business API Credentials
=================================

Phone Number: +54 9 249 420 6835
Phone Number ID: [paste from Step 5.2a]
Business Account ID: [paste from Step 5.2b]
Access Token: [paste permanent token from Step 5.3]
Webhook URL: https://your-wapp-url.railway.app/webhook
Verify Token: [your secure random string]
```

**⚠️ Keep these secure!** Don't share them publicly.

---

## 🔥 STEP 8: Update Your Environment Variables

### 8.1 Update Railway WhatsApp Service

1. Go to Railway dashboard
2. Open your WhatsApp service
3. Go to **"Variables"** tab
4. Update these variables:

```env
WHATSAPP_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WEBHOOK_VERIFY_TOKEN=your_secure_random_string_here
```

5. Railway will automatically redeploy

### 8.2 Update Local Environment (Optional)

If you want to test locally, update `wapp/.env`:

```env
WHATSAPP_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WEBHOOK_VERIFY_TOKEN=your_secure_random_string_here
```

---

## 🧪 STEP 9: Test Your Setup

### 9.1 Test Webhook (After Deployment)

1. Send a test message to your WhatsApp number: **+54 9 249 420 6835**
2. Check Railway logs to see if webhook is receiving messages
3. Check your frontend notifications page

### 9.2 Test Sending Messages (Optional)

You can test sending messages using the API:

```bash
curl -X POST \
  "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5492494206835",
    "type": "text",
    "text": {
      "body": "Test message from API"
    }
  }'
```

**⚠️ Note:** Replace:
- `YOUR_PHONE_NUMBER_ID` with your Phone Number ID
- `YOUR_ACCESS_TOKEN` with your Access Token

---

## 📊 FREE TIER LIMITS

### WhatsApp Business Cloud API (Free Tier):

- ✅ **1,000 conversations/month** (free)
- ✅ **Unlimited messages** within conversations
- ✅ **24-hour messaging window** (can reply to users who message you)
- ⚠️ **No outbound marketing** (can't message users who haven't contacted you first)

### What is a "Conversation"?

A conversation is a **24-hour window** where you can exchange unlimited messages with a user. After 24 hours, you need a new conversation (user must message you again).

---

## 🆘 TROUBLESHOOTING

### "Phone number already in use"

**Problem:** Your phone number is connected to WhatsApp Business app.

**Solution:**
1. Uninstall WhatsApp Business app from your phone
2. Wait 5 minutes
3. Try adding the number again in Meta dashboard

### "Verification code not received"

**Solutions:**
1. Try **Voice Call** instead of SMS
2. Make sure your phone has signal
3. Wait 2-3 minutes and try again
4. Check spam folder (if using email verification)

### "Webhook verification failed"

**Solutions:**
1. Make sure `WEBHOOK_VERIFY_TOKEN` matches in both:
   - Meta Developer Console
   - Railway environment variables
2. Make sure your Railway service is deployed and accessible
3. Check Railway logs for errors

### "Access token expired"

**Solutions:**
1. Generate a new permanent token (Step 5.3)
2. Update Railway environment variables
3. Wait for automatic redeployment

### "Can't send messages"

**Common causes:**
1. **24-hour window expired** - User must message you first
2. **Phone number not verified** - Complete phone verification
3. **Wrong Phone Number ID** - Double-check in Meta dashboard
4. **Invalid token** - Generate new token

---

## 📝 NEXT STEPS

After getting your credentials:

1. ✅ **Update Railway environment variables** (Step 8.1)
2. ✅ **Configure webhook in Meta Console** (Step 6)
3. ✅ **Test by sending a message** to your number
4. ✅ **Check notifications in your frontend**

---

## 🔗 USEFUL LINKS

- **Meta Business Suite:** https://business.facebook.com
- **Meta for Developers:** https://developers.facebook.com
- **WhatsApp Business API Docs:** https://developers.facebook.com/docs/whatsapp
- **API Reference:** https://developers.facebook.com/docs/whatsapp/cloud-api

---

## 💡 TIPS

1. **Save credentials immediately** - Some tokens are only shown once
2. **Use permanent tokens** - Temporary tokens expire quickly
3. **Test with your own number first** - Send yourself a test message
4. **Monitor usage** - Check Meta Business Suite for API usage stats
5. **Keep phone number active** - Don't delete the WhatsApp Business app connection

---

## ✅ CHECKLIST

- [ ] Meta Business account created
- [ ] Meta App created
- [ ] WhatsApp product added
- [ ] Phone number verified (+54 9 249 420 6835)
- [ ] Phone Number ID saved
- [ ] Business Account ID saved
- [ ] Permanent Access Token generated and saved
- [ ] Webhook configured (after Railway deployment)
- [ ] Railway environment variables updated
- [ ] Test message sent and received

---

**🎉 Once complete, your WhatsApp Business API is ready to use!**

Need help with a specific step? Let me know!

