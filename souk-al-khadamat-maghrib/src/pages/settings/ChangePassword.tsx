import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Save, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      setIsLoading(true);
      
      const response = await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (response.data) {
        toast.success('تم تغيير كلمة المرور بنجاح');
        // Logout user to force re-login with new password
        logout();
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowRight className="h-4 w-4 ml-1" />
                العودة
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                تغيير كلمة المرور
              </h1>
              <p className="text-gray-600">
                تحديث كلمة المرور الخاصة بك
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 ml-2" />
                  تغيير كلمة المرور
                </CardTitle>
                <CardDescription>
                  أدخل كلمة المرور الحالية وكلمة المرور الجديدة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="أدخل كلمة المرور الحالية"
                        {...register('currentPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="أدخل كلمة المرور الجديدة"
                        {...register('newPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 ml-2" />
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 ml-2" />
                      {isLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 