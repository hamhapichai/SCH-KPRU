import React, { useState } from 'react';
import { User } from '@/types';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
  onToggleStatus: (userId: number, isActive: boolean) => void;
  onResetPassword: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onEditUser,
  onViewUser,
  onResetPassword,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      (user.firstName as string)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName as string)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !filterRole || user.roleName === filterRole;
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get unique roles for filter
  const uniqueRoles = [...new Set(users.map(user => user.roleName))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stroke rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-stroke rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="">บทบาททั้งหมด</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-stroke rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="">สถานะทั้งหมด</option>
          <option value="active">ใช้งาน</option>
          <option value="inactive">ไม่ใช้งาน</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2">
              <th className="px-4 py-4 text-left font-medium text-black">
                ผู้ใช้
              </th>
              <th className="px-4 py-4 text-left font-medium text-black">
                บทบาท
              </th>
              <th className="px-4 py-4 text-left font-medium text-black">
                หน่วยงาน
              </th>
              <th className="px-4 py-4 text-center font-medium text-black">
                สถานะ
              </th>
              <th className="px-4 py-4 text-left font-medium text-black">
                เข้าสู่ระบบล่าสุด
              </th>
              <th className="px-4 py-4 text-center font-medium text-black">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.userId}
                className="border-b border-stroke hover:bg-gray-1"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {(user.firstName as string)?.charAt(0)}{(user.lastName as string)?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-black">
                        {user?.firstName as string} {user?.lastName as string}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user?.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        @{user?.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {user.roleName}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-black">
                    {user.departmentName || '-'}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {user.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-black">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'ไม่เคย'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    {/* View Button */}
                    <button
                      onClick={() => onViewUser(user)}
                      className="p-2 text-gray-600 hover:text-primary"
                      title="ดูรายละเอียด"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEditUser(user)}
                      className="p-2 text-gray-600 hover:text-warning"
                      title="แก้ไขผู้ใช้"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Toggle Status Button */}
                    {/* <button
                      onClick={() => onToggleStatus(user.userId, user.isActive)}
                      className={`p-2 ${
                        user.isActive
                          ? 'text-gray-600 hover:text-danger'
                          : 'text-gray-600 hover:text-success'
                      }`}
                      title={user.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    >
                      {user.isActive ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button> */}

                    {/* Reset Password Button */}
                    <button
                      onClick={() => onResetPassword(user.userId)}
                      className="p-2 text-gray-600 hover:text-secondary"
                      title="รีเซ็ตรหัสผ่าน"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                      </svg>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteUser(user.userId)}
                      className="p-2 text-gray-600 hover:text-danger"
                      title="ลบผู้ใช้"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mt-4 text-sm text-gray-500">
        แสดง {filteredUsers.length} จาก {users.length} ผู้ใช้
      </div>
    </div>
  );
};

export default UserTable;