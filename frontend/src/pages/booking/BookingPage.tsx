import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import {
  FormContainer,
  FormTitle,
  FormDescription,
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  FormButton,
  FormError,
} from '@/components/auth/FormComponents';

// Types
interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface Provider {
  _id: string;
  businessName: string;
  services: Service[];
}

const bookingSchema = z.object({
  serviceId: z.string(),
  date: z.string().min(1, 'يرجى اختيار التاريخ'),
  time: z.string().min(1, 'يرجى اختيار الوقت'),
  address: z.string().min(10, 'يرجى إدخال العنوان بالتفصيل'),
  notes: z.string().optional(),
  contactName: z.string().min(2, 'يرجى إدخال الاسم'),
  contactPhone: z.string().min(10, 'يرجى إدخال رقم الهاتف'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const { id: providerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch provider data
  const { data: provider, isLoading: isLoadingProvider } = useQuery<Provider>({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      const response = await api.get(`/service-providers/${providerId}`);
      return response.data;
    },
    enabled: !!providerId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: searchParams.get('service') || '',
      contactName: user?.name || '',
      contactPhone: user?.phone || '',
    },
  });

  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId && provider?.services) {
      const service = provider.services.find((s) => s._id === serviceId);
      if (service) {
        setSelectedService(service);
        setValue('serviceId', serviceId);
      }
    }
  }, [searchParams, provider, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await api.post('/bookings', {
        ...data,
        providerId,
      });
      
      if (response.data) {
        navigate(`/payment/${response.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الحجز');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProvider) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </>
    );
  }

  if (!provider) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">مزود الخدمة غير موجود</h2>
            <p className="mt-2 text-gray-600">لم يتم العثور على مزود الخدمة المطلوب</p>
          </div>
        </div>
      </>
    );
  }

  if (!selectedService) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">الخدمة غير متوفرة</h2>
            <p className="mt-2 text-gray-600">يرجى اختيار خدمة صحيحة</p>
            <button
              onClick={() => navigate(`/provider/${providerId}`)}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              العودة إلى صفحة مزود الخدمة
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <FormContainer>
              <FormTitle>حجز الخدمة</FormTitle>
              <FormDescription>
                قم بإكمال النموذج التالي لحجز خدمة {selectedService.name} من {provider.businessName}
              </FormDescription>

              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-primary-900">{selectedService.name}</h3>
                    <p className="text-primary-700 text-sm mt-1">{selectedService.description}</p>
                    <div className="flex items-center mt-2 text-sm text-primary-600">
                      <ClockIcon className="h-4 w-4 ml-1" />
                      <span>{selectedService.duration}</span>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary-900">
                    {selectedService.price} درهم
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Date and Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField>
                    <FormLabel htmlFor="date">التاريخ</FormLabel>
                    <div className="relative">
                      <FormInput
                        id="date"
                        type="date"
                        {...register('date')}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.date && <FormError>{errors.date.message}</FormError>}
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="time">الوقت</FormLabel>
                    <div className="relative">
                      <FormInput
                        id="time"
                        type="time"
                        {...register('time')}
                      />
                      <ClockIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.time && <FormError>{errors.time.message}</FormError>}
                  </FormField>
                </div>

                {/* Address */}
                <FormField>
                  <FormLabel htmlFor="address">العنوان</FormLabel>
                  <div className="relative">
                    <FormTextarea
                      id="address"
                      rows={3}
                      placeholder="أدخل العنوان بالتفصيل"
                      {...register('address')}
                    />
                    <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  </div>
                  {errors.address && <FormError>{errors.address.message}</FormError>}
                </FormField>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField>
                    <FormLabel htmlFor="contactName">الاسم</FormLabel>
                    <div className="relative">
                      <FormInput
                        id="contactName"
                        type="text"
                        placeholder="أدخل الاسم الكامل"
                        {...register('contactName')}
                      />
                      <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.contactName && <FormError>{errors.contactName.message}</FormError>}
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="contactPhone">رقم الهاتف</FormLabel>
                    <div className="relative">
                      <FormInput
                        id="contactPhone"
                        type="tel"
                        placeholder="أدخل رقم الهاتف"
                        {...register('contactPhone')}
                      />
                      <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.contactPhone && <FormError>{errors.contactPhone.message}</FormError>}
                  </FormField>
                </div>

                {/* Notes */}
                <FormField>
                  <FormLabel htmlFor="notes">ملاحظات إضافية (اختياري)</FormLabel>
                  <FormTextarea
                    id="notes"
                    rows={3}
                    placeholder="أي ملاحظات أو متطلبات خاصة"
                    {...register('notes')}
                  />
                </FormField>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                  </div>
                )}

                <FormButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
                </FormButton>
              </form>
            </FormContainer>
          </div>
        </div>
      </div>
    </>
  );
} 