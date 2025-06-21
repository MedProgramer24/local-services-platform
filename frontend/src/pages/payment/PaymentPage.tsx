import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import PaymentForm from '@/components/payment/PaymentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, CreditCard, Calendar, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';

interface BookingDetails {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  address: string;
  provider: {
    _id: string;
    businessName: string;
    contactInfo: {
      phone: string;
      email: string;
    };
  };
}

interface PaymentIntent {
  clientSecret: string;
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
  };
}

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookingDetails();
  }, [bookingId, user]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.booking);
      
      // Create payment intent after fetching booking details
      await createPaymentIntent(response.data.booking);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking details');
      toast.error('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentIntent = async (bookingData: BookingDetails) => {
    try {
      setIsCreatingPayment(true);
      const response = await api.post('/payments/booking', {
        providerId: bookingData.provider._id,
        bookingId: bookingData.id,
        amount: bookingData.price * 100, // Convert to cents for Stripe
        description: `Payment for ${bookingData.serviceName} booking`
      });
      
      setPaymentIntent(response.data);
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      setError(err.response?.data?.message || 'Failed to create payment intent');
      toast.error('Failed to create payment intent');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      // Confirm payment with backend
      await api.post('/payments/confirm', { paymentIntentId: paymentId });
      toast.success('Payment completed successfully!');
      navigate('/booking/success');
    } catch (err: any) {
      toast.error('Failed to confirm payment');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    toast.error(error);
  };

  if (isLoading || isCreatingPayment) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {isCreatingPayment ? 'جاري إعداد الدفع...' : 'جاري تحميل تفاصيل الحجز...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Alert variant="destructive">
                <AlertDescription>
                  {error || 'Booking not found'}
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate(-1)} 
                className="mt-4"
                variant="outline"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة
              </Button>
            </div>
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
          <div className="max-w-4xl mx-auto">
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
                إتمام الدفع
              </h1>
              <p className="text-gray-600">
                أكمل عملية الدفع لتأكيد حجزك
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Booking Details */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      تفاصيل الحجز
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                        <p className="text-gray-600">الخدمة المطلوبة</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {booking.price} درهم
                        </p>
                        <p className="text-sm text-gray-500">السعر</p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{booking.date}</p>
                          <p className="text-sm text-gray-500">التاريخ</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{booking.time}</p>
                          <p className="text-sm text-gray-500">الوقت</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{booking.address}</p>
                          <p className="text-sm text-gray-500">العنوان</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{booking.provider.businessName}</p>
                          <p className="text-sm text-gray-500">مقدم الخدمة</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>ملخص الدفع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>سعر الخدمة</span>
                        <span>{booking.price} درهم</span>
                      </div>
                      <div className="flex justify-between">
                        <span>رسوم المعاملة</span>
                        <span>0 درهم</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-bold text-lg">
                        <span>المجموع</span>
                        <span>{booking.price} درهم</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Form */}
              <div>
                {paymentIntent ? (
                  <PaymentForm
                    clientSecret={paymentIntent.clientSecret}
                    amount={paymentIntent.payment.amount / 100} // Convert back from cents
                    currency={paymentIntent.payment.currency}
                    description={paymentIntent.payment.description}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        الدفع
                      </CardTitle>
                      <CardDescription>
                        جاري إعداد صفحة الدفع...
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">يرجى الانتظار</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 