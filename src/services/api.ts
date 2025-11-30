import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// API types
export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'STARTER' | 'INSIGHT' | 'PRO';
  effectivePlan: 'STARTER' | 'INSIGHT' | 'PRO';
  trialEndsAt: string | null;
  isTrialActive: boolean;
  limits: {
    maxCompetitors: number;
    maxProperties: number;
    updateIntervalHours: number;
    horizonDays: number;
    hasHistory: boolean;
    hasAlerts: boolean;
  };
  createdAt: string;
}

export interface Price {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

// API functions
export async function getMe(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export async function getPrices(): Promise<{ prices: Price[] }> {
  const response = await api.get<{ prices: Price[] }>('/billing/prices');
  return response.data;
}

export async function createCheckoutSession(priceId: string): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>('/billing/checkout', { priceId });
  return response.data;
}

export async function createPortalSession(): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>('/billing/portal');
  return response.data;
}
