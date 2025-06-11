
const Footer = () => {
  const quickLinks = [
    "الرئيسية",
    "الخدمات", 
    "مقدمو الخدمات",
    "من نحن",
    "اتصل بنا"
  ];

  const services = [
    "السباكة",
    "الكهرباء",
    "التنظيف",
    "الطلاء",
    "البستنة",
    "إصلاح الأجهزة"
  ];

  const cities = [
    "الدار البيضاء",
    "الرباط",
    "مراكش",
    "أكادير",
    "فاس",
    "طنجة"
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="bg-moroccan-gradient text-white px-4 py-2 rounded-lg font-bold text-lg mb-4 inline-block">
              سوق الخدمات
            </div>
            <p className="text-gray-300 mb-4">
              منصة مغربية موثوقة لربط العملاء بأفضل مقدمي الخدمات المحلية في جميع أنحاء المملكة.
            </p>
            <div className="flex space-x-reverse space-x-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                📧
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                📱
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                🌐
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">الخدمات</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="text-lg font-semibold mb-4">المدن المتاحة</h3>
            <ul className="space-y-2">
              {cities.map((city, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {city}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 سوق الخدمات المغرب. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
