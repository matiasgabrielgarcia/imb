import React, { useCallback, useEffect } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, Alert, Card, CardContent } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateProperty } from '../hooks/usePropertyCRUD';
import { useNavigate, useParams } from 'react-router-dom';
import CoordinateMap from './CoordinateMap';
import FormField from './FormField';
import DatePickerField from './DatePickerField';
import { propertySchema, PropertyFormData } from '../schemas/propertySchema';
import { usePropertyWithDetails } from '../hooks/usePropertyWithDetails';

const PropertyEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id) : 0;
  const updateMutation = useUpdateProperty(propertyId);
  
  const { data: property, isLoading, error } = usePropertyWithDetails(propertyId);
  
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<PropertyFormData>({
    resolver: yupResolver(propertySchema),
    mode: 'onBlur',
    defaultValues: {
      numero: '',
      direccion: '',
      m2: 0,
      cliente: '',
      fecha: new Date(),
      rev: '',
      latitude: -34.6037,
      longitude: -58.3816,
      dni: '',
    }
  });

  // Reset form when property data loads
  useEffect(() => {
    if (property) {
      reset({
        numero: property.numero || '',
        direccion: property.direccion || '',
        m2: property.m2 || 0,
        cliente: property.cliente || '',
        fecha: property.fecha ? new Date(property.fecha) : new Date(),
        rev: property.rev || '',
        latitude: property.latitude || -34.6037,
        longitude: property.longitude || -58.3816,
        dni: property.dni || '',
      });
    }
  }, [property, reset]);

  const handleCoordinateSelect = useCallback((lat: number, lng: number) => {
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
  }, [setValue]);

  // Watch the current form values for latitude and longitude
  const currentLatitude = watch('latitude');
  const currentLongitude = watch('longitude');

  const onSubmit = async (data: PropertyFormData) => {
    if (!propertyId) return;
    
    try {
      await updateMutation.mutateAsync({
        ...data,
        fecha: data.fecha instanceof Date ? data.fecha.toISOString().split('T')[0] : data.fecha,
      });
      navigate('/propiedades');
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Cargando...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            Error al cargar la propiedad. Por favor, inténtalo de nuevo.
          </Alert>
        </Box>
      </Container>
    );
  }

  return ( 
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Editar Propiedad
        </Typography>
        
        {updateMutation.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al actualizar la propiedad. Por favor, inténtalo de nuevo.
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3} size={12}>
              <Grid container size={{ xs: 12, sm: 6 }} >
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  name="numero"
                  control={control}
                  label="Número"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  name="cliente"
                  control={control}
                  label="Cliente"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  name="dni"
                  control={control}
                  label="DNI (Opcional)"
                  helperText="7-8 dígitos numéricos"
                />
              </Grid>
              <Grid size={12}>
                <FormField
                  name="direccion"
                  control={control}
                  label="Dirección"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePickerField
                  name="fecha"
                  control={control}
                  label="Fecha"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  name="rev"
                  control={control}
                  label="Revisión"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  name="m2"
                  control={control}
                  label="m²"
                  type="number"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  name="latitude"
                  control={control}
                  label="Latitud"
                  type="number"
                  required
                  helperText="Entre -90 y 90"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  name="longitude"
                  control={control}
                  label="Longitud"
                  type="number"
                  required
                  helperText="Entre -180 y 180"
                />
              </Grid>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card>
                  <CardContent>
                    <CoordinateMap
                      latitude={currentLatitude}
                      longitude={currentLongitude}
                      onCoordinateSelect={handleCoordinateSelect}
                      height={400}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/propiedades')}
                    disabled={updateMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateMutation.isPending || !isValid}
                  >
                    {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Propiedad'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box> 
  );
};

export default PropertyEdit;