import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout'

function AppContent({ Component, pageProps, router }: AppProps & { router: any }) {
  const { user, loading, logout } = useAuth();

  // Pages that don't need Layout (public pages)
  const publicPages = [
    '/',
    '/login',
    '/complaints/create',
    '/complaints/track'
  ];

  const shouldUseLayout = !publicPages.includes(router.pathname);

  if (shouldUseLayout) {
    return (
      <Layout 
        user={user ? {
          name: user.name as string,
          email: user.email,
          role: user.roleName
        } : undefined} 
        loading={loading}
        onLogout={logout}
      >
        <Component {...pageProps} />
      </Layout>
    );
  }

  return <Component {...pageProps} />;
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppContent {...props} router={props.router} />
    </AuthProvider>
  );
}