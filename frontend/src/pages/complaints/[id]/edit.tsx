import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Save, X, Calendar, User, Building, FileText, Clock, Users, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  Alert,
  Modal
} from '@/components/ui';
import { Complaint, Department, ComplaintAssignment, ComplaintAssignmentCreate, Group, AISuggestion, ComplaintLog } from '@/types';
import { complaintApi, departmentApi, groupApi, aiSuggestionApi } from '@/lib/api';

const EditComplaintPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [complaintLogs, setComplaintLogs] = useState<ComplaintLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assignment form state
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<ComplaintAssignmentCreate>({
    complaintId: 0,
    assignedToDeptId: undefined,
    assignedToGroupId: undefined,
    assignedToUserId: undefined,
    targetDate: undefined,
    notes: undefined,
  });

  // Committee assignment form state
  const [showCommitteeAssignmentForm, setShowCommitteeAssignmentForm] = useState(false);
  const [committeeAssignmentForm, setCommitteeAssignmentForm] = useState<ComplaintAssignmentCreate>({
    complaintId: 0,
    assignedToDeptId: undefined,
    assignedToGroupId: undefined,
    assignedToUserId: undefined,
    targetDate: undefined,
    notes: undefined,
  });

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchComplaint();
      fetchComplaintLogs();
      fetchAiSuggestion();
      if (user.roleName === 'Dean') {
        fetchDepartments();
      }
      if (user.roleName === 'Deputy' && user.departmentId) {
        fetchGroups();
      }
    }
  }, [id, user]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await complaintApi.getComplaintById(parseInt(id as string));
      setComplaint(response);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      setError('ไม่สามารถโหลดข้อมูลเรื่องร้องเรียนได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintLogs = async () => {
    try {
      const response = await complaintApi.getComplaintLogs(parseInt(id as string));
      setComplaintLogs(response);
    } catch (error) {
      console.error('Error fetching complaint logs:', error);
      // Logs are optional, so we don't set an error
    }
  };

  const fetchAiSuggestion = async () => {
    try {
      const response = await aiSuggestionApi.getAISuggestionByComplaintId(parseInt(id as string));
      setAiSuggestion(response);
    } catch (error) {
      console.log('No AI suggestion available for this complaint');
      // AI suggestion is optional, so we don't set an error
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getActiveDepartments();
      // Filter out admin/dean departments for assignment
      const assignableDepartments = response.filter(dept => !dept.isAdminOrDeanDept);
      setDepartments(assignableDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchGroups = async () => {
    if (!user?.departmentId) return;

    try {
      const response = await groupApi.getGroupsByDepartment(user.departmentId);
      // Filter only active groups
      const activeGroups = response.filter(group => group.isActive);
      setGroups(activeGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleAssignComplaint = async () => {
    if (!complaint) return;

    try {
      setSaving(true);
      const assignmentData = {
        ...assignmentForm,
        complaintId: complaint.complaintId,
      };

      await complaintApi.assignComplaint(complaint.complaintId, assignmentData);

      alert('ส่งต่อเรื่องร้องเรียนเรียบร้อยแล้ว');
      setShowAssignmentForm(false);
      fetchComplaint(); // Refresh data
    } catch (error) {
      console.error('Error assigning complaint:', error);
      setError('ไม่สามารถส่งต่อเรื่องร้องเรียนได้');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!complaint || !newStatus) return;

    try {
      setSaving(true);
      const statusData = {
        newStatus: newStatus,
        notes: statusNotes,
      };

      await complaintApi.updateComplaintStatus(complaint.complaintId, statusData);

      setShowSuccessModal(true);
      setShowStatusUpdateModal(false);
      setNewStatus('');
      setStatusNotes('');
      fetchComplaint(); // Refresh data
      fetchComplaintLogs(); // Refresh logs
    } catch (error) {
      console.error('Error updating status:', error);
      setError('ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignToCommittee = async () => {
    if (!complaint || !user?.departmentId) return;

    try {
      setSaving(true);
      const assignmentData = {
        assignedToDeptId: user.departmentId, // Keep the same department
        assignedToGroupId: committeeAssignmentForm.assignedToGroupId,
        assignedToUserId: committeeAssignmentForm.assignedToUserId,
        targetDate: committeeAssignmentForm.targetDate,
        notes: committeeAssignmentForm.notes,
        status: "Active"
      };

      await complaintApi.assignComplaint(complaint.complaintId, assignmentData);

      alert('ส่งต่อไปยังคณะกรรมการเรียบร้อยแล้ว');
      setShowCommitteeAssignmentForm(false);
      
      // Reset form
      setCommitteeAssignmentForm({
        complaintId: 0,
        assignedToDeptId: undefined,
        assignedToGroupId: undefined,
        assignedToUserId: undefined,
        targetDate: undefined,
        notes: undefined,
      });
      
      fetchComplaint(); // Refresh data
    } catch (error: any) {
      console.error('Error assigning to committee:', error);
      const errorMessage = error.response?.data?.message || 'ไม่สามารถส่งต่อไปยังคณะกรรมการได้';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSelfAssign = async () => {
    if (!complaint || !user) return;

    try {
      setSaving(true);
      
      // Assign the complaint to the current user
      const assignmentData = {
        assignedToUserId: user.userId,
        status: "Active"
      };

      await complaintApi.assignComplaint(complaint.complaintId, assignmentData);

      // Update status to In Progress
      const statusData = {
        newStatus: 'In Progress',
        notes: 'เริ่มดำเนินการโดย ' + user.firstName + ' ' + user.lastName,
      };

      await complaintApi.updateComplaintStatus(complaint.complaintId, statusData);

      alert('เริ่มดำเนินการเรื่องร้องเรียนเรียบร้อยแล้ว');
      fetchComplaint(); // Refresh data
    } catch (error: any) {
      console.error('Error self-assigning complaint:', error);
      const errorMessage = error.response?.data?.message || 'ไม่สามารถดำเนินการเองได้';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'warning';
      case 'Assigned to Department':
        return 'info';
      case 'Assigned to Committee':
        return 'info';
      case 'In Progress':
        return 'info';
      case 'Pending Deputy Dean Approval':
        return 'warning';
      case 'Pending Dean Approval':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Status mapping from English to Thai
  const getStatusLabel = (status: string, userRole?: string) => {
    // Special case for Deputy: show "Assigned to Department" as "รอการดำเนินการ"
    if (userRole === 'Deputy' && status === 'Assigned to Department') {
      return 'รอการดำเนินการ';
    }

    // Special case for Staff: show "Assigned to Committee" as "รอดำเนินการ"
    if (userRole === 'Staff' && status === 'Assigned to Committee') {
      return 'รอดำเนินการ';
    }

    // Special case for Deputy Dean: show "Pending Deputy Dean Approval" as "รอการพิจารณาจากฉัน"
    if (userRole === 'Deputy' && status === 'Pending Deputy Dean Approval') {
      return 'รอการพิจารณาจากฉัน';
    }

    // Special case for Dean: show "Pending Dean Approval" as "รอการพิจารณาจากฉัน"
    if (userRole === 'Dean' && status === 'Pending Dean Approval') {
      return 'รอการพิจารณาจากฉัน';
    }

    switch (status) {
      case 'New':
        return 'เรื่องใหม่';
      case 'Assigned to Department':
        return 'ส่งต่อไปยังหน่วยงานที่เกี่ยวข้องแล้ว';
      case 'Assigned to Committee':
        return 'ส่งต่อไปยังคณะกรรมการที่เกี่ยวข้องแล้ว';
      case 'In Progress':
        return 'กำลังดำเนินการ';
      case 'Pending Deputy Dean Approval':
        return 'รอการพิจารณาจากรองคณบดี';
      case 'Pending Dean Approval':
        return 'รอการพิจารณาจากคณบดี';
      case 'Completed':
        return 'ดำเนินการเสร็จสิ้น';
      case 'Cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['Dean', 'Deputy', 'Staff']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!complaint) {
    return (
      <ProtectedRoute roles={['Dean', 'Deputy', 'Staff']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบเรื่องร้องเรียน</h1>
            <Button onClick={() => router.push('/complaints')}>
              กลับไปหน้าหลัก
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['Dean', 'Deputy', 'Staff']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{complaint.subject}</h1>
            <p className="text-gray-600 text-sm sm:text-base break-all">Ticket ID: {complaint.ticketId}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Action Buttons */}
            {user?.roleName === 'Dean' && complaint.currentStatus === 'New' && (
              <>
                <Button onClick={() => setShowAssignmentForm(true)} className="w-full sm:w-auto">
                  <Building className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">ส่งต่อไปยังหน่วยงาน</span>
                  <span className="sm:hidden">ส่งต่อหน่วยงาน</span>
                </Button>
                <Button variant="outline" onClick={handleSelfAssign} className="w-full sm:w-auto">
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">ดำเนินการเอง</span>
                  <span className="sm:hidden">ดำเนินการเอง</span>
                </Button>
              </>
            )}

            {user?.roleName === 'Deputy' && complaint.currentStatus === 'Assigned to Department' && (
              <>
                <Button onClick={() => setShowCommitteeAssignmentForm(true)} className="w-full sm:w-auto">
                  <Users className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">ส่งต่อไปยังคณะกรรมการ</span>
                  <span className="sm:hidden">ส่งต่อคณะกรรมการ</span>
                </Button>
                <Button variant="outline" onClick={handleSelfAssign} className="w-full sm:w-auto">
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">ดำเนินการเอง</span>
                  <span className="sm:hidden">ดำเนินการเอง</span>
                </Button>
              </>
            )}

            {user?.roleName === 'Staff' && complaint.currentStatus === 'Assigned to Committee' && (
              <Button onClick={() => { setNewStatus('In Progress'); setShowStatusUpdateModal(true); }} className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                เริ่มดำเนินการ
              </Button>
            )}

            {user?.roleName === 'Deputy' && complaint.currentStatus === 'Pending Deputy Dean Approval' && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => { setNewStatus('Pending Dean Approval'); setShowStatusUpdateModal(true); }} className="flex-1 sm:flex-none">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  อนุมัติ
                </Button>
                <Button variant="danger" onClick={() => { setNewStatus('Assigned to Committee'); setShowStatusUpdateModal(true); }} className="flex-1 sm:flex-none">
                  <X className="mr-2 h-4 w-4" />
                  ส่งกลับดำเนินการใหม่
                </Button>
              </div>
            )}

            {user?.roleName === 'Dean' && complaint.currentStatus === 'Pending Dean Approval' && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => { setNewStatus('Completed'); setShowStatusUpdateModal(true); }} className="flex-1 sm:flex-none">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  อนุมัติ
                </Button>
                <Button variant="danger" onClick={() => { setNewStatus('Assigned to Department'); setShowStatusUpdateModal(true); }} className="flex-1 sm:flex-none">
                  <X className="mr-2 h-4 w-4" />
                  ส่งกลับดำเนินการใหม่
                </Button>
              </div>
            )}

            {user?.roleName === 'Staff' && complaint.currentStatus === 'In Progress' && (
              <Button variant="outline" onClick={() => { setNewStatus('Pending Deputy Dean Approval'); setShowStatusUpdateModal(true); }} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                เสร็จสิ้น
              </Button>
            )}

            {user?.roleName === 'Deputy' && complaint.currentStatus === 'In Progress' && (
              <Button variant="outline" onClick={() => { setNewStatus('Pending Dean Approval'); setShowStatusUpdateModal(true); }} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">ดำเนินการเสร็จสิ้น</span>
                <span className="sm:hidden">เสร็จสิ้น</span>
              </Button>
            )}

            {user?.roleName === 'Dean' && complaint.currentStatus === 'In Progress' && (
              <Button variant="outline" onClick={() => { setNewStatus('Completed'); setShowStatusUpdateModal(true); }} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">อนุมัติปิดเรื่อง</span>
                <span className="sm:hidden">ปิดเรื่อง</span>
              </Button>
            )}

            <Button variant="outline" onClick={() => router.push('/complaints')} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              กลับ
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Complaint Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-lg">รายละเอียดเรื่องร้องเรียน</span>
              <Badge variant={getStatusColor(complaint.currentStatus) as any} className="w-fit">
                {getStatusLabel(complaint.currentStatus, user?.roleName)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block">Ticket ID</label>
                <p className="font-mono text-sm break-all">{complaint.ticketId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block">วันที่แจ้ง</label>
                <p className="text-sm">{formatDate(complaint.submissionDate)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block">หัวข้อ</label>
              <p className="font-medium text-sm sm:text-base">{complaint.subject}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block">รายละเอียด</label>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{complaint.message}</p>
            </div>

            {!complaint.isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block">ชื่อผู้แจ้ง</label>
                  <p className="text-sm break-words">{complaint.contactName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block">อีเมล</label>
                  <p className="text-sm break-all">{complaint.contactEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block">เบอร์โทร</label>
                  <p className="text-sm">{complaint.contactPhone}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block">วันที่อัปเดตล่าสุด</label>
                <p className="text-sm">{complaint.updatedAt ? formatDate(complaint.updatedAt) : '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block">อัปเดตโดย</label>
                <p className="text-sm break-words">{complaint.updatedByUserName || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-lg">คำแนะนำจาก AI</span>
                </div>
                {aiSuggestion.confidenceScore && (
                  <Badge variant="info" className="text-xs w-fit">
                    ความมั่นใจ: {Math.round(aiSuggestion.confidenceScore * 100)}%
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestion.summarizedByAI && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block">สรุปโดย AI</label>
                  <p className="mt-1 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg leading-relaxed">
                    {aiSuggestion.summarizedByAI}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiSuggestion.suggestedDepartmentName && user?.roleName === 'Dean' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">หน่วยงานที่แนะนำ</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Building className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-900 break-words">{aiSuggestion.suggestedDepartmentName}</span>
                    </div>
                  </div>
                )}

                {aiSuggestion.suggestedCategory && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">หมวดหมู่ที่แนะนำ</label>
                    <Badge variant="info" className="mt-1 w-fit">
                      {aiSuggestion.suggestedCategory}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                แนะนำเมื่อ: {formatDate(aiSuggestion.suggestedAt)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-lg">สถานะปัจจุบัน</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowTrackingModal(true)} className="w-fit">
                ดูรายละเอียด
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block">สถานะ</label>
                <div className="mt-1">
                  <Badge variant={getStatusColor(complaint.currentStatus) as any} className="w-fit">
                    {getStatusLabel(complaint.currentStatus, user?.roleName)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block">อัปเดตล่าสุด</label>
                <p className="text-sm text-gray-600">
                  {complaint.updatedAt ? formatDate(complaint.updatedAt) : 'ยังไม่มี'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Update Modal */}
        <Modal
          isOpen={showStatusUpdateModal}
          onClose={() => { setShowStatusUpdateModal(false); setNewStatus(''); setStatusNotes(''); }}
          title={`อัปเดตสถานะเป็น: ${getStatusLabel(newStatus, user?.roleName)}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">หมายเหตุ (ไม่บังคับ)</label>
              <Textarea
                placeholder="หมายเหตุ (ไม่บังคับ)"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateStatus} disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
              <Button variant="outline" onClick={() => { setShowStatusUpdateModal(false); setNewStatus(''); setStatusNotes(''); }}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </Modal>

        {/* Assignment Modal */}
        <Modal
          isOpen={showAssignmentForm}
          onClose={() => setShowAssignmentForm(false)}
          title="ส่งต่อไปยังหน่วยงาน"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">เลือกหน่วยงาน</label>
              <Select
                placeholder="เลือกหน่วยงานที่รับผิดชอบ"
                value={assignmentForm.assignedToDeptId?.toString() || ''}
                onChange={(value) => setAssignmentForm(prev => ({
                  ...prev,
                  assignedToDeptId: value ? parseInt(value) : undefined
                }))}
                options={departments.map(dept => ({
                  value: dept.departmentId.toString(),
                  label: dept.departmentName
                }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">ระยะเวลาดำเนินการ (วัน)</label>
              <Input
                type="number"
                placeholder="เช่น 7"
                value={assignmentForm.targetDate?.toString() || ''}
                onChange={(e) => setAssignmentForm(prev => ({
                  ...prev,
                  targetDate: e.target.value ? parseInt(e.target.value) : undefined
                }))}
                leftIcon={<Clock className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">หมายเหตุ</label>
              <Textarea
                placeholder="รายละเอียดเพิ่มเติมสำหรับหน่วยงานที่รับผิดชอบ"
                value={assignmentForm.notes || ''}
                onChange={(e) => setAssignmentForm(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAssignComplaint} disabled={saving}>
                {saving ? 'กำลังส่งต่อ...' : 'ส่งต่อ'}
              </Button>
              <Button variant="outline" onClick={() => setShowAssignmentForm(false)}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </Modal>

        {/* Committee Assignment Modal */}
        <Modal
          isOpen={showCommitteeAssignmentForm}
          onClose={() => setShowCommitteeAssignmentForm(false)}
          title="ส่งต่อไปยังคณะกรรมการ"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">เลือกคณะกรรมการ</label>
              <Select
                placeholder="เลือกคณะกรรมการที่รับผิดชอบ"
                value={committeeAssignmentForm.assignedToGroupId?.toString() || ''}
                onChange={(value) => setCommitteeAssignmentForm(prev => ({
                  ...prev,
                  assignedToGroupId: value ? parseInt(value) : undefined
                }))}
                options={groups.map(group => ({
                  value: group.groupId.toString(),
                  label: group.name
                }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">ระยะเวลาดำเนินการ (วัน)</label>
              <Input
                type="number"
                placeholder="เช่น 7"
                value={committeeAssignmentForm.targetDate?.toString() || ''}
                onChange={(e) => setCommitteeAssignmentForm(prev => ({
                  ...prev,
                  targetDate: e.target.value ? parseInt(e.target.value) : undefined
                }))}
                leftIcon={<Clock className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">หมายเหตุ</label>
              <Textarea
                placeholder="รายละเอียดเพิ่มเติมสำหรับคณะกรรมการที่รับผิดชอบ"
                value={committeeAssignmentForm.notes || ''}
                onChange={(e) => setCommitteeAssignmentForm(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAssignToCommittee} disabled={saving}>
                {saving ? 'กำลังส่งต่อ...' : 'ส่งต่อ'}
              </Button>
              <Button variant="outline" onClick={() => setShowCommitteeAssignmentForm(false)}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </Modal>

        {/* Tracking Modal */}
        <Modal
          isOpen={showTrackingModal}
          onClose={() => setShowTrackingModal(false)}
          title="ติดตามสถานะและประวัติ"
          size="xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">Ticket ID</label>
                <p className="font-mono text-lg font-semibold text-blue-600">{complaint.ticketId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">สถานะปัจจุบัน</label>
                <div className="mt-1">
                  <Badge variant={getStatusColor(complaint.currentStatus) as any}>
                    {getStatusLabel(complaint.currentStatus, user?.roleName)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">วันที่แจ้ง</label>
                <p>{formatDate(complaint.submissionDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">อัปเดตล่าสุด</label>
                <p>{complaint.updatedAt ? formatDate(complaint.updatedAt) : 'ยังไม่มี'}</p>
              </div>
            </div>

            {/* Detailed Timeline */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">ประวัติการดำเนินการ</h3>
              <div className="flow-root max-h-96 overflow-y-auto">
                <ul className="-mb-8">
                  {/* Initial Submission */}
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                            <FileText className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              เรื่องถูกส่งเข้าระบบ
                            </p>
                            <p className="text-sm text-gray-500">
                              เรื่องร้องเรียนได้รับการบันทึกเข้าสู่ระบบเรียบร้อยแล้ว
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {formatDate(complaint.submissionDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {/* Complaint Logs */}
                  {complaintLogs.map((log, index) => (
                    <li key={log.logId}>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white">
                              <Clock className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {log.action}
                              </p>
                              {log.previousStatus && log.newStatus && (
                                <p className="text-sm text-gray-500">
                                  สถานะ: {getStatusLabel(log.previousStatus, user?.roleName)} → {getStatusLabel(log.newStatus, user?.roleName)}
                                </p>
                              )}
                              {log.notes && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">หมายเหตุ:</span> {log.notes}
                                  </p>
                                </div>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                ผู้ดำเนินการ: {log.createdByUserName || 'ระบบ'}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {formatDate(log.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}

                  {/* Completion */}
                  {complaint.currentStatus === 'Completed' && (
                    <li>
                      <div className="relative">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                              <Save className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                เรื่องได้รับการดำเนินการเรียบร้อยแล้ว
                              </p>
                              <p className="text-sm text-gray-500">
                                เรื่องร้องเรียนได้รับการอนุมัติและปิดเรื่องเรียบร้อยแล้ว
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {complaint.updatedAt ? formatDate(complaint.updatedAt) : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">ข้อมูลผู้แจ้ง</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">ชื่อ:</span> {complaint.contactName || 'ไม่ระบุ'}</p>
                  <p><span className="font-medium">อีเมล:</span> {complaint.contactEmail || 'ไม่ระบุ'}</p>
                  <p><span className="font-medium">เบอร์โทร:</span> {complaint.contactPhone || 'ไม่ระบุ'}</p>
                  <p><span className="font-medium">ประเภท:</span> {complaint.isAnonymous ? 'ไม่ระบุตัวตน' : 'ระบุตัวตน'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">ข้อมูลการดำเนินการ</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">ผู้ดำเนินการล่าสุด:</span> {complaint.updatedByUserName || 'ยังไม่มี'}</p>
                  <p><span className="font-medium">วันที่อัปเดต:</span> {complaint.updatedAt ? formatDate(complaint.updatedAt) : 'ยังไม่มี'}</p>
                  <p><span className="font-medium">เวลาที่ใช้:</span> {complaint.updatedAt ? 
                    Math.floor((new Date(complaint.updatedAt).getTime() - new Date(complaint.submissionDate).getTime()) / (1000 * 60 * 60 * 24)) + ' วัน' 
                    : 'ยังไม่มี'}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="สำเร็จ"
          size="sm"
        >
          <div className="text-center py-4">
            <CheckCircle className="text-green-600 text-4xl mb-4 mx-auto" />
            <p className="text-gray-700">อัปเดตสถานะเรียบร้อยแล้ว</p>
            <Button onClick={() => setShowSuccessModal(false)} className="mt-4">
              ตกลง
            </Button>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
};

export default EditComplaintPage;