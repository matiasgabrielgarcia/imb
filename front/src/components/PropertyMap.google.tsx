import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Box, Typography } from '@mui/material';

interface PropertyMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  height?: number;
}

const PropertyMapGoogle: React.FC<PropertyMapProps> = ({ 
  address, 
  latitude = -34.6037, // Default to Buenos Aires coordinates
  longitude = -58.3816,
  height = 400
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
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

    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();
        
        if (mapContainer.current) {
          map.current = new google.maps.Map(mapContainer.current, {
            center: { lat: latitude, lng: longitude },
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: true
          });

          // Add a marker for the property
          marker.current = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map.current,
            title: address
          });

          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeMap();

    return () => {
      if (marker.current) {
        marker.current.setMap(null);
        marker.current = null;
      }
      if (map.current) {
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

export default PropertyMapGoogle;

