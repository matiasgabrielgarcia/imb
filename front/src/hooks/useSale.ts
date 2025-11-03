import { useQuery } from '@tanstack/react-query';
import { salesAPI, propertiesAPI, SaleDto, PropertyDto } from '../services/api';

const keys = {
  all: ['sales'] as const,
  detail: (id: number) => [...keys.all, id] as const,
  byProperty: (propertyId: number, saleId: number) => [...keys.all, 'property', propertyId, saleId] as const,
};

export const useSale = (propertyId: number, saleId: number) => {
  return useQuery({
    queryKey: keys.byProperty(propertyId, saleId),
    queryFn: async (): Promise<{ sale: SaleDto; property: PropertyDto }> => {
      const [sale, property] = await Promise.all([
        salesAPI.get(saleId),
        propertiesAPI.get(propertyId),
      ]);
      return { sale, property };
    },
    enabled: !!propertyId && !!saleId,
  });
};
