import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ArrowLeft, Share2, Heart, Clock, Package, Shield, Award, ChevronRight, Star, User } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  created_at: string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export const ParcelDetail = () => {
  const { categorySlug, parcelSlug } = useParams<{ categorySlug: string; parcelSlug: string }>();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const generateRandomReviews = () => {
  const sampleNames = [
    { name: "Siti N.*", gender: "female" },
    { name: "Budi S.*", gender: "male" },
    { name: "Maya S.*", gender: "female" },
    { name: "Andi W.*", gender: "male" },
    { name: "Rina K.*", gender: "female" },
    { name: "Dedy P.*", gender: "male" },
    { name: "Lina H.*", gender: "female" },
    { name: "Rizki R.*", gender: "male" },
    { name: "Dewi L.*", gender: "female" },
    { name: "Agus S.*", gender: "male" },
    { name: "Fitri H.*", gender: "female" },
    { name: "Wahyu K.*", gender: "male" },
    { name: "Sari I.*", gender: "female" },
    { name: "Tono S.*", gender: "male" },
    { name: "Ani R.*", gender: "female" },
    { name: "Yusuf A.*", gender: "male" },
    { name: "Dina M.*", gender: "female" },
    { name: "Ilham J.*", gender: "male" },
    { name: "Nina Z.*", gender: "female" },
    { name: "Ardi F.*", gender: "male" },
    { name: "Elsa N.*", gender: "female" },
    { name: "Reza B.*", gender: "male" },
    { name: "Tika Y.*", gender: "female" },
    { name: "Galih C.*", gender: "male" },
    { name: "Putri D.*", gender: "female" },
    { name: "Fahmi E.*", gender: "male" },
    { name: "Mega Q.*", gender: "female" },
    { name: "Bayu T.*", gender: "male" },
    { name: "Citra U.*", gender: "female" },
    { name: "Joko M.*", gender: "male" },
    { name: "Vina O.*", gender: "female" },
    { name: "Hendra L.*", gender: "male" },
    { name: "Ratna G.*", gender: "female" },
    { name: "Zaki R.*", gender: "male" },
    { name: "Winda E.*", gender: "female" },
    { name: "Aldi V.*", gender: "male" },
    { name: "Melati T.*", gender: "female" },
    { name: "Rio H.*", gender: "male" },
    { name: "Yuni S.*", gender: "female" },
    { name: "Fajar K.*", gender: "male" }
  ];

  const sampleComments = [
    "Parcel Cirebon sangat rapi, cocok banget untuk kiriman bisnis maupun pribadi.",
    "Terima kasih! Parcelnya indah, cocok untuk hampers lebaran.",
    "Bisa request custom, seller sangat membantu. Parcel mewah tapi tetap terjangkau.",
    "Parcel sudah sampai dengan selamat dan cantik banget packaging-nya!",
    "Isian lengkap, kemasan eksklusif. Saya pesan lagi untuk nanti...",
    "Sudah beberapa kali order, hasilnya selalu memuaskan!",
    "Kualitas isiannya premium, dikemas dengan estetika yang tinggi.",
    "Dikirim ke teman di luar kota, responnya sangat positif.",
    "Tema parcel bisa disesuaikan, cocok untuk segala momen spesial.",
    "Barang sesuai gambar, penataan isinya sangat niat!",
    "Cocok untuk hadiah ultah atau parcel akhir tahun.",
    "Saya order parcel Imlek, warnanya merah emas sangat elegan.",
    "Waktu pengiriman cepat dan tepat, aman banget untuk dikirim jauh.",
    "Seller ramah dan komunikatif, pengalaman belanja menyenangkan.",
    "Parcelnya eksklusif tapi tetap affordable, sangat direkomendasikan.",
    "Suka banget sama desain box-nya, unik dan berkelas.",
    "Isi parcel fresh dan variasinya banyak, cocok untuk hampers keluarga.",
    "Anak-anak pun senang dapat parcel ini, tampilannya menarik.",
    "Saya pakai untuk parcel kantor, semua rekan kerja suka!",
    "Parcel ini sangat berkesan, cocok untuk klien penting.",
    "Kemasan kuat dan tidak rusak saat diterima.",
    "Dekorasi isi parcel lucu, cocok untuk hampers anak-anak.",
    "Pesan parcelnya untuk mama saya , beliau sangat senang dan tersentuh.",
    "Sudah direkomendasikan ke teman-teman karena pelayanannya memuaskan.",
    "Parcel ini pas banget untuk suasana hangat keluarga.",
    "Setiap item dalam parcel terlihat berkualitas tinggi.",
    "Saya pesan hari senin dan langsung sampai hari rabu ke saudara saya di Cirebon dan sangat bagus !",
    "Parcel elegan, cocok buat relasi bisnis premium.",
    "Beli parcel untuk istri, dia sangat suka! Romantis dan manis.",
    "Parcel custom nya sangat menawan dan cocok untuk diberikan ke rekan bisnis.",
    "Isiannya pas, nggak ada yang mubazir. Semua bisa dinikmati.",
    "Seller kasih banyak opsi, tinggal pilih yang sesuai budget.",
    "Parcel Cirebon terbaik sejauh ini! Rekomendasi nomor satu.",
    "Kemasannya kaya retail branded, sangat profesional.",
    "Parcel berkesan banget untuk hari spesial keluarga kami.",
    "Beli untuk acara pengajian, semua tamu senang.",
    "Warna, isi, dan tema parcel sangat dipikirkan. Tidak asal-asalan.",
    "Paling suka karena bisa tulis ucapan di kartu kecil juga.",
    "Kreatif dan tematik. Parcel yang benar-benar niat dibuat."
  ];

  const reviewCount = Math.floor(Math.random() * 36) + 10; // 10-45
  const avgRating = (Math.random() * 0.2 + 4.7).toFixed(1); // 4.7 - 4.9

  setTotalReviews(reviewCount);
  setAverageRating(parseFloat(avgRating));

  const generatedReviews: Review[] = [];

  for (let i = 0; i < Math.min(reviewCount, 6); i++) {
    const rating = Math.random() < 0.7 ? 5 : 4;
    const { name, gender } = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];

  const seed = encodeURIComponent(name.replace(/\s|\*/g, ''));
  const headParam = gender === 'male'
    ? 'short1,short2,short3,short4,short5,shaved1,flatTop,mohawk,cornrows'
    : 'bun,bun2,buns,long,longCurly,medium1,medium2,medium3,mediumStraight';

  const avatarUrl = `https://api.dicebear.com/9.x/open-peeps/svg?seed=${seed}&head=${headParam}&face=smile,smileBig,calm&facialHairProbability=0&skinColor=ffdbb4,edb98a&hairColor=000000&accessoriesProbability=0&maskProbability=0&radius=50&size=128&clip=true`;



    generatedReviews.push({
      id: `review-${i}`,
      name,
      rating,
      comment,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID'),
      avatar: avatarUrl
    });
  }

  setReviews(generatedReviews);
};


  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug || !parcelSlug) return;

      try {
        // Fetch category first
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (categoryData) {
          // Fetch current parcel
          const { data: parcelData } = await supabase
            .from('parcels')
            .select(`
              *,
              category:categories(id, name, slug)
            `)
            .eq('slug', parcelSlug)
            .eq('category_id', categoryData.id)
            .single();

          if (parcelData) {
            setParcel(parcelData);
            generateRandomReviews();

            // Fetch other products in this category
            const { data: relatedData } = await supabase
              .from('parcels')
              .select(`
                *,
                category:categories(id, name, slug)
              `)
              .eq('category_id', categoryData.id)
              .neq('id', parcelData.id)
              .order('created_at', { ascending: false })
              .limit(6);

            setRelatedProducts(relatedData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, parcelSlug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppOrder = () => {
    if (!parcel) return;
    
    const message = `Halo kak! 👋 Saya tertarik dengan produk ${parcel.name} seharga ${formatPrice(parcel.price)}. Bisa info lebih detail dan cara pemesanannya? Terima kasih! 🙏`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (!parcel) return;

    const shareData = {
      title: parcel.name,
      text: `Wah, produk ini bagus banget! 😍 ${parcel.name} - ${formatPrice(parcel.price)}. Yuk cek!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Link berhasil disalin! 📋✨');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStructuredData = () => {
    if (!parcel) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": parcel.name,
      "image": parcel.image_url || `${window.location.origin}/placeholder.svg`,
      "description": parcel.description,
      "category": parcel.category.name,
      "offers": {
        "@type": "Offer",
        "price": parcel.price.toString(),
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock"
      },
      "brand": {
        "@type": "Brand",
        "name": "Seasonal Parcels"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating.toString(),
        "reviewCount": totalReviews.toString()
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl"></div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-10 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-32 bg-slate-200 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-14 bg-slate-200 rounded"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mx-auto flex items-center justify-center">
            <Package className="h-10 w-10 text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Produk Tidak Ditemukan</h1>
            <p className="text-slate-600">Wah, produk yang kamu cari tidak ada nih 😔</p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${parcel.name} - ${parcel.category.name}`}
        description={parcel.description}
        ogImage={parcel.image_url}
        url={`/produk/${parcel.category.slug}/${parcel.slug}`}
        structuredData={getStructuredData()}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900 hover:bg-white/50">
              <Link to={`/produk/${parcel.category.slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke {parcel.category.name}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square relative overflow-hidden rounded-3xl bg-white shadow-2xl">
                <img
                  src={parcel.image_url || '/placeholder.svg'}
                  alt={parcel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg">
                    {parcel.category.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                  </Button>
                </div>
                
                {/* Promo Badge */}
                <div className="absolute bottom-6 left-6">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm px-4 py-2 shadow-lg">
                    🔥 PROMO TERBATAS!
                  </Badge>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-orange-600 font-medium">Kontak kami untuk Stok</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  {parcel.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(5)}
                    <span className="text-sm font-medium text-slate-700 ml-1">
                      {averageRating}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    ({totalReviews} ulasan)
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {formatPrice(parcel.price)}
                    </span>
                    <span className="text-lg text-slate-500 line-through">
                      {formatPrice(Math.floor(parcel.price * 1.25))}
                    </span>
                  </div>
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1">
                    Hemat 20%
                  </Badge>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-white/70 rounded-xl">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div className="text-xs">
                    <div className="font-medium">Garansi</div>
                    <div className="text-slate-500">100% Asli</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white/70 rounded-xl">
                  <Award className="h-5 w-5 text-purple-500" />
                  <div className="text-xs">
                  <div className="font-medium">Terpercaya di Cirebon</div>
                  <div className="text-slate-500">Kualitas yang sudah terbukti</div>

                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">✨ Deskripsi Produk</h2>
                <div className="bg-white/70 p-6 rounded-2xl">
                  <p className="text-slate-700 leading-relaxed">
                    {parcel.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={handleWhatsAppOrder}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg font-bold"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Pesan Sekarang via WA
                  </Button>
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                    className="border-2 border-pink-200 hover:bg-pink-50 text-pink-600"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💬 Cara pesan gampang banget:</strong> Langsung klik tombol WhatsApp di atas! 
                    Admin baik dan ramah, pasti bakal dibantu sampai deal 😊
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">⭐ Ulasan Pembeli</h2>
              <div className="flex items-center gap-6 p-6 bg-white/70 rounded-2xl">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900">{averageRating}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {renderStars(5)}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{totalReviews} ulasan</div>
                </div>
                <div className="flex-1">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const percentage = star === 5 ? 85 : star === 4 ? 10 : 5;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{star}</span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-500">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white/70 p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-orange-100"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{review.name}</h4>
                        <span className="text-sm text-slate-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">🔥 Produk Serupa yang Lagi Hits</h2>
                <Button variant="ghost" asChild className="text-pink-600 hover:text-pink-700">
                  <Link to={`/produk/${parcel.category.slug}`}>
                    Lihat Semua
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <Link 
                    key={product.id}
                    to={`/produk/${product.category.slug}/${product.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-pink-600">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sm text-slate-500 line-through">
                            {formatPrice(Math.floor(product.price * 1.2))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <span>Terjual 100+</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};