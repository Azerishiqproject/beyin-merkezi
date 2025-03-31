import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Hero Section with Clean Background */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[800px] h-[800px] border border-blue-500/10 rounded-full -top-[400px] -right-[400px]"></div>
          <div className="absolute w-[600px] h-[600px] border border-blue-500/10 rounded-full top-[50%] -left-[300px]"></div>
          <div className="absolute w-[400px] h-[400px] border border-blue-500/10 rounded-full bottom-[10%] right-[20%]"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center justify-between min-h-[90vh] gap-12">
            <div className="flex-1 space-y-8 pt-20 md:pt-0">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-800">
                Energetika Sektorunun <span className="text-orange-500">Gələcəyini</span> Formalaşdırırıq
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Azərişıq Beyin Mərkəzi olaraq, energetika sektorunda peşəkar təlimlər və
                təşkilatlarla gələcəyin mütəxəssislərini yetişdiririk.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-orange-500 text-white rounded-full font-semibold transition-all duration-300 hover:bg-orange-600"
                >
                  Təlimlərə Qatılın
                </Link>
                <Link
                  href="/services"
                  className="px-8 py-4 border-2 border-orange-500 text-orange-500 rounded-full font-semibold transition-all duration-300 hover:bg-orange-500 hover:text-white"
                >
                  Daha Ətraflı
                </Link>
              </div>
            </div>
            <div className="flex-1 relative h-[500px] w-full max-w-[600px]">
              <Image
                src="/images/hero.jpeg"
                alt="Enerji Təhsili"
                fill
                className="object-cover rounded-2xl"
                priority
              />
              {/* Floating Elements */}
              <div className="absolute right-5 top-10 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-blue-600 font-bold text-2xl">Təhsil</div>
                <div className="text-gray-600">Proqramları</div>
              </div>
              <div className="absolute -left-5 bottom-20 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-orange-500 font-bold text-2xl">Enerji</div>
                <div className="text-gray-600">Həlləri</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-orange-500">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Tərəfdaşlarımız</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex items-center justify-center group hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="text-white text-center group-hover:scale-105 transition-transform duration-300">
                <span className="font-bold text-lg">Azərişıq ASC</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex items-center justify-center group hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="text-white text-center group-hover:scale-105 transition-transform duration-300">
                <span className="font-bold text-lg">SOCAR</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex items-center justify-center group hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="text-white text-center group-hover:scale-105 transition-transform duration-300">
                <span className="font-bold text-lg">Azərenerji ASC</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex items-center justify-center group hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="text-white text-center group-hover:scale-105 transition-transform duration-300">
                <span className="font-bold text-lg">BP Azərbaycan</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex items-center justify-center group hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="text-white text-center group-hover:scale-105 transition-transform duration-300">
                <span className="font-bold text-lg">Azəristilik ASC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Təhsil <span className="text-orange-500">Proqramlarımız</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Enerji Sistemləri</h3>
              <p className="text-gray-600">
                Müasir enerji sistemləri, şəbəkə idarəetməsi və enerji səmərəliliyi təlimləri.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Bərpa Olunan Enerji</h3>
              <p className="text-gray-600">
                Günəş, külək və digər bərpa olunan enerji mənbələri üzrə hərtərəfli təlimlər.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Sertifikat Proqramları</h3>
              <p className="text-gray-600">
                Beynəlxalq etibarlılığa malik sertifikat proqramları və peşəkar inkişaf təlimləri.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="relative">
              <Image
                src="/images/stats-image.jpeg"
                alt="Təhsil Statistikaları"
                width={600}
                height={400}
                className="rounded-2xl object-cover"
              />
              <div className="absolute -right-5 -bottom-5 bg-orange-500 p-6 rounded-xl text-white">
                <div className="text-4xl font-bold">1000+</div>
                <div>Məzun Tələbə</div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl font-bold mb-8 text-gray-800">
                Rəqəmlərlə <span className="text-orange-500">Beyin Mərkəzi</span>
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-orange-500 mb-2">20+</div>
                  <div className="text-gray-600">Peşəkar Təlimçi</div>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-orange-500 mb-2">50+</div>
                  <div className="text-gray-600">Aktiv Proqram</div>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-orange-500 mb-2">15+</div>
                  <div className="text-gray-600">Tərəfdaş Qurum</div>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-orange-500 mb-2">95%</div>
                  <div className="text-gray-600">Məmnuniyyət Dərəcəsi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Yaxınlaşan <span className="text-orange-500">Tədbirlər</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-2xl flex flex-col items-center justify-center text-orange-500">
                  <span className="text-2xl font-bold">15</span>
                  <span className="text-sm">Mart</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Enerji Səmərəliliyi Konfransı</h3>
                  <p className="text-gray-600">Bakı Konqres Mərkəzi</p>
                </div>
              </div>
              <p className="text-gray-600">
                Enerji səmərəliliyi mütəxəssisləri və sektorun liderləri ilə bir araya gəlirik.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-2xl flex flex-col items-center justify-center text-orange-500">
                  <span className="text-2xl font-bold">22</span>
                  <span className="text-sm">Mart</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Bərpa Olunan Enerji Seminari</h3>
                  <p className="text-gray-600">Onlayn Tədbir</p>
                </div>
              </div>
              <p className="text-gray-600">
                Günəş və külək enerjisi texnologiyalarındakı son inkişafları müzakirə edirik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-white">Gələcəyinizi Formalaşdırın</h2>
            <p className="text-xl text-white/90 mb-8">
              Energetika sektorunda karyera qurmaq üçün təhsil proqramlarımıza qatılın.
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
