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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

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

const serviceCategories = [
  { id: 'plumbing', label: 'السباكة' },
  { id: 'electrical', label: 'الكهرباء' },
  { id: 'cleaning', label: 'النظافة' },
  { id: 'painting', label: 'الدهان' },
  { id: 'gardening', label: 'البستنة' },
  { id: 'appliance', label: 'إصلاح الأجهزة' },
];

const registerSchema = z.object({
  businessName: z.string().min(2, 'اسم المؤسسة يجب أن يحتوي على حرفين على الأقل'),
  contactName: z.string().min(2, 'اسم المسؤول يجب أن يحتوي على حرفين على الأقل'),
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  phone: z.string().regex(/^06\d{8}$/, 'يرجى إدخال رقم هاتف مغربي صحيح (06xxxxxxxx)'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  cities: z.array(z.string()).min(1, 'يرجى اختيار مدينة واحدة على الأقل'),
  serviceCategories: z.array(z.string()).min(1, 'يرجى اختيار فئة خدمة واحدة على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يحتوي على 10 أحرف على الأقل'),
  commercialRegistration: z.string().min(1, 'يرجى إدخال رقم السجل التجاري'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام التجارية',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function ProviderRegister() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
      cities: [],
      serviceCategories: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser({
        name: data.businessName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        type: 'provider',
        contactName: data.contactName,
        cities: data.cities,
        serviceCategories: data.serviceCategories,
        description: data.description,
        commercialRegistration: data.commercialRegistration,
      });
      navigate('/provider/dashboard');
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
      <FormContainer className="max-w-2xl">
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

        <FormTitle>انضم كمقدم خدمة</FormTitle>
        <FormDescription>
          انضم إلى شبكة مقدمي الخدمات المميزين وابدأ في تقديم خدماتك
        </FormDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField>
              <FormLabel htmlFor="businessName">اسم النشاط التجاري</FormLabel>
              <FormInput
                id="businessName"
                placeholder="أدخل اسم نشاطك التجاري"
                {...register('businessName')}
              />
              {errors.businessName && <FormError>{errors.businessName.message}</FormError>}
            </FormField>

            <FormField>
              <FormLabel htmlFor="contactName">اسم المسؤول</FormLabel>
              <FormInput
                id="contactName"
                placeholder="أدخل اسم المسؤول"
                {...register('contactName')}
              />
              {errors.contactName && <FormError>{errors.contactName.message}</FormError>}
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <FormField>
            <FormLabel>المدن التي تخدمها</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {moroccanCities.map((city) => (
                <div key={city.value} className="flex items-center space-x-reverse space-x-2">
                  <Checkbox
                    id={`city-${city.value}`}
                    checked={watch('cities').includes(city.value)}
                    onCheckedChange={(checked) => {
                      const cities = watch('cities');
                      if (checked) {
                        setValue('cities', [...cities, city.value]);
                      } else {
                        setValue(
                          'cities',
                          cities.filter((c) => c !== city.value)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`city-${city.value}`}
                    className="text-sm text-gray-700"
                  >
                    {city.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.cities && <FormError>{errors.cities.message}</FormError>}
          </FormField>

          <FormField>
            <FormLabel>فئات الخدمات</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {serviceCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-reverse space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={watch('serviceCategories').includes(category.id)}
                    onCheckedChange={(checked) => {
                      const categories = watch('serviceCategories');
                      if (checked) {
                        setValue('serviceCategories', [...categories, category.id]);
                      } else {
                        setValue(
                          'serviceCategories',
                          categories.filter((c) => c !== category.id)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm text-gray-700"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.serviceCategories && (
              <FormError>{errors.serviceCategories.message}</FormError>
            )}
          </FormField>

          <FormField>
            <FormLabel htmlFor="description">وصف الخدمات</FormLabel>
            <Textarea
              id="description"
              placeholder="اكتب وصفاً مختصراً لخدماتك"
              className="min-h-[100px] text-right"
              {...register('description')}
            />
            {errors.description && <FormError>{errors.description.message}</FormError>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="profileImage">صورة الملف الشخصي</FormLabel>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-moroccan-gradient file:text-white
                hover:file:opacity-90"
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="commercialRegistration">رقم السجل التجاري (اختياري)</FormLabel>
            <FormInput
              id="commercialRegistration"
              placeholder="أدخل رقم السجل التجاري"
              {...register('commercialRegistration')}
            />
          </FormField>

          <FormField>
            <FormCheckbox
              id="terms"
              label="أوافق على الشروط والأحكام التجارية"
              {...register('terms')}
            />
            {errors.terms && <FormError>{errors.terms.message}</FormError>}
          </FormField>

          {(error || authError) && (
            <FormError>{error || authError}</FormError>
          )}

          <FormButton type="submit" isLoading={isLoading}>
            تسجيل كمقدم خدمة
          </FormButton>

          <div className="text-center mt-4">
            <span className="text-gray-600">لديك حساب تجاري بالفعل؟ </span>
            <FormLink href="/provider/login">تسجيل الدخول</FormLink>
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
            <FormLink href="/register">إنشاء حساب عميل</FormLink>
          </div>
        </form>
      </FormContainer>
    </div>
  );
} 