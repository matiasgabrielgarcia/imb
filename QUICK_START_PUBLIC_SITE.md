# Quick Start - Public Site

## What's New?

A new public-facing website for property listings has been created. Users can browse properties for sale and rent, and submit contact forms that create opportunities in your backoffice.

## Quick Start (3 Steps)

### 1. Install Public Site Dependencies

```bash
cd public-site
npm install
cd ..
```

### 2. Ensure Database Migration

The opportunities table should already be created. If not, run:

```bash
# Connect to your PostgreSQL database
psql -U your_user -d rental_management -f back/src/database/migrations/004_opportunities.sql
```

### 3. Start All Services

**Windows:**
```bash
start-all.bat
```

**Linux/Mac:**
```bash
./start-all.sh
```

## Access Your Sites

- 🌐 **Public Site**: http://localhost:5174
- 🔐 **Backoffice**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3001
- 💬 **WhatsApp**: http://localhost:3002

## Test the Integration

1. Visit the public site: http://localhost:5174
2. Click on any property's "Consultar Venta" or "Consultar Alquiler" button
3. Fill out the contact form and submit
4. Go to backoffice: http://localhost:5173
5. Navigate to "Oportunidades"
6. See your new opportunity!

## What Was Created?

### Backend
- ✅ Opportunity model and database table
- ✅ Public API routes (no auth required)
- ✅ Opportunity management routes (auth required)
- ✅ CORS configured for port 5174

### Public Site
- ✅ React + TypeScript + Vite + Material-UI
- ✅ Property listing with filters
- ✅ Image carousel using Slick.js
- ✅ Contact form dialog
- ✅ Responsive design

## Files Changed/Added

**Backend:**
- `back/src/models/Opportunity.ts` (NEW)
- `back/src/routes/opportunities.ts` (NEW)
- `back/src/routes/public.ts` (NEW)
- `back/src/server.ts` (MODIFIED - added routes and CORS)

**Public Site:** (NEW FOLDER)
- `public-site/` - Complete React application

**Scripts:**
- `start-all.bat` (MODIFIED)
- `start-all.sh` (MODIFIED)
- `stop-all.sh` (MODIFIED)

## Next Steps

### Customize the Public Site

Edit these files to match your brand:
- `public-site/src/App.tsx` - Main layout and colors
- `public-site/src/index.css` - Global styles
- `public-site/src/components/PropertyCard.tsx` - Property display

### Add Real Images

Currently using Unsplash placeholder images. To use real property images:
1. Update `ImageCarousel.tsx` to fetch from your image API
2. Ensure your backend serves property images

### Configure for Production

1. Build the public site:
```bash
cd public-site
npm run build
```

2. Update environment variables:
```bash
# public-site/.env.production
VITE_API_URL=https://your-api-domain.com
```

3. Deploy the `dist/` folder to your web server

## Troubleshooting

**Port 5174 already in use?**
```bash
# Change port in public-site/vite.config.ts
server: {
  port: 5175, // or any other port
}
```

**Can't connect to API?**
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify VITE_API_URL in your environment

**Opportunities not showing in backoffice?**
- Ensure migration 004_opportunities.sql has run
- Check that OpportunitiesView exists in front/src/views/
- Verify backend logs for errors

## Support

For more details, see:
- `PUBLIC_SITE_README.md` - Complete integration guide
- `public-site/README.md` - Public site specific docs
- `OPPORTUNITIES_SYSTEM.md` - Opportunities feature documentation

## Stop All Services

**Linux/Mac:**
```bash
./stop-all.sh
```

**Windows:**
Close each command window or use Task Manager

