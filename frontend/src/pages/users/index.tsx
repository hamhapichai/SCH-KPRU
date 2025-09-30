import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { User } from '@/types';
import { userApi } from '@/lib/api';
import UserTable from '@/components/UserTable';
import UserModal from '@/components/UserModal';
import { Plus, Users, UserCheck, UserX, Shield } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button,
  Alert
} from '@/components/ui';

const UsersPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [error, setError] = useState<string | null>(null);

  // Check authentication and role
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.roleName !== 'Admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, loading, router]);

  // Fetch users data
  useEffect(() => {
    if (user?.roleName === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      await userApi.updateUserStatus(userId, !isActive);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('ไม่สามารถอัปเดตสถานะผู้ใช้ได้');
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (confirm('คุณต้องการรีเซ็ตรหัสผ่านของผู้ใช้นี้หรือไม่?')) {
      try {
        await userApi.resetUserPassword(userId);
        alert('รีเซ็ตรหัสผ่านเรียบร้อยแล้ว รหัสผ่านใหม่จะถูกส่งไปยังอีเมลของผู้ใช้');
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('ไม่สามารถรีเซ็ตรหัสผ่านได้');
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('คุณต้องการลบผู้ใช้นี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
      try {
        await userApi.deleteUser(userId);
        setUsers(users.filter(u => u.userId !== userId));
        alert('ลบผู้ใช้เรียบร้อยแล้ว');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('ไม่สามารถลบผู้ใช้ได้');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSaved = () => {
    fetchUsers(); // Refresh the list
    handleModalClose();
  };

  if (loading || (!isAuthenticated || user?.roleName !== 'Admin')) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute roles={['Admin']}>
      <Head>
        <title>จัดการผู้ใช้ - KPRU CMS</title>
      </Head>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
            <p className="text-gray-600">จัดการผู้ใช้งานระบบและสิทธิ์การเข้าถึง</p>
          </div>
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ผู้ใช้ที่ใช้งาน</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ผู้ใช้ที่ไม่ใช้งาน</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => !u.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ผู้ดูแลระบบ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.roleName === 'Admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        {/* <Card>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                placeholder="ค้นหาด้วย ชื่อ นามสกุล ชื่อผู้ใช้ หรืออีเมล"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card> */}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการผู้ใช้ ({users.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UserTable
              users={users}
              loading={loadingUsers}
              onEditUser={handleEditUser}
              onViewUser={handleViewUser}
              onToggleStatus={handleToggleUserStatus}
              onResetPassword={handleResetPassword}
              onDeleteUser={handleDeleteUser}
            />
          </CardContent>
        </Card>

        {/* User Modal */}
        {isModalOpen && (
          <UserModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={handleUserSaved}
            user={selectedUser}
            mode={modalMode}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default UsersPage;