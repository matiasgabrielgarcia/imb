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
  CircularProgress,
  Alert
} from '@mui/material';
import { useSale } from '../hooks/useSale';
import PropertyMap from './PropertyMap';
import Layout from './Layout';

const SaleDetail: React.FC = () => {
  const { id, saleId } = useParams<{ id: string; saleId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useSale(
    id ? parseInt(id) : 0, 
    saleId ? parseInt(saleId) : 0
  );

  const sale = data?.sale;
  const property = data?.property;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !sale) {
    return (
      <Alert severity="error">
        Venta no encontrada
      </Alert>
    );
  }

  return (
    // <Layout>
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Venta {saleId}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Propiedades en venta
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Fecha:</strong> {sale.fecha}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Algo:</strong> {sale.algo}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Dirección:</strong> {sale.direccion}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>m²:</strong> {sale.m2}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Precio:</strong> ${sale.precio.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={5}>
          <Card>
            <CardContent>
              <PropertyMap 
                address={sale.direccion}
                latitude={property?.latitude || -34.6037}
                longitude={property?.longitude || -58.3816}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/propiedades/${id}`)}
          sx={{ mr: 1 }}
        >
          Volver a la propiedad
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </Box>
    </Box>
    // </Layout>
  );
};

export default SaleDetail;
