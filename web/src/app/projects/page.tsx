import Image from 'next/image';
import Link from 'next/link';

export default function Projects() {
  const projects = [
    {
      title: 'Enerji Səmərəliliyi Analiz Sistemi',
      description: 'Sənaye müəssisələri üçün hazırlanmış enerji istehlakını optimallaşdıran analiz və hesabat sistemi.',
      image: '/images/project1.png',
      category: 'Enerji İdarəetməsi',
      year: '2023',
    },
    {
      title: 'Ağıllı Şəbəkə Monitor Platforması',
      description: 'Elektrik şəbəkələrinin real vaxt rejimində izlənməsi və idarə edilməsi üçün hazırlanmış bulud əsaslı platforma.',
      image: '/images/project2.png',
      category: 'Ağıllı Şəbəkələr',
      year: '2022',
    },
    {
      title: 'Bərpa Olunan Enerji Təhsil Simulyatoru',
      description: 'Günəş və külək enerjisi sistemlərinin iş prinsiplərini öyrədən interaktiv təhsil simulyatoru.',
      image: '/images/project3.png',
      category: 'Təhsil Texnologiyaları',
      year: '2023',
    },
    {
      title: 'Enerji Sektoru Verilənlər Analiz Platforması',
      description: 'Enerji sektorundakı məlumatları təhlil edən və vizuallaşdıran süni intellekt dəstəkli platforma.',
      image: '/images/project4.png',
      category: 'Verilənlər Analizi',
      year: '2022',
    },
  ];

  const categories = ['Hamısı', 'Enerji İdarəetməsi', 'Ağıllı Şəbəkələr', 'Təhsil Texnologiyaları', 'Verilənlər Analizi'];

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-orange-500 text-white overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/images/projects.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Layihələrimiz</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Enerji sektorunda inkişaf etdirdiyimiz innovativ layihələr və uğur hekayələrimiz.
          </p>
        </div>
      </section>

      {/* Project Filters */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-2 rounded-full bg-amber-50 border border-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div key={project.title} className="bg-amber-50 rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
                <div className="relative h-64">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-orange-500">{project.category}</span>
                    <span className="text-sm text-gray-500">{project.year}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <Link
                    href={`/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-orange-500 font-medium hover:text-orange-600 transition-colors"
                  >
                    Ətraflı Baxın →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-white">Layihəniz Üçün Bizimlə Əməkdaşlıq Edin</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Enerji sektorundakı təcrübəmiz və peşəkarlığımızla layihələrinizə dəyər qatırıq.
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