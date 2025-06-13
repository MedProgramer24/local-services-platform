import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

// Mock data - Replace with actual API calls
const mockProvider = {
  id: '1',
  businessName: 'شركة النجاح للخدمات المنزلية',
  contactName: 'أحمد محمد',
  email: 'contact@example.com',
  phone: '+212 6XX-XXXXXX',
  cities: ['الدار البيضاء', 'الرباط', 'طنجة'],
  categories: ['تنظيف المنازل', 'الصيانة المنزلية', 'التنسيق'],
  description: 'نقدم خدمات منزلية احترافية مع ضمان الجودة والموثوقية. فريقنا المدرب جيداً يضمن رضاكم التام.',
  rating: 4.8,
  reviewCount: 128,
  verified: true,
  experience: '10+ سنوات',
  teamSize: '15+ موظف',
  coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3',
  profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3',
  gallery: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3',
  ],
  workingHours: {
    sunday: { start: '08:00', end: '20:00' },
    monday: { start: '08:00', end: '20:00' },
    tuesday: { start: '08:00', end: '20:00' },
    wednesday: { start: '08:00', end: '20:00' },
    thursday: { start: '08:00', end: '20:00' },
    friday: { start: '10:00', end: '18:00' },
    saturday: { start: '10:00', end: '18:00' },
  },
  services: [
    {
      id: '1',
      name: 'تنظيف المنزل الشامل',
      description: 'تنظيف شامل للمنزل يشمل جميع الغرف والمطبخ والحمامات',
      price: 300,
      duration: '3 ساعات',
      features: ['تنظيف شامل', 'غسيل السجاد', 'تنظيف المطبخ', 'تنظيف الحمامات'],
      isPopular: true,
    },
    {
      id: '2',
      name: 'صيانة السباكة',
      description: 'إصلاح وتسربات المياه وتغيير الحنفيات',
      price: 200,
      duration: '2 ساعة',
      features: ['إصلاح التسربات', 'تغيير الحنفيات', 'تنظيف المجاري', 'صيانة سخانات المياه'],
      isPopular: true,
    },
    {
      id: '3',
      name: 'تنظيف النوافذ',
      description: 'تنظيف وتلميع جميع أنواع النوافذ والزجاج',
      price: 150,
      duration: '2 ساعة',
      features: ['تنظيف النوافذ', 'تلميع الزجاج', 'تنظيف الستائر', 'إزالة البقع'],
      isPopular: false,
    },
    {
      id: '4',
      name: 'صيانة التكييف',
      description: 'صيانة وتنظيف جميع أنواع أجهزة التكييف',
      price: 250,
      duration: '3 ساعات',
      features: ['تنظيف الفلاتر', 'إصلاح التسربات', 'إضافة الفريون', 'صيانة المحرك'],
      isPopular: false,
    },
    {
      id: '5',
      name: 'تنظيف السجاد',
      description: 'تنظيف وتجفيف السجاد باحترافية عالية',
      price: 180,
      duration: '2 ساعة',
      features: ['تنظيف عميق', 'إزالة البقع', 'تجفيف سريع', 'معطرات عطرية'],
      isPopular: false,
    },
  ],
  reviews: [
    {
      id: '1',
      userName: 'سارة أحمد',
      rating: 5,
      comment: 'خدمة ممتازة وفريق عمل محترف. أنصح بالتعامل معهم',
      date: '2024-03-15',
      userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3',
    },
    {
      id: '2',
      userName: 'محمد علي',
      rating: 4,
      comment: 'جودة جيدة وسعر معقول. سأتعامل معهم مرة أخرى',
      date: '2024-03-10',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3',
    },
  ],
};

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'gallery'>('services');
  const [showAllServices, setShowAllServices] = useState(false);

  const handleBooking = (serviceId: string) => {
    navigate(`/booking/${id}?service=${serviceId}`);
  };

  const popularServices = mockProvider.services.filter(service => service.isPopular);
  const otherServices = mockProvider.services.filter(service => !service.isPopular);

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

  const ServiceCard = ({ service }: { service: typeof mockProvider.services[0] }) => (
    <div className="border border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
            {service.name}
          </h3>
          <p className="text-gray-600 mb-4">{service.description}</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {service.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <CheckCircleIcon className="h-4 w-4 text-primary-600 ml-1" />
                {feature}
              </div>
            ))}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 ml-1" />
            <span>{service.duration}</span>
          </div>
        </div>
        <div className="text-left mr-6">
          <div className="text-2xl font-semibold text-primary-600 mb-4">
            {service.price} درهم
          </div>
          <button
            onClick={() => handleBooking(service.id)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            حجز الخدمة
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      <div className="relative h-64 md:h-96">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mockProvider.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-end space-x-4 space-x-reverse">
            <div className="relative -mb-16">
              <img
                src={mockProvider.profileImage}
                alt={mockProvider.businessName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover"
              />
              {mockProvider.verified && (
                <div className="absolute bottom-2 right-2 bg-primary-600 text-white p-1 rounded-full">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="text-white mb-4">
              <h1 className="text-3xl font-bold mb-2">{mockProvider.businessName}</h1>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center">
                  {renderStars(mockProvider.rating)}
                  <span className="mr-2">({mockProvider.reviewCount} تقييم)</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 ml-1" />
                  <span>{mockProvider.cities.join('، ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Provider Info */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4 space-x-reverse">
                <div className="bg-primary-50 p-3 rounded-full">
                  <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">سنوات الخبرة</p>
                  <p className="text-lg font-semibold">{mockProvider.experience}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4 space-x-reverse">
                <div className="bg-primary-50 p-3 rounded-full">
                  <UserGroupIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">حجم الفريق</p>
                  <p className="text-lg font-semibold">{mockProvider.teamSize}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4 space-x-reverse">
                <div className="bg-primary-50 p-3 rounded-full">
                  <StarIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">متوسط التقييم</p>
                  <p className="text-lg font-semibold">{mockProvider.rating} / 5</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 space-x-reverse px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'services'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    الخدمات
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'reviews'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    التقييمات
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'gallery'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    معرض الأعمال
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'services' && (
                  <div className="space-y-6">
                    {/* Popular Services */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">الخدمات الأكثر طلباً</h3>
                      <div className="space-y-6">
                        {popularServices.map((service) => (
                          <ServiceCard key={service.id} service={service} />
                        ))}
                      </div>
                    </div>

                    {/* Other Services Button */}
                    {otherServices.length > 0 && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowAllServices(true)}
                          className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          عرض باقي الخدمات ({otherServices.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {mockProvider.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <img
                            src={review.userImage}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{review.userName}</h3>
                                <div className="flex items-center mt-1">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-gray-500 mr-2">{review.date}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 mt-2">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockProvider.gallery.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden group relative"
                      >
                        <img
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <PhotoIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">معلومات الاتصال</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-primary-600 ml-2" />
                  <span>{mockProvider.phone}</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-primary-600 ml-2" />
                  <span>{mockProvider.email}</span>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">ساعات العمل</h2>
              <div className="space-y-2">
                {Object.entries(mockProvider.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="font-medium">{day}</span>
                    <span className="text-gray-600">
                      {hours.start} - {hours.end}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">التصنيفات</h2>
              <div className="flex flex-wrap gap-2">
                {mockProvider.categories.map((category) => (
                  <span
                    key={category}
                    className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Cities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">المدن المتوفرة</h2>
              <div className="flex flex-wrap gap-2">
                {mockProvider.cities.map((city) => (
                  <span
                    key={city}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Modal */}
      {showAllServices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">جميع الخدمات المتوفرة</h2>
              <button
                onClick={() => setShowAllServices(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {otherServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 