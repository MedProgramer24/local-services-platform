import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowRight, Bell, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  bookingNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingNotifications: boolean;
  reminderNotifications: boolean;
}

export default function NotificationsSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    bookingNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingNotifications: false,
    reminderNotifications: true,
  });

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const response = await api.put('/auth/notification-settings', settings);
      
      if (response.data) {
        toast.success('تم حفظ إعدادات الإشعارات بنجاح');
        navigate(-1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الإعدادات');
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
                إعدادات الإشعارات
              </h1>
              <p className="text-gray-600">
                إدارة تفضيلات الإشعارات الخاصة بك
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 ml-2" />
                  الإشعارات
                </CardTitle>
                <CardDescription>
                  اختر أنواع الإشعارات التي تريد تلقيها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Booking Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">إشعارات الحجوزات</Label>
                      <p className="text-sm text-gray-500">
                        تلقي إشعارات عند تأكيد أو إلغاء الحجوزات
                      </p>
                    </div>
                    <Switch
                      checked={settings.bookingNotifications}
                      onCheckedChange={() => handleToggle('bookingNotifications')}
                    />
                  </div>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">الإشعارات عبر البريد الإلكتروني</Label>
                      <p className="text-sm text-gray-500">
                        تلقي إشعارات مهمة عبر البريد الإلكتروني
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={() => handleToggle('emailNotifications')}
                    />
                  </div>

                  {/* SMS Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">الإشعارات عبر الرسائل النصية</Label>
                      <p className="text-sm text-gray-500">
                        تلقي إشعارات عاجلة عبر الرسائل النصية
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={() => handleToggle('smsNotifications')}
                    />
                  </div>

                  {/* Reminder Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">إشعارات التذكير</Label>
                      <p className="text-sm text-gray-500">
                        تذكيرات قبل مواعيد الحجوزات
                      </p>
                    </div>
                    <Switch
                      checked={settings.reminderNotifications}
                      onCheckedChange={() => handleToggle('reminderNotifications')}
                    />
                  </div>

                  {/* Marketing Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">الإشعارات التسويقية</Label>
                      <p className="text-sm text-gray-500">
                        عروض خاصة وتحديثات عن الخدمات الجديدة
                      </p>
                    </div>
                    <Switch
                      checked={settings.marketingNotifications}
                      onCheckedChange={() => handleToggle('marketingNotifications')}
                    />
                  </div>
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
                  <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4 ml-2" />
                    {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 