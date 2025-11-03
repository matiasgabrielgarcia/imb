import { useQuery } from '@tanstack/react-query';
import { propertiesAPI, salesAPI, rentalsAPI, PropertyDto, SaleDto, RentalDto } from '../services/api';

export interface PropertyWithDetails extends PropertyDto {
  ventas: SaleDto[];
  alquileres: RentalDto[];
}

const keys = {
  all: ['properties-with-details'] as const,
  detail: (id: number) => [...keys.all, id] as const,
};

export const usePropertyWithDetails = (id: number) => {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async (): Promise<PropertyWithDetails> => {
      const [property, sales, rentals] = await Promise.all([
        propertiesAPI.get(id),
        salesAPI.getByProperty(id),
        rentalsAPI.getByProperty(id),
      ]);

      return {
        ...property,
        ventas: sales,
        alquileres: rentals,
      };
    },
    enabled: !!id,
  });
};
