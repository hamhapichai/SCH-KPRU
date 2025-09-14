import React from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Alert, Card } from '@/components/ui';

const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // Don't redirect automatically, let login function handle role-based redirect
      // This prevents interference with role-based routing
      return;
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const userData = await login(data.username, data.password);
      
      
      // Redirect based on user role
      if (userData?.roleName === 'Admin') {
        router.push('/users');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(errorMessage);
    }
  };

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-heading mb-2">Smart Complaint Hub</h1>
          <h2 className="text-xl font-semibold text-gray-6">ระบบจัดการข้อร้องเรียนสายตรงคณบดี</h2>
          <p className="mt-2 text-sm text-body-color">
            เข้าสู่ระบบเพื่อจัดการข้อร้องเรียน
          </p>
        </div>

        {/* Login Form */}
        <Card className="mt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                {error}
              </Alert>
            )}

            <div>
              <Input
                label="ชื่อผู้ใช้"
                type="text"
                {...register('username')}
                error={errors.username?.message}
                leftIcon={<User className="h-5 w-5" />}
                placeholder="กรอกชื่อผู้ใช้"
                autoComplete="username"
              />
            </div>

            <div>
              <Input
                label="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-5 hover:text-gray-6"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                placeholder="กรอกรหัสผ่าน"
                autoComplete="current-password"
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-1 rounded-lg border border-stroke">
            <h3 className="text-sm font-medium text-heading mb-2">ข้อมูลสำหรับทดสอบ:</h3>
            <div className="text-sm text-body-color">
              <p><strong>ชื่อผู้ใช้:</strong> admin</p>
              <p><strong>รหัสผ่าน:</strong> admin123</p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-body-color">
          © 2025 SCH-KPRU. สงวนลิขสิทธิ์.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;