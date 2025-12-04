import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Footer } from '@/components/Footer';
import { ParcelCard } from '@/components/ParcelCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getOptimizedImage } from '@/utils/imageOptimizer';
import { trackViewItem, trackBeginCheckout, trackShare, trackWhatsAppClick } from '@/utils/analytics';
import { 
  MessageCircle, 
  Heart, 
  ShieldCheck, 
  Store, 
  MapPin, 
  Truck, 
  Star, 
  ChevronRight, 
  Minus, 
  Plus,
  TicketPercent,
  Map,
  Share2,
  Check,
  Copy,
} from 'lucide-react';
import { createWhatsAppUrl } from '@/constants/whatsapp';

// SEO Keywords for product pages
const PRODUCT_SEO_KEYWORDS = "parcel cirebon, hampers cirebon, jual parcel, toko parcel cirebon, beli parcel online, lipink parcel";

// --- INTERFACES ---
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
  rating?: number;
  reviews_count?: number;
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
  const [quantity, setQuantity] = useState(1);
  
  // Store Status State
  const [isStoreOnline, setIsStoreOnline] = useState(false);
  
  // Share State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  
  // Review States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // --- 1. CHECK SHOP STATUS ---
  useEffect(() => {
    const checkShopStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      // Online between 08:00 (8 AM) and 19:00 (7 PM)
      const isOnline = hour >= 8 && hour < 19;
      setIsStoreOnline(isOnline);
    };
    
    checkShopStatus();
    const interval = setInterval(checkShopStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. MOCK REVIEW GENERATOR (Generic) ---
  const generateRandomReviews = () => {
    const sampleNames = [
      { name: "Siti N.*", gender: "female" }, { name: "Budi S.*", gender: "male" },
      { name: "Maya P.*", gender: "female" }, { name: "Andi W.*", gender: "male" },
      { name: "Rina K.*", gender: "female" }, { name: "Dedy P.*", gender: "male" },
      { name: "Lina H.*", gender: "female" }, { name: "Rizki R.*", gender: "male" },
      { name: "Dewi L.*", gender: "female" }, { name: "Agus S.*", gender: "male" },
      { name: "Fitri A.*", gender: "female" }, { name: "Wahyu K.*", gender: "male" },
      { name: "Sari I.*", gender: "female" }, { name: "Tono B.*", gender: "male" },
      { name: "Ani R.*", gender: "female" },   { name: "Yusuf A.*", gender: "male" },
      { name: "Dina M.*", gender: "female" },  { name: "Ilham J.*", gender: "male" },
      { name: "Nina Z.*", gender: "female" },  { name: "Ardi F.*", gender: "male" }
    ];

    const sampleComments = [
      "Parcelnya cantik banget, rapi dan elegan. Suka sekali!",
      "Pengiriman cepat, barang sampai dengan aman tanpa cacat.",
      "Isian parcelnya premium semua, nggak malu-maluin buat dikasih ke orang.",
      "Seller ramah banget, fast respon pas ditanya-tanya via WA.",
      "Kemasannya mewah, pitanya cantik. Recommended seller!",
      "Harganya terjangkau tapi kualitasnya bintang lima. Makasih ya!",
      "Pas banget buat hadiah ke rekan kerja, kelihatan profesional.",
      "Barang sesuai gambar, bahkan aslinya lebih bagus.",
      "Suka banget sama penataan isinya, sangat estetik.",
      "Udah langganan beli di sini, gapernah mengecewakan.",
      "Cocok banget buat hantaran acara keluarga.",
      "Kartu ucapannya juga bagus, tulisan rapi.",
      "Dikirim ke luar kota aman banget, packingnya tebal.",
      "Kelihatan mahal padahal harganya bersahabat.",
      "Isiannya fresh dan tanggal kadaluarsanya masih lama semua.",
      "Desain box-nya unik, beda dari toko lain.",
      "Buat kado ulang tahun orang tua, mereka seneng banget.",
      "Variasi isinya banyak, nggak ngebosenin.",
      "Pesen dadakan pagi, sore udah sampai. Mantap pelayanannya.",
      "Sangat membantu buat yang cari kado last minute.",
      "Kombinasi warnanya cakep, elegan dan manis.",
      "Kualitas keranjangnya kokoh, bisa dipake lagi.",
      "Teman saya yang nerima seneng banget, katanya bagus.",
      "Parcel terbaik di Cirebon sejauh ini.",
      "Nggak nyesel beli di sini, bakal order lagi next time.",
      "Simple tapi berkesan banget parcelnya.",
      "Adminnya kooperatif banget bantuin pilih yang sesuai budget.",
      "Pengemasan sangat niat, detailnya diperhatikan.",
      "Juaranya parcel, isinya nggak ada yang zonk.",
      "Terima kasih Lipink Parcel, sangat memuaskan!"
    ];

    const reviewCount = Math.floor(Math.random() * 36) + 10; 
    const avgRating = (Math.random() * 0.2 + 4.7).toFixed(1); 
    
    setTotalReviews(reviewCount);
    setAverageRating(parseFloat(avgRating));

    const generatedReviews: Review[] = [];
    const visibleCount = Math.min(reviewCount, 8); 

    for (let i = 0; i < visibleCount; i++) {
      const rating = Math.random() < 0.8 ? 5 : 4; 
      const { name, gender } = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];

      const seed = encodeURIComponent(name.replace(/\s|\*/g, '') + i);
      const headParam = gender === 'male'
        ? 'short1,short2,short3,short4,shaved1,flatTop'
        : 'bun,bun2,long,longCurly,medium1,medium2';

      const avatarUrl = `https://api.dicebear.com/9.x/open-peeps/svg?seed=${seed}&head=${headParam}&face=smile,smileBig&skinColor=ffdbb4,edb98a`;

      generatedReviews.push({
        id: `review-${i}`,
        name,
        rating,
        comment,
        date: `${Math.floor(Math.random() * 6) + 1} hari lalu`,
        avatar: avatarUrl
      });
    }

    setReviews(generatedReviews);
  };

  // --- 3. DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug || !parcelSlug) return;
      try {
        setLoading(true);
        window.scrollTo(0, 0);

        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (categoryData) {
          const { data: parcelData } = await supabase
            .from('parcels')
            .select(`*, category:categories(id, name, slug)`)
            .eq('slug', parcelSlug)
            .eq('category_id', categoryData.id)
            .single();

          if (parcelData) {
            setParcel(parcelData);
            generateRandomReviews();

            // Track product view in GA4
            trackViewItem({
              id: parcelData.id,
              name: parcelData.name,
              category: parcelData.category.name,
              price: parcelData.price,
            });

            const { data: relatedData } = await supabase
              .from('parcels')
              .select(`*, category:categories(id, name, slug)`)
              .eq('category_id', categoryData.id)
              .neq('id', parcelData.id)
              .order('created_at', { ascending: false })
              .limit(6);

            setRelatedProducts(relatedData || []);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categorySlug, parcelSlug]);

  // --- 4. MEMOIZED STRUCTURED DATA GENERATION (SEO) ---
  const structuredData = useMemo(() => {
    if (!parcel) return null;

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.parcelcirebon.com';
    const productUrl = `${siteUrl}/produk/${parcel.category.slug}/${parcel.slug}`;
    // Ensure image is absolute URL for schema
    const imageUrl = parcel.image_url.startsWith('http') 
        ? parcel.image_url 
        : `${siteUrl}${parcel.image_url}`;

    return {
      "@type": "Product",
      "@id": `${productUrl}/#product`,
      "name": parcel.name,
      "image": imageUrl,
      "description": parcel.description,
      "sku": parcel.id,
      "mpn": parcel.id,
      "brand": {
        "@type": "Brand",
        "name": "Lipink Parcel"
      },
      "category": parcel.category.name,
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "IDR",
        "price": parcel.price.toString(),
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Lipink Parcel Cirebon"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating > 0 ? averageRating.toString() : "5.0",
        "reviewCount": totalReviews > 0 ? totalReviews.toString() : "10",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": reviews.slice(0, 3).map(review => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating.toString(),
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": review.name
        },
        "reviewBody": review.comment
      }))
    };
  }, [parcel, averageRating, totalReviews, reviews]);

  // --- HELPERS & HANDLERS ---
  
  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized price formatter
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace("Rp", "Rp");
  }, []);

  const handleWhatsAppOrder = () => {
    if (!parcel) return;
    
    // Track checkout event in GA4
    trackBeginCheckout({
      id: parcel.id,
      name: parcel.name,
      category: parcel.category.name,
      price: parcel.price,
      quantity: quantity,
    });
    trackWhatsAppClick('product_page', parcel.name);
    
    const currentUrl = window.location.href;
    const message = `Halo Admin Lipink Parcel 👋\n\nSaya ingin memesan produk ini:\n\n🛍️ *${parcel.name}*\n💰 Harga: ${formatPrice(parcel.price)}\n📦 Jumlah: ${quantity} pcs\n\n🔗 Link Produk: ${currentUrl}\n\nMohon info stok dan total ongkir ke alamat saya ya. Terima kasih!`;
    const whatsappUrl = createWhatsAppUrl(message, parcel.image_url); 
    window.open(whatsappUrl, '_blank');
  };

  const handleShareClick = async () => {
    if (!parcel) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: parcel.name,
          text: `Cek produk ini: ${parcel.name} hanya ${formatPrice(parcel.price)} di Lipink Parcel!`,
          url: window.location.href,
        });
        // Track share event
        trackShare('native_share', 'product', parcel.id);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setIsShareOpen(!isShareOpen);
    }
  };

  const shareToWhatsApp = () => {
    if (!parcel) return;
    // Track share event
    trackShare('whatsapp', 'product', parcel.id);
    const text = `Lihat produk ini deh: *${parcel.name}*\nHarga: ${formatPrice(parcel.price)}\nLink: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsShareOpen(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- LOADING VIEW ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 h-[400px] bg-slate-200 rounded-xl animate-pulse" />
            <div className="lg:col-span-7 space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="h-12 bg-slate-200 rounded w-1/2 animate-pulse" />
            </div>
        </div>
      </div>
    );
  }

  if (!parcel) return null;

  // Mock price calculations
  const originalPrice = parcel.price * 1.2;
  const discount = 20;

  return (
    <>
      {/* --- SEO COMPONENT INTEGRATION --- */}
      <SEO
        title={`Jual ${parcel.name} Cirebon - Harga ${formatPrice(parcel.price)} | Lipink Parcel`}
        description={`Beli ${parcel.name} di Lipink Parcel Cirebon. ${parcel.description?.slice(0, 120)}... ✓ Kualitas Premium ✓ Harga Terjangkau ✓ Pengiriman Cirebon`}
        keywords={`${parcel.name}, ${parcel.category.name}, ${PRODUCT_SEO_KEYWORDS}`}
        image={parcel.image_url}
        url={`/produk/${parcel.category.slug}/${parcel.slug}`}
        canonical={`https://www.parcelcirebon.com/produk/${parcel.category.slug}/${parcel.slug}`}
        type="product"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-[#F5F5F5] pb-24 md:pb-12 font-sans">
        
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 hidden md:block">
            <div className="container mx-auto px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <Link to="/" className="hover:text-pink-600">Beranda</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to={`/produk/${parcel.category.slug}`} className="hover:text-pink-600">{parcel.category.name}</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-900 font-medium truncate max-w-[200px]">{parcel.name}</span>
            </div>
        </div>

        <div className="container mx-auto px-0 md:px-4 py-0 md:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
            
            {/* === LEFT COLUMN: IMAGE === */}
            <div className="lg:col-span-5">
               <div className="bg-white md:rounded-2xl overflow-hidden sticky top-24 shadow-sm border border-slate-100">
                  <div className="aspect-square relative group cursor-zoom-in bg-slate-50">
                     <img 
                        src={getOptimizedImage(parcel.image_url, 600)} 
                        alt={`${parcel.name} - ${parcel.category.name} Cirebon`}
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        width={600}
                        height={600}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                     />
                     <div className="absolute bottom-4 left-4 flex gap-2">
                        <Badge className="bg-black/70 backdrop-blur-md hover:bg-black/80 text-white border-0 px-3 py-1.5 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                            100% Original
                        </Badge>
                     </div>
                  </div>
               </div>
            </div>

            {/* === RIGHT COLUMN: INFO === */}
            <div className="lg:col-span-7">
                
                {/* 1. Product Info Card */}
                <div className="bg-white p-4 md:p-6 md:rounded-2xl shadow-sm border border-slate-100 mb-4">
                    
                    <div className="flex justify-between items-start gap-4 mb-2">
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                            {parcel.name}
                        </h1>
                        <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 rounded-full hover:bg-pink-50 transition-colors">
                            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-4 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-slate-900 border-b border-slate-900">{averageRating}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="text-slate-500">
                            {totalReviews} Ulasan
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="text-slate-500">
                            Terjual <span className="text-slate-900 font-bold">100+</span>
                        </div>
                    </div>

                    <div className="bg-pink-50/50 p-4 rounded-xl mb-6">
                        <div className="flex items-end gap-3 mb-1">
                            <h2 className="text-3xl font-bold text-red-600">
                                {formatPrice(parcel.price)}
                            </h2>
                            <div className="mb-1.5 flex items-center gap-2">
                                <span className="text-slate-400 line-through text-sm">{formatPrice(originalPrice)}</span>
                                <Badge className="bg-red-100 text-red-600 hover:bg-red-200 border-0 font-bold">
                                    {discount}% OFF
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-pink-600 font-medium">
                            <TicketPercent className="w-3.5 h-3.5" />
                            <span>Hemat {formatPrice(originalPrice - parcel.price)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-start gap-8 pt-2 mb-6">
                        <span className="text-sm font-semibold text-slate-700">Jumlah:</span>
                        <div className="flex items-center border border-slate-300 rounded-lg">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-2 hover:bg-slate-100 border-r border-slate-300 disabled:opacity-50 text-slate-600"
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <input 
                                type="text" 
                                value={quantity} 
                                readOnly 
                                className="w-12 text-center text-sm font-bold text-slate-800 outline-none bg-transparent"
                            />
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-2 hover:bg-slate-100 border-l border-slate-300 text-slate-600"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <span className="text-xs text-slate-500">Stok: 99+</span>
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex gap-3 pt-2 relative">
                        <Button 
                            onClick={handleWhatsAppOrder}
                            size="lg"
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold h-12 text-base shadow-lg shadow-green-200"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Beli Sekarang (WhatsApp)
                        </Button>
                        
                        <div className="relative" ref={shareRef}>
                            <Button onClick={handleShareClick} variant="outline" size="lg" className="h-12 px-6 border-slate-300 text-slate-600 hover:bg-slate-50">
                                <Share2 className="w-5 h-5" />
                            </Button>
                            {isShareOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95">
                                    <div className="text-xs font-bold text-slate-500 px-2 py-1 mb-1">Bagikan ke:</div>
                                    <button onClick={shareToWhatsApp} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 text-left rounded-lg transition-colors group">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><MessageCircle className="w-4 h-4 text-green-600" /></div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-green-700">WhatsApp</span>
                                    </button>
                                    <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left rounded-lg transition-colors group">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                            {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Shop & Shipping Info */}
                <div className="bg-white p-4 md:p-6 md:rounded-2xl shadow-sm border border-slate-100 mb-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800">Lipink Parcel Official</h3>
                                <Badge className="bg-red-600 hover:bg-red-700 h-5 text-[10px]">Official</Badge>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${isStoreOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                {isStoreOnline ? <span className="text-green-600 font-medium">Online</span> : <span className="text-slate-400">Offline (Buka 08.00 - 19.00)</span>}
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                         <div className="flex items-start gap-3">
                             <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                             <div><p className="text-sm font-medium text-slate-700">Dikirim dari <span className="font-bold">Kota Cirebon</span></p></div>
                         </div>
                         <div className="flex items-start gap-3">
                             <Truck className="w-5 h-5 text-slate-400 mt-0.5" />
                             <div className="flex-1">
                                 <p className="text-sm font-medium text-slate-700">Ongkos Kirim</p>
                                 <p className="text-xs text-slate-500 mt-0.5">Mulai dari Rp 10.000 ke tempatmu.</p>
                             </div>
                         </div>
                    </div>
                    <div className="mt-4 pt-2">
                        <a href="https://share.google/USTQ0jAyd2IIoHRVJ" target="_blank" rel="noopener noreferrer" className="block group">
                            <div className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl p-3 flex items-center gap-3 transition-colors cursor-pointer">
                                <div className="bg-white p-2 rounded-full shadow-sm"><Map className="w-5 h-5 text-blue-600" /></div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-blue-700 mb-0.5 group-hover:underline decoration-blue-700">Atau mau kunjungi langsung?</p>
                                    <p className="text-[11px] text-blue-600 leading-snug">Anda di sekitar Cirebon? Yuk mampir ke toko offline kami! 📍</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-blue-400" />
                            </div>
                        </a>
                    </div>
                </div>

                {/* 3. Description */}
                <div className="bg-white p-4 md:p-6 md:rounded-2xl shadow-sm border border-slate-100 mb-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Deskripsi Produk</h3>
                    <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                        {parcel.description}
                        <br/><br/>
                        <p><strong>Spesifikasi:</strong></p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Dibuat fresh setiap pesanan</li>
                            <li>Bahan premium berkualitas</li>
                            <li>Gratis kartu ucapan (Request via Chat)</li>
                            <li>Packaging aman dengan bubble wrap tebal</li>
                        </ul>
                    </div>
                </div>

                {/* 4. Reviews */}
                <div className="bg-white p-4 md:p-6 md:rounded-2xl shadow-sm border border-slate-100 mb-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Ulasan Pembeli ({totalReviews})</h3>
                    <div className="space-y-6">
                        {reviews.slice(0, 3).map((review) => (
                            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <img src={review.avatar} alt={review.name} className="w-8 h-8 rounded-full bg-slate-100" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{review.name}</p>
                                        <div className="flex text-yellow-400 w-16">
                                            {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />))}
                                        </div>
                                    </div>
                                    <span className="ml-auto text-xs text-slate-400">{review.date}</span>
                                </div>
                                <p className="text-sm text-slate-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4 text-slate-600">Lihat Semua Ulasan</Button>
                </div>

            </div>
          </div>

          {/* === RELATED PRODUCTS === */}
          {relatedProducts.length > 0 && (
             <section className="mt-8 mb-24 md:mb-8" aria-label="Related Products">
                 <h2 className="text-xl font-bold text-slate-900 mb-4 px-4 md:px-0">Mungkin Kamu Suka</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 px-4 md:px-0">
                     {relatedProducts.map((product) => (
                         <article key={product.id} className="h-full">
                             <ParcelCard parcel={{
                               ...product,
                               image_url: getOptimizedImage(product.image_url, 300)
                             }} />
                         </article>
                     ))}
                 </div>
             </section>
          )}

        </div>

        {/* === MOBILE STICKY BAR === */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 md:hidden pb-safe">
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3">
                    <Button onClick={handleShareClick} variant="outline" className="w-full h-11 flex-col gap-0.5 text-[10px] text-slate-600 border-slate-300">
                        <Share2 className="w-5 h-5" /> Share
                    </Button>
                </div>
                <div className="col-span-9">
                    <Button onClick={handleWhatsAppOrder} className="w-full h-11 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold">
                        Beli Sekarang
                    </Button>
                </div>
            </div>
        </div>

      </div>

      <Footer />
    </>
  );
};