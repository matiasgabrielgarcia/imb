# 📱 WhatsApp Business API - Credentials Template

**Fill this out as you complete the setup process.**

---

## 🔑 Your Credentials

```
Phone Number: +54 9 249 420 6835
Phone Number ID: _________________________________
Business Account ID: _________________________________
Access Token: _________________________________
Webhook Verify Token: _________________________________
```

---

## 📋 Quick Setup Steps

1. ✅ Create Meta Business account: https://business.facebook.com
2. ✅ Create Meta App: https://developers.facebook.com
3. ✅ Add WhatsApp product to app
4. ✅ Verify phone number: +54 9 249 420 6835
5. ✅ Get Phone Number ID (from API Setup page)
6. ✅ Generate permanent Access Token
7. ✅ Configure webhook (after Railway deployment)

---

## 🔗 Important Links

- **Meta Business Suite:** https://business.facebook.com
- **Meta Developers:** https://developers.facebook.com
- **Your App Dashboard:** https://developers.facebook.com/apps

---

## ⚠️ Important Notes

- Your WhatsApp Business **mobile app will be disconnected** when you connect to API
- This is **normal and expected** - you'll use the API instead
- Save the **permanent access token** immediately - you won't see it again!
- Free tier: **1,000 conversations/month**

---

## 📝 Where to Find Each Credential

### Phone Number ID
- Go to: **WhatsApp → API Setup**
- Look in **"From"** section
- Copy the long number

### Business Account ID
- Go to: **WhatsApp → API Setup**
- Look for **"Business Account ID"**
- Copy the long number

### Access Token (Permanent)
- Go to: **WhatsApp → Configuration → Access Tokens**
- Click **"Generate Token"**
- Select System User
- Select permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
- **Copy immediately!** (Only shown once)

### Webhook Verify Token
- Create your own secure random string
- Use same value in:
  - Meta Developer Console (Webhook settings)
  - Railway environment variable (`WEBHOOK_VERIFY_TOKEN`)

---

**Full guide:** See `WHATSAPP-API-SETUP.md` for detailed instructions.


