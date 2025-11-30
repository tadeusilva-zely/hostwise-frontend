// Re-export types from api
export type { User, Price } from '../services/api';

// Plan types
export type Plan = 'STARTER' | 'INSIGHT' | 'PRO';

export interface PlanLimits {
  maxCompetitors: number;
  maxProperties: number;
  updateIntervalHours: number;
  horizonDays: number;
  hasHistory: boolean;
  hasAlerts: boolean;
}

// Future types (placeholder for when we implement features)
export interface Competitor {
  id: string;
  name: string;
  bookingUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface PriceData {
  id: string;
  date: string;
  price: number | null;
  currency: string;
  available: boolean;
}
