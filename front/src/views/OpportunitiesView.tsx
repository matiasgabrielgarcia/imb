import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Smartphone as MobileIcon,
  Home as PropertyIcon,
  Message as MessageIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  opportunitiesAPI, 
  OpportunityDto, 
  OpportunityType,
  OpportunityStatus 
} from '../services/api';

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
      id={`opportunities-tabpanel-${index}`}
      aria-labelledby={`opportunities-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const statusConfig: Record<OpportunityStatus, { label: string; color: string }> = {
  pending_contact: { label: 'Pendiente a Contactar', color: '#e3f2fd' },
  waiting_response: { label: 'Esperando Respuesta', color: '#fff3e0' },
  evolved: { label: 'Evolucionado', color: '#f3e5f5' },
  take_action: { label: 'Tomar Acción', color: '#ffebee' },
  frozen: { label: 'Congelado', color: '#eceff1' },
  appraisals: { label: 'Tasaciones', color: '#e0f2f1' },
  rental_agency: { label: 'Alquiler Inmobiliaria', color: '#e8f5e9' },
  rental_outsourced: { label: 'Alquiler Tercerizado', color: '#fce4ec' },
};

const OpportunitiesView: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0); // 0 = Sale, 1 = Rental

  useEffect(() => {
    loadOpportunities();
  }, [tabValue]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const type: OpportunityType = tabValue === 0 ? 'sale' : 'rental';
      const data = await opportunitiesAPI.getAll(type);
      setOpportunities(data.opportunities);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setError('No se pudieron cargar las oportunidades. Asegúrate de que el servidor wapp esté ejecutándose en el puerto 3005.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as OpportunityStatus;
    const opportunityId = parseInt(draggableId);

    try {
      // Optimistic update
      setOpportunities((prev) =>
        prev.map((opp) =>
          opp.id === opportunityId ? { ...opp, status: newStatus } : opp
        )
      );

      // API call
      await opportunitiesAPI.updateStatus(opportunityId, newStatus);
    } catch (err) {
      console.error('Error updating opportunity status:', err);
      setError('Error al actualizar el estado de la oportunidad');
      // Reload to get correct state
      loadOpportunities();
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `Hace ${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`;
  };

  const OpportunityCard: React.FC<{ opportunity: OpportunityDto; index: number }> = ({ 
    opportunity, 
    index 
  }) => (
    <Draggable draggableId={opportunity.id.toString()} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            mb: 2,
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
            boxShadow: snapshot.isDragging ? 4 : 1,
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
          }}
        >
          <CardContent>
            <Stack spacing={1.5}>
              {/* Time ago */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Chip
                  icon={<TimeIcon />}
                  label={formatTimeAgo(opportunity.received_at)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={opportunity.channel}
                  size="small"
                  color="default"
                />
              </Box>

              <Divider />

              {/* Contact Name */}
              {opportunity.contact_name && (
                <Typography variant="subtitle1" fontWeight="bold">
                  {opportunity.contact_name}
                </Typography>
              )}

              {/* Email */}
              {opportunity.email && (
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {opportunity.email}
                  </Typography>
                </Box>
              )}

              {/* Phone */}
              {opportunity.phone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {opportunity.phone}
                  </Typography>
                </Box>
              )}

              {/* Mobile */}
              {opportunity.mobile && (
                <Box display="flex" alignItems="center" gap={1}>
                  <MobileIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {opportunity.mobile}
                  </Typography>
                </Box>
              )}

              {/* Property ID */}
              {opportunity.property_id && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PropertyIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Propiedad: #{opportunity.property_id}
                  </Typography>
                </Box>
              )}

              {/* Messages count */}
              {opportunity.messages && opportunity.messages.length > 0 && (
                <Box display="flex" alignItems="center" gap={1}>
                  <MessageIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {opportunity.messages.length} mensaje{opportunity.messages.length > 1 ? 's' : ''}
                  </Typography>
                  <Tooltip title={opportunity.messages.join('\n')} arrow>
                    <IconButton size="small">
                      <MessageIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const KanbanColumn: React.FC<{ 
    status: OpportunityStatus; 
    opportunities: OpportunityDto[] 
  }> = ({ status, opportunities: columnOpportunities }) => {
    const config = statusConfig[status];
    
    return (
      <Paper
        elevation={2}
        sx={{
          minWidth: 300,
          maxWidth: 300,
          height: 'calc(100vh - 300px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: config.color,
        }}
      >
        <Box sx={{ p: 2, borderBottom: '2px solid #ccc' }}>
          <Typography variant="h6" gutterBottom>
            {config.label}
          </Typography>
          <Chip 
            label={columnOpportunities.length} 
            size="small" 
            color="primary"
          />
        </Box>
        
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                p: 2,
                flexGrow: 1,
                overflowY: 'auto',
                backgroundColor: snapshot.isDraggingOver 
                  ? 'rgba(0, 0, 0, 0.05)' 
                  : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
            >
              {columnOpportunities.map((opp, index) => (
                <OpportunityCard key={opp.id} opportunity={opp} index={index} />
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </Paper>
    );
  };

  const KanbanBoard: React.FC = () => {
    const groupedOpportunities: Record<OpportunityStatus, OpportunityDto[]> = {
      pending_contact: [],
      waiting_response: [],
      evolved: [],
      take_action: [],
      frozen: [],
      appraisals: [],
      rental_agency: [],
      rental_outsourced: [],
    };

    opportunities.forEach((opp) => {
      if (groupedOpportunities[opp.status]) {
        groupedOpportunities[opp.status].push(opp);
      }
    });

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
          }}
        >
          {(Object.keys(statusConfig) as OpportunityStatus[]).map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              opportunities={groupedOpportunities[status]}
            />
          ))}
        </Box>
      </DragDropContext>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Oportunidades
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Ventas" />
          <Tab label="Alquileres" />
        </Tabs>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <KanbanBoard />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <KanbanBoard />
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default OpportunitiesView;

