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
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, User, Mail, Phone, MapPin, Building2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

// Validation schema for customer profile
const customerProfileSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام'),
  city: z.string().min(2, 'المدينة مطلوبة'),
});

// Validation schema for provider profile
const providerProfileSchema = z.object({
  businessName: z.string().min(2, 'اسم الشركة يجب أن يكون على الأقل حرفين'),
  contactName: z.string().min(2, 'اسم المسؤول يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  description: z.string().min(10, 'الوصف يجب أن يكون على الأقل 10 أحرف'),
  commercialRegistration: z.string().optional(),
});

type CustomerProfileData = z.infer<typeof customerProfileSchema>;
type ProviderProfileData = z.infer<typeof providerProfileSchema>;

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isProvider = user?.type === 'provider';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CustomerProfileData | ProviderProfileData>({
    resolver: zodResolver(isProvider ? providerProfileSchema : customerProfileSchema),
    defaultValues: {
      ...(isProvider
        ? {
            businessName: user?.name || '',
            contactName: user?.contactName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            city: user?.city || '',
            description: user?.description || '',
            commercialRegistration: user?.commercialRegistration || '',
          }
        : {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            city: user?.city || '',
          }),
    },
  });

  const onSubmit = async (data: CustomerProfileData | ProviderProfileData) => {
    try {
      setIsLoading(true);
      
      const response = await api.put('/auth/profile', data);
      
      if (response.data) {
        // Update user context with new data
        updateUser(response.data.user);
        toast.success('تم تحديث الملف الشخصي بنجاح');
        navigate(isProvider ? '/provider/dashboard' : '/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
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
                تعديل الملف الشخصي
              </h1>
              <p className="text-gray-600">
                {isProvider ? 'تحديث معلومات عملك التجارية' : 'تحديث معلوماتك الشخصية'}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {isProvider ? (
                    <>
                      <Building2 className="h-5 w-5 ml-2" />
                      الملف التجاري
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 ml-2" />
                      الملف الشخصي
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {isProvider
                    ? 'قم بتحديث معلومات عملك التجارية'
                    : 'قم بتحديث معلوماتك الشخصية'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {isProvider ? (
                    // Provider Profile Fields
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessName">اسم الشركة</Label>
                          <Input
                            id="businessName"
                            placeholder="أدخل اسم الشركة"
                            {...register('businessName' as any)}
                          />
                          {errors.businessName && (
                            <p className="text-sm text-red-600">{errors.businessName.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactName">اسم المسؤول</Label>
                          <Input
                            id="contactName"
                            placeholder="أدخل اسم المسؤول"
                            {...register('contactName' as any)}
                          />
                          {errors.contactName && (
                            <p className="text-sm text-red-600">{errors.contactName.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="أدخل البريد الإلكتروني"
                            {...register('email' as any)}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <Input
                            id="phone"
                            placeholder="أدخل رقم الهاتف"
                            {...register('phone' as any)}
                          />
                          {errors.phone && (
                            <p className="text-sm text-red-600">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">المدينة</Label>
                        <Input
                          id="city"
                          placeholder="أدخل المدينة"
                          {...register('city' as any)}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-600">{errors.city.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">وصف الشركة</Label>
                        <Textarea
                          id="description"
                          placeholder="أدخل وصفاً لشركتك وخدماتك"
                          rows={4}
                          {...register('description' as any)}
                        />
                        {errors.description && (
                          <p className="text-sm text-red-600">{errors.description.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commercialRegistration">رقم السجل التجاري (اختياري)</Label>
                        <Input
                          id="commercialRegistration"
                          placeholder="أدخل رقم السجل التجاري"
                          {...register('commercialRegistration' as any)}
                        />
                        {errors.commercialRegistration && (
                          <p className="text-sm text-red-600">{errors.commercialRegistration.message}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    // Customer Profile Fields
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input
                          id="name"
                          placeholder="أدخل الاسم الكامل"
                          {...register('name' as any)}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="أدخل البريد الإلكتروني"
                            {...register('email' as any)}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <Input
                            id="phone"
                            placeholder="أدخل رقم الهاتف"
                            {...register('phone' as any)}
                          />
                          {errors.phone && (
                            <p className="text-sm text-red-600">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">المدينة</Label>
                        <Input
                          id="city"
                          placeholder="أدخل المدينة"
                          {...register('city' as any)}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-600">{errors.city.message}</p>
                        )}
                      </div>
                    </>
                  )}

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
                      {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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