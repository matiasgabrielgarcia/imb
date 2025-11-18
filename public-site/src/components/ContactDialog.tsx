import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { propertyService, Property, ContactFormData } from '../services/api';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  property: Property;
  opportunityType: 'sale' | 'rental';
}

const ContactDialog: React.FC<ContactDialogProps> = ({
  open,
  onClose,
  property,
  opportunityType,
}) => {
  const [formData, setFormData] = useState({
    contact_name: '',
    email: '',
    phone: '',
    mobile: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.contact_name) {
      setError('Por favor, ingresa tu nombre');
      return;
    }
    
    if (!formData.email && !formData.phone && !formData.mobile) {
      setError('Por favor, proporciona al menos un método de contacto');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const contactData: ContactFormData = {
        property_id: property.id,
        contact_name: formData.contact_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        mobile: formData.mobile || undefined,
        message: formData.message || undefined,
        opportunity_type: opportunityType,
      };

      await propertyService.submitContact(contactData);
      setSuccess(true);

      // Reset form after 2 seconds and close dialog
      setTimeout(() => {
        setFormData({
          contact_name: '',
          email: '',
          phone: '',
          mobile: '',
          message: '',
        });
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setError(err.response?.data?.error || 'Error al enviar tu consulta. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        contact_name: '',
        email: '',
        phone: '',
        mobile: '',
        message: '',
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Consultar sobre Propiedad #{property.numero}
        <Typography variant="body2" color="text.secondary">
          {opportunityType === 'sale' ? 'Venta' : 'Alquiler'} - {property.direccion}
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success">
                ¡Gracias por tu consulta! Nos pondremos en contacto contigo pronto.
              </Alert>
            )}

            <TextField
              label="Nombre completo"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading || success}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              disabled={loading || success}
              helperText="Proporciona al menos un método de contacto"
            />

            <TextField
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              disabled={loading || success}
            />

            <TextField
              label="Celular"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              fullWidth
              disabled={loading || success}
            />

            <TextField
              label="Mensaje (opcional)"
              name="message"
              value={formData.message}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              disabled={loading || success}
              placeholder="Cuéntanos más sobre tu interés en esta propiedad..."
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || success}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Enviando...' : 'Enviar Consulta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactDialog;

