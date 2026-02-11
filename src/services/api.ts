import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Tour types
export type TourPage = 'dashboard' | 'rates' | 'reviews' | 'occupancy';

export interface TourPreferences {
  seen: Record<TourPage, boolean>;
  dismissCount: Record<TourPage, number>;
}

// API types
export interface Organization {
  id: string;
  name: string;
  cnpj: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'OWNER' | 'MEMBER';
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
    aiMessagesPerMonth: number;
  };
  tourPreferences: TourPreferences | null;
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

export interface Invitation {
  id: string;
  email: string;
  token: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
  createdAt: string;
}

// Auth API
export async function getMe(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

// Tour Preferences API
export async function updateTourPreferencesApi(
  data: Partial<TourPreferences>
): Promise<TourPreferences> {
  const response = await api.patch<{ tourPreferences: TourPreferences }>(
    '/users/me/tour-preferences',
    data
  );
  return response.data.tourPreferences;
}

// Invitations API
export async function getInvitations(): Promise<{ invitations: Invitation[] }> {
  const response = await api.get<{ invitations: Invitation[] }>('/auth/invitations');
  return response.data;
}

export async function createInvitationApi(email: string): Promise<{ invitation: Invitation; inviteUrl: string }> {
  const response = await api.post<{ invitation: Invitation; inviteUrl: string }>('/auth/invitations', { email });
  return response.data;
}

export async function revokeInvitationApi(id: string): Promise<void> {
  await api.delete(`/auth/invitations/${id}`);
}

export async function validateInvitation(token: string): Promise<{ email: string; organizationName: string }> {
  const response = await api.get<{ email: string; organizationName: string }>(`/auth/invitations/validate/${token}`);
  return response.data;
}

export async function acceptInvitationApi(data: { token: string; password: string; name: string; phone?: string }): Promise<{ user: User; token: string }> {
  const response = await api.post<{ user: User; token: string }>('/auth/invitations/accept', data);
  return response.data;
}

export async function getTeamMembers(): Promise<{ members: TeamMember[] }> {
  const response = await api.get<{ members: TeamMember[] }>('/auth/team');
  return response.data;
}

// Billing API
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

// ============================================
// HOTELS
// ============================================

export interface Hotel {
  id: string;
  name: string;
  bookingHotelId: string;
  isOwn: boolean;
  isActive: boolean;
  address: string | null;
  city: string | null;
  country: string | null;
  starRating: number | null;
  reviewScore: number | null;
  reviewCount: number | null;
  photoUrl: string | null;
  bookingUrl: string | null;
  lastFetchAt: string | null;
  dataFetchedAt: string | null;
  createdAt: string;
}

export interface HotelsResponse {
  ownHotels: Hotel[];
  competitorHotels: Hotel[];
  limits: {
    ownHotels: number;
    competitors: number;
  };
}

export interface HotelSearchResult {
  dest_id: string;
  dest_type: string;
  name: string;
  label: string;
  city_name: string;
  region: string;
  country: string;
  image_url: string;
  latitude: number;
  longitude: number;
  nr_hotels: number;
}

export interface LocationSearchResult {
  dest_id: string;
  dest_type: string;
  name: string;
  label: string;
  city_name: string;
  region: string;
  country: string;
  nr_hotels: number;
  image_url: string;
}

export interface HotelInLocationResult {
  hotel_id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  review_score: number;
  review_count: number;
  star_rating: number;
  price: number;
  currency: string;
  distance: string;
  photo_url: string;
}

export async function getHotels(): Promise<HotelsResponse> {
  const response = await api.get<HotelsResponse>('/hotels');
  return response.data;
}

export async function searchHotelApi(bookingUrl: string): Promise<HotelSearchResult[]> {
  const response = await api.post<HotelSearchResult[]>('/hotels/search', { bookingUrl });
  return response.data;
}

export async function searchLocationsApi(query: string): Promise<LocationSearchResult[]> {
  const response = await api.post<LocationSearchResult[]>('/hotels/search-locations', { query });
  return response.data;
}

export async function searchHotelsInLocationApi(destId: string, destType: string): Promise<HotelInLocationResult[]> {
  const response = await api.post<HotelInLocationResult[]>('/hotels/search-in-location', { destId, destType });
  return response.data;
}

export async function createHotelApi(data: {
  bookingUrl?: string;
  isOwn: boolean;
  bookingHotelId: string;
  name: string;
}): Promise<Hotel> {
  const response = await api.post<Hotel>('/hotels', data);
  return response.data;
}

export async function deleteHotelApi(id: string): Promise<void> {
  await api.delete(`/hotels/${id}`);
}

// ============================================
// RATES
// ============================================

export interface RateCompetitor {
  hotelId: string;
  hotelName: string;
  price: number | null;
}

export interface RateComparison {
  date: string;
  myHotel: number | null;
  competitors: RateCompetitor[];
  avgCompetitor: number | null;
  diff: number | null;
  position: 'cheaper' | 'average' | 'expensive' | null;
}

export interface RatesSummary {
  avgMyHotel: number;
  avgCompetitors: number;
  avgDiff: number;
  cheaper: number;
  expensive: number;
  average: number;
  total: number;
}

export interface RatesResponse {
  summary: RatesSummary;
  rates: RateComparison[];
  hotels: { id: string; name: string; isOwn: boolean }[];
}

export async function getRatesComparison(days: number, hotelId?: string): Promise<RatesResponse> {
  const response = await api.get<RatesResponse>('/rates/comparison', {
    params: { days, ...(hotelId ? { hotelId } : {}) },
  });
  return response.data;
}

// ============================================
// REVIEWS
// ============================================

export interface ReviewWithHotel {
  id: string;
  hotelId: string;
  hotelName: string;
  isOwnHotel: boolean;
  rating: number;
  title: string | null;
  positive: string | null;
  negative: string | null;
  reviewerName: string | null;
  reviewerCountry: string | null;
  reviewDate: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ReviewsSummary {
  avgRating: number;
  totalReviews: number;
  positive: number;
  neutral: number;
  negative: number;
  myAvgRating: number;
  competitorAvgRating: number;
  diff: number;
}

export interface ReviewsResponse {
  reviews: ReviewWithHotel[];
  pagination: { page: number; limit: number; total: number };
}

export async function getReviews(params: {
  hotelId?: string;
  sentiment?: string;
  page?: number;
  limit?: number;
}): Promise<ReviewsResponse> {
  const response = await api.get<ReviewsResponse>('/reviews', { params });
  return response.data;
}

export async function getReviewsSummary(hotelId?: string): Promise<ReviewsSummary> {
  const response = await api.get<ReviewsSummary>('/reviews/summary', {
    params: hotelId ? { hotelId } : undefined,
  });
  return response.data;
}

export interface AiReviewSummary {
  hotelId: string;
  hotelName: string;
  isOwnHotel: boolean;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  trendInsight: string;
  reviewCount: number;
  generatedAt: string;
}

export async function getAiReviewSummary(hotelId: string, refresh = false): Promise<AiReviewSummary> {
  const response = await api.get<AiReviewSummary>('/reviews/ai-summary', {
    params: { hotelId, refresh },
  });
  return response.data;
}

// ============================================
// CALENDAR / OCCUPANCY
// ============================================

export interface OccupancyDay {
  date: string;
  occupancy: number;
  competitorOccupancy: number;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName: string | null;
}

export interface OccupancySummary {
  avgMyHotel: number;
  avgCompetitor: number;
  diff: number;
  avgWeekend: number;
  avgWeekday: number;
  highest: { date: string; occupancy: number };
  lowest: { date: string; occupancy: number };
}

export interface WeeklyOccupancy {
  week: string;
  myHotel: number;
  competitors: number;
}

export interface OccupancyResponse {
  occupancy: OccupancyDay[];
  summary: OccupancySummary;
  weekly: WeeklyOccupancy[];
}

export async function getOccupancy(days?: number, hotelId?: string): Promise<OccupancyResponse> {
  const response = await api.get<OccupancyResponse>('/calendar/occupancy', {
    params: { days, ...(hotelId ? { hotelId } : {}) },
  });
  return response.data;
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardSummary {
  hotels: {
    ownCount: number;
    competitorCount: number;
  };
  rates: RatesSummary & {
    chartData: { date: string; myHotel: number | null; competitors: number | null }[];
  };
  reviews: ReviewsSummary;
  occupancy: OccupancySummary;
}

export async function getDashboardSummary(hotelId?: string): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>('/dashboard/summary', {
    params: hotelId ? { hotelId } : undefined,
  });
  return response.data;
}

// ============================================
// AI CHAT
// ============================================

export interface ChatMessageData {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface ChatConversationData {
  id: string;
  title: string | null;
  updatedAt: string;
  lastMessage: string | null;
}

export interface ChatUsageData {
  used: number;
  limit: number;
  bonusCredits: number;
  totalAvailable: number;
  periodEnd: string;
}

export interface ChatSendResponse {
  conversationId: string;
  message: ChatMessageData;
  usage: ChatUsageData;
}

export interface CreditPack {
  index: number;
  credits: number;
  priceInCents: number;
  label: string;
  available: boolean;
}

export async function sendChatMessage(data: {
  conversationId?: string;
  message: string;
}): Promise<ChatSendResponse> {
  const response = await api.post<ChatSendResponse>('/chat/message', data);
  return response.data;
}

export async function getChatConversations(): Promise<{ conversations: ChatConversationData[] }> {
  const response = await api.get<{ conversations: ChatConversationData[] }>('/chat/conversations');
  return response.data;
}

export async function getConversationMessages(conversationId: string): Promise<{ messages: ChatMessageData[] }> {
  const response = await api.get<{ messages: ChatMessageData[] }>(`/chat/conversations/${conversationId}/messages`);
  return response.data;
}

export async function deleteChatConversation(conversationId: string): Promise<void> {
  await api.delete(`/chat/conversations/${conversationId}`);
}

export async function getChatUsage(): Promise<ChatUsageData> {
  const response = await api.get<ChatUsageData>('/chat/usage');
  return response.data;
}

export async function getCreditPacks(): Promise<{ packs: CreditPack[] }> {
  const response = await api.get<{ packs: CreditPack[] }>('/chat/credits/packs');
  return response.data;
}

export async function purchaseCredits(packIndex: number): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>('/chat/credits/checkout', { packIndex });
  return response.data;
}
