import { Link } from 'react-router-dom';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Shield,
  Users,
  Star,
  Clock,
  Heart
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'الخدمات', href: '/services' },
    { name: 'مزودي الخدمات', href: '/providers' },
    { name: 'من نحن', href: '/about' },
    { name: 'كيف يعمل', href: '/how-it-works' },
    { name: 'الأسئلة الشائعة', href: '/faq' },
  ];

  const serviceCategories = [
    { name: 'السباكة', href: '/services?category=plumbing' },
    { name: 'الكهرباء', href: '/services?category=electrical' },
    { name: 'التنظيف', href: '/services?category=cleaning' },
    { name: 'الطلاء', href: '/services?category=painting' },
    { name: 'الحدادة', href: '/services?category=welding' },
    { name: 'التكييف', href: '/services?category=ac' },
  ];

  const cities = [
    { name: 'الدار البيضاء', href: '/providers?city=casablanca' },
    { name: 'الرباط', href: '/providers?city=rabat' },
    { name: 'مراكش', href: '/providers?city=marrakech' },
    { name: 'فاس', href: '/providers?city=fes' },
    { name: 'طنجة', href: '/providers?city=tangier' },
    { name: 'أكادير', href: '/providers?city=agadir' },
  ];

  const legalLinks = [
    { name: 'شروط الاستخدام', href: '/terms' },
    { name: 'سياسة الخصوصية', href: '/privacy' },
    { name: 'سياسة ملفات تعريف الارتباط', href: '/cookies' },
    { name: 'إخلاء المسؤولية', href: '/disclaimer' },
    { name: 'حقوق المستخدمين', href: '/user-rights' },
    { name: 'الإبلاغ عن مشكلة', href: '/report-issue' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/soukalkhadamat', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/soukalkhadamat', color: 'hover:text-pink-600' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/soukalkhadamat', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/soukalkhadamat', color: 'hover:text-blue-700' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Building2 className="h-8 w-8 text-moroccan-orange" />
              <span className="text-xl font-bold">سوق الخدمات</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              منصة موثوقة تربطك بأفضل الحرفيين ومقدمي الخدمات المحلية في جميع أنحاء المملكة المغربية.
            </p>
            
            {/* Trust Indicators */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <Shield className="h-4 w-4 text-green-400 ml-2" />
                خدمات مضمونة وآمنة
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Users className="h-4 w-4 text-blue-400 ml-2" />
                أكثر من 1000 مقدم خدمة
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Star className="h-4 w-4 text-yellow-400 ml-2" />
                تقييم 4.8/5 من العملاء
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-moroccan-orange">روابط سريعة</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-moroccan-orange transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-moroccan-orange">فئات الخدمات</h3>
            <ul className="space-y-2">
              {serviceCategories.map((category) => (
                <li key={category.name}>
                  <Link 
                    to={category.href}
                    className="text-gray-300 hover:text-moroccan-orange transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-moroccan-orange">تواصل معنا</h3>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="h-4 w-4 text-moroccan-orange ml-2" />
                <span>+212 5XX-XXXXXX</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Mail className="h-4 w-4 text-moroccan-orange ml-2" />
                <a href="mailto:info@souk-al-khadamat.ma" className="hover:text-moroccan-orange">
                  info@souk-al-khadamat.ma
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-moroccan-orange ml-2" />
                <span>الدار البيضاء، المغرب</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-300">تابعنا</h4>
              <div className="flex space-x-3 space-x-reverse">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gray-800 rounded-full transition-colors ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">اشترك في النشرة الإخبارية</h3>
            <p className="text-gray-300 text-sm mb-4">
              احصل على آخر العروض والخدمات الجديدة
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="flex-1 px-4 py-2 rounded-r-lg border-0 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-moroccan-orange"
              />
              <button className="px-6 py-2 bg-moroccan-orange hover:bg-orange-600 rounded-l-lg transition-colors">
                اشتراك
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
              <span>© {currentYear} سوق الخدمات المغرب. جميع الحقوق محفوظة.</span>
              <span>•</span>
              <span>مصنوع بـ</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>في المغرب</span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-400 hover:text-moroccan-orange transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Language & Currency */}
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
              <select className="bg-gray-800 border-0 rounded px-2 py-1">
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
              <span>•</span>
              <span>العملة: درهم مغربي (MAD)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
