import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
  FormContainer,
  FormTitle,
  FormDescription,
  FormField,
  FormLabel,
  FormInput,
  PasswordInput,
  FormCheckbox,
  FormButton,
  FormLink,
  FormError,
} from '@/components/auth/FormComponents';

const loginSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ProviderLogin() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password, 'provider');
      navigate('/provider/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <FormContainer>
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/')}
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
        </div>

        <FormTitle>تسجيل الدخول لمقدمي الخدمات</FormTitle>
        <FormDescription>
          مرحباً بعودتك! قم بتسجيل الدخول لإدارة خدماتك
        </FormDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField>
            <FormLabel htmlFor="email">البريد الإلكتروني</FormLabel>
            <FormInput
              id="email"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              {...register('email')}
            />
            {errors.email && <FormError>{errors.email.message}</FormError>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="password">كلمة المرور</FormLabel>
            <PasswordInput
              id="password"
              placeholder="أدخل كلمة المرور"
              {...register('password')}
            />
            {errors.password && <FormError>{errors.password.message}</FormError>}
          </FormField>

          <div className="flex items-center justify-between">
            <FormCheckbox
              id="rememberMe"
              label="تذكرني"
              {...register('rememberMe')}
            />
            <FormLink href="/provider/forgot-password">نسيت كلمة المرور؟</FormLink>
          </div>

          {(error || authError) && (
            <FormError>{error || authError}</FormError>
          )}

          <FormButton type="submit" isLoading={isLoading}>
            تسجيل الدخول
          </FormButton>

          <div className="text-center mt-4">
            <span className="text-gray-600">ليس لديك حساب تجاري؟ </span>
            <FormLink href="/provider/register">انضم كمقدم خدمة</FormLink>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">أو</span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-gray-600">هل أنت عميل؟ </span>
            <FormLink href="/login">تسجيل دخول العملاء</FormLink>
          </div>
        </form>
      </FormContainer>
    </div>
  );
} 