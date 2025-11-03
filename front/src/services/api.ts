import axios from 'axios';

const API_BASE_URL = '/api';// import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear tokens and redirect if we have a token (meaning user was logged in)
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // If no token, it's likely a login attempt failure - don't redirect
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    twoFactorEnabled: boolean;
  };
  userId?: number;
  requiresTwoFactor?: boolean;
}

export interface TwoFactorRequest {
  userId: number;
  token: string;
}

export interface TwoFactorResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    twoFactorEnabled: boolean;
  };
}

export interface Setup2FAResponse {
  message: string;
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export const authAPI = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/auth/login', data).then(res => res.data),

  verify2FA: (data: TwoFactorRequest): Promise<TwoFactorResponse> =>
    api.post('/auth/verify-2fa', data).then(res => res.data),

  setup2FA: (userId: number): Promise<Setup2FAResponse> =>
    api.post('/auth/setup-2fa', { userId }).then(res => res.data),

  sendEmailCode: (email: string): Promise<{ message: string }> =>
    api.post('/auth/send-email-code', { email }).then(res => res.data),

  verifyEmailCode: (email: string, code: string): Promise<TwoFactorResponse> =>
    api.post('/auth/verify-email-code', { email, code }).then(res => res.data),
};

export default api;

// Properties API
export interface PropertyDto {
  id: number;
  numero: string;
  direccion: string;
  m2: number;
  cliente: string;
  fecha: string;
  rev: string;
  latitude: number;
  longitude: number;
}

export type CreatePropertyRequest = Omit<PropertyDto, 'id'>;
export type UpdatePropertyRequest = Partial<CreatePropertyRequest>;

export const propertiesAPI = {
  list: (): Promise<PropertyDto[]> => api.get('/properties').then(r => r.data),
  get: (id: number): Promise<PropertyDto> => api.get(`/properties/${id}`).then(r => r.data),
  create: (data: CreatePropertyRequest): Promise<PropertyDto> => api.post('/properties', data).then(r => r.data),
  update: (id: number, data: UpdatePropertyRequest): Promise<PropertyDto> => api.put(`/properties/${id}`, data).then(r => r.data),
  remove: (id: number): Promise<void> => api.delete(`/properties/${id}`).then(() => undefined),
};

// Sales API
export interface SaleDto {
  id: number;
  property_id: number;
  fecha: string;
  precio: number;
  algo: string;
  direccion: string;
  m2: number;
}

export type CreateSaleRequest = Omit<SaleDto, 'id'>;
export type UpdateSaleRequest = Partial<CreateSaleRequest>;

export const salesAPI = {
  list: (): Promise<SaleDto[]> => api.get('/sales').then(r => r.data),
  get: (id: number): Promise<SaleDto> => api.get(`/sales/${id}`).then(r => r.data),
  getByProperty: (propertyId: number): Promise<SaleDto[]> => api.get(`/sales/property/${propertyId}`).then(r => r.data),
  create: (data: CreateSaleRequest): Promise<SaleDto> => api.post('/sales', data).then(r => r.data),
  update: (id: number, data: UpdateSaleRequest): Promise<SaleDto> => api.put(`/sales/${id}`, data).then(r => r.data),
  remove: (id: number): Promise<void> => api.delete(`/sales/${id}`).then(() => undefined),
};

// Rentals API
export interface RentalDto {
  id: number;
  property_id: number;
  contract_number: string;
  start_date: string;
  end_date: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  monthly_rent: number;
  deposit: number;
  tenant_name: string;
  tenant_email?: string;
  tenant_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RentalPriceHistoryDto {
  id: number;
  rental_id: number;
  price: number;
  effective_date: string;
  reason?: string;
  created_at: string;
}

export type CreateRentalRequest = Omit<RentalDto, 'id' | 'created_at' | 'updated_at'>;
export type UpdateRentalRequest = Partial<CreateRentalRequest>;
export type AddPriceChangeRequest = Omit<RentalPriceHistoryDto, 'id' | 'created_at'>;

export const rentalsAPI = {
  list: (status?: string): Promise<RentalDto[]> => {
    const params = status ? { status } : {};
    return api.get('/rentals', { params }).then(r => r.data);
  },
  get: (id: number): Promise<RentalDto> => api.get(`/rentals/${id}`).then(r => r.data),
  getByProperty: (propertyId: number): Promise<RentalDto[]> => api.get(`/rentals/property/${propertyId}`).then(r => r.data),
  create: (data: CreateRentalRequest): Promise<RentalDto> => api.post('/rentals', data).then(r => r.data),
  update: (id: number, data: UpdateRentalRequest): Promise<RentalDto> => api.put(`/rentals/${id}`, data).then(r => r.data),
  remove: (id: number): Promise<void> => api.delete(`/rentals/${id}`).then(() => undefined),
  
  // Price history methods
  getPriceHistory: (id: number): Promise<RentalPriceHistoryDto[]> => 
    api.get(`/rentals/${id}/price-history`).then(r => r.data),
  addPriceChange: (id: number, data: AddPriceChangeRequest): Promise<RentalPriceHistoryDto> => 
    api.post(`/rentals/${id}/price-change`, data).then(r => r.data),
  getCurrentPrice: (id: number): Promise<{ current_price: number }> => 
    api.get(`/rentals/${id}/current-price`).then(r => r.data),
};