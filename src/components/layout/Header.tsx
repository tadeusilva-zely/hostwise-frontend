import { UserButton } from '@clerk/clerk-react';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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

        {/* Page title placeholder - can be customized per page */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-hw-navy-900">Dashboard</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-hw-navy-50 transition-colors">
            <Bell className="w-5 h-5 text-hw-navy-600" />
            {/* Notification badge */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-hw-green rounded-full"></span> */}
          </button>

          {/* User menu */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
