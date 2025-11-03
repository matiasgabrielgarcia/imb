import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import { usePropertiesWithDetails } from '../hooks/usePropertiesWithDetails';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`properties-tabpanel-${index}`}
      aria-labelledby={`properties-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PropertiesView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { data: properties = [], isLoading } = usePropertiesWithDetails();
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/propiedades/${propertyId}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Propiedades
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/propiedades/nueva')}
        >
          Nueva Propiedad
        </Button>
      </Box>
      
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="properties tabs">
            <Tab label="General" />
            <Tab label="Ventas" />
            <Tab label="Alquileres" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>REV</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Nro propiedad</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow 
                    key={property.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handlePropertyClick(property.id)}
                  >
                    <TableCell>
                      <Box
                        component="img"
                        src="/images/27002.jpg"
                        alt="Preview"
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={property.rev} size="small" />
                    </TableCell>
                    <TableCell>{property.fecha}</TableCell>
                    <TableCell>{property.numero}</TableCell>
                    <TableCell>{property.cliente}</TableCell>
                    <TableCell>
                      <Chip 
                        label="Ver detalles" 
                        color="primary" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertyClick(property.id);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>REV</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Nro propiedad</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties
                  .filter(property => property.ventas && property.ventas.length > 0)
                  .map((property) => (
                    <TableRow 
                      key={property.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handlePropertyClick(property.id)}
                    >
                      <TableCell>
                        <Box
                          component="img"
                          src={property.ventas?.[0]?.preview_image || '/images/27002.jpg'}
                          alt="Preview"
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={property.rev} size="small" />
                      </TableCell>
                      <TableCell>{property.fecha}</TableCell>
                      <TableCell>{property.numero}</TableCell>
                      <TableCell>{property.cliente}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Ver ventas" 
                          color="primary" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(property.id);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>REV</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Nro propiedad</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties
                  .filter(property => property.alquileres && property.alquileres.length > 0)
                  .map((property) => (
                    <TableRow 
                      key={property.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handlePropertyClick(property.id)}
                    >
                      <TableCell>
                        <Box
                          component="img"
                          src={property.alquileres?.[0]?.preview_image || '/images/27002.jpg'}
                          alt="Preview"
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={property.rev} size="small" />
                      </TableCell>
                      <TableCell>{property.fecha}</TableCell>
                      <TableCell>{property.numero}</TableCell>
                      <TableCell>{property.cliente}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Ver alquileres" 
                          color="primary" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(property.id);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default PropertiesView;
