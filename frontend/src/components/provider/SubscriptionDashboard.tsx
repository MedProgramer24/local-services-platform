import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { arMA } from 'date-fns/locale';

interface SubscriptionStatus {
  status: 'trial' | 'active' | 'expired';
  startDate: string;
  endDate: string;
  trialEndDate: string;
  lastPaymentDate?: string;
  paymentAmount?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

export default function SubscriptionDashboard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/subscriptions/status');
      setSubscription(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب حالة الاشتراك');
      console.error('Error fetching subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      const response = await api.post('/subscriptions/payment', {
        paymentMethod: 'card' // This will be replaced with actual payment gateway
      });
      setSubscription(response.data.subscription);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء معالجة الدفع');
      console.error('Error processing payment:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>لا يوجد اشتراك</AlertTitle>
        <AlertDescription>لم يتم العثور على معلومات الاشتراك</AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial':
        return 'text-blue-600';
      case 'active':
        return 'text-green-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trial':
        return <Clock className="h-5 w-5" />;
      case 'active':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'trial':
        return 'فترة تجريبية';
      case 'active':
        return 'نشط';
      case 'expired':
        return 'منتهي';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(subscription.status)}
            <span className={getStatusColor(subscription.status)}>
              {getStatusText(subscription.status)}
            </span>
          </CardTitle>
          <CardDescription>
            {subscription.status === 'trial' && 'أنت في فترة التجربة المجانية'}
            {subscription.status === 'active' && 'اشتراكك نشط'}
            {subscription.status === 'expired' && 'انتهت صلاحية اشتراكك'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">تاريخ البدء</p>
              <p className="font-medium">
                {format(new Date(subscription.startDate), 'PPP', { locale: arMA })}
              </p>
            </div>
            {subscription.status === 'trial' && (
              <div>
                <p className="text-sm text-gray-500">نهاية الفترة التجريبية</p>
                <p className="font-medium">
                  {format(new Date(subscription.trialEndDate), 'PPP', { locale: arMA })}
                </p>
              </div>
            )}
            {subscription.status === 'active' && (
              <div>
                <p className="text-sm text-gray-500">تاريخ انتهاء الاشتراك</p>
                <p className="font-medium">
                  {format(new Date(subscription.endDate), 'PPP', { locale: arMA })}
                </p>
              </div>
            )}
            {subscription.lastPaymentDate && (
              <div>
                <p className="text-sm text-gray-500">آخر دفعة</p>
                <p className="font-medium">
                  {format(new Date(subscription.lastPaymentDate), 'PPP', { locale: arMA })}
                </p>
              </div>
            )}
            {subscription.paymentAmount && (
              <div>
                <p className="text-sm text-gray-500">قيمة الدفعة</p>
                <p className="font-medium">{subscription.paymentAmount} درهم</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {subscription.status === 'trial' && (
            <Button
              onClick={handlePayment}
              disabled={processingPayment}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 ml-2" />
              {processingPayment ? 'جاري المعالجة...' : 'اشترك الآن (100 درهم/شهر)'}
            </Button>
          )}
          {subscription.status === 'expired' && (
            <Button
              onClick={handlePayment}
              disabled={processingPayment}
              className="w-full"
            >
              <CreditCard className="h-4 w-4 ml-2" />
              {processingPayment ? 'جاري المعالجة...' : 'تجديد الاشتراك (100 درهم/شهر)'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 