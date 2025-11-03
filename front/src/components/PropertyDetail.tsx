import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { usePropertyWithDetails } from '../hooks/usePropertyWithDetails';
import { usePropertyImages } from '../hooks/usePropertyImages';
import PropertyMap from './PropertyMap';
import PropertyImageUpload from './PropertyImageUpload';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);
  const propertyId = id ? parseInt(id) : 0;
  
  const { data: property, isLoading, error } = usePropertyWithDetails(propertyId);
  const { data: images = [], refetch: refetchImages } = usePropertyImages(propertyId);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Alert severity="error">
        Propiedad no encontrada
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Propiedad {property.numero}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Información General" />
          <Tab label="Imágenes" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
      <Grid container spacing={3}>
        <Grid size={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {property.direccion}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Dirección:</strong> {property.direccion}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>m²:</strong> {property.m2}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Cliente:</strong> {property.cliente}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Fecha:</strong> {property.fecha}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>REV:</strong> <Chip label={property.rev} size="small" />
                </Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ventas
                </Typography>
                {property.ventas && property.ventas.length > 0 ? (
                  property.ventas.map((sale) => (
                    <Paper key={sale.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Dirección:</strong> {sale.direccion}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => navigate(`/propiedades/${property.id}/ventas/${sale.id}`)}
                      >
                        Ver detalles de venta
                      </Button>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay ventas registradas
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Alquileres
                </Typography>
                {property.alquileres && property.alquileres.length > 0 ? (
                  property.alquileres.map((rental) => (
                    <Paper key={rental.id} sx={{ p: 2, mb: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={rental.preview_image || '/public/images/27002.jpg'}
                        alt="Preview"
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1,
                          flexShrink: 0
                        }}
                      />
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">
                          <strong>Dirección:</strong> {property.direccion}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => navigate(`/propiedades/${property.id}/alquileres/${rental.id}`)}
                        >
                          Ver detalles de alquiler
                        </Button>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay alquileres registrados
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={5}>
          <Card>
            <CardContent>
              <PropertyMap 
                address={property.direccion}
                latitude={property.latitude}
                longitude={property.longitude}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Imágenes de la Propiedad
            </Typography>
            <PropertyImageUpload
              propertyId={propertyId}
              images={images}
              onImagesChange={() => refetchImages()}
            />
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/propiedades')}
        >
          Volver a la lista
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate(`/propiedades/${property.id}/editar`)}
        >
          Editar
        </Button>
      </Box>
    </Box>
  );
};

export default PropertyDetail;
