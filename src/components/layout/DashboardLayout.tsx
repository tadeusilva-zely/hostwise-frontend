import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TourProvider } from '../../contexts/TourContext';
import { TourOfferPopup } from '../../tour/TourOfferPopup';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    </TourProvider>
  );
}
