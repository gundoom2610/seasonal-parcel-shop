import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ParcelCard } from '@/components/ParcelCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, MessageCircle } from 'lucide-react';
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
        title="Lipink Parcel Cirebon - Parcel Lebaran, Imlek, Natal | Banyak Jenis Parcel Makanan & Keramik"
        description="Parcel Cirebon untuk Lebaran, Imlek, Natal. Banyak jenis parcel makanan premium, parcel keramik cantik, dan hampers eksklusif. Pesan sekarang via WhatsApp!"
        url="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Lipink Parcel Cirebon",
          "description": "Toko parcel terpercaya di Cirebon untuk berbagai acara spesial",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Cirebon",
            "addressRegion": "Jawa Barat",
            "addressCountry": "ID"
          },
          "telephone": "+62-xxx-xxxx-xxxx",
          "url": window.location.origin,
          "openingHours": "Mo-Su 08:00-20:00",
          "priceRange": "$$"
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary-glow/5 to-purple-100/30">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="animate-fade-in">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-medium block mb-2">
                    Parcel Premium
                  </span>
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    Cirebon
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                  Parcel premium untuk <span className="text-primary font-semibold">Lebaran</span>, 
                  <span className="text-primary font-semibold"> Imlek</span>, dan 
                  <span className="text-primary font-semibold"> Natal</span>. 
                  Banyak jenis parcel makanan berkualitas dan keramik cantik untuk setiap momen spesial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg shadow-elegant rounded-xl font-semibold"
                    onClick={() => window.open(createWhatsAppUrl('Halo! Saya tertarik dengan parcel dari Lipink Parcel Cirebon. Bisa berikan informasi lebih lanjut?'), '_blank')}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Pesan via WhatsApp
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-xl border-2 border-primary/30 hover:bg-primary/10">
                    Lihat Katalog
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Pilih Kategori Parcel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Berbagai pilihan parcel eksklusif untuk setiap momen istimewa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Card key={category.id} className={`group hover:shadow-elegant transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] animate-fade-in shadow-soft gradient-card border-0 rounded-2xl overflow-hidden ${index === 1 ? 'md:scale-105' : ''}`}>
                <CardContent className="p-6 lg:p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-glow/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <ShoppingBag className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold mb-4 text-foreground">{category.name}</h3>
                    <p className="text-muted-foreground mb-6 text-sm lg:text-base leading-relaxed">
                      {category.slug === 'lebaran' && 'Parcel spesial untuk merayakan Idul Fitri dengan kemeriahan'}
                      {category.slug === 'christmas' && 'Hampers Natal istimewa untuk berbagi kebahagiaan'}
                      {category.slug === 'lunar-new-year' && 'Parcel Imlek penuh berkah untuk tahun yang hoki'}
                    </p>
                    <Button asChild className="w-full bg-gradient-primary hover:opacity-90 text-white rounded-xl py-3 font-semibold shadow-lg">
                      <Link to={`/parcel/${category.slug}`}>
                        Lihat Produk
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-3xl mx-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Produk Pilihan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Koleksi parcel terpopuler dan terlaris dari Lipink Parcel Cirebon
            </p>
          </div>
          {featuredParcels.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center animate-float">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
              <p className="text-muted-foreground text-lg">Produk sedang dalam persiapan...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {featuredParcels.map((parcel, index) => (
                <div key={parcel.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ParcelCard parcel={parcel} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="bg-gradient-primary rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pesan Parcel Istimewa Anda
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Hubungi kami melalui WhatsApp untuk konsultasi dan pemesanan parcel custom sesuai kebutuhan Anda
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg shadow-elegant rounded-xl font-semibold"
                onClick={() => window.open(createWhatsAppUrl('Halo! Saya ingin konsultasi untuk pemesanan parcel custom. Bisa dibantu?'), '_blank')}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat WhatsApp Sekarang
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};