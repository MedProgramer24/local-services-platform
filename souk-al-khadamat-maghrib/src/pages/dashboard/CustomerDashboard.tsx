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
interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  providerId: string;
}

interface FavoriteProvider {
  id: string;
  name: string;
  category: string;
  rating: number;
  city: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');

  // Fetch bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['customer-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/customer');
      return response.data;
    }
  });

  // Fetch favorite providers
  // const { data: favorites, isLoading: isLoadingFavorites } = useQuery<FavoriteProvider[]>({
  //   queryKey: ['customer-favorites'],
  //   queryFn: async () => {
  //     const response = await api.get('/favorites');
  //     return response.data;
  //   }
  // });

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
            <p className="text-gray-600">إدارة حسابك وحجوزاتك</p>
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
                    variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('bookings')}
                  >
                    <History className="ml-2 h-4 w-4" />
                    الحجوزات
                  </Button>
                  <Button
                    variant={activeTab === 'favorites' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('favorites')}
                  >
                    <Star className="ml-2 h-4 w-4" />
                    المفضلة
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
                    الملف الشخصي
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
                  <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
                  <TabsTrigger value="favorites">المفضلة</TabsTrigger>
                  <TabsTrigger value="messages">الرسائل</TabsTrigger>
                  <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
                  <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                </TabsList>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <Card>
                    <CardHeader>
                      <CardTitle>حجوزاتي</CardTitle>
                      <CardDescription>عرض وإدارة جميع حجوزاتك</CardDescription>
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
                                  <p className="text-gray-600">{booking.providerName}</p>
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
                                      <span>{booking.price} درهم</span>
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

                {/* Favorites Tab */}
                <TabsContent value="favorites">
                  <Card>
                    <CardHeader>
                      <CardTitle>المفضلة</CardTitle>
                      <CardDescription>مقدمي الخدمات المفضلين لديك</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* {isLoadingFavorites ? (
                        <div className="text-center py-8">جاري التحميل...</div>
                      ) : favorites?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          لا توجد مقدمي خدمات مفضلين حالياً
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {favorites?.map((provider) => (
                            <div
                              key={provider.id}
                              className="border rounded-lg p-4 hover:border-primary-500 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold">{provider.name}</h3>
                                  <p className="text-gray-600">{provider.category}</p>
                                  <div className="flex items-center space-x-4 space-x-reverse mt-2">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Star className="h-4 w-4 ml-1" />
                                      {provider.rating}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <MapPin className="h-4 w-4 ml-1" />
                                      {provider.city}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/provider/${provider.id}`)}
                                >
                                  عرض الملف
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )} */}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages">
                  <Card>
                    <CardHeader>
                      <CardTitle>الرسائل</CardTitle>
                      <CardDescription>محادثاتك مع مقدمي الخدمات</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">نظام الرسائل</h3>
                        <p className="text-gray-500 mb-4">تواصل مع مقدمي الخدمات مباشرة</p>
                        <Button onClick={() => navigate('/chat')}>
                          <MessageSquare className="ml-2 h-4 w-4" />
                          فتح المحادثات
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>الملف الشخصي</CardTitle>
                      <CardDescription>معلومات حسابك الشخصية</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">الاسم</label>
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
                        <Button className="mt-4" onClick={() => navigate('/profile/edit')}>تعديل الملف الشخصي</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>الإعدادات</CardTitle>
                      <CardDescription>إدارة إعدادات حسابك</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">الإشعارات</h3>
                            <p className="text-sm text-gray-500">تلقي إشعارات عن الحجوزات والتحديثات</p>
                          </div>
                          <Button variant="outline" onClick={() => navigate('/settings/notifications')}>تعديل</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">تغيير كلمة المرور</h3>
                            <p className="text-sm text-gray-500">تحديث كلمة المرور الخاصة بك</p>
                          </div>
                          <Button variant="outline" onClick={() => navigate('/settings/change-password')}>تغيير</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">حذف الحساب</h3>
                            <p className="text-sm text-gray-500">حذف حسابك نهائياً</p>
                          </div>
                          <Button variant="destructive">حذف</Button>
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