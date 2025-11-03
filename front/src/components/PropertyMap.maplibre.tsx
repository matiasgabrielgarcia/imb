import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Box, Typography } from '@mui/material';

interface PropertyMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  height?: number;
}

const PropertyMapLibre: React.FC<PropertyMapProps> = ({ 
  address, 
  latitude = -34.6037, // Default to Buenos Aires coordinates
  longitude = -58.3816,
  height = 400
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    // Validate coordinates
    const isValidLat = latitude >= -90 && latitude <= 90;
    const isValidLng = longitude >= -180 && longitude <= 180;
    
    if (!isValidLat || !isValidLng) {
      console.warn('Invalid coordinates:', { latitude, longitude });
      return;
    }

    if (!mapContainer.current) return;

    try {
      // Initialize MapLibre GL map with OpenStreetMap tiles
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [longitude, latitude], // Note: MapLibre uses [lng, lat] order
        zoom: 14
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      // Create marker for the property
      marker.current = new maplibregl.Marker({ draggable: false })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Add popup with address
      const popup = new maplibregl.Popup({ offset: 25 })
        .setText(address);
      
      marker.current.setPopup(popup);

      // Set loaded state when map is ready
      map.current.on('load', () => {
        setMapLoaded(true);
      });

    } catch (error) {
      console.error('Error loading MapLibre GL:', error);
    }

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, address]);

  // Check if coordinates are valid
  const isValidLat = latitude >= -90 && latitude <= 90;
  const isValidLng = longitude >= -180 && longitude <= 180;
  const hasValidCoordinates = isValidLat && isValidLng;

  return (
    <Box sx={{ width: '100%', height: height }}>
      <Typography variant="h6" gutterBottom>
        Mapa de la propiedad
      </Typography>
      {!hasValidCoordinates ? (
        <Box
          sx={{
            width: '100%',
            height: height - 40,
            border: '1px solid #ddd',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: 'text.secondary'
          }}
        >
          <Typography variant="body2" color="error">
            Coordenadas inválidas: Latitud debe estar entre -90 y 90, Longitud entre -180 y 180
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            ref={mapContainer}
            sx={{
              width: '100%',
              height: height - 40, // Account for title height
              border: '1px solid #ddd',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          />
          {!mapLoaded && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              Cargando mapa...
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default PropertyMapLibre;

