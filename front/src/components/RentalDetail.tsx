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
import { useRental } from '../hooks/useRental';
import PropertyMap from './PropertyMap';
import Layout from './Layout';



/**
 *  rental has this 
 * 
 * contract_number
: 
"CON-MIGRATED-002"
created_at
: 
"2025-10-02T00:36:36.429Z"
deposit
: 
"0.00"
end_date
: 
"2024-12-31T03:00:00.000Z"
id
: 
2
monthly_rent
: 
"800.00"
notes
: 
"Migrated from old record: 450"
property_id
: 
2
start_date
: 
"2024-01-01T03:00:00.000Z"
status
: 
"in_progress"
tenant_email
: 
null
tenant_name
: 
"Tenant 2"
tenant_phone
: 
null
updated_at
: 
"2025-10-02T00:36:36.429Z"
 */


const RentalDetail: React.FC = () => {
  const { id, rentalId } = useParams<{ id: string; rentalId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useRental(
    id ? parseInt(id) : 0, 
    rentalId ? parseInt(rentalId) : 0
  );

  const rental = data?.rental;
  const property = data?.property;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !rental) {
    return (
      <Alert severity="error">
        Alquiler no encontrado
      </Alert>
    );
  }

  console.log("rental", rental);

  return (
    // <Layout>
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Alquiler {rentalId}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Propiedades en alquiler
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Fecha:</strong> {new Date(rental.start_date).toLocaleTimeString('en-US', {
year: 'numeric',
month: 'long',
day: 'numeric'
})}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Notes:</strong> {rental.notes}
                </Typography>
                {/* <Typography variant="body1" gutterBottom>
                  <strong>Dirección:</strong> {property.direccion}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>m²:</strong> {property.m2}
                </Typography> */}
                <Typography variant="body1" gutterBottom>
                  <strong>Precio mensual:</strong> ${rental.monthly_rent.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={5}>
          <Card>
            <CardContent>
              <PropertyMap 
                address={rental.direccion}
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

export default RentalDetail;
