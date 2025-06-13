import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon, UsersIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AddServiceForm } from '@/components/provider/AddServiceForm';
import { Toaster } from '@/components/ui/toaster';

// Define a Provider type (adjust fields as per your API response)
interface Provider {
  _id: string;
  businessName: string;
  description: string;
  contactInfo: { 
    phone: string; 
    email?: string;
    website?: string;
  };
  services: Array<{ 
    _id: string; 
    name: string; 
    description: string; 
    price: number; 
    duration: number;
    category: string;
    isPopular?: boolean;
  }>;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  categories: Array<{
    _id: string;
    name: string;
  }>;
  availability: {
    days: Array<{
      day: string;
      isAvailable: boolean;
      slots: Array<{
        start: string;
        end: string;
      }>;
    }>;
  };
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired';
}

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'gallery'>('services');
  const [showAllServices, setShowAllServices] = useState(false);

  const { data: provider, isLoading, error } = useQuery<Provider>({
    queryKey: ['provider', id],
    queryFn: async () => {
      const res = await api.get(`/service-providers/${id}`);
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <Skeleton className="h-48 w-full" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-8">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">حدث خطأ</h2>
              <p className="text-gray-600">حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!provider) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="text-gray-400 mb-4">
                <UsersIcon className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-2">لا يوجد مزود خدمة</h2>
              <p className="text-gray-600">لم يتم العثور على مزود الخدمة المطلوب.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const handleBooking = (serviceId: string) => {
    navigate(`/booking/${id}?service=${serviceId}`);
  };

  // (Optional) Filter popular services if you have a flag (e.g. isPopular) in your service data
  const popularServices = provider.services.filter((service) => service.isPopular);
  const otherServices = provider.services.filter((service) => !service.isPopular);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className="text-yellow-400">
        {index < Math.floor(rating) ? (
          <StarIcon className="h-5 w-5" />
        ) : (
          <StarOutlineIcon className="h-5 w-5" />
        )}
      </span>
    ));
  };

  // Helper function to format day names in Arabic
  const formatDayName = (day: string) => {
    const dayMap: { [key: string]: string } = {
      'monday': 'الاثنين',
      'tuesday': 'الثلاثاء',
      'wednesday': 'الأربعاء',
      'thursday': 'الخميس',
      'friday': 'الجمعة',
      'saturday': 'السبت',
      'sunday': 'الأحد'
    };
    return dayMap[day] || day;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-primary-600 to-primary-700 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 space-x-reverse mb-6">
                {provider.isVerified && (
                  <Badge variant="secondary" className="bg-white/10 hover:bg-white/20">
                    <TrophyIcon className="h-4 w-4 ml-1" />
                    موثق
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20">
                  {provider.subscriptionStatus === 'active' ? 'نشط' : 'تجريبي'}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{provider.businessName}</h1>
              <div className="flex items-center space-x-6 space-x-reverse">
                <div className="flex items-center">
                  {renderStars(provider.rating)}
                  <span className="mr-2">({provider.totalReviews} تقييم)</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 ml-1" />
                  <span>{provider.location.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="services" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="services">الخدمات</TabsTrigger>
                <TabsTrigger value="about">عن الشركة</TabsTrigger>
                <TabsTrigger value="reviews">التقييمات</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-8">
                {provider.isVerified && (
                  <AddServiceForm
                    providerId={provider._id}
                    onSuccess={() => {
                      // Refetch provider data to update the services list
                      queryClient.invalidateQueries(['provider', id]);
                    }}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {provider.services.map((service) => (
                    <Card key={service._id} className="group hover:border-primary-500 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary-600 transition-colors">
                              {service.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                            <div className="flex items-center mt-4 text-sm text-gray-500">
                              <ClockIcon className="h-4 w-4 ml-1" />
                              <span>{service.duration} دقيقة</span>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-xl font-semibold text-primary-600 mb-4">
                              {service.price} درهم
                            </div>
                            <button
                              onClick={() => handleBooking(service._id)}
                              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              حجز الخدمة
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">عن الشركة</h2>
                    <p className="text-gray-600 mb-6">{provider.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="bg-primary-50 p-3 rounded-full">
                          <PhoneIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">رقم الهاتف</p>
                          <p className="font-medium">{provider.contactInfo.phone}</p>
                        </div>
                      </div>
                      {provider.contactInfo.email && (
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="bg-primary-50 p-3 rounded-full">
                            <EnvelopeIcon className="h-6 w-6 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                            <p className="font-medium">{provider.contactInfo.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">ساعات العمل</h2>
                      <div className="space-y-3">
                        {provider.availability.days.map((day) => (
                          <div key={day.day} className="flex justify-between items-center">
                            <span className="font-medium">{formatDayName(day.day)}</span>
                            <span className="text-gray-600">
                              {day.isAvailable ? (
                                day.slots.map((slot, index) => (
                                  <span key={index}>
                                    {slot.start} - {slot.end}
                                    {index < day.slots.length - 1 ? '، ' : ''}
                                  </span>
                                ))
                              ) : (
                                'مغلق'
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">التصنيفات</h2>
                      <div className="flex flex-wrap gap-2">
                        {provider.categories.map((category) => (
                          <Badge
                            key={category._id}
                            variant="secondary"
                            className="bg-primary-50 text-primary-600 hover:bg-primary-100"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">العنوان</h2>
                    <div className="space-y-2">
                      <p className="text-gray-600">{provider.location.address}</p>
                      <p className="text-gray-600">{provider.location.city}، {provider.location.state}</p>
                      <p className="text-gray-600">{provider.location.postalCode}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">التقييمات والمراجعات</h2>
                        <div className="flex items-center">
                          {renderStars(provider.rating)}
                          <span className="mr-2 text-gray-600">({provider.totalReviews} تقييم)</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg">
                        {provider.rating.toFixed(1)} / 5
                      </Badge>
                    </div>
                    <div className="text-center py-8 text-gray-500">
                      قريباً - سيتم إضافة نظام التقييمات والمراجعات
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
} 