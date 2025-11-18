import axios from 'axios';

// Use relative path to leverage Vite's proxy configuration
// In development: proxy forwards /api to http://localhost:3000/api
// In production: set VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Property {
  id: number;
  numero: string;
  direccion: string;
  m2: number;
  cliente: string;
  fecha: string;
  rev: string;
  latitude: number;
  longitude: number;
  ventas?: Sale[];
  alquileres?: Rental[];
}

export interface Sale {
  id: number;
  precio: number;
  fecha: string;
  algo: string;
  direccion: string;
  m2: number;
}

export interface Rental {
  id: number;
  contract_number: string;
  monthly_rent: number;
  status: string;
  start_date: string;
  end_date: string;
  tenant_name?: string;
}

export interface ContactFormData {
  property_id: number;
  contact_name: string;
  email?: string;
  phone?: string;
  message?: string;
  opportunity_type: 'sale' | 'rental';
}

export const propertyService = {
  // Get all properties
  getAllProperties: async (): Promise<Property[]> => {
    const response = await api.get('/public/properties');
    return response.data;
  },

  // Get properties for sale
  getPropertiesForSale: async (): Promise<Property[]> => {
    const response = await api.get('/public/properties/for-sale');
    return response.data;
  },

  // Get properties for rent
  getPropertiesForRent: async (): Promise<Property[]> => {
    const response = await api.get('/public/properties/for-rent');
    return response.data;
  },

  // Get property by id
  getPropertyById: async (id: number): Promise<Property> => {
    const response = await api.get(`/public/properties/${id}`);
    return response.data;
  },

  // Submit contact form (create opportunity)
  submitContact: async (data: ContactFormData): Promise<any> => {
    const response = await api.post('/public/contact', data);
    return response.data;
  },
};

export default api;

