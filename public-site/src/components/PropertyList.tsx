import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  Box,
  Alert,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { propertyService, Property } from '../services/api';
import PropertyCard from './PropertyCard';

interface PropertyListProps {
  filterType: 'all' | 'sale' | 'rental';
}

const PropertyList: React.FC<PropertyListProps> = ({ filterType }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: Property[];

        switch (filterType) {
          case 'sale':
            data = await propertyService.getPropertiesForSale();
            break;
          case 'rental':
            data = await propertyService.getPropertiesForRent();
            break;
          default:
            data = await propertyService.getAllProperties();
        }

        setProperties(data);
      } catch (err: any) {
        console.error('Error fetching properties:', err);
        setError('Error al cargar las propiedades. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filterType]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (properties.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No hay propiedades disponibles en este momento
        </Typography>
      </Box>
    );
  }

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'grid' | 'list' | null
  ) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <Box>
      {/* View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Vista:
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <GridViewIcon sx={{ mr: 0.5 }} />
            <Typography variant="caption">Cuadrícula</Typography>
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon sx={{ mr: 0.5 }} />
            <Typography variant="caption">Lista</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Properties Grid/List */}
      <Box sx={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center',
        maxWidth: viewMode === 'grid' ? '1400px' : '800px',
        mx: 'auto'
      }}>
        {properties.map((property) => (
          <Box 
            key={property.id} 
            sx={{ 
              width: viewMode === 'grid' ? { 
                xs: '100%', 
                sm: 'calc(50% - 8px)', 
                md: 'calc(33.333% - 11px)', 
                lg: 'calc(25% - 12px)' 
              } : '100%',
              minWidth: viewMode === 'grid' ? '250px' : 'auto',
              flexGrow: viewMode === 'list' ? 1 : 0
            }}
          >
            <PropertyCard property={property} viewMode={viewMode} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PropertyList;

