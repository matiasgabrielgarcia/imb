import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

interface PropertyImage {
  id: number;
  property_id: number;
  url: string;
  thumbnail_url: string;
  is_primary: boolean;
  created_at: string;
}

export const usePropertyImages = (propertyId: number) => {
  return useQuery({
    queryKey: ['properties', propertyId, 'images'],
    queryFn: async () => {
      const response = await api.get<PropertyImage[]>(`/properties/${propertyId}/images`);
      return response.data;
    },
    enabled: !!propertyId,
  });
};

export const usePrimaryImage = (propertyId: number) => {
  return useQuery({
    queryKey: ['properties', propertyId, 'images', 'primary'],
    queryFn: async () => {
      const response = await api.get<PropertyImage | null>(`/properties/${propertyId}/images/primary`);
      return response.data;
    },
    enabled: !!propertyId,
  });
};

