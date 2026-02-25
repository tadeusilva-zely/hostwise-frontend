import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    const parts: string[] = [];
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
        }
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    return parts.join('&');
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
  plan: 'STARTER' | 'INSIGHT' | 'PRO';
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
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
    hasTimeline: boolean;
    hasCategoryTrends: boolean;
    hasSmartReply: boolean;
    maxReviews: number | null;
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

export async function resendInvitationApi(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.post<{ success: boolean; message: string }>(`/auth/invitations/${id}/resend`);
  return response.data;
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

export async function createCheckoutSession(priceId: string, couponId?: string): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>('/billing/checkout', { priceId, couponId });
  return response.data;
}


export interface CouponValidationResult {
  valid: boolean;
  couponId?: string;
  name?: string | null;
  percentOff?: number | null;
  amountOff?: number | null;
}

export async function validateCoupon(couponCode: string): Promise<CouponValidationResult> {
  const response = await api.post<CouponValidationResult>('/billing/validate-coupon', { couponCode });
  return response.data;
}

export async function createPortalSession(): Promise<{ url: string }> {
  const response = await api.post<{ url: string }>('/billing/portal');
  return response.data;
}

export interface RedeemPromoResult {
  success: boolean;
  plan: string;
  trialEndsAt: string;
}

export async function redeemPromoCode(code: string): Promise<RedeemPromoResult> {
  const response = await api.post<RedeemPromoResult>('/billing/redeem-promo', { code });
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
  swapCount: number;
  hasPendingSwapRequest: boolean;
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
  tripadvisorId: string | null;
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

export async function searchHotelsInLocationApi(destId: string, destType: string, pageNumber = 0): Promise<HotelInLocationResult[]> {
  const response = await api.post<HotelInLocationResult[]>('/hotels/search-in-location', { destId, destType, pageNumber });
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

export async function requestSwapApi(hotelId: string): Promise<{ id: string }> {
  const response = await api.post<{ id: string }>(`/hotels/${hotelId}/swap-request`);
  return response.data;
}

export async function retryHotelFetchApi(hotelId: string): Promise<{ ok: boolean }> {
  const response = await api.post<{ ok: boolean }>(`/hotels/${hotelId}/retry-fetch`);
  return response.data;
}

export async function remapTripadvisorApi(hotelId: string): Promise<{ ok: boolean; mapped: boolean; tripadvisorId: string | null }> {
  const response = await api.post<{ ok: boolean; mapped: boolean; tripadvisorId: string | null }>(`/hotels/${hotelId}/remap-tripadvisor`);
  return response.data;
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
  source?: ReviewSource;
  rating: number;
  title: string | null;
  positive: string | null;
  negative: string | null;
  reviewerName: string | null;
  reviewerCountry: string | null;
  reviewDate: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  responseStatus: 'PENDING' | 'ANSWERED';
  respondedAt: string | null;
  aiReplyText: string | null;
  aiReplyTone: string | null;
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
  responseStatus?: 'PENDING' | 'ANSWERED';
  sources?: ReviewSource[];
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

// New reviews features

export interface ReviewResponseStats {
  responseRate: number;
  totalAnswered: number;
  totalPending: number;
  totalReviews: number;
  pendingNegative: number;
}

export interface ReviewCategory {
  id: string;
  name: string;
  score: number | null;
  prevScore: number | null;
  trend: number | null;
  reviewCount: number;
  competitorScore: number | null;
}

export interface CategoryTrendPoint {
  date: string;
  score: number;
}

export interface CategoryAlert {
  categoryId: string;
  categoryName: string;
  currentScore: number;
  previousScore: number;
  drop: number;
}

export interface ReviewTimelinePoint {
  date: string;
  avgRating: number;
  reviewCount: number;
  responseRate?: number;
}

export interface ReviewPeriodComparison {
  current: {
    avgRating: number;
    totalReviews: number;
    responseRate: number;
    startDate: string;
    endDate: string;
  };
  previous: {
    avgRating: number;
    totalReviews: number;
    responseRate: number;
    startDate: string;
    endDate: string;
  };
  deltas: {
    avgRating: number;
    totalReviews: number;
    responseRate: number;
  };
}

export interface SmartReplyResponse {
  reply: string;
}

export async function markReviewStatus(
  reviewId: string,
  status: 'PENDING' | 'ANSWERED'
): Promise<ReviewWithHotel> {
  const response = await api.patch<ReviewWithHotel>(`/reviews/${reviewId}/status`, { status });
  return response.data;
}

export const markReviewAnswered = (id: string) => markReviewStatus(id, 'ANSWERED');

export async function getReviewResponseStats(hotelId?: string): Promise<ReviewResponseStats> {
  const response = await api.get<ReviewResponseStats>('/reviews/response-stats', {
    params: hotelId ? { hotelId } : undefined,
  });
  return response.data;
}

export async function getSmartReply(
  reviewId: string,
  tone: 'empathetic' | 'formal' | 'grateful'
): Promise<SmartReplyResponse> {
  const response = await api.post<SmartReplyResponse>(`/reviews/${reviewId}/smart-reply`, { tone });
  return response.data;
}

export type ReviewSource = 'BOOKING' | 'GOOGLE' | 'TRIPADVISOR';

export async function getReviewCategories(
  hotelId?: string,
  sources?: ReviewSource[],
  compareMode?: { competitorIds: string[] } // empty array = all competitors
): Promise<{ categories: ReviewCategory[] }> {
  const response = await api.get<{ categories: ReviewCategory[] }>('/reviews/categories', {
    params: {
      ...(hotelId ? { hotelId } : {}),
      ...(sources?.length ? { sources } : {}),
      ...(compareMode
        ? compareMode.competitorIds.length > 0
          ? { competitorIds: compareMode.competitorIds }
          : { compareAll: 'true' }
        : {}),
    },
  });
  return response.data;
}

export async function getReviewCategoryTrend(
  categoryId: string,
  hotelId?: string
): Promise<{ points: CategoryTrendPoint[] }> {
  const response = await api.get<{ points: CategoryTrendPoint[] }>(
    `/reviews/categories/${categoryId}/trend`,
    { params: hotelId ? { hotelId } : undefined }
  );
  return response.data;
}

export async function getReviewCategoryAlerts(hotelId?: string, sources?: ReviewSource[]): Promise<{ alerts: CategoryAlert[] }> {
  const response = await api.get<{ alerts: CategoryAlert[] }>('/reviews/category-alerts', {
    params: { ...(hotelId ? { hotelId } : {}), ...(sources?.length ? { sources } : {}) },
  });
  return response.data;
}

export async function getReviewsTimeline(
  range: '7d' | '30d' | '90d',
  hotelId?: string,
  sources?: ReviewSource[],
  compareMode?: { competitorIds: string[] } // empty array = all competitors
): Promise<{ points: ReviewTimelinePoint[]; competitorPoints: ReviewTimelinePoint[] | null }> {
  const response = await api.get<{ points: ReviewTimelinePoint[]; competitorPoints: ReviewTimelinePoint[] | null }>('/reviews/timeline', {
    params: {
      range,
      ...(hotelId ? { hotelId } : {}),
      ...(sources?.length ? { sources } : {}),
      ...(compareMode
        ? compareMode.competitorIds.length > 0
          ? { competitorIds: compareMode.competitorIds }
          : { compareAll: 'true' }
        : {}),
    },
  });
  return response.data;
}

export async function getReviewsTimelineComparison(
  hotelId?: string
): Promise<ReviewPeriodComparison> {
  const response = await api.get<ReviewPeriodComparison>('/reviews/timeline/comparison', {
    params: hotelId ? { hotelId } : undefined,
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
