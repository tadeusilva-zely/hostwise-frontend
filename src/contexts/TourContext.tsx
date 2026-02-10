import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { updateTourPreferencesApi } from '../services/api';

export type TourPage = 'dashboard' | 'rates' | 'reviews' | 'occupancy';

const TOUR_PAGES: TourPage[] = ['dashboard', 'rates', 'reviews', 'occupancy'];

interface TourPreferencesState {
  seen: Record<TourPage, boolean>;
  dismissCount: Record<TourPage, number>;
}

interface TourContextType {
  isRunning: boolean;
  currentPage: TourPage | null;
  startTour: (page?: TourPage) => void;
  stopTour: () => void;
  hasSeenTour: (page: TourPage) => boolean;
  markTourSeen: (page: TourPage) => void;
  dismissTour: (page: TourPage) => void;
  shouldOfferTour: (page: TourPage) => boolean;
  hasPendingTours: boolean;
}

const TourContext = createContext<TourContextType | null>(null);

const STORAGE_KEY = 'hw_tours_seen';

export const pathToPage: Record<string, TourPage> = {
  '/dashboard': 'dashboard',
  '/rates': 'rates',
  '/reviews': 'reviews',
  '/occupancy': 'occupancy',
};

const DEFAULT_PREFERENCES: TourPreferencesState = {
  seen: { dashboard: false, rates: false, reviews: false, occupancy: false },
  dismissCount: { dashboard: 0, rates: 0, reviews: 0, occupancy: 0 },
};

function parsePreferences(raw: { seen: Record<string, boolean>; dismissCount: Record<string, number> } | null): TourPreferencesState {
  if (!raw) return { ...DEFAULT_PREFERENCES, seen: { ...DEFAULT_PREFERENCES.seen }, dismissCount: { ...DEFAULT_PREFERENCES.dismissCount } };
  return {
    seen: { ...DEFAULT_PREFERENCES.seen, ...raw.seen },
    dismissCount: { ...DEFAULT_PREFERENCES.dismissCount, ...raw.dismissCount },
  };
}

export function TourProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState<TourPage | null>(null);
  const [preferences, setPreferences] = useState<TourPreferencesState>(
    () => parsePreferences(user?.tourPreferences ?? null)
  );
  const initializedRef = useRef(false);

  // Sync preferences from user data when it changes
  useEffect(() => {
    if (user) {
      if (!initializedRef.current) {
        // One-time migration: localStorage -> DB
        const localData = (() => {
          try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          } catch {
            return {};
          }
        })();

        if (user.tourPreferences === null && Object.keys(localData).length > 0) {
          const migrated: TourPreferencesState = {
            seen: { ...DEFAULT_PREFERENCES.seen, ...localData },
            dismissCount: { ...DEFAULT_PREFERENCES.dismissCount },
          };
          setPreferences(migrated);
          updateTourPreferencesApi(migrated).catch(() => {});
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setPreferences(parsePreferences(user.tourPreferences));
          // Clean up old localStorage if DB has data
          if (user.tourPreferences) {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
        initializedRef.current = true;
      } else {
        setPreferences(parsePreferences(user.tourPreferences));
      }
    }
  }, [user?.tourPreferences]);

  const startTour = useCallback((page?: TourPage) => {
    const detectedPage = page || pathToPage[location.pathname];
    if (detectedPage) {
      setCurrentPage(detectedPage);
      setIsRunning(true);
    }
  }, [location.pathname]);

  const stopTour = useCallback(() => {
    setIsRunning(false);
    setCurrentPage(null);
  }, []);

  const hasSeenTour = useCallback((page: TourPage) => {
    return !!preferences.seen[page];
  }, [preferences.seen]);

  const markTourSeen = useCallback((page: TourPage) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        seen: { ...prev.seen, [page]: true },
      };
      updateTourPreferencesApi({ seen: { [page]: true } }).catch(() => {});
      return updated;
    });
  }, []);

  const dismissTour = useCallback((page: TourPage) => {
    setPreferences(prev => {
      const newCount = (prev.dismissCount[page] || 0) + 1;
      const updated = {
        ...prev,
        dismissCount: { ...prev.dismissCount, [page]: newCount },
      };
      updateTourPreferencesApi({ dismissCount: { [page]: newCount } }).catch(() => {});
      return updated;
    });
  }, []);

  const shouldOfferTour = useCallback((page: TourPage) => {
    return !preferences.seen[page] && (preferences.dismissCount[page] || 0) < 3;
  }, [preferences]);

  const hasPendingTours = TOUR_PAGES.some(
    page => !preferences.seen[page] && (preferences.dismissCount[page] || 0) >= 3
  );

  return (
    <TourContext.Provider value={{
      isRunning,
      currentPage,
      startTour,
      stopTour,
      hasSeenTour,
      markTourSeen,
      dismissTour,
      shouldOfferTour,
      hasPendingTours,
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
