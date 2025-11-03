import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Box, Typography, Button } from '@mui/material';

interface CoordinateMapProps {
  latitude?: number;
  longitude?: number;
  onCoordinateSelect: (lat: number, lng: number) => void;
  height?: number;
}

const CoordinateMapGoogle: React.FC<CoordinateMapProps> = ({ 
  latitude = -34.6037, 
  longitude = -58.3816, 
  onCoordinateSelect,
  height = 400
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
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

          // Add initial marker
          marker.current = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map.current,
            draggable: true,
            title: 'Ubicación de la propiedad'
          });

          // Update coordinates when marker is dragged
          marker.current.addListener('dragend', () => {
            if (marker.current) {
              const position = marker.current.getPosition();
              if (position) {
                onCoordinateSelect(position.lat(), position.lng());
              }
            }
          });

          // Add click handler to move marker
          map.current.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng && marker.current) {
              marker.current.setPosition(event.latLng);
              onCoordinateSelect(event.latLng.lat(), event.latLng.lng());
            }
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
  }, [latitude, longitude]);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (map.current && marker.current && mapLoaded) {
      const isValidLat = latitude >= -90 && latitude <= 90;
      const isValidLng = longitude >= -180 && longitude <= 180;
      
      if (isValidLat && isValidLng) {
        const newPosition = { lat: latitude, lng: longitude };
        marker.current.setPosition(newPosition);
        map.current.setCenter(newPosition);
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

export default CoordinateMapGoogle;

