import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Menu, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useTour } from '../../contexts/TourContext';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { startTour, hasPendingTours } = useTour();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-hw-navy-100">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-hw-navy-50 transition-colors"
        >
          <Menu className="w-6 h-6 text-hw-navy-600" />
        </button>

        {/* Page title placeholder */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-hw-navy-900">Dashboard</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-hw-navy-50 transition-colors">
            <Bell className="w-5 h-5 text-hw-navy-600" />
          </button>

          {/* Tour button */}
          <button
            onClick={() => startTour()}
            data-tour="tour-button"
            className={cn(
              'relative p-2 rounded-lg hover:bg-hw-navy-50 transition-colors',
              hasPendingTours && 'animate-pulse-ring'
            )}
            title="Tour guiado"
          >
            <HelpCircle className={cn(
              'w-5 h-5',
              hasPendingTours ? 'text-hw-purple' : 'text-hw-navy-600'
            )} />
            {hasPendingTours && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-hw-purple rounded-full animate-ping" />
            )}
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 bg-hw-purple-100 rounded-full flex items-center justify-center hover:bg-hw-purple-200 transition-colors"
            >
              <span className="text-sm font-semibold text-hw-purple">{initial}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-hw-navy-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-hw-navy-100">
                  <p className="text-sm font-medium text-hw-navy-900 truncate">{user?.name}</p>
                  <p className="text-xs text-hw-navy-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-hw-navy-600 hover:bg-hw-navy-50"
                >
                  <Settings className="w-4 h-4" />
                  Configuracoes
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
