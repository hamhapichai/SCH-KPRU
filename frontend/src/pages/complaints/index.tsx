import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, Eye, Edit, Trash2, Settings, X } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Select, 
  Table, 
  Badge, 
  Modal 
} from '@/components/ui';
import { Column } from '@/components/ui/Table';
import { Complaint } from '@/types';
import { complaintApi } from '@/lib/api';

const ComplaintsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);

  // Redirect Admin to users page
  useEffect(() => {
    if (user?.roleName === 'Admin') {
      router.push('/users');
    }
  }, [user, router]);

  // Fetch complaints data
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintApi.getFilteredComplaints(
        searchTerm || undefined,
        statusFilter || undefined,
        currentPage,
        pageSize
      );
      
      setComplaints(response.complaints);
      setTotalCount(response.pagination.totalCount);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters or page changes
  React.useEffect(() => {
    if (user && user.roleName !== 'Admin') {
      fetchComplaints();
    }
  }, [user, searchTerm, statusFilter, currentPage, pageSize]);

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

  const columns: Column<Complaint>[] = [
    {
      key: 'ticketId',
      title: 'Ticket ID',
      width: '120px',
      render: (value) => (
        <span className="font-mono text-sm">{String(value)}</span>
      ),
    },
    {
      key: 'subject',
      title: 'หัวข้อ',
      render: (value, record) => (
        <div>
          <div className="font-medium">{String(value)}</div>
          <div className="text-sm text-gray-500">
            {record.isAnonymous ? 'ผู้ใช้ไม่ระบุชื่อ' : record.contactName}
          </div>
        </div>
      ),
    },
    {
      key: 'currentStatus',
      title: 'สถานะ',
      width: '120px',
      render: (value) => (
        <Badge variant={getStatusColor(String(value)) as any}>
          {getStatusLabel(String(value), user?.roleName)}
        </Badge>
      ),
    },
    {
      key: 'submissionDate',
      title: 'วันที่แจ้ง',
      width: '150px',
      render: (value) => formatDate(String(value)),
    },
    {
      key: 'actions',
      title: 'การดำเนินการ',
      width: '150px',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewComplaint(record)}
            title='ดูรายละเอียด'
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/complaints/${record.complaintId}/edit`)}
            title='ดำเนินการ'
          >
            <Edit className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteComplaint(record.complaintId)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button> */}
        </div>
      ),
    },
  ];

  const handleRowClick = (complaint: Complaint) => {
    router.push(`/complaints/${complaint.complaintId}/edit`);
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsViewModalOpen(true);
  };

  const handleDeleteComplaint = (id: number) => {
    if (confirm('คุณต้องการลบข้อร้องเรียนนี้ใช่หรือไม่?')) {
      setComplaints(complaints.filter(c => c.complaintId !== id));
    }
  };

  const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'New', label: 'เรื่องใหม่' },
    { value: 'Assigned to Department', label: 'ส่งต่อไปยังหน่วยงานที่เกี่ยวข้องแล้ว' },
    { value: 'Assigned to Committee', label: 'ส่งต่อไปยังคณะกรรมการที่เกี่ยวข้องแล้ว' },
    { value: 'In Progress', label: 'กำลังดำเนินการ' },
    { value: 'Pending Deputy Dean Approval', label: 'รอการพิจารณาจากรองคณบดี' },
    { value: 'Pending Dean Approval', label: 'รอการพิจารณาจากคณบดี' },
    { value: 'Completed', label: 'ดำเนินการเสร็จสิ้น' },
    { value: 'Cancelled', label: 'ยกเลิก' },
  ];

  return (
    <ProtectedRoute roles={['Dean', 'Deputy', 'Staff']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 p-8 text-gray-800 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">จัดการข้อร้องเรียน</h1>
                <p className="text-slate-600 mt-2 text-lg">จัดการและติดตามข้อร้องเรียนทั้งหมดในระบบ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="mr-2 h-5 w-5 text-blue-600" />
                ค้นหาและกรอง
              </h3>
              <p className="text-sm text-gray-600 mt-1">ค้นหาข้อร้องเรียนตามเงื่อนไขต่างๆ</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                {totalCount} รายการ
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Search className="mr-2 h-4 w-4 text-gray-500" />
                ค้นหา
              </label>
              <div className="relative">
                <Input
                  placeholder="หัวข้อ, Ticket ID, ชื่อผู้แจ้ง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                สถานะ
              </label>
              <Select
                placeholder="เลือกสถานะ"
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Advanced Filters Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                ตัวกรองเพิ่มเติม
              </label>
              <Button
                variant="outline"
                className="w-full h-12 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <Filter className="mr-2 h-4 w-4" />
                ตัวกรองเพิ่มเติม
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter) && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">ตัวกรองที่ใช้งาน:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Search className="mr-1 h-3 w-3" />
                        ค้นหา: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {statusFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <div className="mr-1 h-2 w-2 rounded-full bg-purple-500"></div>
                        สถานะ: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                        <button
                          onClick={() => setStatusFilter('')}
                          className="ml-2 hover:bg-purple-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ล้างทั้งหมด
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  รายการข้อร้องเรียน
                </h3>
                <p className="text-sm text-gray-600 mt-1">แสดง {complaints.length} จาก {totalCount} รายการ</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                  {totalCount} รายการทั้งหมด
                </div>
              </div>
            </div>
          </div>
          <div className="p-0">
            <Table
              data={complaints}
              columns={columns}
              loading={loading}
              emptyMessage="ไม่พบข้อร้องเรียน"
              onRowClick={handleRowClick}
            />
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                  แสดง {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} จาก {totalCount} รายการ
                </div>
                <div className="text-sm text-gray-600">
                  หน้า {currentPage} จาก {totalPages}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">←</span>
                    </div>
                    <span>ก่อนหน้า</span>
                  </div>
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span>ถัดไป</span>
                    <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">→</span>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="รายละเอียดข้อร้องเรียน"
          size="xl"
        >
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ticket ID</label>
                  <p className="font-mono">{selectedComplaint.ticketId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">สถานะ</label>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(selectedComplaint.currentStatus) as any}>
                      {getStatusLabel(selectedComplaint.currentStatus, user?.roleName)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">หัวข้อ</label>
                <p>{selectedComplaint.subject}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">รายละเอียด</label>
                <p className="whitespace-pre-wrap">{selectedComplaint.message}</p>
              </div>
              
              {!selectedComplaint.isAnonymous && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ชื่อผู้แจ้ง</label>
                    <p>{selectedComplaint.contactName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">อีเมล</label>
                    <p>{selectedComplaint.contactEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">เบอร์โทร</label>
                    <p>{selectedComplaint.contactPhone}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">วันที่แจ้ง</label>
                  <p>{formatDate(selectedComplaint.submissionDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">อัปเดตล่าสุด</label>
                  <p>{selectedComplaint.updatedAt ? formatDate(selectedComplaint.updatedAt) : '-'}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
};

export default ComplaintsPage;