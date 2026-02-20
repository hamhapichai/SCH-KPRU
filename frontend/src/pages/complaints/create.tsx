import React from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, User, Mail, Phone, Send, Paperclip, X, Image, Film, File } from 'lucide-react';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import apiClient from '@/lib/api';

const complaintSchema = z.object({
  subject: z.string().min(10, 'หัวข้อต้องมีอย่างน้อย 10 ตัวอักษร'),
  message: z.string().min(20, 'รายละเอียดต้องมีอย่างน้อย 20 ตัวอักษร'),
  contactName: z.string().optional(),
  contactEmail: z.email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  isAnonymous: z.boolean(),
  isUrgent: z.boolean(),
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
    reset,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      isAnonymous: false,
      isUrgent: false,
    },
  });

  // router.query is empty on first render; wait until router is ready
  React.useEffect(() => {
    if (router.isReady) {
      reset((prev) => ({ ...prev, isUrgent: router.query.urgent === 'true' }));
    }
  }, [router.isReady, router.query.urgent, reset]);

  const isAnonymous = watch('isAnonymous');
  const isUrgentValue = watch('isUrgent');

  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 20;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) return false;
      return true;
    });
    setAttachedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
    });
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Film className="h-4 w-4 text-purple-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('message', data.message);
      formData.append('isAnonymous', String(data.isAnonymous));
      formData.append('urgent', String(data.isUrgent));
      if (!data.isAnonymous) {
        if (data.contactName) formData.append('contactName', data.contactName);
        if (data.contactEmail) formData.append('contactEmail', data.contactEmail);
        if (data.contactPhone) formData.append('contactPhone', data.contactPhone);
      }
      attachedFiles.forEach((file) => formData.append('files', file));

      const response = await apiClient.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

              {/* Hidden urgent field */}
              <input type="hidden" {...register('isUrgent')} />

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

              {/* File Attachment */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-heading">แนบไฟล์ (ถ้ามี)</h3>

                {/* Drop zone */}
                <button
                  type="button"
                  className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors w-full ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-stroke bg-gray-1 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <Paperclip className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm font-medium text-heading">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                  <p className="mt-1 text-xs text-body-color">
                    รูปภาพ, วิดีโอ, PDF, Word, Excel — สูงสุด {MAX_FILE_SIZE_MB} MB ต่อไฟล์
                  </p>
                </button>

                {/* File list */}
                {attachedFiles.length > 0 && (
                  <ul className="space-y-2">
                    {attachedFiles.map((file) => (
                      <li
                        key={`${file.name}-${file.size}`}
                        className="flex items-center justify-between rounded-lg border border-stroke bg-white px-4 py-2"
                      >
                        <div className="flex min-w-0 items-center space-x-3">
                          {getFileIcon(file)}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-heading">{file.name}</p>
                            <p className="text-xs text-body-color">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(attachedFiles.indexOf(file))}
                          className="ml-3 flex-shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
                        {isUrgentValue && (
                          <li>ระบบจะดำเนินการตรวจสอบและประสานงานกับหน่วยงานที่เกี่ยวข้องโดยด่วน</li>
                        ) || (
                          <li>ระบบจะดำเนินการตรวจสอบและประสานงานกับหน่วยงานที่เกี่ยวข้อง</li>
                        )}
                        {/* <li>หากต้องการความช่วยเหลือเร่งด่วน กรุณาติดต่อหน่วยงานโดยตรง</li> */}
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