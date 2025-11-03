import React from 'react';
import PropertyMapGoogle from './PropertyMap.google';
import PropertyMapLibre from './PropertyMap.maplibre';

interface PropertyMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  height?: number;
}

/**
 * HOC wrapper that selects the appropriate map implementation based on VITE_MAP_VERSION
 * - 'google': Uses Google Maps
 * - anything else: Uses MapLibre GL (default)
 */
const PropertyMap: React.FC<PropertyMapProps> = (props) => {
  const mapVersion = import.meta.env.VITE_MAP_VERSION;
  
  if (mapVersion === 'google') {
    return <PropertyMapGoogle {...props} />;
  }
  
  return <PropertyMapLibre {...props} />;
};

export default PropertyMap;
