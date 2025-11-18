# Public Site Integration Guide

## Overview

A new public-facing website has been created for property listings. This site allows the general public to:

- Browse properties available for sale or rent
- View property details with image carousels
- Submit contact forms to express interest

Contact submissions create **opportunities** (oportunidades) in the backoffice system for tracking and follow-up.

## Architecture

### Backend (New Routes)

**Public API Endpoints** (`/api/public/*`) - No authentication required:
- `GET /api/public/properties` - List all properties with sales/rentals
- `GET /api/public/properties/for-sale` - List properties for sale
- `GET /api/public/properties/for-rent` - List properties for rent
- `GET /api/public/properties/:id` - Get specific property details
- `POST /api/public/contact` - Submit contact form (creates opportunity)

**Opportunity Management** (`/api/opportunities/*`) - Requires authentication:
- `GET /api/opportunities` - List all opportunities
- `GET /api/opportunities/:id` - Get specific opportunity
- `GET /api/opportunities/property/:propertyId` - Get opportunities by property
- `POST /api/opportunities` - Create opportunity manually
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity
- `POST /api/opportunities/:id/message` - Add message to opportunity

### Database

**Opportunities Table** (already migrated via `004_opportunities.sql`):
- Stores leads from public website, WhatsApp, phone, etc.
- Links to properties
- Tracks contact information (email, phone, mobile)
- Records messages and notes
- Status tracking (pending_contact, waiting_response, evolved, etc.)
- Type: sale or rental

### Frontend - Public Site

**Location**: `/public-site/`
**Tech Stack**: React 19 + TypeScript + Vite + Material-UI + Slick Carousel
**Port**: 5174

**Features**:
- Property listing with filters (All, For Sale, For Rent)
- Image carousel using react-slick
- Responsive Material-UI design
- Contact dialog that creates opportunities

## Setup Instructions

### 1. Install Dependencies

```bash
cd public-site
npm install
```

### 2. Start All Services

Use the updated startup scripts:

**Windows**:
```bash
start-all.bat
```

**Linux/Mac**:
```bash
./start-all.sh
```

### 3. Access the Services

- **Backend API**: http://localhost:3001
- **Backoffice**: http://localhost:5173 (existing admin interface)
- **Public Site**: http://localhost:5174 (new public website)
- **WhatsApp Service**: http://localhost:3002

## How It Works

1. **User visits public site** → http://localhost:5174
2. **Browses properties** → Calls `/api/public/properties`
3. **Clicks "Consultar Venta" or "Consultar Alquiler"** → Opens contact dialog
4. **Fills contact form** → Submits to `/api/public/contact`
5. **Opportunity created** → Stored in database, visible in backoffice

## Viewing Opportunities in Backoffice

The existing backoffice already has an Opportunities view at:
- http://localhost:5173 → Navigate to "Oportunidades"

You can see all opportunities including:
- Source channel (public_website, whatsapp, etc.)
- Contact information
- Property of interest
- Status and type (sale/rental)
- Messages and notes

## Development

### Public Site Development

```bash
cd public-site
npm run dev
```

### Backend Changes

The backend now includes:
- `back/src/models/Opportunity.ts` - Opportunity model
- `back/src/routes/opportunities.ts` - Protected opportunity routes
- `back/src/routes/public.ts` - Public API routes

### Adding Features

To customize the public site:
- **Styles**: Edit `public-site/src/index.css`
- **Components**: Located in `public-site/src/components/`
- **API Service**: `public-site/src/services/api.ts`

## Image Carousel

Currently uses placeholder images from Unsplash. To use real property images:

1. Update `ImageCarousel.tsx` to fetch images from your backend
2. Ensure property images are stored and accessible
3. Update the API to include image URLs in property responses

## Production Deployment

### Build Public Site

```bash
cd public-site
npm run build
```

Output will be in `public-site/dist/`

### Environment Variables

Create `public-site/.env` for production:
```
VITE_API_URL=https://your-api-domain.com
```

### CORS Configuration

Update `back/src/server.ts` CORS settings for production:
```typescript
origin: ['https://your-backoffice-domain.com', 'https://your-public-site-domain.com']
```

## Testing the Integration

1. Start all services using startup scripts
2. Visit public site: http://localhost:5174
3. Click on a property's "Consultar" button
4. Fill out the contact form and submit
5. Go to backoffice: http://localhost:5173
6. Navigate to "Oportunidades" view
7. Verify the new opportunity appears with:
   - Channel: "public_website"
   - Contact information you entered
   - Linked to the correct property
   - Status: "pending_contact"

## Troubleshooting

**Public site can't connect to API**:
- Ensure backend is running on port 3001
- Check CORS settings in `back/src/server.ts`
- Verify proxy settings in `public-site/vite.config.ts`

**Opportunities not appearing**:
- Verify database migration `004_opportunities.sql` has run
- Check backend logs for errors
- Ensure the backoffice has the OpportunitiesView implemented

**Images not loading**:
- Currently uses Unsplash placeholders (requires internet)
- For offline, replace with local images

## Next Steps

1. **Customize design** - Update colors, fonts, and layout in public site
2. **Add real images** - Integrate with property image system
3. **Email notifications** - Send email when opportunity is created
4. **SEO optimization** - Add meta tags, sitemap, etc.
5. **Analytics** - Track visitor behavior and conversions
6. **Property search** - Add filtering by location, price, size, etc.

