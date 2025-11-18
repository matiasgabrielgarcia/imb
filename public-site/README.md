# Public Site - Inmobiliaria

Public-facing website for property listings (sales and rentals).

## Features

- Browse properties (all, for sale, or for rent)
- Image carousel for each property using Slick.js
- Contact form that creates opportunities in the backoffice
- Responsive design with Material-UI
- TypeScript + React + Vite

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults work for development):
```bash
# Optional - only needed for production
VITE_API_URL=https://your-production-api.com/api
```

3. Start the development server:
```bash
npm run dev
```

The site will be available at http://localhost:5174

## Building for Production

```bash
npm run build
npm run preview
```

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Material-UI
- **API**: Connects to backend at `/api/public/*` endpoints (no authentication required)
- **Carousel**: react-slick for image galleries

## Contact Form

When users submit the contact form, it creates an "opportunity" (oportunidad) in the backoffice system that can be managed by administrators through the backoffice interface at http://localhost:5173

