import { useQuery } from '@tanstack/react-query';
import { rentalsAPI, propertiesAPI, RentalDto, PropertyDto } from '../services/api';

const keys = {
  all: ['rentals'] as const,
  detail: (id: number) => [...keys.all, id] as const,
  byProperty: (propertyId: number, rentalId: number) => [...keys.all, 'property', propertyId, rentalId] as const,
};

export const useRental = (propertyId: number, rentalId: number) => {
  return useQuery({
    queryKey: keys.byProperty(propertyId, rentalId),
    queryFn: async (): Promise<{ rental: RentalDto; property: PropertyDto }> => {
      const [rental, property] = await Promise.all([
        rentalsAPI.get(rentalId),
        propertiesAPI.get(propertyId),
      ]);
      return { rental, property };
    },
    enabled: !!propertyId && !!rentalId,
  });
};
