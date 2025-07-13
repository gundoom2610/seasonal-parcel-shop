import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ParcelCard } from '@/components/ParcelCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, MessageCircle, ShoppingCart,Instagram } from 'lucide-react';
import { createWhatsAppUrl } from '@/constants/whatsapp';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Parcel {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  category: Category;
}

export const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredParcels, setFeaturedParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        // Fetch featured parcels with category info
        const { data: parcelsData } = await supabase
          .from('parcels')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .limit(6)
          .order('created_at', { ascending: false });

        setCategories(categoriesData || []);
        setFeaturedParcels(parcelsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted/50 aspect-square rounded-xl"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted/50 rounded-lg"></div>
                <div className="h-4 bg-muted/50 rounded-lg w-2/3"></div>
                <div className="h-6 bg-muted/50 rounded-lg w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Lipink Parcel Cirebon - Parcel Lebaran, Natal, Imlek Terbaik | Hampers Premium"
        description="🎁 Parcel premium terbaik di Cirebon untuk Lebaran, Natal, dan Imlek. Banyak pilihan parcel makanan berkualitas, keramik cantik, dan hampers eksklusif. Pesan sekarang via WhatsApp! ✨"
        url="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Lipink Parcel Cirebon",
          "description": "Toko parcel premium dan hampers terpercaya di Cirebon untuk berbagai acara spesial",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Cirebon",
            "addressRegion": "Jawa Barat",
            "addressCountry": "ID"
          },
          "telephone": "+62-xxx-xxxx-xxxx",
          "url": typeof window !== 'undefined' ? window.location.origin : '',
          "openingHours": "Mo-Su 08:00-20:00",
          "priceRange": "$$-$$$",
          "image": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
          "sameAs": [
            "https://instagram.com/lipinkparcel",
            "https://facebook.com/lipinkparcel"
          ]
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary-glow/5 to-purple-100/20 py-20 lg:py-32">
          <div className="absolute inset-0 opacity-30"></div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-5xl mx-auto">
              <div className="animate-slide-up">
                <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-6">
                  <span className="text-primary font-medium text-sm">🎁 Parcel Premium Cirebon</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="font-serif bg-gradient-hero bg-clip-text text-transparent">
                    Parcel Terbaik
                  </span>
                  <br />
                  <span className="text-2xl md:text-4xl lg:text-5xl text-gray-700 font-sans font-medium">
                    untuk Setiap Momen Spesial
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                  Hadirkan kebahagiaan dengan parcel premium untuk <span className="text-primary font-semibold">Lebaran</span>, 
                  <span className="text-primary font-semibold"> Natal</span>, dan 
                  <span className="text-primary font-semibold"> Imlek</span>. 
                  Koleksi eksklusif parcel makanan berkualitas tinggi dan keramik cantik.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-primary hover:opacity-90 text-white px-10 py-4 text-lg shadow-elegant rounded-xl font-semibold group"
                    onClick={() => window.open(createWhatsAppUrl('🎁 Halo! Saya tertarik dengan parcel premium dari Lipink Parcel Cirebon. Bisa berikan informasi lebih lanjut?'), '_blank')}
                  >
                    <MessageCircle className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                    Pesan Sekarang
                  </Button>
                  <Button variant="outline" size="lg" className="px-10 py-4 text-lg rounded-xl border-2 border-primary/30 hover:bg-primary/10 font-semibold">
                    Lihat Katalog Lengkap
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-white/70 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="animate-fade-in">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-gray-600">Pelanggan Puas</div>
              </div>
              <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-gray-600">Varian Parcel</div>
              </div>
              <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="text-3xl font-bold text-primary mb-2">5+</div>
                <div className="text-gray-600">Tahun Pengalaman</div>
              </div>
              <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-gray-600">Customer Service</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 to-primary-glow/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif bg-gradient-primary bg-clip-text text-transparent">
                Pilihan Parcel Premium
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Koleksi eksklusif parcel berkualitas tinggi untuk setiap momen berharga dalam hidup Anda
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
              {categories.map((category, index) => (
                <Card key={category.id} className={`group hover:shadow-elegant transition-all duration-700 transform hover:-translate-y-4 hover:scale-[1.02] animate-fade-in shadow-soft bg-white/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden ${index === 1 ? 'md:scale-105' : ''}`} style={{animationDelay: `${index * 0.2}s`}}>
                  <CardContent className="p-8 lg:p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-glow/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                        <ShoppingBag className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-800 font-serif">{category.name}</h3>
                      <p className="text-gray-600 mb-8 text-base lg:text-lg leading-relaxed">
                        {category.slug === 'lebaran' && 'Parcel spesial Idul Fitri dengan kemasan mewah dan isi berkualitas premium untuk merayakan kemenangan'}
                        {category.slug === 'christmas' && 'Hampers Natal istimewa dengan sentuhan elegan untuk berbagi kebahagiaan bersama keluarga'}
                        {category.slug === 'lunar-new-year' && 'Parcel Imlek penuh makna dengan simbol keberuntungan untuk tahun yang penuh berkah'}
                        {category.slug === 'set-bekal-anak' && 'Parcel Imlek penuh makna dengan simbol keberuntungan untuk tahun yang penuh berkah'}
                      </p>
                      <Button asChild className="w-full bg-gradient-primary hover:opacity-90 text-white rounded-2xl py-4 font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <Link to={`/produk/${category.slug}`}>
                          <ShoppingBag className="h-5 w-5 mr-2" />
                          Lihat Koleksi
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif bg-gradient-primary bg-clip-text text-transparent">
                Produk Terlaris
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Pilihan favorit pelanggan yang telah terbukti memberikan kepuasan maksimal
              </p>
            </div>
            {featuredParcels.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-slow shadow-xl">
                  <ShoppingBag className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Koleksi Segera Hadir</h3>
                <p className="text-gray-500 text-lg">Kami sedang mempersiapkan produk-produk terbaik untuk Anda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredParcels.map((parcel, index) => (
                  <div key={parcel.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <ParcelCard parcel={parcel} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

       {/* CTA Section */}
<section className="py-20 bg-gradient-to-br from-pink-100 via-pink-200 to-rose-300 text-gray-800 relative overflow-hidden">
  <div className="absolute inset-0 bg-white/20"></div>
  <div className="container mx-auto px-4 relative z-10">
    <div className="text-center max-w-4xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif text-gray-900">
        Wujudkan Momen Spesial Anda
      </h2>
      <p className="text-xl mb-10 text-gray-700 leading-relaxed">
        Konsultasi gratis dengan tim ahli kami untuk mendapatkan parcel yang sempurna sesuai kebutuhan dan budget Anda
      </p>
      
      {/* Main CTA - WhatsApp (Biggest) */}
      <div className="mb-8">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 py-6 text-xl shadow-xl rounded-2xl font-bold transform hover:scale-105 transition-all duration-300 group"
          onClick={() => window.open(createWhatsAppUrl('🎁 Halo! Saya ingin konsultasi untuk pemesanan parcel custom. Bisa dibantu?'), '_blank')}
        >
          <MessageCircle className="h-8 w-8 mr-4 group-hover:scale-110 transition-transform" />
          Konsultasi Gratis via WhatsApp
        </Button>
      </div>
      
      {/* Secondary CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
        <Button 
          size="lg"
          variant="outline"
          className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-6 py-4 text-lg rounded-xl font-semibold transition-all duration-300 group"
          onClick={() => window.open('https://www.tokopedia.com/', '_blank')}
        >
          <ShoppingBag className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Tokopedia
        </Button>
        
        <Button 
          size="lg"
          variant="outline"
          className="border-2 border-orange-600 text-orange-700 hover:bg-orange-600 hover:text-white px-6 py-4 text-lg rounded-xl font-semibold transition-all duration-300 group"
          onClick={() => window.open('https://shopee.co.id/', '_blank')}
        >
          <ShoppingCart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Shopee
        </Button>
        
        <Button 
          size="lg"
          variant="outline"
          className="border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-6 py-4 text-lg rounded-xl font-semibold transition-all duration-300 group"
          onClick={() => window.open('https://instagram.com/', '_blank')}
        >
          <Instagram className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Instagram
        </Button>
      </div>
      
    </div>
  </div>
</section>
      </div>
    </>
  );
};