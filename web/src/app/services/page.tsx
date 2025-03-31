import Link from 'next/link';

export default function Services() {
  const services = [
    {
      title: 'Enerji Sistemləri Təlimləri',
      description: 'Müasir enerji sistemləri və şəbəkə idarəetməsi üzrə hərtərəfli təlimlər təqdim edirik.',
      features: [
        'Elektrik şəbəkələri',
        'Enerji səmərəliliyi',
        'Şəbəkə monitorinqi',
        'Enerji idarəetmə sistemləri',
      ],
      icon: (
        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Bərpa Olunan Enerji Kursları',
      description: 'Günəş, külək və digər bərpa olunan enerji mənbələri üzrə ixtisaslaşmış təhsil proqramları.',
      features: [
        'Günəş enerjisi sistemləri',
        'Külək enerjisi texnologiyaları',
        'Hibrid enerji sistemləri',
        'Yaşıl enerji həlləri',
      ],
      icon: (
        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Peşəkar Sertifikatlaşdırma',
      description: 'Beynəlxalq səviyyədə tanınan enerji sektoru sertifikatları üçün hazırlıq proqramları.',
      features: [
        'Enerji auditi sertifikatları',
        'Texniki sertifikatlar',
        'İdarəetmə sertifikatları',
        'Beynəlxalq standartlar',
      ],
      icon: (
        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Korporativ Təlimlər',
      description: 'Şirkətlər üçün xüsusi hazırlanmış enerji sektoru təlimləri və komanda inkişaf proqramları.',
      features: [
        'Komanda təlimləri',
        'Liderlik proqramları',
        'Texniki bacarıqlar',
        'İnnovativ düşüncə',
      ],
      icon: (
        <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Hero Section */}
      <section className="py-20 bg-orange-500 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Xidmətlərimiz</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Energetika sektorunda peşəkar təhsil və təlim xidmətləri təqdim edirik.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div key={service.title} className="bg-amber-50 p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
                <div className="mb-6">{service.icon}</div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{service.title}</h2>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-white">Ehtiyaclarınıza Uyğun Təlim Proqramı Tapaq</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Peşəkar komandamız, şirkətinizin ehtiyaclarını təhlil edərək sizə ən uyğun təlim proqramını təqdim etməyə hazırdır.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-orange-500 px-12 py-4 rounded-full font-semibold text-lg hover:bg-amber-50 transition-colors duration-300"
            >
              Bizimlə Əlaqə Saxlayın
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 