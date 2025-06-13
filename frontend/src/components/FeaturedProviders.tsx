import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Loader2 } from "lucide-react";
import { api } from '@/lib/api';

interface Provider {
  _id: string;
  businessName: string;
  description: string;
  categories: Array<{
    _id: string;
    name: string;
  }>;
  rating: number;
  totalReviews: number;
  location: {
    city: string;
  };
  services: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
  isVerified: boolean;
  isActive: boolean;
}

const FeaturedProviders = () => {
  const navigate = useNavigate();

  const { data: providers, isLoading, error } = useQuery({
    queryKey: ['featuredProviders'],
    queryFn: async () => {
      try {
        console.log('Fetching featured providers...');
        const response = await api.get('/service-providers/search', {
          params: {
            limit: 3,
            sort: 'createdAt:-1' // Sort by newest first instead of rating
          }
        });
        console.log('Featured providers response:', response.data);
        return response.data.serviceProviders as Provider[];
      } catch (error: any) {
        console.error('Error fetching featured providers:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحميل مقدمي الخدمات المميزين');
      }
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              مقدمو خدمات مميزون
            </h2>
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              مقدمو خدمات مميزون
            </h2>
            <p className="text-red-600">
              {error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل مقدمي الخدمات المميزين'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              مقدمو خدمات مميزون
            </h2>
            <p className="text-gray-600">
              لا يوجد مقدمي خدمات مميزين حالياً
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            أحدث مقدمي الخدمات
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف أحدث مقدمي الخدمات المنضمين إلى منصتنا
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map((provider) => (
            <Card key={provider._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {provider.businessName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 ml-1" />
                      {provider.location.city}
                    </div>
                  </div>
                  {provider.isVerified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      موثق
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {provider.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.categories.slice(0, 2).map((category) => (
                    <Badge key={category._id} variant="secondary" className="text-xs">
                      {category.name}
                    </Badge>
                  ))}
                  {provider.categories.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{provider.categories.length - 2} أكثر
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 ml-1" />
                    <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                    <span className="text-gray-500 mr-1">({provider.totalReviews})</span>
                  </div>
                  {provider.services[0] && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 ml-1" />
                      <span>من {provider.services[0].duration} دقيقة</span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => navigate(`/provider/${provider._id}`)}
                >
                  عرض التفاصيل
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => navigate('/providers')}
            className="text-lg"
          >
            عرض جميع مقدمي الخدمات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProviders;
