import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  React.useEffect(() => {
    if (user && roles && !roles.includes(user.roleName)) {
      // Redirect based on user role to appropriate default page
      let redirectPath = '';
      switch (user.roleName) {
        case 'Admin':
          redirectPath = '/users';
          break;
        case 'Dean':
        case 'Deputy':
        case 'Staff':
        default:
          redirectPath = '/dashboard';
          break;
      }
      
      // Only redirect if we're not already on the target page
      if (router.pathname !== redirectPath) {
        router.push(redirectPath);
      }
    }
  }, [user, roles, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" text="กำลังโหลด..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (roles && user && !roles.includes(user.roleName)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="mt-2 text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;