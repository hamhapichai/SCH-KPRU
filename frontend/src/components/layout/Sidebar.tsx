import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Building2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Users2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  userRole?: string;
  loading?: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  roles: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle, userRole, loading = false }) => {
  const router = useRouter();

  // Define navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const allItems: NavigationItem[] = [
      {
        name: 'แดชบอร์ด',
        href: '/dashboard',
        icon: LayoutDashboard,
        current: router.pathname === '/dashboard',
        roles: ['Dean', 'Deputy', 'Staff'], // admin cannot access dashboard
      },{
        name: 'ข้อร้องเรียน',
        href: '/complaints',
        icon: MessageSquare,
        current: router.pathname.startsWith('/complaints'),
        roles: ['Dean', 'Deputy', 'Staff'], // admin cannot access complaints
      },
      {
        name: 'คณะกรรมการดำเนินการ',
        href: '/committees',
        icon: Users2,
        current: router.pathname.startsWith('/committees'),
        roles: ['Deputy'], // Only Deputy can manage committees
      },
      {
        name: 'ผู้ใช้งาน',
        href: '/users',
        icon: Users,
        current: router.pathname.startsWith('/users'),
        roles: ['Admin'], // Only Admin can manage users
      },
      {
        name: 'หน่วยงาน',
        href: '/departments',
        icon: Building2,
        current: router.pathname.startsWith('/departments'),
        roles: ['Admin'], // Only Admin can manage departments
      },
    ];

    // Filter items based on user role
    // Don't show any items while loading to prevent flash
    if (loading || !userRole) {
      return [];
    }
    
    return allItems.filter(item => 
      item.roles.includes(userRole)
    );
  };

  const navigation = getNavigationItems();

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-white text-gray-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <h1 className="text-sm text-black font-bold whitespace-nowrap">Smart Complaint Hub-KPRU</h1>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-gray hover:bg-gray-200"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                item.current
                  ? 'bg-blue-200 text-blue-600'
                  : 'text-bodydark1 hover:bg-gray-200 hover:text-bodydark1'
              )}
            >
              <Icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  item.current ? 'text-blue-600' : 'text-bodydark1'
                )}
              />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Role Badge */}
      {!collapsed && userRole && (
        <div className="p-4">
          <div className="rounded-lg bg-strokedark px-3 py-2">
            <p className="text-xs text-blue-500">Role</p>
            <p className="text-sm font-medium text-gray-800">{userRole}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;