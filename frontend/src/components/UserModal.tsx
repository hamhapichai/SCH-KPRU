import React, { useState, useEffect } from 'react';
import { User, Role, Department } from '@/types';
import { userApi, roleApi, departmentApi } from '@/lib/api';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
  mode: 'create' | 'edit' | 'view';
}

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleId: number;
  departmentId: number | null;
  isActive: boolean;
  password?: string;
  confirmPassword?: string;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  mode
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roleId: 1,
    departmentId: null,
    isActive: true,
    password: '',
    confirmPassword: ''
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when user or mode changes
  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: (user.phoneNumber as string) || '',
        roleId: user.roleId,
        departmentId: user.departmentId || null,
        isActive: user.isActive,
        password: '',
        confirmPassword: ''
      });
    } else if (mode === 'create') {
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        roleId: 1,
        departmentId: null,
        isActive: true,
        password: '',
        confirmPassword: ''
      });
    }
    setErrors({});
  }, [user, mode]);

  // Fetch roles and departments
  useEffect(() => {
    if (isOpen) {
      fetchRolesAndDepartments();
    }
  }, [isOpen]);

  // Filter departments based on selected role
  useEffect(() => {
    if (departments.length > 0 && roles.length > 0) {
      const selectedRole = roles.find(r => r.roleId === formData.roleId);

      if (selectedRole && (selectedRole.roleName === 'Admin' || selectedRole.roleName === 'Dean')) {
        // Admin and Dean can use any department
        setAvailableDepartments(departments);
      } else {
        // Other roles can only use departments where isAdminOrDeanDept is false
        setAvailableDepartments(departments.filter(dept => !dept.isAdminOrDeanDept));

        // If current department is admin/dean department and user is not admin/dean, reset department
        const currentDept = departments.find(d => d.departmentId === formData.departmentId);
        if (currentDept && currentDept.isAdminOrDeanDept) {
          setFormData(prev => ({ ...prev, departmentId: null }));
        }
      }
    }
  }, [formData.roleId, departments, roles]);

  const fetchRolesAndDepartments = async () => {
    try {
      const [rolesData, departmentsData] = await Promise.all([
        roleApi.getAllRoles(),
        departmentApi.getAllDepartments()
      ]);
      setRoles(rolesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error fetching roles and departments:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation - English letters and numbers only, no spaces
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username = 'Username must contain only English letters and numbers';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation - proper email format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Phone number validation - Thai phone number format
    if (formData.phoneNumber.trim()) {
      if (!/^0[689]\d{8}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid Thai phone number (10 digits starting with 06, 08, or 09)';
      }
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(formData.password)) {
        newErrors.password = 'Password must contain only English letters, numbers, and special characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        roleId: formData.roleId,
        departmentId: formData.departmentId!,
        isActive: formData.isActive,
        ...(mode === 'create'
          ? { password: formData.password as string }
          : {})
      };

      if (mode === 'create') {
        await userApi.createUser({
          ...submitData,
          password: formData.password as string
        });
      } else if (mode === 'edit') {
        await userApi.updateUser(user!.userId, submitData);
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving user:', error);
      if (error?.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'An error occurred while saving the user' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow numbers
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'roleId' || name === 'departmentId' ? (value ? parseInt(value) : null) :
                name === 'isActive' ? value === 'true' : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'create' ? 'สร้างผู้ใช้ใหม่' :
                    mode === 'edit' ? 'แก้ไขผู้ใช้' : 'รายละเอียดผู้ใช้';

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[10000]">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalTitle}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อผู้ใช้ *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={mode === 'view' || (mode === 'edit' && !!user)}
                    placeholder="ตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อีเมล *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    placeholder="example@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      นามสกุล *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    placeholder="06xxxxxxxx, 08xxxxxxxx, หรือ 09xxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    บทบาท *
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  >
                    {roles.map(role => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หน่วยงาน *
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId || ''}
                    onChange={handleInputChange}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">เลือกหน่วยงาน</option>
                    {availableDepartments.map(dept => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>
                  )}
                  {availableDepartments.length < departments.length && (
                    <p className="mt-1 text-xs text-gray-500">
                      * หน่วยงานบางแห่งถูกจำกัดตามบทบาทที่เลือก
                    </p>
                  )}
                </div>

                {/* Active Status */}
                {mode !== 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สถานะ
                    </label>
                    <select
                      name="isActive"
                      value={formData.isActive.toString()}
                      onChange={handleInputChange}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="true">ใช้งาน</option>
                      <option value="false">ไม่ใช้งาน</option>
                    </select>
                  </div>
                )}

                {/* Password fields for create mode */}
                {mode === 'create' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        รหัสผ่าน *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="ตัวอักษรภาษาอังกฤษ, ตัวเลข, และสัญลักษณ์พิเศษเท่านั้น"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ยืนยันรหัสผ่าน *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {mode !== 'view' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังบันทึก...' : (mode === 'create' ? 'สร้างผู้ใช้' : 'บันทึกการเปลี่ยนแปลง')}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {mode === 'view' ? 'ปิด' : 'ยกเลิก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;