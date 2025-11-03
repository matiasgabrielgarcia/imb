import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Breadcrumbs,
  Typography,
  Paper,
  Box
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  House as HouseIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getIcon = (segment: string, index: number) => {
    const fullPath = '/' + pathSegments.slice(0, index + 1).join('/');
    
    switch (segment) {
      case 'profile':
        return <PersonIcon fontSize="small" />;
      case 'dashboard':
        return <DashboardIcon fontSize="small" />;
      case 'propiedades':
        return <HouseIcon fontSize="small" />;
      case 'nueva':
        return <AddIcon fontSize="small" />;
      case 'editar':
        return <EditIcon fontSize="small" />;
      default:
        // For numeric IDs or other segments, check if it's a number
        if (!isNaN(Number(segment))) {
          return <HouseIcon fontSize="small" />;
        }
        return <HomeIcon fontSize="small" />;
    }
  };

  const getLabel = (segment: string, index: number) => {
    switch (segment) {
      case 'profile':
        return 'Perfil';
      case 'dashboard':
        return 'Dashboard';
      case 'propiedades':
        return 'Propiedades';
      case 'nueva':
        return 'Nueva Propiedad';
      case 'editar':
        return 'Editar';
      case 'ventas':
        return 'Ventas';
      case 'alquileres':
        return 'Alquileres';
      default:
        // For numeric IDs, show a more user-friendly label
        if (!isNaN(Number(segment))) {
          const prevSegment = pathSegments[index - 1];
          if (prevSegment === 'propiedades') {
            return `Propiedad #${segment}`;
          } else if (prevSegment === 'ventas') {
            return `Venta #${segment}`;
          } else if (prevSegment === 'alquileres') {
            return `Alquiler #${segment}`;
          }
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 1.5, 
        mb: 2, 
        borderRadius: 1,
        backgroundColor: 'background.default'
      }}
    >
      <Breadcrumbs 
        aria-label="breadcrumb" 
        separator="›"
        sx={{ 
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary'
          }
        }}
      >
        <RouterLink 
          to="/profile" 
          style={{ 
            color: 'inherit', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <HomeIcon fontSize="small" />
          <Typography variant="body2">Inicio</Typography>
        </RouterLink>
        {pathSegments.map((segment, idx) => {
          const url = '/' + pathSegments.slice(0, idx + 1).join('/');
          const isLast = idx === pathSegments.length - 1;
          const icon = getIcon(segment, idx);
          const label = getLabel(segment, idx);
          
          return isLast ? (
            <Box key={url} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {icon}
              <Typography variant="body2" color="text.primary" fontWeight="medium">
                {label}
              </Typography>
            </Box>
          ) : (
            <RouterLink 
              key={url} 
              to={url} 
              style={{ 
                color: 'inherit', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {icon}
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
            </RouterLink>
          );
        })}
      </Breadcrumbs>
    </Paper>
  );
};

export default Breadcrumb;
