import React from 'react';
import CoordinateMapGoogle from './CoordinateMap.google';
import CoordinateMapLibre from './CoordinateMap.maplibre';

interface CoordinateMapProps {
  latitude?: number;
  longitude?: number;
  onCoordinateSelect: (lat: number, lng: number) => void;
  height?: number;
}

/**
 * HOC wrapper that selects the appropriate map implementation based on VITE_MAP_VERSION
 * - 'google': Uses Google Maps
 * - anything else: Uses MapLibre GL (default)
 */
const CoordinateMap: React.FC<CoordinateMapProps> = (props) => {
  const mapVersion = import.meta.env.VITE_MAP_VERSION;
  
  if (mapVersion === 'google') {
    return <CoordinateMapGoogle {...props} />;
  }
  
  return <CoordinateMapLibre {...props} />;
};

export default CoordinateMap;
