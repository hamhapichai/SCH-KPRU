import React from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, User, Mail, Phone, Send } from 'lucide-react';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import apiClient from '@/lib/api';

const complaintSchema = z.object({
  subject: z.string().min(10, 'หัวข้อต้องมีอย่างน้อย 10 ตัวอักษร'),
  message: z.string().min(20, 'รายละเอียดต้องมีอย่างน้อย 20 ตัวอักษร'),
  contactName: z.string().optional(),
  contactEmail: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  isAnonymous: z.boolean(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const CreateComplaintPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      isAnonymous: false,
    },
  });

  const isAnonymous = watch('isAnonymous');

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await apiClient.post('/complaints', {
        subject: data.subject,
        message: data.message,
        contactName: data.isAnonymous ? null : data.contactName,
        contactEmail: data.isAnonymous ? null : data.contactEmail,
        contactPhone: data.isAnonymous ? null : data.contactPhone,
        isAnonymous: data.isAnonymous,
      });

      const { ticketId, complaintId } = response.data;
      
      // Send to n8n webhook for AI processing
      try {
        await fetch('http://localhost:5678/webhook/complaint/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ComplaintId: complaintId
          }),
        });
        console.log('Sent complaint to AI processing');
      } catch (webhookError) {
        console.error('Failed to send to AI processing:', webhookError);
        // Don't block the user flow if webhook fails
      }
      
      // Redirect to tracking page with ticket ID
      router.push(`/complaints/track?ticket=${ticketId}`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'เกิดข้อผิดพลาดในการส่งข้อร้องเรียน';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-1">
      {/* Header */}
      <div className="bg-white shadow-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-heading">ระบบสายตรงคณบดี</h1>
              <p className="text-sm text-body-color">มหาวิทยาลัยราชภัฏกำแพงเพชร</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Dean Direct Line Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <FileText className="h-6 w-6" />
              <span>ระบบสายตรงคณบดี</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="text-body-color space-y-4">
              <p className="text-heading font-medium">
                ระบบสายตรงคณบดี มีวัตถุประสงค์เพื่อ
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <p>รับข้อเสนอความคิดเห็นในการพัฒนา ปรับปรุงคณะ</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <div className="space-y-2">
                    <p>รับฟังเสียงสะท้อนหรือข้อร้องเรียนของผู้รับบริการ ผู้มาติดต่อ หรือผู้มีส่วนได้ส่วนเสียหรือสาธารณชน เช่น</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li>การทุจริตของเจ้าหน้าที่ในหน่วยงาน</li>
                      <li>การจัดซื้อจัดจ้าง</li>
                      <li>ความไม่เป็นธรรมในการให้บริการ</li>
                      <li>การรับสินบน</li>
                      <li>ความไม่โปร่งใสต่อการดำเนินการภายในองค์กร</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-warning/10 border-l-4 border-warning rounded-r">
                <p className="text-sm">
                  <strong className="text-warning">หมายเหตุสำคัญ:</strong> การร้องเรียนการทุจริตและประพฤติมิชอบของบุคลากรภายในหน่วยงาน 
                  ถือเป็นความลับทางราชการ มหาวิทยาลัยและผู้รับผิดชอบจะปกปิดชื่อผู้ร้องเรียน และข้อมูลที่เกี่ยวข้องเป็นความลับ 
                  โดยคำนึงถึงความปลอดภัยและความเสียหายของทุกฝ่ายที่เกี่ยวข้อง
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>แบบฟอร์มแจ้งข้อร้องเรียน</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Anonymous Option */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  {...register('isAnonymous')}
                  className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
                />
                <label htmlFor="isAnonymous" className="text-sm font-medium text-heading">
                  แจ้งแบบไม่ระบุชื่อ (Anonymous)
                </label>
              </div>

              {/* Contact Information */}
              {!isAnonymous && (
                <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-heading">ข้อมูลผู้แจ้ง</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="ชื่อ-นามสกุล"
                      {...register('contactName')}
                      error={errors.contactName?.message}
                      leftIcon={<User className="h-4 w-4" />}
                      placeholder="กรอกชื่อ-นามสกุล"
                    />
                    <Input
                      label="เบอร์โทรศัพท์"
                      {...register('contactPhone')}
                      error={errors.contactPhone?.message}
                      leftIcon={<Phone className="h-4 w-4" />}
                      placeholder="กรอกเบอร์โทรศัพท์"
                    />
                  </div>
                  <Input
                    label="อีเมล"
                    type="email"
                    {...register('contactEmail')}
                    error={errors.contactEmail?.message}
                    leftIcon={<Mail className="h-4 w-4" />}
                    placeholder="กรอกอีเมล"
                  />
                </div>
              )}

              {/* Complaint Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-heading">รายละเอียดข้อร้องเรียน</h3>
                
                <Input
                  label="หัวข้อเรื่องร้องเรียน *"
                  {...register('subject')}
                  error={errors.subject?.message}
                  placeholder="กรอกหัวข้อเรื่องที่ต้องการร้องเรียน"
                  required
                />

                <Textarea
                  label="รายละเอียด *"
                  {...register('message')}
                  error={errors.message?.message}
                  placeholder="กรอกรายละเอียดของปัญหาหรือข้อร้องเรียน..."
                  rows={6}
                  required
                />
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-gray-1 border border-stroke p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-info" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-heading">
                      หมายเหตุ
                    </h3>
                    <div className="mt-2 text-sm text-body-color">
                      <ul className="list-disc space-y-1 pl-5">
                        <li>เมื่อส่งข้อร้องเรียนแล้ว ท่านจะได้รับ Ticket ID สำหรับติดตามสถานะ</li>
                        <li>ระบบจะดำเนินการตรวจสอบและประสานงานกับหน่วยงานที่เกี่ยวข้อง</li>
                        <li>หากต้องการความช่วยเหลือเร่งด่วน กรุณาติดต่อหน่วยงานโดยตรง</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  size="lg"
                  className="min-w-[150px] btn-primary"
                >
                  <Send className="mr-2 h-4 w-4" />
                  ส่งข้อร้องเรียน
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-body-color">
          <p>© 2025 มหาวิทยาลัยราชภัฏกำแพงเพชร - ระบบร้องเรียนออนไลน์</p>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaintPage;