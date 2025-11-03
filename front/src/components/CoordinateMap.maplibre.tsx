import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Box, Typography, Button } from '@mui/material';

interface CoordinateMapProps {
  latitude?: number;
  longitude?: number;
  onCoordinateSelect: (lat: number, lng: number) => void;
  height?: number;
}

const CoordinateMapLibre: React.FC<CoordinateMapProps> = ({ 
  latitude = -34.6037, 
  longitude = -58.3816, 
  onCoordinateSelect,
  height = 400
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

      // Create draggable marker
      marker.current = new maplibregl.Marker({ draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          onCoordinateSelect(lngLat.lat, lngLat.lng);
        }
      });

      // Handle map click to move marker
      map.current.on('click', (e) => {
        if (marker.current) {
          marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          onCoordinateSelect(e.lngLat.lat, e.lngLat.lng);
        }
      });

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
  }, []);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (map.current && marker.current && mapLoaded) {
      const isValidLat = latitude >= -90 && latitude <= 90;
      const isValidLng = longitude >= -180 && longitude <= 180;
      
      if (isValidLat && isValidLng) {
        marker.current.setLngLat([longitude, latitude]);
        map.current.setCenter([longitude, latitude]);
      }
    }
  }, [latitude, longitude, mapLoaded]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por este navegador.');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onCoordinateSelect(lat, lng);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        
        let errorMessage = 'No se pudo obtener la ubicación actual. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permisos de ubicación denegados. Por favor, habilita la geolocalización en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'La información de ubicación no está disponible.';
            break;
          case error.TIMEOUT:
            errorMessage += 'La solicitud de ubicación tardó demasiado tiempo.';
            break;
          default:
            errorMessage += 'Error desconocido. Por favor, selecciona manualmente en el mapa.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">
          Seleccionar ubicación
        </Typography>
        <Button 
          variant="outlined" 
          size="small"
          onClick={handleUseCurrentLocation}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? 'Obteniendo ubicación...' : 'Usar ubicación actual'}
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación de la propiedad
      </Typography>
      <Box
        ref={mapContainer}
        sx={{
          width: '100%',
          height: height,
          border: '1px solid #ddd',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative'
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
    </Box>
  );
};

export default CoordinateMapLibre;

