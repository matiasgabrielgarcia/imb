import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Phone as PhoneIcon,
  ShoppingCart as BuyerIcon,
  Sell as SellerIcon,
  Home as TenantIcon,
  HomeWork as LandlordIcon,
  Help as UncategorizedIcon
} from '@mui/icons-material';
import { notificationsAPI, NotificationDto, NotificationsSummary } from '../services/api';

const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [summary, setSummary] = useState<NotificationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsAPI.getAll();
      setNotifications(data.notifications);
      setSummary(data.summary);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('No se pudieron cargar las notificaciones. Asegúrate de que el servidor wapp esté ejecutándose en el puerto 3005.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (phoneNumber: string) => {
    // Clean phone number (remove spaces, dashes, parentheses, plus signs)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    // Open WhatsApp Web in a new tab
    window.open(`https://web.whatsapp.com/send?phone=${cleanPhone}`, '_blank');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BUYER':
        return <BuyerIcon />;
      case 'SELLER':
        return <SellerIcon />;
      case 'TENANT':
        return <TenantIcon />;
      case 'LANDLORD':
        return <LandlordIcon />;
      default:
        return <UncategorizedIcon />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'BUYER':
        return 'Comprador';
      case 'SELLER':
        return 'Vendedor';
      case 'TENANT':
        return 'Inquilino';
      case 'LANDLORD':
        return 'Propietario';
      default:
        return 'Sin categoría';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BUYER':
        return '#2196f3'; // Blue
      case 'SELLER':
        return '#4caf50'; // Green
      case 'TENANT':
        return '#ff9800'; // Orange
      case 'LANDLORD':
        return '#9c27b0'; // Purple
      default:
        return '#757575'; // Grey
    }
  };

  const getCardBackgroundColor = (isOld: boolean) => {
    return isOld ? '#ffebee' : '#e8f5e9'; // Red tint for old, green tint for recent
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const category = notification.category || 'UNCATEGORIZED';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notification);
    return acc;
  }, {} as Record<string, NotificationDto[]>);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Notificaciones de Clientes
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Mensajes recibidos de WhatsApp categorizados por tipo de cliente.
            Las notificaciones con fondo rojo tienen más de un mes, las verdes son recientes.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {summary && (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Notificaciones
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(summary).map(([category, count]) => (
                <Grid item xs={12} sm={6} md={2.4} key={category}>
                  <Card sx={{ bgcolor: getCategoryColor(category), color: 'white' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                        {getCategoryIcon(category)}
                        <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                          {count}
                        </Typography>
                        <Typography variant="body2">
                          {getCategoryLabel(category)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {notifications.length === 0 ? (
          <Alert severity="info">
            No hay notificaciones disponibles.
          </Alert>
        ) : (
          <Box>
            {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => (
              <Box key={category} mb={4}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box sx={{ color: getCategoryColor(category), mr: 1 }}>
                    {getCategoryIcon(category)}
                  </Box>
                  <Typography variant="h5" component="h2">
                    {getCategoryLabel(category)} ({categoryNotifications.length})
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {categoryNotifications.map((notification, index) => (
                    <Grid item xs={12} md={6} key={`${notification.messageId || index}`}>
                      <Card
                        elevation={3}
                        sx={{
                          bgcolor: getCardBackgroundColor(notification.isOld),
                          borderLeft: `6px solid ${getCategoryColor(category)}`
                        }}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Typography variant="subtitle2" color="textSecondary">
                                De:
                              </Typography>
                              <Box
                                onClick={() => openWhatsApp(notification.messageFrom)}
                                sx={{
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  transition: 'background-color 0.2s',
                                  '&:hover': {
                                    backgroundColor: 'rgba(37, 211, 102, 0.1)',
                                  },
                                }}
                              >
                                <PhoneIcon 
                                  sx={{ 
                                    fontSize: 18, 
                                    mr: 0.5, 
                                    color: '#25d366'
                                  }} 
                                />
                                <Typography 
                                  variant="h6" 
                                  component="div"
                                  sx={{
                                    color: '#25d366',
                                    fontWeight: 500,
                                    textDecoration: 'underline',
                                  }}
                                >
                                  {notification.messageFrom}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={notification.isOld ? 'Más de 1 mes' : 'Reciente'}
                              color={notification.isOld ? 'error' : 'success'}
                              size="small"
                            />
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(notification.datetime)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        )}
      </Box>
  );
};

export default NotificationsView;

