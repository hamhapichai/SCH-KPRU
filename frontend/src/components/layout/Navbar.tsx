import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User, LogOut, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
  loading?: boolean;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, loading = false, onLogout }) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const allItems = [
      { 
        name: 'แดชบอร์ด', 
        href: '/dashboard', 
        current: router.pathname === '/dashboard',
        roles: ['Dean', 'Deputy', 'Staff'] // Admin cannot access dashboard
      },
      { 
        name: 'ข้อร้องเรียน', 
        href: '/complaints', 
        current: router.pathname.startsWith('/complaints'),
        roles: ['Dean', 'Deputy', 'Staff'] // Admin cannot access complaints
      },
      { 
        name: 'ผู้ใช้งาน', 
        href: '/users', 
        current: router.pathname.startsWith('/users'),
        roles: ['Admin'] // Only Admin can manage users
      },
      { 
        name: 'หน่วยงาน', 
        href: '/departments', 
        current: router.pathname.startsWith('/departments'),
        roles: ['Admin'] // Only Admin can manage departments
      },
    ];

    // Filter items based on user role
    // Don't show any items while loading to prevent flash
    if (loading || !user?.role) {
      return [];
    }
    
    return allItems.filter(item => 
      item.roles.includes(user.role)
    );
  };

  const navigation = getNavigationItems();

  // Determine home page based on user role
  const getHomePage = () => {
    if (!user?.role) return '/dashboard';
    
    switch (user.role) {
      case 'Admin':
        return '/users'; // Admin goes to users page
      case 'Dean':
      case 'Deputy':
      case 'Staff':
      default:
        return '/dashboard'; // Others go to dashboard
    }
  };

  return (
    <nav className="bg-white border-b border-stroke shadow-default">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and navigation */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href={getHomePage()} className="text-xl font-bold text-primary">
                ระบบจัดการข้อร้องเรียนสายตรงคณบดี
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray">
              <Bell className="h-5 w-5 text-body" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-danger text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Profile dropdown */}
            {user && (
              <div className="relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded-full transition-all duration-200 hover:shadow-md"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {isProfileOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-72 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 transform transition-all duration-200 ease-out">
                    {/* User Info Section */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {user.role === 'Dean' && 'คณบดี'}
                            {user.role === 'Deputy' && 'รองคณบดี'}
                            {user.role === 'Staff' && 'เจ้าหน้าที่'}
                            {user.role === 'Admin' && 'ผู้ดูแลระบบ'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 group"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors duration-150">
                          <Settings className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <span className="font-medium">ตั้งค่าโปรไฟล์</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout?.();
                        }}
                        className="flex w-full items-center px-6 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors duration-150">
                          <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600" />
                        </div>
                        <span className="font-medium">ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                item.current
                  ? 'border-primary bg-gray text-primary'
                  : 'border-transparent text-body hover:border-stroke hover:bg-gray hover:text-black'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;