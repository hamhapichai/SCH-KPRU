import React from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  loading?: boolean;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, loading = false, onLogout }) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Public pages that don't need layout
  const publicPages = ['/login', '/complaints/create', '/complaints/track'];
  const isPublicPage = publicPages.includes(router.pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={user?.role}
        loading={loading}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar user={user} loading={loading} onLogout={onLogout} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;