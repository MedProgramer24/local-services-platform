import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, Star, MapPin, Clock, Phone, Loader2, User } from "lucide-react";
import Header from "@/components/Header";
import { api } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    address: string;
  };
  services: Array<{
    name: string;
    description: string;
    price: number;
    duration: number;
  }>;
  isVerified: boolean;
  isActive: boolean;
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
}

const moroccanCities = [
  'الدار البيضاء',
  'الرباط',
  'مراكش',
  'طنجة',
  'فاس',
  'أكادير',
  'مكناس',
  'وجدة',
  'القنيطرة',
  'تطوان'
];

const serviceCategories = [
  'السباكة',
  'الكهرباء',
  'التنظيف',
  'الدهان',
  'البستنة',
  'إصلاح الأجهزة',
  'التنسيق',
  'النجارة',
  'الحدادة',
  'البناء'
];

export default function AllProviders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("0");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data, isLoading, error } = useQuery({
    queryKey: ['providers', searchQuery, selectedCity, selectedCategory, selectedRating, selectedAvailability, page],
    queryFn: async () => {
      try {
        const params: any = {
          limit,
          page,
          query: searchQuery || undefined,
          minRating: selectedRating !== "0" ? Number(selectedRating) : undefined,
          sort: 'rating'
        };

        if (selectedCity !== "all") {
          params.city = selectedCity;
        }

        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }

        console.log('Fetching providers with params:', params);
        const response = await api.get('/service-providers/search', { params });
        console.log('Providers response:', response.data);
        return response.data as { serviceProviders: Provider[]; pagination: { total: number; pages: number } };
      } catch (error: any) {
        console.error('Error fetching providers:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحميل مقدمي الخدمات');
      }
    }
  });

  const providers = data?.serviceProviders || [];
  const totalPages = data?.pagination.pages || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to first page on filter change
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              مقدمي الخدمات
            </h1>
            <p className="text-lg text-gray-600">
              اختر من بين أفضل مقدمي الخدمات المحترفين في منطقتك
            </p>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن مقدم خدمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select 
                value={selectedCity} 
                onValueChange={(value) => {
                  setSelectedCity(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {moroccanCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedCategory} 
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التخصص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التخصصات</SelectItem>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedRating} 
                onValueChange={(value) => {
                  setSelectedRating(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="التقييم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">جميع التقييمات</SelectItem>
                  <SelectItem value="4">4 نجوم وأعلى</SelectItem>
                  <SelectItem value="3">3 نجوم وأعلى</SelectItem>
                  <SelectItem value="2">2 نجوم وأعلى</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={selectedAvailability} 
                onValueChange={(value) => {
                  setSelectedAvailability(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="التوفر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأوقات</SelectItem>
                  <SelectItem value="today">متاح اليوم</SelectItem>
                  <SelectItem value="tomorrow">متاح غداً</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end mt-4">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  <Grid className="h-4 w-4 ml-2" />
                  شبكة
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  <List className="h-4 w-4 ml-2" />
                  قائمة
                </Button>
              </div>
            </div>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-2 text-gray-600">جاري تحميل مقدمي الخدمات...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                {error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل مقدمي الخدمات'}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                إعادة المحاولة
              </Button>
            </div>
          )}

          {/* Providers Grid/List */}
          {!isLoading && !error && (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {providers.map((provider) => {
                  const minPrice = Math.min(...provider.services.map(s => s.price));
                  const maxPrice = Math.max(...provider.services.map(s => s.price));
                  const priceRange = `${minPrice}-${maxPrice} درهم`;

                  return (
                    <Card 
                      key={provider._id}
                      className={`hover:shadow-md transition-shadow ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      <CardContent className={`p-6 ${viewMode === 'list' ? 'flex gap-6 w-full' : ''}`}>
                        <div className={`text-4xl mb-4 ${viewMode === 'list' ? 'flex-shrink-0' : 'text-center'}`}>
                          <User className="h-16 w-16 text-gray-400 mx-auto" />
                        </div>
                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {provider.businessName}
                            </h3>
                            {provider.isVerified && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                موثق
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 ml-1" />
                            {provider.location.city}
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 ml-1" />
                            {provider.services[0]?.duration} دقيقة
                          </div>

                          <p className="text-gray-600 mb-3">
                            {provider.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {provider.categories.map((category) => (
                              <Badge key={category._id} variant="secondary" className="text-xs">
                                {category.name}
                              </Badge>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 ml-1 text-yellow-400" />
                              <span>{provider.rating.toFixed(1)}</span>
                              <span className="text-gray-500 text-sm mr-1">
                                ({provider.totalReviews} تقييم)
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{priceRange}</span>
                              <span className="text-gray-500 text-sm mr-1">/ ساعة</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = `/provider/${provider._id}`}
                            >
                              عرض الملف الشخصي
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => window.location.href = `/booking/${provider._id}`}
                            >
                              احجز الآن
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    التالي
                  </Button>
                </div>
              )}

              {/* No Results */}
              {providers.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-600">لم يتم العثور على مقدمي خدمات</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('all');
                      setSelectedCategory('all');
                      setSelectedRating('0');
                      setSelectedAvailability('all');
                      setPage(1);
                    }}
                  >
                    إعادة تعيين الفلاتر
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 