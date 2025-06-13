import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, Filter } from "lucide-react";
import Header from "@/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for categories - this would come from your API
const categories = [
  {
    id: 1,
    name: "السباكة",
    icon: "🔧",
    description: "إصلاح وتركيب الأنابيب والحنفيات",
    providerCount: 150,
    subcategories: ["إصلاح التسريبات", "تركيب الحنفيات", "صيانة دورية", "تركيب سخانات"],
    averageRating: 4.8,
    popularCities: ["الدار البيضاء", "الرباط", "مراكش", "طنجة"]
  },
  {
    id: 2,
    name: "الكهرباء",
    icon: "⚡",
    description: "أعمال كهربائية وصيانة",
    providerCount: 120,
    subcategories: ["تركيب الأضواء", "إصلاح الأعطال", "فحص دوري", "تركيب أنظمة الأمان"],
    averageRating: 4.7,
    popularCities: ["الدار البيضاء", "الرباط", "فاس", "أكادير"]
  },
  {
    id: 3,
    name: "التنظيف",
    icon: "🧹",
    description: "تنظيف المنازل والمكاتب",
    providerCount: 200,
    subcategories: ["تنظيف عميق", "تنظيف يومي", "تنظيف بعد الحفلات", "تنظيف السجاد"],
    averageRating: 4.6,
    popularCities: ["الدار البيضاء", "الرباط", "مراكش", "طنجة"]
  },
  {
    id: 4,
    name: "الطلاء",
    icon: "🎨",
    description: "طلاء الجدران والديكور",
    providerCount: 80,
    subcategories: ["طلاء داخلي", "طلاء خارجي", "ديكورات جبسية", "ورق جدران"],
    averageRating: 4.5,
    popularCities: ["الدار البيضاء", "الرباط", "مراكش", "فاس"]
  },
  {
    id: 5,
    name: "البستنة",
    icon: "🌿",
    description: "تنسيق وصيانة الحدائق",
    providerCount: 60,
    subcategories: ["تنسيق الحدائق", "صيانة النباتات", "تركيب أنظمة الري", "تقطيع الأشجار"],
    averageRating: 4.9,
    popularCities: ["الدار البيضاء", "الرباط", "مراكش", "أكادير"]
  },
  {
    id: 6,
    name: "إصلاح الأجهزة",
    icon: "🔧",
    description: "صيانة الأجهزة المنزلية",
    providerCount: 90,
    subcategories: ["إصلاح الثلاجات", "إصلاح الغسالات", "إصلاح المكيفات", "إصلاح الأفران"],
    averageRating: 4.4,
    popularCities: ["الدار البيضاء", "الرباط", "فاس", "طنجة"]
  }
];

export default function AllCategories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("0");

  const cities = Array.from(new Set(categories.flatMap(cat => cat.popularCities)));

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.includes(searchQuery) || 
                         category.description.includes(searchQuery) ||
                         category.subcategories.some(sub => sub.includes(searchQuery));
    
    const matchesCity = selectedCity === "all" || category.popularCities.includes(selectedCity);
    const matchesRating = selectedRating === "0" || category.averageRating >= parseFloat(selectedRating);
    
    return matchesSearch && matchesCity && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              جميع فئات الخدمات
            </h1>
            <p className="text-lg text-gray-600">
              اكتشف مجموعة واسعة من الخدمات المهنية المتاحة في منطقتك
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن خدمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger>
                  <SelectValue placeholder="التقييم الأدنى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">جميع التقييمات</SelectItem>
                  <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                  <SelectItem value="4.0">4.0+ ⭐</SelectItem>
                  <SelectItem value="3.5">3.5+ ⭐</SelectItem>
                </SelectContent>
              </Select>

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
          </div>

          {/* Categories Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredCategories.map((category) => (
              <Card 
                key={category.id}
                className={`hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <CardContent className={`p-6 ${viewMode === 'list' ? 'flex gap-6 w-full' : ''}`}>
                  <div className={`text-4xl mb-4 ${viewMode === 'list' ? 'flex-shrink-0' : 'text-center'}`}>
                    {category.icon}
                  </div>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {category.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {category.subcategories.map((sub, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="ml-1">⭐ {category.averageRating}</span>
                        <span className="mx-2">•</span>
                        <span>{category.providerCount}+ مقدم خدمة</span>
                      </div>
                      <div className="flex items-center">
                        <span className="ml-1">المدن المتوفرة:</span>
                        <span className="font-medium">{category.popularCities.length}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4 bg-moroccan-gradient hover:opacity-90"
                    >
                      عرض مقدمي الخدمة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                لم يتم العثور على نتائج تطابق معايير البحث
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 