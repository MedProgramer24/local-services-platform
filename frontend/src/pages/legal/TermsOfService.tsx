import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Users, FileText, AlertTriangle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-moroccan-orange ml-2" />
              <h1 className="text-3xl font-bold text-gray-900">شروط الاستخدام</h1>
            </div>
            <p className="text-gray-600">آخر تحديث: {new Date().toLocaleDateString('ar-MA')}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-moroccan-orange ml-2" />
                  مقدمة
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  مرحباً بك في منصة "سوق الخدمات المغرب". باستخدام هذه المنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
                  يرجى قراءة هذه الشروط بعناية قبل استخدام الخدمات.
                </p>
              </section>

              {/* Definitions */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">التعريفات</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <ul className="space-y-3 text-gray-700">
                    <li><strong>"المنصة":</strong> موقع سوق الخدمات المغرب الإلكتروني وتطبيقاته</li>
                    <li><strong>"المستخدم":</strong> أي شخص يستخدم المنصة سواء كان عميلاً أو مقدم خدمة</li>
                    <li><strong>"العميل":</strong> الشخص الذي يبحث عن خدمات ويحجزها</li>
                    <li><strong>"مقدم الخدمة":</strong> الشخص أو الشركة التي تقدم الخدمات</li>
                    <li><strong>"الخدمة":</strong> أي خدمة مقدمة من خلال المنصة</li>
                  </ul>
                </div>
              </section>

              {/* Eligibility */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">الأهلية</h2>
                <div className="space-y-4 text-gray-700">
                  <p>لاستخدام المنصة، يجب أن تكون:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>على الأقل 18 سنة من العمر</li>
                    <li>قادراً قانونياً على إبرام العقود</li>
                    <li>متواجداً في المغرب أو لديك عنوان صحيح في المغرب</li>
                    <li>توافق على الالتزام بهذه الشروط</li>
                  </ul>
                </div>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">حسابات المستخدمين</h2>
                <div className="space-y-4 text-gray-700">
                  <p>عند إنشاء حساب، يجب عليك:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>تقديم معلومات دقيقة وكاملة</li>
                    <li>حماية كلمة المرور الخاصة بك</li>
                    <li>إخطارنا فوراً بأي استخدام غير مصرح به</li>
                    <li>عدم مشاركة حسابك مع الآخرين</li>
                  </ul>
                </div>
              </section>

              {/* Service Providers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">مقدمو الخدمات</h2>
                <div className="space-y-4 text-gray-700">
                  <p>كمقدم خدمة، يجب عليك:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>تقديم خدمات عالية الجودة</li>
                    <li>الالتزام بالمواعيد المتفق عليها</li>
                    <li>تقديم أسعار عادلة وشفافة</li>
                    <li>الحفاظ على التأمين والتراخيص المطلوبة</li>
                    <li>معاملة العملاء باحترام</li>
                  </ul>
                </div>
              </section>

              {/* Payment Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">شروط الدفع</h2>
                <div className="space-y-4 text-gray-700">
                  <p>جميع المدفوعات تتم بالدرهم المغربي (MAD) وتشمل:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>رسوم الخدمة المتفق عليها</li>
                    <li>الضرائب المطبقة</li>
                    <li>رسوم المنصة (إن وجدت)</li>
                  </ul>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 ml-2 mt-0.5" />
                      <p className="text-yellow-800">
                        <strong>ملاحظة:</strong> جميع المدفوعات محمية ومؤمنة. لن نشارك معلوماتك المالية مع أي طرف ثالث.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cancellation Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">سياسة الإلغاء</h2>
                <div className="space-y-4 text-gray-700">
                  <p>يمكن إلغاء الحجوزات وفقاً للشروط التالية:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>إلغاء مجاني قبل 24 ساعة من موعد الخدمة</li>
                    <li>رسوم إلغاء 50% من قيمة الخدمة إذا تم الإلغاء قبل 12 ساعة</li>
                    <li>لا يمكن الإلغاء خلال 12 ساعة من موعد الخدمة</li>
                    <li>استثناءات للظروف الطارئة (تخضع للمراجعة)</li>
                  </ul>
                </div>
              </section>

              {/* Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">الخصوصية</h2>
                <p className="text-gray-700 leading-relaxed">
                  نحن نلتزم بحماية خصوصيتك. يرجى مراجعة <a href="/privacy" className="text-moroccan-orange hover:underline">سياسة الخصوصية</a> 
                  لفهم كيفية جمع واستخدام معلوماتك.
                </p>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">إخلاء المسؤولية</h2>
                <div className="space-y-4 text-gray-700">
                  <p>المنصة تقدم خدمة ربط فقط ولا تتحمل مسؤولية:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>جودة الخدمات المقدمة</li>
                    <li>سلوك مقدمي الخدمات</li>
                    <li>النتائج النهائية للخدمات</li>
                    <li>أي خسائر أو أضرار غير مباشرة</li>
                  </ul>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">إنهاء الخدمة</h2>
                <div className="space-y-4 text-gray-700">
                  <p>يمكن إنهاء حسابك في الحالات التالية:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>انتهاك هذه الشروط</li>
                    <li>سلوك غير لائق أو احتيالي</li>
                    <li>عدم الدفع أو الالتزام بالالتزامات</li>
                    <li>طلب منك إنهاء الحساب</li>
                  </ul>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">التواصل</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا:
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>البريد الإلكتروني:</strong> legal@souk-al-khadamat.ma</p>
                    <p><strong>الهاتف:</strong> +212 5XX-XXXXXX</p>
                    <p><strong>العنوان:</strong> الدار البيضاء، المغرب</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 