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
} from 'lucide-react';

const mainMenuItems = [
  { icon: LayoutDashboard, label: 'HostWise', path: '/dashboard' },
  { icon: DollarSign, label: 'Espião de Tarifas', path: '/rates' },
  { icon: TrendingUp, label: 'Sensor de Lotação', path: '/occupancy' },
  { icon: Star, label: 'Raio-X de Avaliações', path: '/reviews' },
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

  const getPlanColor = (plan?: string) => {
    switch (plan) {
      case 'STARTER': return 'bg-hw-navy-100 text-hw-navy-600';
      case 'INSIGHT': return 'bg-hw-purple-100 text-hw-purple';
      case 'PRO': return 'bg-gradient-to-r from-hw-purple to-hw-purple-600 text-white';
      default: return 'bg-hw-navy-100 text-hw-navy-600';
    }
  };

  const userName = authUser?.name || 'Usuário';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-hw-navy-100">
        <SidebarContent
          userName={userName}
          initial={initial}
          user={user}
          location={location}
          getPlanLabel={getPlanLabel}
          getPlanColor={getPlanColor}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-hw-navy-100 transform transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent
          userName={userName}
          initial={initial}
          user={user}
          location={location}
          getPlanLabel={getPlanLabel}
          getPlanColor={getPlanColor}
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
  getPlanColor: (plan?: string) => string;
  handleLogout: () => void;
  onNavigate?: () => void;
}

function SidebarContent({
  userName,
  initial,
  user,
  location,
  getPlanLabel,
  getPlanColor,
  handleLogout,
  onNavigate,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center px-6 py-5 border-b border-hw-navy-100">
        <img src="/logo.png" alt="HostWise" className="h-10 w-auto rounded-lg" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-hw-purple-50 text-hw-purple'
                  : 'text-hw-navy-600 hover:bg-hw-navy-50'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-4 border-t border-hw-navy-100" />

        {/* Hotels Menu */}
        <Link
          to={hotelMenuItem.path}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === hotelMenuItem.path
              ? 'bg-hw-purple-50 text-hw-purple'
              : 'text-hw-navy-600 hover:bg-hw-navy-50'
          )}
        >
          <hotelMenuItem.icon className="w-5 h-5" />
          {hotelMenuItem.label}
        </Link>
      </nav>

      {/* User Info & Bottom Navigation */}
      <div className="px-4 py-4 border-t border-hw-navy-100 space-y-3">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-hw-purple-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-hw-purple">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-hw-navy-900 truncate">
              {userName}
            </p>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', getPlanColor(user?.plan))}>
              {getPlanLabel(user?.plan)}
            </span>
          </div>
        </div>

        {/* Billing */}
        <Link
          to="/billing"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/billing'
              ? 'bg-hw-purple-50 text-hw-purple'
              : 'text-hw-navy-600 hover:bg-hw-navy-50'
          )}
        >
          <CreditCard className="w-5 h-5" />
          Billing
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-hw-navy-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  );
}
