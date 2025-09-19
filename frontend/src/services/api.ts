import axios, { AxiosInstance } from 'axios';
import { toast } from 'react-toastify';

// API base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Send httpOnly cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login or show message
          toast.error(data.message || 'Unauthorized access');
          // You might want to redirect to login here
          // window.location.href = '/login';
          break;
        case 403:
          toast.error('Access forbidden');
          break;
        case 404:
          toast.error(data.message || 'Resource not found');
          break;
        case 409:
          toast.error(data.message || 'Conflict error');
          break;
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((error: any) => {
              toast.error(error.msg || error.message);
            });
          } else {
            toast.error(data.message || 'Validation error');
          }
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// API endpoints

// Authentication
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  updateProfile: (data: { firstName?: string; lastName?: string }) => 
    api.put('/auth/profile', data),
};

// Leads
export const leadsAPI = {
  // Get all leads with pagination and filtering
  getLeads: (params: {
    page?: number;
    limit?: number;
    sort?: string;
    filters?: string;
  }) => api.get('/leads', { params }),
  
  // Get single lead
  getLead: (id: string) => api.get(`/leads/${id}`),
  
  // Create new lead
  createLead: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company: string;
    city: string;
    state: string;
    source: string;
    status?: string;
    score: number;
    lead_value: number;
    is_qualified?: boolean;
  }) => api.post('/leads', data),
  
  // Update lead
  updateLead: (id: string, data: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company: string;
    city: string;
    state: string;
    source: string;
    status: string;
    score: number;
    lead_value: number;
    is_qualified: boolean;
    last_activity_at: string;
  }>) => api.put(`/leads/${id}`, data),
  
  // Delete lead
  deleteLead: (id: string) => api.delete(`/leads/${id}`),
  
  // Get stats
  getStats: () => api.get('/leads/stats/summary'),
};

// Type definitions for API responses
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Lead {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  source: 'website' | 'facebook_ads' | 'google_ads' | 'referral' | 'events' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  score: number;
  lead_value: number;
  last_activity_at?: string;
  is_qualified: boolean;
  user: string;
  created_at: string;
  updated_at: string;
  full_name?: string;
}

export interface LeadsResponse {
  data: Lead[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LeadStats {
  summary: {
    total: number;
    totalValue: number;
    averageScore: number;
    qualified: number;
  };
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  bySource: Array<{
    _id: string;
    count: number;
  }>;
}

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await authAPI.getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
};

export default api;