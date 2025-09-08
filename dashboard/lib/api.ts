import axios from 'axios';
import type {
  AdminUser,
  Client,
  ClientFormData,
  AdSpace,
  AdSpaceFormData,
  AdOrder,
  OrderFormData,
  DashboardStats,
  RevenueAnalytics,
  PerformanceAnalytics,
  LoginCredentials,
  AuthResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  getCurrentUser: async (): Promise<AdminUser> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Admin Users API
export const adminUsersApi = {
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  createUser: async (userData: Omit<AdminUser, 'id' | 'created_at' | 'last_login'> & { password: string }): Promise<AdminUser> => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};

// Clients API
export const clientsApi = {
  getClients: async (): Promise<Client[]> => {
    const response = await api.get('/admin/clients');
    return response.data;
  },

  getClient: async (id: string): Promise<Client> => {
    const response = await api.get(`/admin/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData: ClientFormData): Promise<Client> => {
    const response = await api.post('/admin/clients', clientData);
    return response.data;
  },

  updateClient: async (id: string, clientData: ClientFormData): Promise<Client> => {
    const response = await api.put(`/admin/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id: string): Promise<void> => {
    await api.delete(`/admin/clients/${id}`);
  },
};

// Ad Spaces API
export const adSpacesApi = {
  getAdSpaces: async (): Promise<AdSpace[]> => {
    const response = await api.get('/admin/ad-spaces');
    return response.data;
  },

  createAdSpace: async (adSpaceData: AdSpaceFormData): Promise<AdSpace> => {
    const response = await api.post('/admin/ad-spaces', adSpaceData);
    return response.data;
  },

  updateAdSpace: async (id: string, adSpaceData: AdSpaceFormData): Promise<AdSpace> => {
    const response = await api.put(`/admin/ad-spaces/${id}`, adSpaceData);
    return response.data;
  },

  deleteAdSpace: async (id: string): Promise<void> => {
    await api.delete(`/admin/ad-spaces/${id}`);
  },
};

// Orders API
export const ordersApi = {
  getOrders: async (): Promise<AdOrder[]> => {
    const response = await api.get('/admin/ad-orders');
    return response.data;
  },

  createOrder: async (orderData: OrderFormData): Promise<AdOrder> => {
    const response = await api.post('/admin/ad-orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: { status?: string; payment_status?: string }): Promise<void> => {
    await api.put(`/admin/ad-orders/${id}/status`, status);
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/admin/ad-orders/${id}`);
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    const response = await api.get('/admin/analytics/revenue');
    return response.data;
  },

  getPerformanceAnalytics: async (): Promise<PerformanceAnalytics> => {
    const response = await api.get('/admin/analytics/performance');
    return response.data;
  },
};

// Public API for ad display and tracking
export const publicApi = {
  getAdsForPosition: async (position: string) => {
    const response = await api.get(`/public/ads/${position}`);
    return response.data;
  },

  recordAdClick: async (orderId: string): Promise<void> => {
    await api.post(`/public/ads/${orderId}/click`);
  },
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;