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
  FormSelect,
  FormCheckbox,
  FormButton,
  FormLink,
  FormError,
} from '@/components/auth/FormComponents';

const moroccanCities = [
  { value: 'casablanca', label: 'الدار البيضاء' },
  { value: 'rabat', label: 'الرباط' },
  { value: 'marrakech', label: 'مراكش' },
  { value: 'agadir', label: 'أكادير' },
  { value: 'fes', label: 'فاس' },
  { value: 'tangier', label: 'طنجة' },
  { value: 'meknes', label: 'مكناس' },
  { value: 'oujda', label: 'وجدة' },
];

const registerSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل'),
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  phone: z.string().regex(/^06\d{8}$/, 'يرجى إدخال رقم هاتف مغربي صحيح (06xxxxxxxx)'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  city: z.string().min(1, 'يرجى اختيار مدينتك'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function CustomerRegister() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser({
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        city: data.city,
        type: 'customer',
      });
      navigate('/dashboard');
    } catch (err: any) {
      // Handle field-specific errors from backend
      if (err.message && typeof err.message === 'object' && 'fields' in err.message) {
        const fieldErrors = err.message.fields;
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(`${field}: ${message}`);
          }
        });
      } else {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب');
      }
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

        <FormTitle>إنشاء حساب جديد للعملاء</FormTitle>
        <FormDescription>
          انضم إلينا اليوم واستمتع بخدماتنا المميزة
        </FormDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField>
            <FormLabel htmlFor="fullName">الاسم الكامل</FormLabel>
            <FormInput
              id="fullName"
              placeholder="أدخل اسمك الكامل"
              {...register('fullName')}
            />
            {errors.fullName && <FormError>{errors.fullName.message}</FormError>}
          </FormField>

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
            <FormLabel htmlFor="phone">رقم الهاتف</FormLabel>
            <FormInput
              id="phone"
              type="tel"
              placeholder="06xxxxxxxx"
              {...register('phone')}
            />
            {errors.phone && <FormError>{errors.phone.message}</FormError>}
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

          <FormField>
            <FormLabel htmlFor="confirmPassword">تأكيد كلمة المرور</FormLabel>
            <PasswordInput
              id="confirmPassword"
              placeholder="أعد إدخال كلمة المرور"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <FormError>{errors.confirmPassword.message}</FormError>
            )}
          </FormField>

          <FormField>
            <FormLabel htmlFor="city">المدينة</FormLabel>
            <FormSelect
              options={moroccanCities}
              placeholder="اختر مدينتك"
              value={watch('city')}
              onChange={(value) => setValue('city', value)}
            />
            {errors.city && <FormError>{errors.city.message}</FormError>}
          </FormField>

          <FormField>
            <FormCheckbox
              id="terms"
              label="أوافق على الشروط والأحكام"
              {...register('terms')}
            />
            {errors.terms && <FormError>{errors.terms.message}</FormError>}
          </FormField>

          {(error || authError) && (
            <FormError>{error || authError}</FormError>
          )}

          <FormButton type="submit" isLoading={isLoading}>
            إنشاء الحساب
          </FormButton>

          <div className="text-center mt-4">
            <span className="text-gray-600">لديك حساب بالفعل؟ </span>
            <FormLink href="/login">تسجيل الدخول</FormLink>
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
            <span className="text-gray-600">هل أنت مقدم خدمة؟ </span>
            <FormLink href="/provider/register">انضم كمقدم خدمة</FormLink>
          </div>
        </form>
      </FormContainer>
    </div>
  );
} 