# Proxy Setup - No CORS Issues

## How It Works

The public site uses Vite's proxy feature to avoid CORS (Cross-Origin Resource Sharing) issues when calling the backend API during development.

## Configuration

### Vite Config (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // Backend server
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3001',  // Backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### API Service (`src/services/api.ts`)

```typescript
// Use relative path - Vite proxy will handle it
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## How Requests Flow

### Development (with proxy)

```
Browser Request:
http://localhost:5174/api/public/properties
              ↓
Vite Dev Server (localhost:5174) detects '/api' prefix
              ↓
Proxies to: http://localhost:3001/api/public/properties
              ↓
Backend Server (localhost:3001)
              ↓
Response back through proxy
              ↓
Browser receives response
```

**Result**: No CORS issues because browser thinks it's talking to the same origin (localhost:5174)

### Production (without proxy)

Set the environment variable:
```bash
VITE_API_URL=https://your-api-domain.com/api
```

```
Browser Request:
https://your-site.com makes request to
              ↓
https://your-api-domain.com/api/public/properties
              ↓
Backend Server
              ↓
Response (CORS headers must be properly configured on backend)
```

## Why This Approach?

### ❌ Without Proxy (Direct API Call)
```typescript
// BAD - Causes CORS issues in development
const API_BASE_URL = 'http://localhost:3001';
```

Browser sees:
- Page origin: `http://localhost:5174`
- API origin: `http://localhost:3001`
- **Different origins** → CORS error!

### ✅ With Proxy (Relative Path)
```typescript
// GOOD - No CORS issues
const API_BASE_URL = '/api';
```

Browser sees:
- Page origin: `http://localhost:5174`
- API origin: `http://localhost:5174/api` (same origin!)
- **Same origin** → No CORS error!

Vite dev server proxies the request to the actual backend.

## Comparison with Backoffice

Both apps use the same pattern:

**Backoffice** (`front/vite.config.ts`):
```typescript
port: 3000,
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    // ...
  }
}
```

**Public Site** (`public-site/vite.config.ts`):
```typescript
port: 5174,
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    // ...
  }
}
```

Both apps:
- Run on different ports (3000, 5174)
- Use relative paths (`/api`)
- Proxy to the same backend (3001)
- Avoid CORS issues in development

## Backend Configuration

The backend CORS is configured to allow both frontends:

```typescript
// back/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:3000',   // Backoffice
    'http://localhost:5173',   // Also backoffice (Vite default)
    'http://localhost:5174',   // Public site
  ],
  credentials: true
}));
```

## Troubleshooting

### Still getting CORS errors?

1. **Check backend is running**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verify proxy config**:
   - Check `vite.config.ts` has correct target (`http://localhost:3001`)
   - Restart dev server after config changes

3. **Check API calls use relative paths**:
   ```typescript
   // Correct
   api.get('/api/public/properties')
   
   // Wrong - bypasses proxy
   api.get('http://localhost:3001/api/public/properties')
   ```

4. **Browser console**:
   - Open DevTools → Network tab
   - Check request URLs
   - Should show `localhost:5174/api/...` not `localhost:3001/api/...`

### Port conflicts?

If port 5174 is in use, change it in `vite.config.ts`:
```typescript
server: {
  port: 5175, // or any available port
  // ...
}
```

## Production Deployment

For production, you won't use the Vite dev server proxy. Instead:

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Set production API URL**:
   ```bash
   # .env.production
   VITE_API_URL=https://api.yoursite.com/api
   ```

3. **Configure backend CORS**:
   ```typescript
   origin: ['https://yoursite.com']
   ```

4. **Deploy**:
   - Serve `dist/` folder from a web server
   - Ensure backend allows your domain in CORS

## Summary

✅ **Development**: Use Vite proxy (relative paths)
- No CORS issues
- Easy local development
- Automatic request forwarding

✅ **Production**: Use environment variable
- Set `VITE_API_URL` to production API
- Configure backend CORS properly
- Deploy static files

This setup matches your existing backoffice app and follows best practices! 🎉

