import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ServiceCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: "السباكة",
      icon: "🔧",
      description: "إصلاح وتركيب الأنابيب والحنفيات",
      count: "150+ مقدم خدمة"
    },
    {
      id: 2,
      name: "الكهرباء",
      icon: "⚡",
      description: "أعمال كهربائية وصيانة",
      count: "120+ مقدم خدمة"
    },
    {
      id: 3,
      name: "التنظيف",
      icon: "🧹",
      description: "تنظيف المنازل والمكاتب",
      count: "200+ مقدم خدمة"
    },
    {
      id: 4,
      name: "الطلاء",
      icon: "🎨",
      description: "طلاء الجدران والديكور",
      count: "80+ مقدم خدمة"
    },
    {
      id: 5,
      name: "البستنة",
      icon: "🌿",
      description: "تنسيق وصيانة الحدائق",
      count: "60+ مقدم خدمة"
    },
    {
      id: 6,
      name: "إصلاح الأجهزة",
      icon: "🔧",
      description: "صيانة الأجهزة المنزلية",
      count: "90+ مقدم خدمة"
    }
  ];

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            فئات الخدمات المتاحة
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اختر من بين مجموعة واسعة من الخدمات المهنية المتاحة في منطقتك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              className="card-hover cursor-pointer group border-2 hover:border-primary"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {category.description}
                </p>
                <div className="text-primary font-semibold text-sm">
                  {category.count}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-moroccan-gradient hover:opacity-90 px-8"
            onClick={() => navigate('/services')}
          >
            عرض جميع الخدمات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
