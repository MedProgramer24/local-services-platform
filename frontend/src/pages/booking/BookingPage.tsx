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
  const { user, isAuthenticated } = useAuth();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch provider data
  const { data: provider, isLoading: isLoadingProvider, error: providerError } = useQuery<Provider>({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      console.log('Fetching provider with ID:', providerId);
      const response = await api.get(`/service-providers/${providerId}`);
      console.log('Provider response:', response.data);
      return response.data;
    },
    enabled: !!providerId,
  });

  // Log provider error if any
  useEffect(() => {
    if (providerError) {
      console.error('Provider fetch error:', providerError);
    }
  }, [providerError]);

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
    console.log('Service ID from URL:', serviceId);
    console.log('Provider services:', provider?.services);
    console.log('Provider services IDs:', provider?.services?.map(s => s._id));
    
    if (serviceId && provider?.services) {
      const service = provider.services.find((s) => s._id === serviceId);
      console.log('Found service:', service);
      console.log('Service ID comparison:', {
        urlServiceId: serviceId,
        serviceIds: provider.services.map(s => ({ id: s._id, name: s.name, match: s._id === serviceId }))
      });
      
      if (service) {
        setSelectedService(service);
        setValue('serviceId', serviceId);
      } else {
        // If the specific service is not found, try to find it by name or use the first available service
        console.log('Service not found by ID, trying alternative matching...');
        
        // Try to find service by name (fallback)
        const serviceByName = provider.services.find((s) => 
          s.name.toLowerCase().includes(serviceId.toLowerCase()) ||
          serviceId.toLowerCase().includes(s.name.toLowerCase())
        );
        
        if (serviceByName) {
          console.log('Found service by name:', serviceByName);
          setSelectedService(serviceByName);
          setValue('serviceId', serviceByName._id);
        } else if (provider.services.length > 0) {
          // Use the first available service as fallback
          console.log('Using first available service as fallback:', provider.services[0]);
          setSelectedService(provider.services[0]);
          setValue('serviceId', provider.services[0]._id);
        }
      }
    } else if (provider?.services && provider.services.length > 0 && !serviceId) {
      // If no service ID provided but provider has services, use the first one
      console.log('No service ID provided, using first available service:', provider.services[0]);
      setSelectedService(provider.services[0]);
      setValue('serviceId', provider.services[0]._id);
    }
  }, [searchParams, provider, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Debug authentication state
      console.log('Booking submission - User:', user);
      console.log('Booking submission - Is authenticated:', !!user);
      console.log('Booking submission - Token:', localStorage.getItem('token'));
      
      // Ensure we have the selected service
      if (!selectedService) {
        setError('يرجى اختيار خدمة صحيحة');
        return;
      }
      
      const response = await api.post('/bookings', {
        ...data,
        providerId,
        serviceId: selectedService._id,
        serviceName: selectedService.name,
        serviceDescription: selectedService.description,
        price: selectedService.price,
      });
      
      if (response.data) {
        navigate('/booking/success');
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء الحجز';
      setError(errorMessage);
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

  if (providerError) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">خطأ في تحميل البيانات</h2>
            <p className="mt-2 text-gray-600">حدث خطأ أثناء جلب بيانات مزود الخدمة</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate('/')}
              className="mt-4 mr-4 text-primary-600 hover:text-primary-700"
            >
              العودة للصفحة الرئيسية
            </button>
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
            <h2 className="text-2xl font-semibold text-gray-900">اختر الخدمة</h2>
            <p className="mt-2 text-gray-600">يرجى اختيار خدمة من القائمة أدناه</p>
            
            {provider?.services && provider.services.length > 0 ? (
              <div className="mt-6 max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">الخدمات المتوفرة</h3>
                  <div className="space-y-3">
                    {provider.services.map((service) => (
                      <button
                        key={service._id}
                        onClick={() => {
                          setSelectedService(service);
                          setValue('serviceId', service._id);
                        }}
                        className="w-full text-right p-4 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <ClockIcon className="h-4 w-4 ml-1" />
                              <span>{service.duration} دقيقة</span>
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-primary-600">
                            {service.price} درهم
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-red-600">لا توجد خدمات متوفرة لهذا المزود</p>
                <button
                  onClick={() => navigate(`/provider/${providerId}`)}
                  className="mt-4 text-primary-600 hover:text-primary-700"
                >
                  العودة إلى صفحة مزود الخدمة
                </button>
              </div>
            )}
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
                      <span>{selectedService.duration} دقيقة</span>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary-900">
                    {selectedService.price} درهم
                  </div>
                </div>
                
                {/* Service Selection Dropdown */}
                {provider?.services && provider.services.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <FormField>
                      <FormLabel htmlFor="serviceSelect">تغيير الخدمة</FormLabel>
                      <select
                        id="serviceSelect"
                        value={selectedService._id}
                        onChange={(e) => {
                          const newService = provider.services.find(s => s._id === e.target.value);
                          if (newService) {
                            setSelectedService(newService);
                            setValue('serviceId', newService._id);
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {provider.services.map((service) => (
                          <option key={service._id} value={service._id}>
                            {service.name} - {service.price} درهم
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                )}
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