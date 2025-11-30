import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PublicLayout } from './components/layout/PublicLayout';

// Auth pages
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';

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
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export const router = createBrowserRouter([
  // Public routes (auth)
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/sign-in/*',
        element: <SignIn />,
      },
      {
        path: '/sign-up/*',
        element: <SignUp />,
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
