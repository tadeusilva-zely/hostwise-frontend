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
} from 'lucide-react';

const mainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Star, label: 'Avaliações', path: '/reviews' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
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
              style={
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
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-3" style={{ borderTop: '1px solid var(--surface-border)' }} />

        {/* Hotels Menu */}
        <Link
          to={hotelMenuItem.path}
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={
            location.pathname === hotelMenuItem.path
              ? {
                  background:
                    'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))',
                  color: '#818cf8',
                  borderLeft: '2px solid var(--accent-primary)',
                  paddingLeft: '10px',
                }
              : {
                  color: 'var(--text-muted)',
                }
          }
          onMouseEnter={(e) => {
            if (location.pathname !== hotelMenuItem.path) {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== hotelMenuItem.path) {
              (e.currentTarget as HTMLElement).style.backgroundColor = '';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }
          }}
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
          onMouseEnter={(e) => {
            if (location.pathname !== '/billing') {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/billing') {
              (e.currentTarget as HTMLElement).style.backgroundColor = '';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }
          }}
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
