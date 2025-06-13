import React from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Target, Award, Heart, Shield, Clock } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "مجتمع موثوق",
      description: "نربط بين العملاء ومقدمي الخدمات الموثوقين والمعتمدين"
    },
    {
      icon: Target,
      title: "خدمة متميزة",
      description: "نضمن جودة الخدمات المقدمة من خلال نظام تقييم متكامل"
    },
    {
      icon: Award,
      title: "خبرة واسعة",
      description: "نقدم خدمات متنوعة تغطي جميع احتياجات المنزل والمكتب"
    },
    {
      icon: Heart,
      title: "رضا العملاء",
      description: "نسعى دائماً لتحقيق أعلى مستويات رضا العملاء"
    },
    {
      icon: Shield,
      title: "حماية وأمان",
      description: "نضمن سلامة وأمان جميع المعاملات والخدمات"
    },
    {
      icon: Clock,
      title: "سرعة الاستجابة",
      description: "نوفر خدمة سريعة وفعالة في جميع أنحاء المغرب"
    }
  ];

  const stats = [
    { number: "500+", label: "مقدم خدمة معتمد" },
    { number: "10,000+", label: "عميل راضٍ" },
    { number: "8", label: "مدينة متاحة" },
    { number: "98%", label: "نسبة رضا العملاء" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/moroccan-pattern.svg')] bg-repeat opacity-5 pointer-events-none" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 drop-shadow-lg">
              من نحن
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              سوق الخدمات المغربي هو منصة رقمية رائدة تربط بين العملاء ومقدمي الخدمات المنزلية والمهنية في جميع أنحاء المغرب
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              تواصل معنا
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-card shadow-xl border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  رؤيتنا
                </h2>
                <p className="text-muted-foreground">
                  نسعى لأن نكون المنصة الرائدة في مجال الخدمات المنزلية والمهنية في المغرب، من خلال تقديم حلول مبتكرة تربط بين العملاء ومقدمي الخدمات الموثوقين، مع ضمان أعلى معايير الجودة والموثوقية.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-xl border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  مهمتنا
                </h2>
                <p className="text-muted-foreground">
                  نسعى لتسهيل حصول العملاء على خدمات منزلية ومهنية عالية الجودة، مع توفير فرص عمل لمقدمي الخدمات المحترفين، وتعزيز الاقتصاد المحلي من خلال دعم المشاريع الصغيرة والمتوسطة.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              لماذا تختارنا؟
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نتميز بتقديم خدمات متميزة تلبي احتياجات عملائنا بأعلى معايير الجودة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card shadow-lg border-0 hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {React.createElement(feature.icon, { size: 28 })}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card text-center shadow-md border-0">
                <CardContent className="p-8">
                  <div className="text-4xl font-extrabold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground text-lg">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 drop-shadow-lg">
              انضم إلينا اليوم
            </h2>
            <p className="text-xl mb-8 opacity-90">
              سواء كنت تبحث عن خدمات منزلية أو مهنية، أو كنت مقدم خدمة تبحث عن فرص عمل، نحن هنا لمساعدتك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="secondary"
                className="shadow-md"
                onClick={() => navigate('/register')}
              >
                سجل كعميل
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 shadow-md"
                onClick={() => navigate('/provider/register')}
              >
                سجل كمقدم خدمة
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 