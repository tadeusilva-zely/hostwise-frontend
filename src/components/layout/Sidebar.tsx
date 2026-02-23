import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { getMe } from '../../services/api';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Star,
  Building2,
  CreditCard,
  LogOut,
  BarChart2,
  Radar,
  ChevronDown,
} from 'lucide-react';

const mainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Star, label: 'Avaliações', path: '/reviews' },
  { icon: BarChart2, label: 'Reputação', path: '/analytics' },
];

const radarSubItems = [
  { icon: DollarSign, label: 'Espião de Tarifas', path: '/rates' },
  { icon: TrendingUp, label: 'Sensor de Lotação', path: '/occupancy' },
];

const hotelMenuItem = { icon: Building2, label: 'Meus Hotéis', path: '/hotels' };

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user: authUser, logout } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const handleLogout = () => {
    logout();
  };

  const getPlanLabel = (plan?: string) => {
    switch (plan) {
      case 'STARTER': return 'Starter';
      case 'INSIGHT': return 'Insight';
      case 'PRO': return 'Pro';
      default: return 'Starter';
    }
  };

  const userName = authUser?.name || 'Usuário';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderRight: '1px solid var(--surface-border)',
        }}
      >
        <SidebarContent
          userName={userName}
          initial={initial}
          user={user}
          location={location}
          getPlanLabel={getPlanLabel}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderRight: '1px solid var(--surface-border)',
        }}
      >
        <SidebarContent
          userName={userName}
          initial={initial}
          user={user}
          location={location}
          getPlanLabel={getPlanLabel}
          handleLogout={handleLogout}
          onNavigate={onClose}
        />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  userName: string;
  initial: string;
  user: { plan?: string; limits?: { maxCompetitors: number; maxProperties: number } } | undefined;
  location: ReturnType<typeof useLocation>;
  getPlanLabel: (plan?: string) => string;
  handleLogout: () => void;
  onNavigate?: () => void;
}

function SidebarContent({
  userName,
  initial,
  user,
  location,
  getPlanLabel,
  handleLogout,
  onNavigate,
}: SidebarContentProps) {
  const isRadarActive = radarSubItems.some((item) => location.pathname === item.path);
  const [radarOpen, setRadarOpen] = useState(isRadarActive);

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'PRO':
        return (
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            Pro
          </span>
        );
      case 'INSIGHT':
        return (
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            Insight
          </span>
        );
      default:
        return (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: 'var(--surface-card)',
              color: 'var(--text-muted)',
              border: '1px solid var(--surface-border)',
            }}
          >
            {getPlanLabel(plan)}
          </span>
        );
    }
  };

  const linkStyle = (isActive: boolean) =>
    isActive
      ? {
          background:
            'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
          color: '#818cf8',
          borderLeft: '2px solid var(--accent-primary)',
          paddingLeft: '10px',
        }
      : {
          color: 'var(--text-muted)',
        };

  const hoverHandlers = (isActive: boolean) => ({
    onMouseEnter: (e: React.MouseEvent) => {
      if (!isActive) {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      if (!isActive) {
        (e.currentTarget as HTMLElement).style.backgroundColor = '';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
      }
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center justify-center px-6 py-5"
        style={{ borderBottom: '1px solid var(--surface-border)' }}
      >
        <img src="/logo.png" alt="HostWise" className="h-10 w-auto rounded-lg" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={linkStyle(isActive)}
              {...hoverHandlers(isActive)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {/* Radar de Mercado - Collapsible */}
        <div>
          <button
            onClick={() => setRadarOpen(!radarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              color: isRadarActive ? '#818cf8' : 'var(--text-muted)',
              ...(isRadarActive
                ? {
                    background:
                      'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.05))',
                  }
                : {}),
            }}
            onMouseEnter={(e) => {
              if (!isRadarActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRadarActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              }
            }}
          >
            <Radar className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">Radar de Mercado</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                radarOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Sub-items */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              radarOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'
            )}
          >
            <div className="ml-3 pl-3 space-y-0.5" style={{ borderLeft: '1px solid var(--surface-border)' }}>
              {radarSubItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                    style={
                      isActive
                        ? {
                            background:
                              'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
                            color: '#818cf8',
                          }
                        : {
                            color: 'var(--text-muted)',
                          }
                    }
                    {...hoverHandlers(isActive)}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="my-3" style={{ borderTop: '1px solid var(--surface-border)' }} />

        {/* Hotels Menu */}
        <Link
          to={hotelMenuItem.path}
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={linkStyle(location.pathname === hotelMenuItem.path)}
          {...hoverHandlers(location.pathname === hotelMenuItem.path)}
        >
          <hotelMenuItem.icon className="w-5 h-5 flex-shrink-0" />
          {hotelMenuItem.label}
        </Link>
      </nav>

      {/* User Info & Bottom Navigation */}
      <div
        className="px-3 py-4 space-y-2"
        style={{ borderTop: '1px solid var(--surface-border)' }}
      >
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <span className="text-sm font-semibold text-white">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {userName}
            </p>
            {getPlanBadge(user?.plan)}
          </div>
        </div>

        {/* Billing */}
        <Link
          to="/billing"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={
            location.pathname === '/billing'
              ? {
                  background:
                    'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
                  color: '#818cf8',
                }
              : { color: 'var(--text-muted)' }
          }
          {...hoverHandlers(location.pathname === '/billing')}
        >
          <CreditCard className="w-5 h-5 flex-shrink-0" />
          Planos & Billing
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            (e.currentTarget as HTMLElement).style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Sair
        </button>
      </div>
    </div>
  );
}
