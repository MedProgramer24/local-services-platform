import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Users, Shield, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const featuredServices = [
  {
    id: 1,
    name: "تنظيف المنازل",
    icon: "🧹",
    description: "خدمات تنظيف احترافية للمنازل والمكاتب",
    price: "من 150 درهم"
  },
  {
    id: 2,
    name: "الصيانة المنزلية",
    icon: "🔧",
    description: "إصلاح وصيانة جميع الأجهزة المنزلية",
    price: "من 200 درهم"
  },
  {
    id: 3,
    name: "الكهرباء",
    icon: "⚡",
    description: "خدمات كهربائية معتمدة وآمنة",
    price: "من 180 درهم"
  },
  {
    id: 4,
    name: "السباكة",
    icon: "🚰",
    description: "حلول سباكة احترافية وسريعة",
    price: "من 250 درهم"
  }
];

const cities = [
  "الدار البيضاء",
  "الرباط",
  "مراكش",
  "أكادير",
  "فاس",
  "طنجة",
  "مكناس",
  "وجدة"
];

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery)}${selectedCity !== "all" ? `&city=${encodeURIComponent(selectedCity)}` : ''}`);
    }
  }, [searchQuery, selectedCity, navigate]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <section className="relative bg-moroccan-gradient min-h-[500px] xs:min-h-[600px] sm:min-h-[700px] md:min-h-[800px] lg:min-h-[900px] flex items-center overflow-hidden py-6 xs:py-8 sm:py-12 md:py-16 lg:py-20">
      {/* Background Pattern - Further optimized for mobile */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/moroccan-pattern.svg')] bg-repeat opacity-[0.03] xs:opacity-5 sm:opacity-10 bg-[length:100px_100px] xs:bg-[length:150px_150px] sm:bg-[length:200px_200px]"></div>
      </div>

      {/* Decorative Elements - Optimized for performance */}
      <div className="absolute top-0 left-0 w-24 xs:w-32 sm:w-48 md:w-64 lg:w-96 h-24 xs:h-32 sm:h-48 md:h-64 lg:h-96 bg-yellow-300/10 rounded-full filter blur-2xl xs:blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[150px] xs:w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] h-[150px] xs:h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-orange-500/10 rounded-full filter blur-2xl xs:blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] xs:w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[200px] xs:h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-blue-500/5 rounded-full filter blur-2xl xs:blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-2.5 xs:px-3 sm:px-4 md:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-5 xs:space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
          <div className="space-y-2.5 xs:space-y-3 sm:space-y-4 md:space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl xs:text-2.5xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold text-white drop-shadow-lg leading-tight tracking-tight">
              اكتشف أفضل مقدمي الخدمات
              <br className="hidden xs:block" />
              <span className="text-yellow-300 relative inline-block mt-1 xs:mt-1.5 sm:mt-2 md:mt-0">
                في المغرب
                <span className="absolute -bottom-0.5 xs:-bottom-1 sm:-bottom-1.5 md:-bottom-2 left-0 w-full h-0.5 xs:h-0.75 sm:h-1 bg-yellow-300/30 rounded-full"></span>
              </span>
            </h1>
            
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6">
              منصة موثوقة تربطك بأفضل الحرفيين ومقدمي الخدمات المحلية في جميع أنحاء المملكة
            </p>
          </div>

          {/* Trust Indicators - Enhanced touch targets */}
          <div className="flex flex-wrap justify-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 mb-5 xs:mb-6 sm:mb-8 md:mb-12 lg:mb-16 px-2 xs:px-3 sm:px-4">
            {[
              { icon: Users, text: "+1000 مقدم خدمة" },
              { icon: Star, text: "4.8/5 تقييم" },
              { icon: Shield, text: "خدمات موثوقة" },
              { icon: Clock, text: "حجز فوري" }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center bg-white/10 backdrop-blur-md px-3 xs:px-3.5 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-3 md:py-4 rounded-full text-white border border-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 transform active:scale-95 min-h-[40px] xs:min-h-[44px] sm:min-h-[48px] touch-manipulation"
              >
                <item.icon className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5 md:h-6 md:w-6 ml-1.5 xs:ml-2 sm:ml-2.5 md:ml-3 text-yellow-300" />
                <span className="font-medium text-xs xs:text-sm sm:text-base md:text-lg whitespace-nowrap">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Search Box - Mobile-First, Pill-Shaped, Unified Height */}
          <div className={`bg-white/95 backdrop-blur-md rounded-2xl p-2 xs:p-2.5 sm:p-4 md:p-6 max-w-4xl mx-auto shadow-md border border-white/10 mx-1.5 xs:mx-2 sm:mx-4 md:mx-6 transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-moroccan-orange/20' : ''}`}>
            <div className="flex flex-col sm:flex-row gap-2.5 xs:gap-3 sm:gap-4 md:gap-6">
              {/* Search Input - Pill Shape, Unified Height */}
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="ما الخدمة التي تحتاجها؟"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-right text-gray-900 placeholder-gray-500 text-sm sm:text-base rounded-full border-gray-200 focus:border-moroccan-orange focus:ring-2 focus:ring-moroccan-orange/20 transition-all duration-200 min-h-[44px] sm:min-h-[52px] touch-manipulation shadow-sm"
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* City Select - Pill Shape, Unified Height, Custom Arrow */}
              <div className="relative flex-1">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger 
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-full border-gray-200 focus:border-moroccan-orange focus:ring-2 focus:ring-moroccan-orange/20 transition-all duration-200 min-h-[44px] sm:min-h-[52px] touch-manipulation shadow-sm bg-white flex items-center justify-between"
                  >
                    <SelectValue placeholder="اختر المدينة" />
                    <svg className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-[250px] sm:max-h-[300px] overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200"
                    position="popper"
                    sideOffset={4}
                  >
                    <SelectItem 
                      value="all" 
                      className="text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-5 focus:bg-moroccan-orange/10 focus:text-moroccan-orange cursor-pointer rounded-full"
                    >
                      جميع المدن
                    </SelectItem>
                    {cities.map((city) => (
                      <SelectItem 
                        key={city} 
                        value={city} 
                        className="text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-5 focus:bg-moroccan-orange/10 focus:text-moroccan-orange cursor-pointer rounded-full"
                      >
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button - Pill Shape, Unified Height */}
              <Button 
                className="bg-moroccan-orange hover:bg-orange-600 active:bg-orange-700 px-4 sm:px-5 py-2.5 sm:py-3 text-white text-sm sm:text-base rounded-full transition-all duration-200 transform active:scale-95 hover:shadow-md w-full sm:w-auto min-h-[44px] sm:min-h-[52px] touch-manipulation shadow-sm flex items-center justify-center gap-2"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>ابحث الآن</span>
              </Button>
            </div>
          </div>

          {/* Featured Services Carousel - Enhanced mobile experience */}
          <div className="mt-4 xs:mt-6 sm:mt-8 md:mt-10 lg:mt-12 max-w-5xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6">
            <div className="flex items-center justify-center gap-2 mb-2 xs:mb-3 sm:mb-4 md:mb-5">
              <CheckCircle2 className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-300" />
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold text-white">خدمات شائعة</h2>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
                containScroll: "trimSnaps",
                skipSnaps: false,
              }}
              className="w-full"
            >
              <CarouselContent className="py-2 xs:py-3 sm:py-4 px-1 xs:px-2">
                {featuredServices.map((service) => (
                  <CarouselItem
                    key={service.id}
                    className="basis-[85%] xs:basis-[75%] sm:basis-1/2 lg:basis-1/4 px-1.5 xs:px-2 sm:px-3"
                  >
                    <div 
                      className="p-2.5 xs:p-3 sm:p-4 md:p-5 lg:p-6 bg-white/10 backdrop-blur-md rounded-lg xs:rounded-xl sm:rounded-2xl text-white cursor-pointer hover:bg-white/20 active:bg-white/30 transition-all duration-200 transform active:scale-95 border border-white/10 min-h-[160px] xs:min-h-[180px] sm:min-h-[200px] md:min-h-[220px] flex flex-col justify-between touch-manipulation"
                      onClick={() => navigate(`/services?category=${encodeURIComponent(service.name)}`)}
                    >
                      <div>
                        <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 transform hover:scale-110 transition-transform duration-200">{service.icon}</div>
                        <h3 className="font-semibold text-xs xs:text-sm sm:text-base md:text-lg mb-1.5 xs:mb-2 sm:mb-2.5">{service.name}</h3>
                        <p className="text-white/80 mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 text-[11px] xs:text-xs sm:text-sm leading-relaxed">{service.description}</p>
                      </div>
                      <p className="text-yellow-300 font-medium text-[11px] xs:text-xs sm:text-sm md:text-base">{service.price}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Show navigation controls on all screen sizes */}
              <div className="flex items-center justify-center gap-2 mt-3 xs:mt-4">
                <CarouselPrevious className="static translate-y-0 text-white border-white/20 hover:bg-white/20 hover:border-white/40 active:bg-white/30 transition-all duration-200 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9">
                  <ChevronLeft className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                </CarouselPrevious>
                <CarouselNext className="static translate-y-0 text-white border-white/20 hover:bg-white/20 hover:border-white/40 active:bg-white/30 transition-all duration-200 h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9">
                  <ChevronRight className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                </CarouselNext>
              </div>
            </Carousel>
          </div>

          {/* Quick Links - Enhanced mobile experience */}
          <div className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 lg:mt-16 flex flex-wrap justify-center gap-2.5 xs:gap-3 sm:gap-4 md:gap-6 lg:gap-8 px-2 xs:px-3 sm:px-4">
            {[
              { text: "تصفح جميع الخدمات", path: "/services" },
              { text: "عرض مقدمي الخدمات", path: "/providers" }
            ].map((link, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 active:bg-white/30 px-3 xs:px-4 sm:px-6 md:px-12 py-2 xs:py-2.5 sm:py-3 md:py-6 text-sm xs:text-base sm:text-lg rounded-lg transition-all duration-200 transform active:scale-95 hover:border-white/40 hover:shadow-lg w-full sm:w-auto min-h-[40px] xs:min-h-[44px] sm:min-h-[48px] touch-manipulation"
                onClick={() => navigate(link.path)}
              >
                {link.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
