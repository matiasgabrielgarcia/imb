# Map Implementation Architecture

This project supports **two map implementations** that can be switched via environment configuration:

1. **Google Maps** - Full-featured Google Maps API
2. **MapLibre GL** - Open-source, free alternative with no API key required

## Architecture Overview

The implementation uses a **Higher-Order Component (HOC)** pattern to switch between map providers based on the `VITE_MAP_VERSION` environment variable.

### Component Structure

```
components/
├── CoordinateMap.tsx              # HOC wrapper (router)
├── CoordinateMap.google.tsx       # Google Maps implementation
├── CoordinateMap.maplibre.tsx     # MapLibre GL implementation
├── PropertyMap.tsx                # HOC wrapper (router)
├── PropertyMap.google.tsx         # Google Maps implementation
└── PropertyMap.maplibre.tsx       # MapLibre GL implementation
```

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Map Version: 'google' or 'maplibre'
VITE_MAP_VERSION=maplibre

# Google Maps API Key (only required if VITE_MAP_VERSION=google)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Switching Between Implementations

1. **To use MapLibre GL (free, default):**
   ```bash
   VITE_MAP_VERSION=maplibre
   ```

2. **To use Google Maps:**
   ```bash
   VITE_MAP_VERSION=google
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

## Component API

Both implementations expose **identical interfaces**, ensuring compatibility.

### CoordinateMap

Interactive map for selecting coordinates (used in property creation/editing).

```tsx
<CoordinateMap
  latitude={-34.6037}
  longitude={-58.3816}
  onCoordinateSelect={(lat, lng) => console.log(lat, lng)}
  height={400}
/>
```

**Props:**
- `latitude` (optional): Initial latitude (default: -34.6037)
- `longitude` (optional): Initial longitude (default: -58.3816)
- `onCoordinateSelect`: Callback when coordinates are selected
- `height` (optional): Map height in pixels (default: 400)

**Features:**
- Click on map to set coordinates
- Draggable marker
- "Use current location" button
- Coordinate validation

### PropertyMap

Read-only map for displaying property location.

```tsx
<PropertyMap
  address="Av. Corrientes 1234"
  latitude={-34.6037}
  longitude={-58.3816}
  height={400}
/>
```

**Props:**
- `address`: Property address (shown in marker popup/tooltip)
- `latitude` (optional): Property latitude (default: -34.6037)
- `longitude` (optional): Property longitude (default: -58.3816)
- `height` (optional): Map height in pixels (default: 400)

**Features:**
- Fixed marker (non-draggable)
- Address popup/tooltip
- Coordinate validation
- Loading state indicator

## Implementation Details

### Google Maps Features
- Uses `@googlemaps/js-api-loader`
- Requires API key from Google Cloud Console
- Subject to Google Maps pricing (free tier: $200/month)
- Street View integration
- Rich ecosystem of plugins

### MapLibre GL Features
- Uses `maplibre-gl` package
- 100% free, no API key required
- Uses free demo tiles from MapLibre
- Lightweight and performant
- Compatible with Mapbox GL JS API
- Can be customized with different tile sources

## Benefits of This Architecture

1. ✅ **Flexibility**: Switch between providers without changing application code
2. ✅ **Cost Management**: Use free MapLibre for development, Google Maps for production
3. ✅ **Compatibility**: Both implementations expose identical APIs
4. ✅ **Maintainability**: Separate implementations are easier to update
5. ✅ **Type Safety**: Full TypeScript support for both implementations

## Migration Guide

### From Google Maps Only to This Architecture

If you're upgrading from the previous Google Maps-only implementation:

1. Add `VITE_MAP_VERSION` to your `.env` file
2. No code changes required in components using the maps
3. Existing imports continue to work:
   ```tsx
   import CoordinateMap from './components/CoordinateMap';
   import PropertyMap from './components/PropertyMap';
   ```

### Customizing Tile Sources

To use custom tile sources with MapLibre (e.g., Mapbox, Maptiler):

Edit the `style` property in `*.maplibre.tsx` files:

```tsx
map.current = new maplibregl.Map({
  container: mapContainer.current,
  style: 'https://your-custom-tiles-url/style.json',
  // or Mapbox: 'mapbox://styles/mapbox/streets-v11'
  center: [longitude, latitude],
  zoom: 14
});
```

## Troubleshooting

### Maps not loading
- Check that `VITE_MAP_VERSION` is set in `.env`
- For Google Maps: Verify `VITE_GOOGLE_MAPS_API_KEY` is valid
- Restart dev server after changing `.env` variables

### TypeScript errors
- Ensure `vite-env.d.ts` includes all VITE_* environment variables
- Run `npm install` to ensure all dependencies are installed

### Coordinate issues
- MapLibre uses `[lng, lat]` order (opposite of Google Maps)
- This is handled internally by the implementations
- Always pass coordinates as `latitude, longitude` to the components

## Future Enhancements

Potential improvements to this architecture:

- [ ] Add support for additional providers (Azure Maps, HERE, etc.)
- [ ] Implement map clustering for multiple markers
- [ ] Add geocoding services
- [ ] Support custom marker icons
- [ ] Add distance measurement tools
- [ ] Implement drawing/polygon tools

## Resources

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

