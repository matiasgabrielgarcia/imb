import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../services/api';

interface PropertyImage {
  id: number;
  property_id: number;
  url: string;
  thumbnail_url: string;
  is_primary: boolean;
  created_at: string;
}

interface PropertyImageUploadProps {
  propertyId: number;
  images: PropertyImage[];
  onImagesChange: () => void;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  propertyId,
  images,
  onImagesChange
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('isPrimary', (images.length === 0).toString());

        await api.post(`/properties/${propertyId}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      onImagesChange();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [propertyId, images.length, onImagesChange]);

  const handleDelete = async (imageId: number) => {
    try {
      await api.delete(`/properties/${propertyId}/images/${imageId}`);
      onImagesChange();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await api.put(`/properties/${propertyId}/images/${imageId}/primary`);
      onImagesChange();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set primary image');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Button>
        {uploading && <CircularProgress size={24} />}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {images.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No images uploaded yet. Upload your first image!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={image.url}
                  alt="Property image"
                  sx={{ objectFit: 'cover' }}
                />
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    {image.is_primary && (
                      <Chip
                        label="Primary"
                        size="small"
                        color="primary"
                        icon={<StarIcon />}
                      />
                    )}
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleSetPrimary(image.id)}
                      disabled={image.is_primary}
                      title="Set as primary"
                    >
                      {image.is_primary ? <StarIcon color="primary" /> : <StarBorderIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(image.id)}
                      color="error"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PropertyImageUpload;

