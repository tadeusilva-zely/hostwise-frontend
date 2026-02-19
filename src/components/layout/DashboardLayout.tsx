import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TourProvider } from '../../contexts/TourContext';
import { TourOfferPopup } from '../../tour/TourOfferPopup';
import { ChatBubble } from '../chat/ChatBubble';
import { useAuth } from '../../contexts/AuthContext';

const TRIAL_ALLOWED_PATHS = ['/billing', '/billing/success', '/billing/manage'];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isTrialExpired =
    user?.plan === 'STARTER' &&
    !user?.isTrialActive &&
    !!user?.trialEndsAt &&
    new Date(user.trialEndsAt) < new Date();

  const isAllowed = TRIAL_ALLOWED_PATHS.some((p) => location.pathname.startsWith(p));

  if (isTrialExpired && !isAllowed && location.pathname !== '/dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <TourProvider>
      <div className="min-h-screen bg-hw-navy-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main content */}
        <div className="lg:pl-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <TourOfferPopup />
      <ChatBubble />
    </TourProvider>
  );
}
