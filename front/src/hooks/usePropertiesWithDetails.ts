import { useQuery } from '@tanstack/react-query';
import { propertiesAPI, salesAPI, rentalsAPI, PropertyDto, SaleDto, RentalDto } from '../services/api';

export interface PropertyWithDetails extends PropertyDto {
  ventas: SaleDto[];
  alquileres: RentalDto[];
}

const keys = {
  all: ['properties-with-details'] as const,
};

export const usePropertiesWithDetails = () => {
  return useQuery({
    queryKey: keys.all,
    queryFn: async (): Promise<PropertyWithDetails[]> => {
      // Fetch all data in parallel
      const [properties, sales, rentals] = await Promise.all([
        propertiesAPI.list(),
        salesAPI.list(),
        rentalsAPI.list(),
      ]);

      // Group sales and rentals by property_id
      const salesByProperty = sales.reduce((acc, sale) => {
        if (!acc[sale.property_id]) {
          acc[sale.property_id] = [];
        }
        acc[sale.property_id].push(sale);
        return acc;
      }, {} as Record<number, SaleDto[]>);

      const rentalsByProperty = rentals.reduce((acc, rental) => {
        if (!acc[rental.property_id]) {
          acc[rental.property_id] = [];
        }
        acc[rental.property_id].push(rental);
        return acc;
      }, {} as Record<number, RentalDto[]>);

      // Combine properties with their sales and rentals
      return properties.map(property => ({
        ...property,
        ventas: salesByProperty[property.id] || [],
        alquileres: rentalsByProperty[property.id] || [],
      }));
    },
  });
};
