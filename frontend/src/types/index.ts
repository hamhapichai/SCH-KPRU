export interface User {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  roleId: number;
  roleName: string;
  departmentId?: number;
  departmentName?: string;
  lastLoginAt?: string;
  isActive: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
  department?: string;
  expiresAt: string;
}

export interface UserCreate {
  username: string;
  password: string;
  email: string;
  name: string;
  lastname: string;
  bio?: string;
  roleId: number;
  departmentId?: number;
}

export interface UserUpdate {
  email?: string;
  name?: string;
  lastname?: string;
  bio?: string;
  roleId?: number;
  departmentId?: number;
  isActive?: boolean;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
  description?: string;
  isAdminOrDeanDept: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  createdByUserId?: number;
  updatedByUserId?: number;
  userCount?: number; // เพิ่มสำหรับแสดงจำนวนผู้ใช้
  [key: string]: unknown;
}

export interface Complaint {
  complaintId: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  subject: string;
  message: string;
  submissionDate: string;
  currentStatus: string;
  isAnonymous: boolean;
  ticketId: string;
  updatedAt?: string;
  updatedByUserName?: string;
  [key: string]: unknown;
}

export interface ComplaintCreate {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  subject: string;
  message: string;
  isAnonymous?: boolean;
}

export interface ComplaintUpdate {
  currentStatus?: string;
}

export interface ComplaintAssignment {
  assignmentId: number;
  complaintId: number;
  complaintSubject: string;
  assignedByUserId: number;
  assignedByUserName: string;
  assignedToDeptId?: number;
  assignedToDeptName?: string;
  assignedToGroupId?: number;
  assignedToGroupName?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  targetDate?: string;
  status: string;
  assignedDate: string;
  receivedDate?: string;
  completedDate?: string;
  closedDate?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  complaints: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface Group {
  groupId: number;
  departmentId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdByUserId?: number;
  updatedByUserId?: number;
}

export interface Member {
  membersId: number;
  groupId: number;
  userId: number;
  createdAt: string;
  createdByUserId?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ComplaintLog {
  logId: number;
  complaintId: number;
  userId?: number;
  userName?: string;
  departmentId?: number;
  departmentName?: string;
  action: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
  timestamp: string;
  metadata?: string;
  relatedAssignmentId?: number;
  createdByUserId?: number;
  createdByUserName?: string;
  [key: string]: unknown;
}

export interface ComplaintAssignmentCreate {
  complaintId: number;
  assignedToDeptId?: number;
  assignedToGroupId?: number;
  assignedToUserId?: number;
  targetDate?: number; // ระยะเวลาเป็นวัน
  notes?: string;
}

export interface Group {
  groupId: number;
  departmentId: number;
  departmentName: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdByUserName?: string;
  updatedByUserName?: string;
  memberCount: number;
}

export interface GroupCreate {
  departmentId: number;
  name: string;
  description?: string;
}

export interface GroupUpdate {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Member {
  membersId: number;
  groupId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userFullName: string;
  createdAt: string;
  createdByUserName?: string;
}

export interface MemberCreate {
  groupId: number;
  userId: number;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  totalUsers: number;
  totalDepartments: number;
  averageResponseTimeValue: number;
  averageResponseTimeUnit: string;
  averageResponseTimeDisplay: string;
}

export interface RecentComplaint {
  complaintId: number;
  subject: string;
  currentStatus: string;
  departmentName?: string;
  submissionDate: string;
  ticketId: string;
}

export interface AISuggestion {
  aiSuggestionId: number;
  complaintId: number;
  suggestedDeptId?: number;
  suggestedDepartmentName?: string;
  suggestedCategory?: string;
  summarizedByAI?: string;
  confidenceScore?: number;
  suggestedAt: string;
  n8nWorkflowId?: string;
}