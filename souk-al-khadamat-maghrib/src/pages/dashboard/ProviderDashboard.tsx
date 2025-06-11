import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Star,
  MapPin,
  User,
  Settings,
  History,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
} from "lucide-react";

// Types
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: {
    id: string;
    name: string;
  };
  isActive: boolean;
}

interface Booking {
  id: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  address: string;
  customerId: string;
}

interface DashboardStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch provider services
  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ['provider-services'],
    queryFn: async () => {
      const response = await api.get('/services/provider');
      return response.data;
    }
  });

  // Fetch provider bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['provider-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/provider');
      return response.data;
    }
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['provider-stats'],
    queryFn: async () => {
      const response = await api.get('/provider/stats');
      return response.data;
    }
  });

  const renderBookingStatus = (status: string) => {
    const statusStyles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const statusText = {
      confirmed: 'مؤكد',
      pending: 'قيد الانتظار',
      cancelled: 'ملغي',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-sm ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-2xl font-bold mb-2">مرحباً، {user?.name}</h1>
            <p className="text-gray-600">إدارة خدماتك وحجوزاتك</p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>القائمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('overview')}
                  >
                    <Calendar className="ml-2 h-4 w-4" />
                    نظرة عامة
                  </Button>
                  <Button
                    variant={activeTab === 'services' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('services')}
                  >
                    <Settings className="ml-2 h-4 w-4" />
                    الخدمات
                  </Button>
                  <Button
                    variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('bookings')}
                  >
                    <History className="ml-2 h-4 w-4" />
                    الحجوزات
                  </Button>
                  <Button
                    variant={activeTab === 'messages' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('messages')}
                  >
                    <MessageSquare className="ml-2 h-4 w-4" />
                    الرسائل
                  </Button>
                  <Button
                    variant={activeTab === 'profile' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="ml-2 h-4 w-4" />
                    الملف التجاري
                  </Button>
                  <Button
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="ml-2 h-4 w-4" />
                    الإعدادات
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="services">الخدمات</TabsTrigger>
                  <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
                  <TabsTrigger value="messages">الرسائل</TabsTrigger>
                  <TabsTrigger value="profile">الملف التجاري</TabsTrigger>
                  <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  {isLoadingStats ? (
                    <div className="text-center py-8">جاري التحميل...</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-500">إجمالي الحجوزات</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.totalBookings}</h3>
                              </div>
                              <div className="bg-primary-50 p-3 rounded-full">
                                <Calendar className="h-6 w-6 text-primary-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-500">إجمالي الإيرادات</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.totalRevenue} درهم</h3>
                              </div>
                              <div className="bg-green-50 p-3 rounded-full">
                                <DollarSign className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-500">متوسط التقييم</p>
                                <h3 className="text-2xl font-bold mt-1">{stats?.averageRating}</h3>
                                <p className="text-sm text-gray-500">من {stats?.totalReviews} تقييم</p>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-full">
                                <Star className="h-6 w-6 text-yellow-600" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>الحجوزات الأخيرة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isLoadingBookings ? (
                            <div className="text-center py-8">جاري التحميل...</div>
                          ) : bookings?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              لا توجد حجوزات حالياً
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {bookings?.slice(0, 3).map((booking) => (
                                <div
                                  key={booking.id}
                                  className="border rounded-lg p-4 hover:border-primary-500 transition-colors"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-semibold">{booking.serviceName}</h3>
                                      <p className="text-gray-600">{booking.customerName}</p>
                                      <div className="flex items-center space-x-4 space-x-reverse mt-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                          <Calendar className="h-4 w-4 ml-1" />
                                          {booking.date}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                          <Clock className="h-4 w-4 ml-1" />
                                          {booking.time}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                          <MapPin className="h-4 w-4 ml-1" />
                                          {booking.address}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      {renderBookingStatus(booking.status)}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/booking/${booking.id}`)}
                                      >
                                        التفاصيل
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>الخدمات</CardTitle>
                        <CardDescription>إدارة خدماتك المقدمة</CardDescription>
                      </div>
                      <Button onClick={() => navigate('/provider/services/new')}>
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة خدمة
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isLoadingServices ? (
                        <div className="text-center py-8">جاري التحميل...</div>
                      ) : services?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          لا توجد خدمات حالياً
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {services?.map((service) => (
                            <div
                              key={service.id}
                              className="border rounded-lg p-4 hover:border-primary-500 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{service.name}</h3>
                                  <p className="text-gray-600">{service.description}</p>
                                  <div className="flex items-center space-x-4 space-x-reverse mt-2">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <span>{service.price} درهم</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-4 w-4 ml-1" />
                                      {service.duration} دقيقة
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <span>{service.category.name}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/provider/services/${service.id}/edit`)}
                                  >
                                    <Edit className="h-4 w-4 ml-1" />
                                    تعديل
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {/* TODO: Implement delete service */}}
                                  >
                                    <Trash2 className="h-4 w-4 ml-1" />
                                    حذف
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <Card>
                    <CardHeader>
                      <CardTitle>الحجوزات</CardTitle>
                      <CardDescription>إدارة جميع حجوزات العملاء</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingBookings ? (
                        <div className="text-center py-8">جاري التحميل...</div>
                      ) : bookings?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          لا توجد حجوزات حالياً
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings?.map((booking) => (
                            <div
                              key={booking.id}
                              className="border rounded-lg p-4 hover:border-primary-500 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{booking.serviceName}</h3>
                                  <p className="text-gray-600">{booking.customerName}</p>
                                  <div className="flex items-center space-x-4 space-x-reverse mt-2">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Calendar className="h-4 w-4 ml-1" />
                                      {booking.date}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-4 w-4 ml-1" />
                                      {booking.time}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <MapPin className="h-4 w-4 ml-1" />
                                      {booking.address}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  {renderBookingStatus(booking.status)}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/booking/${booking.id}`)}
                                  >
                                    التفاصيل
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages">
                  <Card>
                    <CardHeader>
                      <CardTitle>الرسائل</CardTitle>
                      <CardDescription>محادثاتك مع العملاء</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        قريباً - سيتم إضافة نظام الرسائل
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>الملف التجاري</CardTitle>
                      <CardDescription>معلومات عملك وخدماتك</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">اسم الشركة</label>
                            <p className="mt-1">{user?.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                            <p className="mt-1">{user?.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                            <p className="mt-1">{user?.phone}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">المدينة</label>
                            <p className="mt-1">{user?.city}</p>
                          </div>
                        </div>
                        <Button className="mt-4">تعديل الملف التجاري</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>الإعدادات</CardTitle>
                      <CardDescription>إدارة إعدادات حسابك التجاري</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">الإشعارات</h3>
                            <p className="text-sm text-gray-500">تلقي إشعارات عن الحجوزات والتحديثات</p>
                          </div>
                          <Button variant="outline">تعديل</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">ساعات العمل</h3>
                            <p className="text-sm text-gray-500">تحديد أوقات توفرك للعملاء</p>
                          </div>
                          <Button variant="outline">تعديل</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">تغيير كلمة المرور</h3>
                            <p className="text-sm text-gray-500">تحديث كلمة المرور الخاصة بك</p>
                          </div>
                          <Button variant="outline">تغيير</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 