import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Property } from '../services/api';
import ImageCarousel from './ImageCarousel';
import ContactDialog from './ContactDialog';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, viewMode = 'grid' }) => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [opportunityType, setOpportunityType] = useState<'sale' | 'rental'>('sale');
  
  // When viewMode is 'list', show horizontal layout (big cards, one per row)
  // When viewMode is 'grid', show vertical layout (small cards, multiple per row)
  const isListView = viewMode === 'list';

  const hasVentas = property.ventas && property.ventas.length > 0;
  const hasAlquileres = property.alquileres && property.alquileres.length > 0;

  const handleContactClick = (type: 'sale' | 'rental') => {
    setOpportunityType(type);
    setContactDialogOpen(true);
  };

  // Get price info
  const getPriceInfo = () => {
    if (hasVentas && property.ventas![0].precio) {
      return {
        type: 'Venta',
        price: `$${property.ventas![0].precio.toLocaleString()}`,
      };
    }
    if (hasAlquileres && property.alquileres![0].monthly_rent) {
      return {
        type: 'Alquiler',
        price: `$${property.alquileres![0].monthly_rent.toLocaleString()}/mes`,
      };
    }
    return null;
  };

  const priceInfo = getPriceInfo();

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: isListView ? { xs: 'column', sm: 'row' } : 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <Box sx={{ 
          width: isListView ? { xs: '100%', sm: '280px', md: '320px' } : '100%',
          minWidth: isListView ? { sm: '280px', md: '320px' } : 'auto',
          maxWidth: isListView ? { sm: '280px', md: '320px' } : '100%',
          flexShrink: 0 
        }}>
          <ImageCarousel propertyId={property.id} height={isListView ? 220 : 200} />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1, 
          width: isListView ? { xs: '100%', sm: 'calc(100% - 280px)', md: 'calc(100% - 320px)' } : '100%',
          minWidth: 0 // Prevents flex item from overflowing
        }}>
        <CardContent sx={{ flexGrow: 1, p: isListView ? 2 : 1.5, '&:last-child': { pb: isListView ? 2 : 1.5 } }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" component="div" fontWeight="bold" gutterBottom>
              Propiedad #{property.numero}
            </Typography>
            
            <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
              <Chip label={property.rev} size="small" color="primary" />
              {hasVentas && <Chip label="Venta" size="small" color="success" />}
              {hasAlquileres && <Chip label="Alquiler" size="small" color="info" />}
            </Stack>
          </Box>

          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary" noWrap>
                {property.direccion}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SquareFootIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {property.m2} m²
              </Typography>
            </Box>

            {priceInfo && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachMoneyIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  {priceInfo.price}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>

        <CardActions sx={{ p: isListView ? 2 : 1.5, pt: 0 }}>
          <Stack 
            direction="column"
            spacing={0.5} 
            sx={{ width: '100%' }}
          >
            {hasVentas && (
              <Button 
                variant="contained" 
                color="success" 
                size="small"
                fullWidth
                onClick={() => handleContactClick('sale')}
              >
                Consultar Venta
              </Button>
            )}
            {hasAlquileres && (
              <Button 
                variant="contained" 
                color="info" 
                size="small"
                fullWidth
                onClick={() => handleContactClick('rental')}
              >
                Consultar Alquiler
              </Button>
            )}
          </Stack>
        </CardActions>
        </Box>
      </Card>

      <ContactDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        property={property}
        opportunityType={opportunityType}
      />
    </>
  );
};

export default PropertyCard;

