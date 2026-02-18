import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Edit, Trash2, Building2, Users } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Table, 
  Badge, 
  Modal,
  Alert
} from '@/components/ui';
import { Column } from '@/components/ui/Table';
import { Department } from '@/types';
import { departmentApi } from '@/lib/api';

const DepartmentsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Only Admin can access departments
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;
    
    if (user && user.roleName !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);

  // Fetch departments from API
  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await departmentApi.getActiveDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('ไม่สามารถโหลดข้อมูลหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredDepartments = departments.filter((department) => {
    const matchesSearch = 
      department.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && !department.isDeleted;
  });

  const columns: Column<Department>[] = [
    {
      key: 'departmentName',
      title: 'ชื่อหน่วยงาน',
      render: (value, record) => (
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{String(value)}</span>
          </div>
          {record.isAdminOrDeanDept && (
            <Badge variant="info" size="sm" className="mt-1 bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs">
              หน่วยงานสำคัญ
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      title: 'คำอธิบาย',
      width: '300px',
      render: (value) => {
        const text = String(value || 'ไม่มีคำอธิบาย');
        const truncated = text.length > 30 ? text.slice(0, 30) + '...' : text;
        return (
          <div title={text}>
            <p className="text-sm text-gray-600">
              {truncated}
            </p>
          </div>
        );
      },
    },
    {
      key: 'userCount',
      title: 'จำนวนผู้ใช้',
      width: '120px',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{Number(value) || 0}</span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      title: 'อัปเดตล่าสุด',
      width: '150px',
      render: (value) => value ? formatDate(String(value)) : '-',
    },
    {
      key: 'actions',
      title: 'การดำเนินการ',
      width: '120px',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDepartment(record)}
            title='ดูรายละเอียดหน่วยงาน'
          >
            <Building2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/departments/${record.departmentId}/edit`)}
            title='แก้ไขรายละเอียดหน่วยงาน'
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteDepartment(record.departmentId)}
            disabled={record.isAdminOrDeanDept}
            title={'ลบหน่วยงาน'}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsViewModalOpen(true);
  };

  const handleDeleteDepartment = async (id: number) => {
    const department = departments.find(d => d.departmentId === id);
    if (department?.isAdminOrDeanDept) {
      alert('ไม่สามารถลบหน่วยงานสำคัญได้');
      return;
    }
    
    if (confirm('คุณต้องการลบหน่วยงานนี้ใช่หรือไม่?')) {
      try {
        await departmentApi.deleteDepartment(id);
        // Remove department from local state
        setDepartments(departments.filter(d => d.departmentId !== id));
      } catch (err) {
        console.error('Error deleting department:', err);
        alert('ไม่สามารถลบหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  return (
    <ProtectedRoute roles={['Admin']}>
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
            <h1 className="text-2xl font-bold text-gray-900">จัดการหน่วยงาน</h1>
            <p className="text-gray-600">จัดการหน่วยงานงานและหน่วยงานต่างๆ</p>
          </div>
          <Button onClick={() => router.push('/departments/new')}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มหน่วยงานใหม่
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                placeholder="ค้นหาด้วย ชื่อหน่วยงานหรือคำอธิบาย"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการหน่วยงาน ({filteredDepartments.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              data={filteredDepartments}
              columns={columns}
              loading={loading}
              emptyMessage="ไม่พบหน่วยงาน"
            />
          </CardContent>
        </Card>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="รายละเอียดหน่วยงาน"
          size="lg"
        >
          {selectedDepartment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">ชื่อหน่วยงาน</label>
                  <p className="font-medium">{selectedDepartment.departmentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ประเภท</label>
                  <div className="mt-1">
                    <Badge variant={selectedDepartment.isAdminOrDeanDept ? 'info' : 'default'}>
                      {selectedDepartment.isAdminOrDeanDept ? 'หน่วยงานสำคัญ' : 'หน่วยงานทั่วไป'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
                <p className="whitespace-pre-wrap">
                  {selectedDepartment.description || 'ไม่มีคำอธิบาย'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">วันที่สร้าง</label>
                  <p>{formatDate(selectedDepartment.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">อัปเดตล่าสุด</label>
                  <p>{selectedDepartment.updatedAt ? formatDate(selectedDepartment.updatedAt) : '-'}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="text-sm font-medium text-gray-700">สถิติหน่วยงาน</label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedDepartment.userCount || 0}</div>
                    <div className="text-sm text-gray-500">ผู้ใช้งาน</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">-</div>
                    <div className="text-sm text-gray-500">ข้อร้องเรียนที่ได้รับ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">-</div>
                    <div className="text-sm text-gray-500">รอดำเนินการ</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
};

export default DepartmentsPage;