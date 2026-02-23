import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Menu, Settings, LogOut, HelpCircle, Sun, Moon } from 'lucide-react';
import { useTour } from '../../contexts/TourContext';
import { cn } from '../../lib/utils';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reviews': 'Avaliações',
  '/analytics': 'Analytics',
  '/rates': 'Espião de Tarifas',
  '/occupancy': 'Sensor de Lotação',
  '/hotels': 'Meus Hotéis',
  '/billing': 'Planos & Billing',
  '/billing/success': 'Planos & Billing',
  '/billing/manage': 'Planos & Billing',
  '/settings': 'Configurações',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { startTour, hasPendingTours } = useTour();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'HostWise';

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
    <header
      className="sticky top-0 z-40"
      style={{
        backgroundColor: 'var(--surface-secondary)',
        borderBottom: '1px solid var(--surface-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '';
          }}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <div className="hidden lg:block">
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'Lexend, Inter, system-ui, sans-serif' }}
          >
            {pageTitle}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '';
            }}
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Tour button */}
          <button
            onClick={() => startTour()}
            data-tour="tour-button"
            className={cn(
              'relative p-2 rounded-lg transition-colors',
              hasPendingTours && 'animate-pulse-ring'
            )}
            style={{ color: hasPendingTours ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            title="Tour guiado"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '';
            }}
          >
            <HelpCircle className="w-5 h-5" />
            {hasPendingTours && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
            )}
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <span className="text-sm font-semibold text-white">{initial}</span>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl py-1 z-50 overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--surface-border)',
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {user?.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  }}
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
