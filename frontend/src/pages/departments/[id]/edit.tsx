import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Building2, Save, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Textarea,
  Alert,
  Badge
} from '@/components/ui';
import { Department } from '@/types';
import { departmentApi } from '@/lib/api';

const EditDepartmentPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    departmentName: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch department data
  useEffect(() => {
    const fetchDepartment = async () => {
      if (!id || Array.isArray(id)) return;

      try {
        setLoading(true);
        setError(null);
        
        const data = await departmentApi.getDepartmentById(parseInt(id));
        setDepartment(data);
        setFormData({
          departmentName: data.departmentName,
          description: data.description || ''
        });
      } catch (err: any) {
        console.error('Error fetching department:', err);
        setError('ไม่สามารถโหลดข้อมูลหน่วยงานได้');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.departmentName.trim()) {
      setError('กรุณาระบุชื่อหน่วยงาน');
      return;
    }

    if (!id || Array.isArray(id) || !department) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await departmentApi.updateDepartment(parseInt(id), {
        departmentName: formData.departmentName.trim(),
        description: formData.description.trim() || undefined,
        isAdminOrDeanDept: department.isAdminOrDeanDept, // คงค่าเดิม ไม่ให้แก้ไข
        isDeleted: false
      });

      setSuccess('แก้ไขข้อมูลหน่วยงานเรียบร้อยแล้ว');
      
      // Redirect to departments list after 1.5 seconds
      setTimeout(() => {
        router.push('/departments');
      }, 1500);

    } catch (err: any) {
      console.error('Error updating department:', err);
      setError(err.response?.data?.message || 'ไม่สามารถแก้ไขข้อมูลหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!department || !id || Array.isArray(id)) return;

    if (department.isAdminOrDeanDept) {
      setError('ไม่สามารถลบหน่วยงานสำคัญได้');
      return;
    }

    if (!confirm(`คุณต้องการลบหน่วยงาน "${department.departmentName}" ใช่หรือไม่?\n\nการลบนี้ไม่สามารถย้อนกลับได้`)) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await departmentApi.deleteDepartment(parseInt(id));
      
      setSuccess('ลบหน่วยงานเรียบร้อยแล้ว');
      
      // Redirect to departments list after 1 second
      setTimeout(() => {
        router.push('/departments');
      }, 1000);

    } catch (err: any) {
      console.error('Error deleting department:', err);
      setError('ไม่สามารถลบหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/departments');
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['Admin']}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!department) {
    return (
      <ProtectedRoute roles={['Admin']}>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900">ไม่พบหน่วยงานที่ต้องการ</h2>
          <p className="text-gray-600 mt-2">หน่วยงานอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
          <Button onClick={handleCancel} className="mt-4">
            กลับไปหน้ารายการหน่วยงาน
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['Admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับ</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span>แก้ไขหน่วยงาน</span>
            </h1>
            <p className="text-gray-600">แก้ไขข้อมูลหน่วยงาน {department.departmentName}</p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ข้อมูลหน่วยงาน</CardTitle>
              <div className="flex items-center space-x-2">
                {department.isAdminOrDeanDept && (
                  <Badge variant="info">หน่วยงานสำคัญ</Badge>
                )}
                <Badge variant="default">
                  จำนวนผู้ใช้: {department.userCount || 0}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อหน่วยงาน <span className="text-red-500">*</span>
                </label>
                <Input
                  name="departmentName"
                  value={formData.departmentName}
                  onChange={handleInputChange}
                  placeholder="เช่น หน่วยงานวิชาการ, หน่วยงานบุคคล"
                  required
                  disabled={saving}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="อธิบายหน้าที่และความรับผิดชอบของหน่วยงาน"
                  rows={4}
                  disabled={saving}
                />
              </div>

              {/* Department Type Notice */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">ประเภทหน่วยงาน</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={department.isAdminOrDeanDept ? 'info' : 'default'}>
                    {department.isAdminOrDeanDept ? 'หน่วยงานสำคัญ' : 'หน่วยงานทั่วไป'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {department.isAdminOrDeanDept 
                      ? '(ไม่สามารถเปลี่ยนแปลงได้)' 
                      : '(หน่วยงานทั่วไปที่สร้างโดยผู้ดูแล)'
                    }
                  </span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={saving || department.isAdminOrDeanDept}
                  className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>ลบหน่วยงาน</span>
                </Button>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !formData.departmentName.trim()}
                    className="flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>กำลังบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>บันทึกการเปลี่ยนแปลง</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Department Info */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">วันที่สร้าง:</span>
                <p>{new Date(department.createdAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">อัปเดตล่าสุด:</span>
                <p>{department.updatedAt 
                  ? new Date(department.updatedAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'ยังไม่มีการอัปเดต'
                }</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default EditDepartmentPage;