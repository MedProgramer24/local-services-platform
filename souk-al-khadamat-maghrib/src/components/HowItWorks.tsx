import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      title: "اختر الخدمة",
      description: "تصفح فئات الخدمات واختر ما تحتاجه من السباكة إلى التنظيف والكهرباء",
      icon: "🔍"
    },
    {
      step: "2", 
      title: "اختر مقدم الخدمة",
      description: "قارن بين مقدمي الخدمات، اقرأ التقييمات واختر الأنسب لك",
      icon: "👤"
    },
    {
      step: "3",
      title: "احجز موعدك",
      description: "حدد التاريخ والوقت المناسب لك وأرسل طلب الحجز",
      icon: "📅"
    },
    {
      step: "4",
      title: "استمتع بالخدمة",
      description: "سيصلك مقدم الخدمة في الموعد المحدد لتنفيذ العمل بجودة عالية",
      icon: "✅"
    }
  ];

  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-moroccan-orange/5 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 relative inline-block">
            كيف يعمل الموقع؟
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-moroccan-orange rounded-full"></span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            أربع خطوات بسيطة للحصول على الخدمة التي تحتاجها
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={step.step} 
              className="text-center relative group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-8">
                <div className="absolute -top-4 right-1/2 transform translate-x-1/2 w-12 h-12 bg-moroccan-gradient rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                
                <div className="text-5xl mb-6 mt-6 transform group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-lg">
                  {step.description}
                </p>

                {/* Decorative Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-moroccan-orange/20">
                    <div className="absolute top-0 left-0 w-2 h-2 bg-moroccan-orange rounded-full"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Button 
            className="bg-moroccan-orange hover:bg-orange-600 px-8 py-4 text-white text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={() => navigate('/services')}
          >
            ابدأ الآن
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
