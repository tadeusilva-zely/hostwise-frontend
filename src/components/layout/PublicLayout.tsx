import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--surface-bg)' }}
    >
      {/* Header */}
      <header className="py-5 px-6 flex items-center justify-center">
        <img src="/logo.png" alt="HostWise" className="h-10 w-auto rounded-lg" />
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Outlet />
      </main>
    </div>
  );
}
