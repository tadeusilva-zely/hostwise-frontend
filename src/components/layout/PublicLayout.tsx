import { Outlet, Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-hw-gradient">
      {/* Header */}
      <header className="py-4 px-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <Home className="w-6 h-6 text-hw-purple" />
          </div>
          <span className="text-xl font-bold text-white">HostWise</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex items-center justify-center px-4 py-12">
        <Outlet />
      </main>
    </div>
  );
}
