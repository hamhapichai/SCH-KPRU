import React from 'react';
import { useRouter } from 'next/router';
import { Search, FileText, Clock, CheckCircle, AlertCircle, User, Calendar, Building, ArrowRight } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Alert } from '@/components/ui';
import apiClient from '@/lib/api';

interface ComplaintStatus {
  complaintId: number;
  ticketId: string;
  subject: string;
  message: string;
  currentStatus: string;
  submissionDate: string;
  updatedAt?: string;
  isAnonymous: boolean;
  contactName?: string;
  assignments?: {
    assignmentId: number;
    departmentName?: string;
    groupName?: string;
    assignedDate: string;
    status: string;
  }[];
  logs?: any[];
  aiSuggestion?: {
    aiSuggestionId: number;
    complaintId: number;
    suggestedDeptId?: number;
    suggestedDepartmentName?: string;
    suggestedCategory?: string;
    summarizedByAI?: string;
    confidenceScore?: number;
    suggestedAt: string;
  };
}

const TrackComplaintPage = () => {
  const router = useRouter();
  const { ticket } = router.query;
  
  const [ticketId, setTicketId] = React.useState(ticket as string || '');
  const [complaint, setComplaint] = React.useState<ComplaintStatus | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const searchComplaint = async (searchTicketId?: string) => {
    const searchId = searchTicketId || ticketId;
    if (!searchId.trim()) {
      setError('กรุณากรอก Ticket ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/complaints/track/${searchId}`);
      const complaintData = response.data;
      
      // Try to fetch AI suggestion
      try {
        const aiSuggestionResponse = await apiClient.get(`/admin/AISuggestions/complaint/${complaintData.complaintId}`);
        complaintData.aiSuggestion = aiSuggestionResponse.data;
      } catch (aiError) {
        console.log('No AI suggestion available for this complaint');
        // AI suggestion is optional, so we don't set an error
      }
      
      setComplaint(complaintData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'ไม่พบข้อมูลเรื่องร้องเรียน');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (ticket) {
      searchComplaint(ticket as string);
    }
  }, [ticket]);

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
  const getStatusLabel = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New':
        return <Clock className="h-4 w-4" />;
      case 'Assigned to Department':
      case 'Assigned to Committee':
        return <ArrowRight className="h-4 w-4" />;
      case 'In Progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'Pending Deputy Dean Approval':
      case 'Pending Dean Approval':
        return <Clock className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-1">
      {/* Header */}
      <div className="bg-white shadow-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Search className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-heading">ติดตามเรื่องร้องเรียน</h1>
                <p className="text-sm text-body-color">ตรวจสอบสถานะการดำเนินการ</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push('/complaints/create')} className="w-full sm:w-auto">
              แจ้งเรื่องใหม่
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Box */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <Input
                  label="Ticket ID"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="กรอก Ticket ID ที่ได้รับเมื่อแจ้งเรื่อง เช่น TK-001"
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <Button 
                onClick={() => searchComplaint()}
                loading={loading}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Complaint Details */}
        {complaint && (
          <div className="space-y-6">
            {/* Main Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-lg">ข้อมูลเรื่องร้องเรียน</span>
                  </div>
                  <Badge variant={getStatusColor(complaint.currentStatus) as any} className="w-fit flex items-center space-x-1">
                    {getStatusIcon(complaint.currentStatus)}
                    <span>{getStatusLabel(complaint.currentStatus)}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">Ticket ID</label>
                    <p className="mt-1 text-lg font-mono font-semibold text-blue-600 break-all">{complaint.ticketId}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block">วันที่แจ้ง</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">{formatDate(complaint.submissionDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700 block">หัวข้อ</label>
                  <p className="mt-1 text-base sm:text-lg font-medium text-gray-900 break-words">{complaint.subject}</p>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 block">รายละเอียด</label>
                  <p className="mt-1 whitespace-pre-wrap text-gray-600 text-sm leading-relaxed">{complaint.message}</p>
                </div>

                {!complaint.isAnonymous && complaint.contactName && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 block">ผู้แจ้ง</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm break-words">{complaint.contactName}</span>
                    </div>
                  </div>
                )}

                {complaint.updatedAt && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 block">อัปเดตล่าสุด</label>
                    <p className="mt-1 text-sm text-gray-500">{formatDate(complaint.updatedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestion */}
            {complaint.aiSuggestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-lg">คำแนะนำจาก AI</span>
                    </div>
                    {complaint.aiSuggestion.confidenceScore && (
                      <Badge variant="info" className="text-xs w-fit">
                        ความมั่นใจ: {Math.round(complaint.aiSuggestion.confidenceScore * 100)}%
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {complaint.aiSuggestion.summarizedByAI && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 block">สรุปโดย AI</label>
                      <p className="mt-1 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg leading-relaxed">
                        {complaint.aiSuggestion.summarizedByAI}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {complaint.aiSuggestion.suggestedDepartmentName && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block">หน่วยงานที่แนะนำ</label>
                        <div className="mt-1 flex items-center space-x-2">
                          <Building className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900 break-words">{complaint.aiSuggestion.suggestedDepartmentName}</span>
                        </div>
                      </div>
                    )}

                    {complaint.aiSuggestion.suggestedCategory && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block">หมวดหมู่ที่แนะนำ</label>
                        <Badge variant="info" className="mt-1 w-fit">
                          {complaint.aiSuggestion.suggestedCategory}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    แนะนำเมื่อ: {formatDate(complaint.aiSuggestion.suggestedAt)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-lg">ติดตามสถานะ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flow-root max-w-full overflow-y-scroll" style={{ maxHeight: '400px' }}>
                  <ul className="-mb-8">
                    {/* Initial submission */}
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div className="flex-shrink-0">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                              <FileText className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div className="min-w-0 flex-1 pr-4">
                              <p className="text-sm font-medium text-gray-900 break-words">
                                เรื่องถูกส่งเข้าระบบแล้ว
                              </p>
                              <p className="text-sm text-gray-500 break-words">
                                เรื่องร้องเรียนได้รับการบันทึกในระบบเรียบร้อยแล้ว
                              </p>
                            </div>
                            <div className="flex-shrink-0 whitespace-nowrap text-right text-sm text-gray-500 hidden sm:block">
                              {formatDate(complaint.submissionDate)}
                            </div>
                            <div className="flex-shrink-0 text-right text-sm text-gray-500 sm:hidden">
                              <div className="text-xs">
                                {new Date(complaint.submissionDate).toLocaleDateString('th-TH', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>

                    {/* Assignments */}
                    {complaint.assignments && complaint.assignments.length > 0 && complaint.assignments.map((assignment, index) => (
                      <li key={assignment.assignmentId}>
                        <div className="relative pb-8">
                          <div className="relative flex space-x-3">
                            <div className="flex-shrink-0">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white">
                                <Building className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div className="min-w-0 flex-1 pr-4">
                                <p className="text-sm font-medium text-gray-900 break-words">
                                  ส่งต่อไปยัง{assignment.departmentName ? `หน่วยงาน: ${assignment.departmentName}` : assignment.groupName ? `คณะกรรมการ: ${assignment.groupName}` : 'หน่วยงานที่เกี่ยวข้อง'}
                                </p>
                                <p className="text-sm text-gray-500 break-words">
                                  เรื่องได้รับการส่งต่อเพื่อดำเนินการ
                                </p>
                              </div>
                              <div className="flex-shrink-0 whitespace-nowrap text-right text-sm text-gray-500 hidden sm:block">
                                {formatDate(assignment.assignedDate)}
                              </div>
                              <div className="flex-shrink-0 text-right text-sm text-gray-500 sm:hidden">
                                <div className="text-xs">
                                  {new Date(assignment.assignedDate).toLocaleDateString('th-TH', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}

                    {/* Status updates */}
                    {complaint.currentStatus !== 'New' && complaint.currentStatus !== 'Assigned to Department' && complaint.currentStatus !== 'Assigned to Committee' && (
                      <li>
                        <div className="relative pb-8">
                          <div className="relative flex space-x-3">
                            <div className="flex-shrink-0">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 ring-8 ring-white">
                                <AlertCircle className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div className="min-w-0 flex-1 pr-4">
                                <p className="text-sm font-medium text-gray-900 break-words">
                                  {getStatusLabel(complaint.currentStatus)}
                                </p>
                                <p className="text-sm text-gray-500 break-words">
                                  กำลังดำเนินการตามขั้นตอน
                                </p>
                              </div>
                              <div className="flex-shrink-0 whitespace-nowrap text-right text-sm text-gray-500 hidden sm:block">
                                {complaint.updatedAt ? formatDate(complaint.updatedAt) : '-'}
                              </div>
                              <div className="flex-shrink-0 text-right text-sm text-gray-500 sm:hidden">
                                <div className="text-xs">
                                  {complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString('th-TH', {
                                    month: 'short',
                                    day: 'numeric',
                                  }) : '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}

                    {/* Completion */}
                    {complaint.currentStatus === 'Completed' && (
                      <li>
                        <div className="relative">
                          <div className="relative flex space-x-3">
                            <div className="flex-shrink-0">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div className="min-w-0 flex-1 pr-4">
                                <p className="text-sm font-medium text-gray-900 break-words">
                                  เรื่องได้รับการดำเนินการเรียบร้อยแล้ว
                                </p>
                                <p className="text-sm text-gray-500 break-words">
                                  ขอบคุณสำหรับการแจ้งเรื่องร้องเรียน
                                </p>
                              </div>
                              <div className="flex-shrink-0 whitespace-nowrap text-right text-sm text-gray-500 hidden sm:block">
                                {complaint.updatedAt ? formatDate(complaint.updatedAt) : '-'}
                              </div>
                              <div className="flex-shrink-0 text-right text-sm text-gray-500 sm:hidden">
                                <div className="text-xs">
                                  {complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString('th-TH', {
                                    month: 'short',
                                    day: 'numeric',
                                  }) : '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Help Info */}
            <Card>
              <CardContent>
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        ข้อมูลการติดตาม
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc space-y-1 pl-5">
                          <li>Ticket ID นี้ใช้สำหรับติดตามเรื่องร้องเรียนของท่าน</li>
                          <li>กรุณาเก็บ Ticket ID นี้ไว้เพื่อใช้ในการติดตาม</li>
                          <li>สถานะจะอัปเดตอัตโนมัติเมื่อมีการดำเนินการ</li>
                          <li>หากมีคำถามเพิ่มเติม กรุณาติดต่อหน่วยงานโดยอ้างอิง Ticket ID</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 มหาวิทยาลัยราชภัฏกำแพงเพชร - ระบบติดตามเรื่องร้องเรียน</p>
        </div>
      </div>
    </div>
  );
};

export default TrackComplaintPage;