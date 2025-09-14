import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Textarea,
  Alert
} from '@/components/ui';
import { departmentApi } from '@/lib/api';

const NewDepartmentPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    departmentName: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const newDepartment = await departmentApi.createDepartment({
        departmentName: formData.departmentName.trim(),
        description: formData.description.trim() || undefined,
        isAdminOrDeanDept: false, // หน่วยงานใหม่จะเป็นหน่วยงานทั่วไปเสมอ
        isDeleted: false
      });

      setSuccess('สร้างหน่วยงานใหม่เรียบร้อยแล้ว');
      
      // Redirect to departments list after 1.5 seconds
      setTimeout(() => {
        router.push('/departments');
      }, 1500);

    } catch (err: any) {
      console.error('Error creating department:', err);
      setError(err.response?.data?.message || 'ไม่สามารถสร้างหน่วยงานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/departments');
  };

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
              <span>เพิ่มหน่วยงานใหม่</span>
            </h1>
            <p className="text-gray-600">สร้างหน่วยงานงานหรือหน่วยงานใหม่</p>
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
            <CardTitle>ข้อมูลหน่วยงาน</CardTitle>
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className='hover:!bg-gray-100'
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.departmentName.trim()}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>สร้างหน่วยงาน</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">หมายเหตุ</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ชื่อหน่วยงานต้องไม่ซ้ำกับหน่วยงานที่มีอยู่แล้ว</li>
                <li>• หน่วยงานใหม่จะเป็นหน่วยงานทั่วไป (ไม่ใช่หน่วยงานสำคัญ)</li>
                <li>• หน่วยงานสำคัญ (Admin/Dean) ถูก seed ไว้ในระบบแล้ว</li>
                <li>• สามารถแก้ไขข้อมูลหน่วยงานได้ภายหลัง</li>
                <li>• ผู้ใช้สามารถเพิ่มเข้ามาในหน่วยงานได้หลังจากสร้างแล้ว</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default NewDepartmentPage;