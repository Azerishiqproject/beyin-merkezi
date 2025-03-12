import Image from 'next/image';

export default function About() {
  const teamMembers = [
    {
      name: 'Əhməd Məmmədov',
      position: 'Baş Direktor',
      image: '/team/ceo.jpg',
    },
    {
      name: 'Leyla Əliyeva',
      position: 'Texnologiya Direktoru',
      image: '/team/cto.jpg',
    },
    {
      name: 'Səməd Hüseynov',
      position: 'Layihə Meneceri',
      image: '/team/pm.jpg',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Hero Section */}
      <section className="py-20 bg-orange-500 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Haqqımızda</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            2022-ci ildən bəri energetika sektorunda təhsil və təlim xidmətləri göstərən
            Azərişıq Beyin Mərkəzi, müştərilərinə ən yaxşı xidməti təqdim etməyi hədəfləyir.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">Vizyonumuz</h2>
              <p className="text-gray-600 leading-relaxed">
                Energetika sahəsində aparıcı və innovativ həllərlə, müştərilərimizin peşəkar
                inkişaf yolunda etibarlı bir tərəfdaş olmaq və qlobal miqyasda uğurlu
                layihələrə imza atmaq.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">Missiyamız</h2>
              <p className="text-gray-600 leading-relaxed">
                Ən son texnologiyalardan istifadə edərək, müştərilərimizin ehtiyaclarına uyğun,
                innovativ və davamlı həllər yaratmaq. Peşəkar komandamızla birlikdə
                keyfiyyətli xidmət göstərərək müştəri məmnuniyyətini ən yüksək səviyyədə saxlamaq.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Dəyərlərimiz</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">İnnovasiya</h3>
              <p className="text-gray-600">
                Davamlı inkişaf və innovasiya anlayışı ilə, ən son texnologiyaları
                izləyir və tətbiq edirik.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Etibarlılıq</h3>
              <p className="text-gray-600">
                Müştərilərimizlə şəffaf və etibara əsaslanan əlaqələr quraraq,
                verdiyimiz sözləri yerinə yetiririk.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Keyfiyyət</h3>
              <p className="text-gray-600">
                Hər layihəmizdə ən yüksək keyfiyyət standartlarını tətbiq edərək
                mükəmməlliyi hədəfləyirik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Rəhbərlik Komandamız</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-amber-50 p-8 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                <p className="text-orange-500">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-white">Bizimlə Əməkdaşlıq Edin</h2>
            <p className="text-xl text-white/90 mb-8">
              Energetika sahəsində təhsil və təlim ehtiyaclarınız üçün bizimlə əlaqə saxlayın.
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-orange-500 px-12 py-4 rounded-full font-semibold text-lg hover:bg-amber-50 transition-colors duration-300"
            >
              Bizimlə Əlaqə Saxlayın
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 