
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCategories from "@/components/ServiceCategories";
import FeaturedProviders from "@/components/FeaturedProviders";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen arabic-text">
      <Header />
      <Hero />
      <ServiceCategories />
      <FeaturedProviders />
      <HowItWorks />
      <Stats />
      <Footer />
    </div>
  );
};

export default Index;
