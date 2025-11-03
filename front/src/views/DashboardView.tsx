import React from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
  
const DashboardView: React.FC = () => {
  const { user } = useAuth();  
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome, {user?.username}!</Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Propiedades</Typography>
              <Typography variant="body2" gutterBottom>
                Gestiona propiedades, ventas y alquileres.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/propiedades')}>Ir a Propiedades</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardView;
