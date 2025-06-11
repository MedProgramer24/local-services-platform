const Stats = () => {
  const stats = [
    { number: "1000+", label: "مقدم خدمة معتمد" },
    { number: "5000+", label: "عميل راضٍ" },
    { number: "8", label: "مدينة متاحة" },
    { number: "24/7", label: "دعم العملاء" }
  ];

  return (
    <section className="py-24 bg-moroccan-gradient relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/moroccan-pattern.svg')] bg-repeat opacity-5"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-300/5 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl transform transition-transform duration-300 group-hover:scale-105 group-hover:bg-white/15"></div>
              
              {/* Content */}
              <div className="relative p-8 text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-3 transform transition-transform duration-300 group-hover:scale-110">
                  {stat.number}
                </div>
                <div className="text-white/90 font-medium text-lg">
                  {stat.label}
                </div>

                {/* Decorative Line */}
                {index < stats.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-white/20">
                    <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
