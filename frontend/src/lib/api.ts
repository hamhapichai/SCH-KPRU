import axios from 'axios';
import { Department, User, Complaint, Role, ComplaintCreate, ComplaintUpdate, PaginatedResponse, Group, GroupCreate, GroupUpdate, Member, MemberCreate } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Department API
export const departmentApi = {
  // Get all departments
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get('/admin/Departments');
    return response.data;
  },

  // Get active departments only
  getActiveDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get('/admin/Departments/active');
    return response.data;
  },

  // Get single department by ID
  getDepartmentById: async (id: number): Promise<Department> => {
    const response = await apiClient.get(`/admin/Departments/${id}`);
    return response.data;
  },

  // Create new department
  createDepartment: async (department: Omit<Department, 'departmentId' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'updatedByUserId'>): Promise<Department> => {
    const response = await apiClient.post('/admin/Departments', department);
    return response.data;
  },

  // Update department
  updateDepartment: async (id: number, department: Omit<Department, 'departmentId' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'updatedByUserId'>): Promise<Department> => {
    const response = await apiClient.put(`/admin/Departments/${id}`, department);
    return response.data;
  },

  // Delete department (soft delete)
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/Departments/${id}`);
  },
};

// User API
export const userApi = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/admin/Users');
    // Map API response to match our User interface
    const users = response.data.map((user: any) => ({
      userId: user.userId,
      username: user.username,
      email: user.email,
      firstName: user.name,
      lastName: user.lastname,
      bio: user.bio,
      roleId: user.roleId,
      roleName: user.roleName,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));
    return users;
  },

  // Get single user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/admin/Users/${id}`);
    // Map API response to match our User interface
    const user = response.data;
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      firstName: user.name,
      lastName: user.lastname,
      bio: user.bio,
      roleId: user.roleId,
      roleName: user.roleName,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  },

  // Get user by username
  getUserByUsername: async (username: string): Promise<User> => {
    const response = await apiClient.get(`/admin/Users/username/${username}`);
    // Map API response to match our User interface
    const user = response.data;
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      firstName: user.name,
      lastName: user.lastname,
      bio: user.bio,
      roleId: user.roleId,
      roleName: user.roleName,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  },

  // Create new user
  createUser: async (user: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber?: string;
    departmentId: number;
    roleId: number;
    isActive: boolean;
    password: string;
  }): Promise<User> => {
    // Map frontend format to backend format
    const requestData = {
      name: user.firstName,
      lastname: user.lastName,
      username: user.username,
      email: user.email,
      password: user.password,
      phoneNumber: user.phoneNumber,
      departmentId: user.departmentId,
      roleId: user.roleId,
      isActive: user.isActive
    };
    const response = await apiClient.post('/admin/Users', requestData);
    // Map API response to match our User interface
    const createdUser = response.data;
    return {
      userId: createdUser.userId,
      username: createdUser.username,
      email: createdUser.email,
      firstName: createdUser.name,
      lastName: createdUser.lastname,
      bio: createdUser.bio,
      roleId: createdUser.roleId,
      roleName: createdUser.roleName,
      departmentId: createdUser.departmentId,
      departmentName: createdUser.departmentName,
      lastLoginAt: createdUser.lastLoginAt,
      isActive: createdUser.isActive,
      createdAt: createdUser.createdAt
    };
  },

  // Update user
  updateUser: async (id: number, user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    departmentId?: number;
    roleId?: number;
    isActive?: boolean;
  }): Promise<User> => {
    // Map frontend format to backend format
    const requestData = {
      ...(user.firstName !== undefined && { name: user.firstName }),
      ...(user.lastName !== undefined && { lastname: user.lastName }),
      ...(user.email !== undefined && { email: user.email }),
      ...(user.phoneNumber !== undefined && { phoneNumber: user.phoneNumber }),
      ...(user.departmentId !== undefined && { departmentId: user.departmentId }),
      ...(user.roleId !== undefined && { roleId: user.roleId }),
      ...(user.isActive !== undefined && { isActive: user.isActive })
    };
    const response = await apiClient.put(`/admin/Users/${id}`, requestData);
    // Map API response to match our User interface
    const updatedUser = response.data;
    return {
      userId: updatedUser.userId,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.name,
      lastName: updatedUser.lastname,
      bio: updatedUser.bio,
      roleId: updatedUser.roleId,
      roleName: updatedUser.roleName,
      departmentId: updatedUser.departmentId,
      departmentName: updatedUser.departmentName,
      lastLoginAt: updatedUser.lastLoginAt,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    };
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/Users/${id}`);
  },

  // Update user status (active/inactive)
  updateUserStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/admin/Users/${id}/status`, { isActive });
  },

  // Reset user password
  resetUserPassword: async (id: number): Promise<void> => {
    await apiClient.post(`/admin/Users/${id}/reset-password`);
  },

  // Change user password
  changeUserPassword: async (id: number, currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/admin/Users/${id}/change-password`, {
      currentPassword,
      newPassword
    });
  },

  // Get users by department
  getUsersByDepartment: async (departmentId: number): Promise<User[]> => {
    const response = await apiClient.get(`/admin/Users/department/${departmentId}`);
    // Map API response to match our User interface
    const users = response.data.map((user: any) => ({
      ...user,
      firstName: user.name,
      lastName: user.lastname
    }));
    return users;
  },

  // Get users by role
  getUsersByRole: async (roleId: number): Promise<User[]> => {
    const response = await apiClient.get(`/admin/Users/role/${roleId}`);
    // Map API response to match our User interface
    const users = response.data.map((user: any) => ({
      ...user,
      firstName: user.name,
      lastName: user.lastname
    }));
    return users;
  },
};

// Role API
export const roleApi = {
  // Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get('/admin/Roles');
    return response.data;
  },
};

// Complaint API
export const complaintApi = {
  // Get all complaints (role-based filtering)
  getAllComplaints: async (): Promise<Complaint[]> => {
    const response = await apiClient.get('/admin/Complaints');
    return response.data;
  },

  // Get filtered complaints with pagination
  getFilteredComplaints: async (
    searchTerm?: string,
    status?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Complaint>> => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const response = await apiClient.get(`/admin/Complaints/filtered?${params}`);
    return response.data;
  },

  // Get complaint by ID
  getComplaintById: async (id: number): Promise<Complaint> => {
    const response = await apiClient.get(`/admin/Complaints/${id}`);
    return response.data;
  },

  // Get complaint by ticket ID
  getComplaintByTicketId: async (ticketId: string): Promise<Complaint> => {
    const response = await apiClient.get(`/admin/Complaints/ticket/${ticketId}`);
    return response.data;
  },

  // Create new complaint
  createComplaint: async (complaint: ComplaintCreate): Promise<Complaint> => {
    const response = await apiClient.post('/Complaints', complaint);
    return response.data;
  },

  // Update complaint
  updateComplaint: async (id: number, complaint: ComplaintUpdate): Promise<Complaint> => {
    const response = await apiClient.put(`/admin/Complaints/${id}`, complaint);
    return response.data;
  },

  // Delete complaint
  deleteComplaint: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/Complaints/${id}`);
  },

  // Get complaints by status
  getComplaintsByStatus: async (status: string): Promise<Complaint[]> => {
    const response = await apiClient.get(`/admin/Complaints/status/${status}`);
    return response.data;
  },

  // Search complaints
  searchComplaints: async (searchTerm: string): Promise<Complaint[]> => {
    const response = await apiClient.get(`/admin/Complaints/search/${searchTerm}`);
    return response.data;
  },

  // Get recent complaints
  getRecentComplaints: async (count: number = 10): Promise<Complaint[]> => {
    const response = await apiClient.get(`/admin/Complaints/recent?count=${count}`);
    return response.data;
  },

  // Assignment operations
  assignComplaint: async (complaintId: number, assignmentData: any): Promise<any> => {
    const response = await apiClient.post(`/admin/Complaints/${complaintId}/assign`, assignmentData);
    return response.data;
  },

  getComplaintAssignments: async (complaintId: number): Promise<any[]> => {
    const response = await apiClient.get(`/admin/Complaints/${complaintId}/assignments`);
    return response.data;
  },

  // Status update with notes
  updateComplaintStatus: async (complaintId: number, statusData: any): Promise<Complaint> => {
    const response = await apiClient.put(`/admin/Complaints/${complaintId}/status`, statusData);
    return response.data;
  },

  // Log operations
  getComplaintLogs: async (complaintId: number): Promise<any[]> => {
    const response = await apiClient.get(`/admin/Complaints/${complaintId}/logs`);
    return response.data;
  },

  // Dashboard operations
  getDashboardStats: async (): Promise<any> => {
    const response = await apiClient.get('/admin/Complaints/dashboard/stats');
    return response.data;
  },

  getRecentComplaintsForDashboard: async (count: number = 5): Promise<any[]> => {
    const response = await apiClient.get(`/admin/Complaints/dashboard/recent?count=${count}`);
    return response.data;
  },
};

// Group API
export const groupApi = {
  // Get all groups
  getAllGroups: async (): Promise<Group[]> => {
    const response = await apiClient.get('/admin/Groups');
    return response.data;
  },

  // Get groups by department
  getGroupsByDepartment: async (departmentId: number): Promise<Group[]> => {
    const response = await apiClient.get(`/admin/Groups/department/${departmentId}`);
    return response.data;
  },

  // Get group by ID
  getGroupById: async (id: number): Promise<Group> => {
    const response = await apiClient.get(`/admin/Groups/${id}`);
    return response.data;
  },

  // Create new group
  createGroup: async (groupData: GroupCreate): Promise<Group> => {
    const response = await apiClient.post('/admin/Groups', groupData);
    return response.data;
  },

  // Update group
  updateGroup: async (id: number, groupData: GroupUpdate): Promise<void> => {
    await apiClient.put(`/admin/Groups/${id}`, groupData);
  },

  // Delete group
  deleteGroup: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/Groups/${id}`);
  },

  // Get group members
  getGroupMembers: async (groupId: number): Promise<Member[]> => {
    const response = await apiClient.get(`/admin/Groups/${groupId}/members`);
    return response.data;
  },

  // Add member to group
  addMemberToGroup: async (groupId: number, memberData: MemberCreate): Promise<Member> => {
    const response = await apiClient.post(`/admin/Groups/${groupId}/members`, memberData);
    return response.data;
  },

  // Remove member from group
  removeMemberFromGroup: async (memberId: number): Promise<void> => {
    await apiClient.delete(`/admin/Groups/members/${memberId}`);
  },
};

// AI Suggestions API
export const aiSuggestionApi = {
  // Get AI suggestion by complaint ID
  getAISuggestionByComplaintId: async (complaintId: number): Promise<any> => {
    const response = await apiClient.get(`/admin/AISuggestions/complaint/${complaintId}`);
    return response.data;
  },

  // Get all AI suggestions
  getAllAISuggestions: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/AISuggestions');
    return response.data;
  },
};

export default apiClient;