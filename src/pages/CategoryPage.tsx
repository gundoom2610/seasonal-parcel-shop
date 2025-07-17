import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ParcelCard } from '@/components/ParcelCard';
import { Grid, Filter, SortAsc, ChevronDown, Star, Search, Tag, TrendingUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

interface Parcel {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  category: Category;
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  discount_percentage?: number;
}

export const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return;

      try {
        // Fetch category
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (categoryData) {
          setCategory(categoryData);

          // Fetch parcels with optimized query
          const { data: parcelsData } = await supabase
            .from('parcels')
            .select(`
              *,
              category:categories(id, name, slug)
            `)
            .eq('category_id', categoryData.id)
            .order('created_at', { ascending: false });

          setParcels(parcelsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  // Sort parcels without additional DB queries
  const sortedParcels = [...parcels].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'popular':
        return (b.reviews_count || 0) - (a.reviews_count || 0);
      default:
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            Enhanced Header Skeleton
            <div className="mb-12">
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              
              {/* Stats Cards Skeleton */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls Skeleton */}
              <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm mb-8">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-48"></div>
              </div>
            </div>

            {/* Enhanced Products Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 aspect-square"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Grid className="w-12 h-12 text-rose-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Kategori Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">Kategori yang Anda cari tidak tersedia atau mungkin telah dipindahkan.</p>
          <button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'price_low', label: 'Harga Terendah' },
    { value: 'price_high', label: 'Harga Tertinggi' },
    { value: 'popular', label: 'Terpopuler' }
  ];

  return (
    <>
      <SEO 
        title={`${category.name} Premium - Hampers & Kado Istimewa | Toko Hampers`} 
        description={`Koleksi ${category.name} terbaik untuk Lebaran, Imlek, Natal, dan momen spesial lainnya. ${parcels.length}+ produk berkualitas premium dengan harga terjangkau. Pengiriman ke seluruh Indonesia. Gratis ongkir untuk pembelian di atas Rp500.000.`}
        url={`/produk/${category.slug}`}
        image={category.image_url}
        type="website"
      />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Category Header */}
          <div className="mb-12">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li><a href="/" className="hover:text-rose-600 transition-colors">Beranda</a></li>
                <li className="text-gray-400">/</li>
                <li><a href="/produk" className="hover:text-rose-600 transition-colors">Produk</a></li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">{category.name}</li>
              </ol>
            </nav>

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                {category.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
                {category.description || 
                  `Temukan koleksi ${category.name} terbaik untuk hadiah istimewa. 
                  Setiap produk dipilih dengan teliti untuk memberikan kebahagiaan 
                  di setiap momen berharga Anda.`
                }
              </p>
            </div>

            {/* Category Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 mb-1">{parcels.length}</div>
                  <div className="text-sm text-gray-600">Total Produk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 mb-1">
                    {parcels.filter(p => p.image_url).length}
                  </div>
                  <div className="text-sm text-gray-600">Produk Unggulan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 mb-1">
                    Rp{Math.min(...parcels.map(p => p.price)).toLocaleString('id-ID')}
                  </div>
                  <div className="text-sm text-gray-600">Mulai Dari</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 mb-1">
                    {Math.round(parcels.reduce((acc, p) => acc + (p.rating || 4.5), 0) / parcels.length * 10) / 10}
                  </div>
                  <div className="text-sm text-gray-600">Rating Rata-rata</div>
                </div>
              </div>
            </div>

            {/* Enhanced Filters & Controls */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {parcels.length} Produk Ditemukan
                  </span>
                  {parcels.some(p => p.is_featured) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-sm font-medium">
                      <Star className="w-4 h-4" />
                      {parcels.filter(p => p.is_featured).length} Unggulan
                    </span>
                  )}
                  {parcels.some(p => p.discount_percentage && p.discount_percentage > 0) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-red-100 to-pink-100 text-red-800 text-sm font-medium">
                      <Tag className="w-4 h-4" />
                      Ada Diskon
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 transition-colors"
                    >
                      <SortAsc className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {sortOptions.find(opt => opt.value === sortBy)?.label}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {showSortMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value as any);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              sortBy === option.value ? 'text-rose-600 bg-rose-50' : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Products Grid */}
          {sortedParcels.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Belum Ada Produk
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Produk dalam kategori {category.name} akan segera tersedia. 
                Pantau terus untuk mendapatkan koleksi terbaru kami.
              </p>
              <button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
                Jelajahi Kategori Lain
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedParcels.map((parcel) => (
                <div key={parcel.id} className="group transform transition-all duration-200 hover:scale-105">
                  <ParcelCard parcel={parcel} />
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Load More Button */}
          {parcels.length >= 12 && (
            <div className="text-center mt-16">
              <button className="bg-white hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 text-gray-700 hover:text-rose-600 font-medium py-4 px-12 rounded-xl border-2 border-rose-200 hover:border-rose-300 transition-all duration-200 transform hover:scale-105">
                Muat Lebih Banyak Produk
              </button>
            </div>
          )}

          {/* Enhanced SEO Content Section */}
          <div className="mt-16 space-y-8">
            {/* Main Content */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Koleksi {category.name} Terbaik untuk Hadiah Istimewa
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Temukan beragam pilihan {category.name} berkualitas premium yang cocok untuk berbagai momen spesial. 
                  Koleksi kami mencakup {parcels.length} produk pilihan yang telah dikurasi khusus untuk memberikan 
                  pengalaman berbelanja yang memuaskan dan hasil yang memukau.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Setiap produk {category.name} dalam koleksi ini dirancang dengan perhatian terhadap detail dan kualitas. 
                  Mulai dari harga Rp{Math.min(...parcels.map(p => p.price)).toLocaleString('id-ID')}, 
                  Anda dapat menemukan pilihan yang sesuai dengan budget dan kebutuhan Anda.
                </p>
              </div>
            </div>

            {/* Popular Products Highlight */}
            {parcels.filter(p => p.is_featured).length > 0 && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-rose-600" />
                  Produk Terpopuler dalam Kategori {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  Produk-produk unggulan yang paling diminati pelanggan dalam kategori {category.name}. 
                  Dipilih berdasarkan rating tinggi dan ulasan positif dari pembeli.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parcels.filter(p => p.is_featured).slice(0, 3).map((parcel) => (
                    <div key={parcel.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">{parcel.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{parcel.description.substring(0, 100)}...</p>
                      <div className="flex items-center justify-between">
                        <span className="text-rose-600 font-bold">
                          Rp{parcel.price.toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{parcel.rating || 4.5}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-gray-900">
                Pertanyaan Umum tentang {category.name}
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-rose-200 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Berapa harga {category.name} yang tersedia?
                  </h4>
                  <p className="text-gray-600">
                    Harga {category.name} di toko kami mulai dari Rp{Math.min(...parcels.map(p => p.price)).toLocaleString('id-ID')} 
                    hingga Rp{Math.max(...parcels.map(p => p.price)).toLocaleString('id-ID')}. 
                    Tersedia berbagai pilihan sesuai budget dan kebutuhan Anda.
                  </p>
                </div>
                
                <div className="border-l-4 border-rose-200 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Apakah {category.name} cocok untuk hadiah?
                  </h4>
                  <p className="text-gray-600">
                    Ya, semua produk {category.name} kami dirancang khusus untuk hadiah dan dilengkapi dengan 
                    kemasan yang menarik. Cocok untuk berbagai occasion seperti ulang tahun, anniversary, 
                    dan momen spesial lainnya.
                  </p>
                </div>
                
                <div className="border-l-4 border-rose-200 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Bagaimana cara memilih {category.name} yang tepat?
                  </h4>
                  <p className="text-gray-600">
                    Pertimbangkan budget, preferensi penerima, dan occasion. Anda dapat menggunakan filter 
                    harga dan melihat produk unggulan yang memiliki rating tinggi untuk membantu keputusan.
                  </p>
                </div>
              </div>
            </div>

            {/* Related Categories */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Tag className="w-6 h-6 text-rose-600" />
                Kategori Terkait
              </h3>
              <p className="text-gray-600 mb-6">
                Jelajahi kategori lain yang mungkin Anda minati untuk melengkapi pilihan hadiah Anda.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Hampers Lebaran', 'Hampers Natal', 'Hampers Imlek', 'Hampers Custom'].map((cat) => (
                  <a
                    key={cat}
                    href={`/produk/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 hover:from-rose-100 hover:to-pink-100 transition-all duration-200 text-center"
                  >
                    <div className="text-sm font-medium text-gray-900">{cat}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};