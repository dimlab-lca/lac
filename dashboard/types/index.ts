// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

// User and Authentication Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AdminUser;
}

// Client Types
export interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address?: string;
  created_at: string;
  is_active: boolean;
  total_spent: number;
}

export interface ClientFormData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address?: string;
}

// Ad Space Types
export interface AdSpace {
  id: string;
  name: string;
  position: string;
  dimensions: {
    width: number;
    height: number;
  };
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
  is_active: boolean;
  created_at: string;
}

export interface AdSpaceFormData {
  name: string;
  position: string;
  dimensions: {
    width: number;
    height: number;
  };
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
}

// Order Types
export interface AdOrder {
  id: string;
  client_id: string;
  ad_space_id: string;
  content_type: 'image' | 'video' | 'html';
  content_url?: string;
  content_html?: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  total_amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'overdue';
  created_at: string;
  impressions: number;
  clicks: number;
  client?: Client;
  ad_space?: AdSpace;
}

export interface OrderFormData {
  client_id: string;
  ad_space_id: string;
  content_type: 'image' | 'video' | 'html';
  content_url?: string;
  content_html?: string;
  start_date: string;
  end_date: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  order_id: string;
  client_id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: string;
  created_at: string;
}

// Dashboard Statistics
export interface DashboardStats {
  total_clients: number;
  active_orders: number;
  monthly_revenue: number;
  total_impressions: number;
  total_clicks: number;
  pending_payments: number;
}

// Analytics Types
export interface RevenueAnalytics {
  monthly_revenue: Array<{
    month: string;
    revenue: number;
    orders_count: number;
  }>;
  total_revenue: number;
  average_monthly_revenue: number;
  growth_rate: number;
}

export interface PerformanceAnalytics {
  performance_data: Array<{
    order_id: string;
    client_name: string;
    ad_space_name: string;
    impressions: number;
    clicks: number;
    ctr: number;
    amount: number;
    status: string;
  }>;
  total_impressions: number;
  total_clicks: number;
  average_ctr: number;
}

// Table and UI Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

// Filter Types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterState {
  [key: string]: string | string[] | number | boolean;
}

// Export utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type ContentType = 'image' | 'video' | 'html';
export type OrderStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type UserRole = 'admin' | 'editor';