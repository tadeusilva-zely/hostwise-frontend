import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PublicLayout } from './components/layout/PublicLayout';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { InvitePage } from './pages/auth/InvitePage';

// Dashboard pages
import { Dashboard } from './pages/dashboard/Dashboard';

// Feature pages
import { HotelsPage } from './pages/hotels/HotelsPage';
import { RatesPage } from './pages/rates/RatesPage';
import { ReviewsPage } from './pages/reviews/ReviewsPage';
import { OccupancyPage } from './pages/occupancy/OccupancyPage';

// Billing pages
import { PricingPage } from './pages/billing/PricingPage';
import { CheckoutSuccess } from './pages/billing/CheckoutSuccess';
import { ManageSubscription } from './pages/billing/ManageSubscription';

// Settings pages
import { SettingsPage } from './pages/settings/SettingsPage';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hw-navy-50">
        <div className="w-8 h-8 border-4 border-hw-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirects to dashboard if already logged in)
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hw-navy-50">
        <div className="w-8 h-8 border-4 border-hw-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  // Public routes (auth)
  {
    element: (
      <PublicOnlyRoute>
        <PublicLayout />
      </PublicOnlyRoute>
    ),
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/cadastro',
        element: <RegisterPage />,
      },
    ],
  },

  // Invite page (public, but no redirect if logged in)
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/convite/:token',
        element: <InvitePage />,
      },
    ],
  },

  // Protected routes (dashboard)
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/hotels',
        element: <HotelsPage />,
      },
      {
        path: '/rates',
        element: <RatesPage />,
      },
      {
        path: '/reviews',
        element: <ReviewsPage />,
      },
      {
        path: '/occupancy',
        element: <OccupancyPage />,
      },
      {
        path: '/billing',
        element: <PricingPage />,
      },
      {
        path: '/billing/success',
        element: <CheckoutSuccess />,
      },
      {
        path: '/billing/manage',
        element: <ManageSubscription />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Redirects
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
