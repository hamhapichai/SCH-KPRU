import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Group, Member, User } from '@/types';
import { groupApi, userApi } from '@/lib/api';
import { Plus, Search, Users, Edit, Trash2, UserPlus, UserMinus, Building2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Modal,
  Alert,
  AlertModal,
  UserSelectionModal,
  Badge,
  Loading
} from '@/components/ui';

const CommitteesPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'members'>('view');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [updatingMember, setUpdatingMember] = useState(false);

  // AlertModal states
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'warning' | 'danger' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'warning',
  });

  // UserSelectionModal state
  const [userSelectionModalOpen, setUserSelectionModalOpen] = useState(false);

  // AlertModal helper functions
  const closeAlertModal = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const openAddMemberModal = (user: User) => {
    setAlertModal({
      isOpen: true,
      title: 'เพิ่มสมาชิก',
      message: `คุณต้องการเพิ่ม ${user.firstName} ${user.lastName} เป็นสมาชิกของคณะกรรมการ "${selectedGroup?.name}" ใช่หรือไม่?`,
      onConfirm: () => handleAddMember(user.userId),
      variant: 'warning',
    });
  };

  const openRemoveMemberModal = (member: Member) => {
    setAlertModal({
      isOpen: true,
      title: 'ลบสมาชิก',
      message: `คุณต้องการลบ ${member.userFullName} ออกจากคณะกรรมการ "${selectedGroup?.name}" ใช่หรือไม่?`,
      onConfirm: () => handleRemoveMember(member.membersId),
      variant: 'danger',
    });
  };

  // Form states
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    isActive: true
  });

  // Check authentication and role
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.roleName !== 'Deputy') {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, loading, router]);

  // Fetch groups data
  useEffect(() => {
    console.log('useEffect triggered:', { loading, user: user ? { roleName: user.roleName, departmentId: user.departmentId } : null });
    if (!loading && user?.roleName === 'Deputy' && user.departmentId) {
      console.log('useEffect: Conditions met, fetching data');
      fetchGroups();
      fetchAvailableUsers();
    } else {
      console.log('useEffect: Conditions not met', { loading, roleName: user?.roleName, departmentId: user?.departmentId });
    }
  }, [user, loading]);

  const fetchGroups = async () => {
    if (!user?.departmentId) {
      console.log('fetchGroups: No departmentId available', user);
      return;
    }

    try {
      setLoadingGroups(true);
      setError(null);
      console.log('fetchGroups: Fetching groups for departmentId:', user.departmentId);
      const data = await groupApi.getGroupsByDepartment(user.departmentId);
      console.log('fetchGroups: Received data:', data);
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('ไม่สามารถโหลดข้อมูลคณะกรรมการได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchAvailableUsers = async () => {
    if (!user?.departmentId) return;

    try {
      const users = await userApi.getUsersByDepartment(user.departmentId);
      // Filter only active users
      const activeUsers = users.filter(u => u.isActive);
      setAvailableUsers(activeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
      setAvailableUsers([]); // Clear available users on error
    }
  };

  const fetchGroupMembers = async (groupId: number) => {
    try {
      setLoadingMembers(true);
      const members = await groupApi.getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error fetching group members:', error);
      setError('ไม่สามารถโหลดข้อมูลสมาชิกได้ กรุณาลองใหม่อีกครั้ง');
      setGroupMembers([]); // Clear group members on error
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setGroupForm({
      name: '',
      description: '',
      isActive: true
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      isActive: group.isActive
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewMembers = async (group: Group) => {
    setSelectedGroup(group);
    await fetchGroupMembers(group.groupId);
    setModalMode('members');
    setIsModalOpen(true);
  };

  const handleSubmitGroup = async () => {
    if (!user?.departmentId) return;

    setError(null); // Clear previous error
    try {
      if (modalMode === 'create') {
        await groupApi.createGroup({
          departmentId: user.departmentId,
          name: groupForm.name,
          description: groupForm.description || undefined
        });
      } else if (modalMode === 'edit' && selectedGroup) {
        await groupApi.updateGroup(selectedGroup.groupId, {
          name: groupForm.name,
          description: groupForm.description || undefined,
          isActive: groupForm.isActive
        });
      }

      setIsModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      setError('ไม่สามารถบันทึกข้อมูลคณะกรรมการได้');
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('คุณต้องการลบคณะกรรมการนี้ใช่หรือไม่?')) return;

    setError(null); // Clear previous error
    try {
      await groupApi.deleteGroup(groupId);
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('ไม่สามารถลบคณะกรรมการได้');
    }
  };

  const handleAddMember = async (userId: number) => {
    if (!selectedGroup) return;

    setError(null); // Clear previous error
    setUpdatingMember(true);
    closeAlertModal(); // Close modal immediately
    try {
      await groupApi.addMemberToGroup(selectedGroup.groupId, {
        groupId: selectedGroup.groupId,
        userId: userId
      });
      await fetchGroupMembers(selectedGroup.groupId);
      await fetchGroups(); // Update memberCount in group list
    } catch (error) {
      console.error('Error adding member:', error);
      setError('ไม่สามารถเพิ่มสมาชิกได้');
    } finally {
      setUpdatingMember(false);
    }
  };

  const handleAddMembers = async (users: User[]) => {
    if (!selectedGroup || users.length === 0) return;

    setError(null); // Clear previous error
    setUpdatingMember(true);
    setUserSelectionModalOpen(false); // Close modal immediately

    try {
      // Add members one by one
      for (const user of users) {
        await groupApi.addMemberToGroup(selectedGroup.groupId, {
          groupId: selectedGroup.groupId,
          userId: user.userId
        });
      }

      await fetchGroupMembers(selectedGroup.groupId);
      await fetchGroups(); // Update memberCount in group list
    } catch (error) {
      console.error('Error adding members:', error);
      setError('ไม่สามารถเพิ่มสมาชิกได้');
    } finally {
      setUpdatingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedGroup) return;

    setError(null); // Clear previous error
    setUpdatingMember(true);
    closeAlertModal(); // Close modal immediately
    try {
      await groupApi.removeMemberFromGroup(memberId);
      if (selectedGroup) {
        await fetchGroupMembers(selectedGroup.groupId);
        await fetchGroups(); // Update memberCount in group list
      }
    } catch (error) {
      console.error('Error removing member:', error);
      setError('ไม่สามารถลบสมาชิกได้');
    } finally {
      setUpdatingMember(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAvailableUsersForGroup = () => {
    if (!selectedGroup) return [];

    const memberUserIds = groupMembers.map(m => m.userId);
    return availableUsers.filter(u => !memberUserIds.includes(u.userId));
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['Deputy']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['Deputy']}>
      <Head>
        <title>จัดการคณะกรรมการ - SCH-KPRU</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการคณะกรรมการดำเนินการ</h1>
            <p className="text-gray-600">จัดการคณะกรรมการและสมาชิกในหน่วยงานของคุณ</p>
          </div>
          <Button onClick={handleCreateGroup}>
            <Plus className="mr-2 h-4 w-4" />
            สร้างคณะกรรมการใหม่
          </Button>
        </div>

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Search */}
        <Card>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="ค้นหาคณะกรรมการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingGroups ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredGroups.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบคณะกรรมการ</h3>
              <p className="mt-1 text-sm text-gray-500">เริ่มสร้างคณะกรรมการใหม่</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <Card key={group.groupId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <Badge variant={group.isActive ? 'success' : 'danger'}>
                      {group.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {group.description || 'ไม่มีคำอธิบาย'}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    {group.memberCount} สมาชิก
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMembers(group)}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      จัดการสมาชิก
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGroup(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.groupId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen && (modalMode === 'create' || modalMode === 'edit')}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'create' ? 'สร้างคณะกรรมการใหม่' : 'แก้ไขคณะกรรมการ'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">ชื่อคณะกรรมการ</label>
              <Input
                value={groupForm.name}
                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="เช่น คณะกรรมการตรวจสอบคุณภาพ"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
              <Input
                value={groupForm.description}
                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="อธิบายหน้าที่และความรับผิดชอบ"
              />
            </div>

            {modalMode === 'edit' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={groupForm.isActive}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  เปิดใช้งาน
                </label>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmitGroup} disabled={!groupForm.name.trim()}>
                {modalMode === 'create' ? 'สร้าง' : 'บันทึก'}
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </Modal>

        {/* Members Modal */}
        <Modal
          isOpen={isModalOpen && modalMode === 'members'}
          onClose={() => setIsModalOpen(false)}
          title={`จัดการสมาชิก - ${selectedGroup?.name}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Current Members */}
            <div>
              <h3 className="text-lg font-medium mb-4">สมาชิกปัจจุบัน</h3>
              {loadingMembers ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : groupMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีสมาชิก</p>
              ) : (
                <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <div key={member.membersId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{member.userFullName}</p>
                        <p className="text-sm text-gray-500">{member.userEmail}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRemoveMemberModal(member)}
                        disabled={updatingMember}
                      >
                        {updatingMember ? (
                          <Loading size="sm" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">เพิ่มสมาชิก</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setUserSelectionModalOpen(true)}
                  disabled={updatingMember}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  เลือกสมาชิก
                </Button>
              </div>
              {getAvailableUsersForGroup().length === 0 ? (
                <p className="text-gray-500 text-center py-4">ไม่มีผู้ใช้ที่สามารถเพิ่มได้</p>
              ) : (
                <p className="text-sm text-gray-600">
                  มีผู้ใช้ที่สามารถเพิ่มได้ {getAvailableUsersForGroup().length} คน
                </p>
              )}
            </div>
          </div>
        </Modal>

        {/* User Selection Modal */}
        <UserSelectionModal
          isOpen={userSelectionModalOpen}
          onClose={() => setUserSelectionModalOpen(false)}
          onConfirm={handleAddMembers}
          availableUsers={getAvailableUsersForGroup()}
          title={`เลือกสมาชิกสำหรับ "${selectedGroup?.name}"`}
          isLoading={updatingMember}
        />

        {/* Alert Modal for confirmations */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlertModal}
          onConfirm={alertModal.onConfirm}
          title={alertModal.title}
          message={alertModal.message}
          variant={alertModal.variant}
          isLoading={updatingMember}
        />
      </div>
    </ProtectedRoute>
  );
};

export default CommitteesPage;