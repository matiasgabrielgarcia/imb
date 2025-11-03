import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertiesAPI, CreatePropertyRequest, UpdatePropertyRequest, PropertyDto } from '../services/api';

const keys = {
  all: ['properties'] as const,
  detail: (id: number) => [...keys.all, id] as const,
};

export const useListProperties = () => {
  return useQuery({ queryKey: keys.all, queryFn: propertiesAPI.list });
};

export const useGetProperty = (id: number) => {
  return useQuery({ queryKey: keys.detail(id), queryFn: () => propertiesAPI.get(id), enabled: !!id });
};

export const useCreateProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => propertiesAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
};

export const useUpdateProperty = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePropertyRequest) => propertiesAPI.update(id, data),
    onSuccess: (updated: PropertyDto) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.setQueryData(keys.detail(id), updated);
    },
  });
};

export const useDeleteProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => propertiesAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
};


