import React, { useState, useMemo } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, Button, Input, Table, Column } from '@/components/ui';
import { User } from '@/types';

export interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedUsers: User[]) => void;
  availableUsers: User[];
  title?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  availableUsers,
  title = 'เลือกสมาชิก',
  confirmText = 'เพิ่มสมาชิกที่เลือก',
  cancelText = 'ยกเลิก',
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return availableUsers;

    const term = searchTerm.toLowerCase();
    return availableUsers.filter(user =>
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }, [availableUsers, searchTerm]);

  // Handle user selection
  const handleUserToggle = (userId: number) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.userId)));
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    const selectedUsers = availableUsers.filter(user => selectedUserIds.has(user.userId));
    onConfirm(selectedUsers);
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedUserIds(new Set());
    }
  }, [isOpen]);

  const columns: Column<User>[] = [
    {
      key: 'select',
      title: '',
      render: (value: unknown, user: User) => (
        <input
          type="checkbox"
          checked={selectedUserIds.has(user.userId)}
          onChange={() => handleUserToggle(user.userId)}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      key: 'name',
      title: 'ชื่อ-นามสกุล',
      render: (value: unknown, user: User) => (
        <div>
          <div className="font-medium">{user.firstName} {user.lastName}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'สถานะ',
      render: (value: unknown, user: User) => (
        <span className={cn(
          'inline-flex px-2 py-1 text-xs font-medium rounded-full',
          user.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        )}>
          {user.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
        </span>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      showCloseButton={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selection Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            เลือกแล้ว {selectedUserIds.size} จาก {filteredUsers.length} คน
          </span>
          {selectedUserIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUserIds(new Set())}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4 mr-1" />
              ล้างการเลือก
            </Button>
          )}
        </div>

        {/* Users Table */}
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'ไม่พบผู้ใช้ที่ตรงกับคำค้นหา' : 'ไม่มีผู้ใช้ที่สามารถเพิ่มได้'}
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredUsers}
              className="min-w-full"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || selectedUserIds.size === 0}
            loading={isLoading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {confirmText} ({selectedUserIds.size})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserSelectionModal;