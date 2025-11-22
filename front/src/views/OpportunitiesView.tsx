import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Tooltip,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  DialogContentText,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as PropertyIcon,
  Message as MessageIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Note as NoteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  opportunitiesAPI, 
  OpportunityDto, 
  OpportunityNoteDto,
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
  const navigate = useNavigate();
  const location = useLocation();
  const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<number>(1); // Default 1 month
  const [editingPhone, setEditingPhone] = useState<{ id: number; phone: string; mobile: string } | null>(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneConfirmDialogOpen, setPhoneConfirmDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityDto | null>(null);
  const [notes, setNotes] = useState<OpportunityNoteDto[]>([]);
  const [newNote, setNewNote] = useState('');
  const [notesCounts, setNotesCounts] = useState<Record<number, number>>({});
  
  // Determine tab based on route
  const getTabFromPath = (path: string): number => {
    if (path.includes('/alquileres')) return 1;
    return 0; // Default to ventas
  };
  
  const tabValue = getTabFromPath(location.pathname);

  useEffect(() => {
    // Redirect to /ventas if on base /oportunidades route
    if (location.pathname === '/oportunidades') {
      navigate('/oportunidades/ventas', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    loadOpportunities();
  }, [tabValue, dateFilter]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const type: OpportunityType = tabValue === 0 ? 'sale' : 'rental';
      const data = await opportunitiesAPI.getAll(type, undefined, dateFilter);
      setOpportunities(data.opportunities);

      // Load notes counts for all opportunities
      const counts: Record<number, number> = {};
      await Promise.all(
        data.opportunities.map(async (opp) => {
          try {
            const notesData = await opportunitiesAPI.getNotes(opp.id);
            counts[opp.id] = notesData.notes?.length || 0;
          } catch (err) {
            console.error(`Error loading notes count for opportunity ${opp.id}:`, err);
            counts[opp.id] = 0;
          }
        })
      );
      setNotesCounts(counts);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setError('No se pudieron cargar las oportunidades. Asegúrate de que el servidor wapp esté ejecutándose en el puerto 3005.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const path = newValue === 0 ? '/oportunidades/ventas' : '/oportunidades/alquileres';
    navigate(path);
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

  const formatTimeAgo = (dateString: string | undefined, fallbackDateString?: string): string => {
    const dateStr = dateString || fallbackDateString;
    if (!dateStr) return 'Fecha no disponible';
    
    const date = new Date(dateStr);
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

  const formatFullDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const openWhatsApp = (phoneNumber: string) => {
    // Clean phone number (remove spaces, dashes, parentheses, plus signs)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    // Open WhatsApp Web in a new tab
    window.open(`https://web.whatsapp.com/send?phone=${cleanPhone}`, '_blank');
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
            // Highlight frozen cards
            ...(opportunity.status === 'frozen' && {
              border: '2px solid #f44336',
              backgroundColor: '#ffebee',
            }),
          }}
        >
          <CardContent>
            <Stack spacing={1.5}>
              {/* Time ago - use status_updated_at if available, otherwise received_at */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Tooltip 
                  title={formatFullDateTime(opportunity.status_updated_at || opportunity.received_at)} 
                  arrow
                >
                  <Chip
                    icon={<TimeIcon />}
                    label={formatTimeAgo(opportunity.status_updated_at, opportunity.received_at)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Tooltip>
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

              {/* Phone - Show phone or mobile (prefer phone) with edit button */}
              {(opportunity.phone || opportunity.mobile) && (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={1}
                  sx={{
                    padding: '4px 0',
                    borderRadius: '4px',
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    onClick={(e) => {
                      e.stopPropagation();
                      const phoneNumber = opportunity.phone || opportunity.mobile;
                      if (phoneNumber) openWhatsApp(phoneNumber);
                    }}
                    sx={{
                      cursor: 'pointer',
                      flex: 1,
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 211, 102, 0.1)',
                      },
                    }}
                  >
                    <PhoneIcon fontSize="small" color="success" />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#25d366',
                        fontWeight: 500,
                        textDecoration: 'underline',
                      }}
                    >
                      {opportunity.phone || opportunity.mobile}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPhone({
                        id: opportunity.id,
                        phone: opportunity.phone || '',
                        mobile: opportunity.mobile || '',
                      });
                      setPhoneDialogOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Property ID with link */}
              {opportunity.property_id && (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/propiedades/${opportunity.property_id}`);
                  }}
                  sx={{
                    cursor: 'pointer',
                    padding: '4px 0',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <PropertyIcon fontSize="small" color="primary" />
                  <Link
                    component="button"
                    variant="body2"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/propiedades/${opportunity.property_id}`);
                    }}
                    sx={{
                      textDecoration: 'underline',
                      color: 'primary.main',
                      fontWeight: 500,
                    }}
                  >
                    Propiedad #{opportunity.property_id}
                  </Link>
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

              {/* Notes button */}
              <Box 
                display="flex" 
                alignItems="center" 
                gap={1}
                onClick={async (e) => {
                  e.stopPropagation();
                  setSelectedOpportunity(opportunity);
                  setNotesDialogOpen(true);
                  try {
                    const notesData = await opportunitiesAPI.getNotes(opportunity.id);
                    setNotes(notesData.notes || []);
                    // Update count in state
                    setNotesCounts((prev) => ({
                      ...prev,
                      [opportunity.id]: notesData.notes?.length || 0,
                    }));
                  } catch (err) {
                    console.error('Error loading notes:', err);
                    setNotes([]);
                  }
                }}
                sx={{
                  cursor: 'pointer',
                  padding: '4px 0px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <NoteIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Notas{(notesCounts[opportunity.id] || 0) > 0 ? ` (${notesCounts[opportunity.id]})` : ''}
                </Typography>
              </Box>
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

      {/* Date filter */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtro de fecha</InputLabel>
          <Select
            value={dateFilter}
            label="Filtro de fecha"
            onChange={(e) => setDateFilter(e.target.value as number)}
          >
            <MenuItem value={1}>Último mes</MenuItem>
            <MenuItem value={2}>Últimos 2 meses</MenuItem>
            <MenuItem value={3}>Últimos 3 meses</MenuItem>
          </Select>
        </FormControl>
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

      {/* Phone Edit Dialog */}
      <Dialog open={phoneDialogOpen} onClose={() => setPhoneDialogOpen(false)}>
        <DialogTitle>Editar Teléfono</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas editar el teléfono? Esto afectará la comunicación con el cliente.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Teléfono"
            type="tel"
            fullWidth
            variant="outlined"
            value={editingPhone?.phone || ''}
            onChange={(e) => setEditingPhone({
              ...editingPhone!,
              phone: e.target.value,
            })}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Móvil"
            type="tel"
            fullWidth
            variant="outlined"
            value={editingPhone?.mobile || ''}
            onChange={(e) => setEditingPhone({
              ...editingPhone!,
              mobile: e.target.value,
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhoneDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              // Close edit dialog and open confirm dialog
              setPhoneDialogOpen(false);
              setPhoneConfirmDialogOpen(true);
            }}
            variant="contained"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Phone Confirm Dialog */}
      <Dialog
        open={phoneConfirmDialogOpen}
        onClose={() => setPhoneConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirmar Cambio de Teléfono</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas guardar estos cambios de teléfono? 
            Esto afectará la comunicación con el cliente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhoneConfirmDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (!editingPhone) return;
              
              try {
                await opportunitiesAPI.update(editingPhone.id, {
                  phone: editingPhone.phone || undefined,
                  mobile: editingPhone.mobile || undefined,
                });
                setPhoneConfirmDialogOpen(false);
                setPhoneDialogOpen(false);
                setEditingPhone(null);
                loadOpportunities();
              } catch (err) {
                console.error('Error updating phone:', err);
                setError('Error al actualizar el teléfono');
                setPhoneConfirmDialogOpen(false);
              }
            }}
            variant="contained"
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog
        open={notesDialogOpen}
        onClose={() => {
          setNotesDialogOpen(false);
          setSelectedOpportunity(null);
          setNotes([]);
          setNewNote('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Notas - {selectedOpportunity?.contact_name || `Oportunidad #${selectedOpportunity?.id}`}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, '&.MuiDialogContent-root': { paddingTop: '24px !important' } }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Nueva nota"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              variant="outlined"
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={async () => {
                if (!newNote.trim() || !selectedOpportunity) return;
                
                try {
                  await opportunitiesAPI.createNote(selectedOpportunity.id, newNote.trim());
                  const notesData = await opportunitiesAPI.getNotes(selectedOpportunity.id);
                  setNotes(notesData.notes || []);
                  setNewNote('');
                  // Update notes count
                  if (selectedOpportunity) {
                    setNotesCounts((prev) => ({
                      ...prev,
                      [selectedOpportunity.id]: notesData.notes?.length || 0,
                    }));
                  }
                } catch (err) {
                  console.error('Error creating note:', err);
                  setError('Error al crear la nota');
                }
              }}
              sx={{ mt: 1 }}
            >
              Agregar nota
            </Button>
          </Box>
          
          <List>
            {notes.map((note) => (
              <ListItem key={note.id}>
                <ListItemText
                  primary={note.note}
                  secondary={new Date(note.created_at).toLocaleString('es-AR')}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={async () => {
                      if (!selectedOpportunity) return;
                      const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta nota?');
                      if (confirmed) {
                        try {
                          await opportunitiesAPI.deleteNote(selectedOpportunity.id, note.id);
                          const notesData = await opportunitiesAPI.getNotes(selectedOpportunity.id);
                          setNotes(notesData.notes || []);
                          // Update notes count
                          if (selectedOpportunity) {
                            setNotesCounts((prev) => ({
                              ...prev,
                              [selectedOpportunity.id]: notesData.notes?.length || 0,
                            }));
                          }
                        } catch (err) {
                          console.error('Error deleting note:', err);
                          setError('Error al eliminar la nota');
                        }
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {notes.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No hay notas aún. Agrega una nueva nota arriba.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNotesDialogOpen(false);
            setSelectedOpportunity(null);
            setNotes([]);
            setNewNote('');
          }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OpportunitiesView;

