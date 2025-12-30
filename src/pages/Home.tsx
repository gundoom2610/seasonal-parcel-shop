"use client"

import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { SEO } from "@/components/SEO"
import { ParcelCard } from "@/components/ParcelCard"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Search,
  PackageX,
  Sparkles,
  MessageCircle,
  MapPin,
  Clock,
  Phone,
  Gift,
  Truck,
  Shield,
  Star,
  CheckCircle2
} from "lucide-react"
import { createWhatsAppUrl } from "@/constants/whatsapp"
import { getOptimizedImage } from "@/utils/imageOptimizer"

// --- LAZY LOAD COMPONENTS ---
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

// --- SEASONAL CONFIG ---
type SeasonType = 'imlek' | 'lebaran' | 'natal' | 'general';

interface SeasonConfig {
  keywords: string[];
  title: string;
  emoji: string;
  gradient: string;
}

const SEASONAL_CONFIG: Record<SeasonType, SeasonConfig> = {
  imlek: {
    keywords: ['imlek', 'chinese new year', 'sincia'],
    title: 'Koleksi Spesial Imlek',
    emoji: '🧧',
    gradient: 'from-red-500 to-amber-500'
  },
  lebaran: {
    keywords: ['lebaran', 'idul fitri', 'ramadan', 'ramadhan'],
    title: 'Koleksi Spesial Lebaran',
    emoji: '🕌',
    gradient: 'from-emerald-500 to-teal-500'
  },
  natal: {
    keywords: ['natal', 'christmas', 'xmas'],
    title: 'Koleksi Spesial Natal',
    emoji: '🎄',
    gradient: 'from-red-500 to-green-600'
  },
  general: {
    keywords: [],
    title: 'Koleksi Parcel Cirebon Terlaris',
    emoji: '🎁',
    gradient: 'from-pink-500 to-rose-500'
  }
};

// Get current season based on month
const getCurrentSeason = (): SeasonType => {
  const month = new Date().getMonth() + 1; // 1-12
  
  // January - February: Imlek season
  if (month >= 1 && month <= 2) return 'imlek';
  
  // February - March (overlaps with Imlek end): Lebaran prep
  // March - April: Lebaran (typically Ramadan ends March/April)
  if (month >= 2 && month <= 4) return 'lebaran';
  
  // December: Natal season
  if (month === 12) return 'natal';
  
  // Default for other months
  return 'general';
};

// --- SEO CONFIG ---
const SEO_CONFIG = {
  business: {
    name: "Lipink Parcel Cirebon",
    description: "Pusat Parcel & Hampers Terlengkap di Cirebon.",
    tagline: "Parcel Terbaik Cirebon Untuk Silaturahmi Keluarga", 
  },
}

// --- TYPES ---
interface Category { id: string; name: string; slug: string; parcels?: Parcel[] }
interface Parcel { id: string; name: string; slug: string; description: string; image_url: string; price: number; category: { id: string; name: string; slug: string }; created_at?: string; rating?: number; reviews_count?: number; }

// --- SEO KEYWORDS ---
const SEO_KEYWORDS = "parcel cirebon, hampers cirebon, parcel lebaran cirebon, parcel natal cirebon, parcel imlek cirebon, jual parcel cirebon, toko parcel cirebon, parcel murah cirebon, hampers lebaran, hampers natal, hampers imlek, parcel makanan cirebon, parcel keramik cirebon, lipink parcel";

const getCategoryEmoji = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('lebaran')) return '🕌'
  if (lower.includes('natal')) return '🎄'
  if (lower.includes('imlek')) return '🧧'
  return '🎁'
}

// --- OPTIMIZED SKELETON ---
const ParcelSkeleton = () => (
  <div className="w-[145px] md:w-[210px] h-[260px] md:h-[320px] bg-slate-100 rounded-lg animate-pulse flex-shrink-0 snap-start border border-slate-200" />
)

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("q") || ""
  
  const [categoriesWithParcels, setCategoriesWithParcels] = useState<Category[]>([])
  const [featuredParcels, setFeaturedParcels] = useState<Parcel[]>([])
  const [seasonalParcels, setSeasonalParcels] = useState<Parcel[]>([])
  const [searchResults, setSearchResults] = useState<Parcel[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Get current season
  const currentSeason = useMemo(() => getCurrentSeason(), [])
  const seasonConfig = SEASONAL_CONFIG[currentSeason]

  // --- SEO LOGIC ---
  const seoData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    
    // Get seasonal SEO boost
    const seasonalSEO = {
      imlek: { suffix: "Hampers Imlek", desc: "Parcel Imlek premium" },
      lebaran: { suffix: "Hampers Lebaran", desc: "Parcel Lebaran premium" },
      natal: { suffix: "Hampers Natal", desc: "Parcel Natal premium" },
      general: { suffix: "Hampers Premium", desc: "Parcel premium" }
    }[currentSeason]
    
    if (!query) {
      return {
        title: `Parcel Terbaik Cirebon & ${seasonalSEO.suffix} Terlengkap | Lipink`,
        description: `Cari Parcel Terbaik di Cirebon? Lipink Parcel menyediakan ${seasonalSEO.desc} untuk silaturahmi keluarga dan kerabat. Harga mulai Rp50.000. Ongkir mulai dari 25rb, bisa kirim se-Indonesia!`,
        keywords: SEO_KEYWORDS
      }
    }
    const capitalizedQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
    return {
      title: `Jual ${capitalizedQuery} Cirebon Murah & Lengkap | Lipink`,
      description: `Dapatkan penawaran harga terbaik untuk ${searchQuery} di Lipink Parcel Cirebon. Kualitas premium untuk silaturahmi keluarga. Tersedia ${seasonalSEO.desc}.`,
      keywords: `${searchQuery}, ${SEO_KEYWORDS}`
    }
  }, [searchQuery, currentSeason]);

  // --- DATA FETCHING ---
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. SEARCH LOGIC
        if (searchQuery) {
          if (isMounted) setIsSearching(true)
          const { data: matchingCategories } = await supabase.from('categories').select('id').ilike('name', `%${searchQuery}%`)
          let query = supabase.from("parcels").select(`*, category:categories(id, name, slug)`).order("created_at", { ascending: false })
          
          const nameFilter = `name.ilike.%${searchQuery}%`
          let orFilter = nameFilter
          if (matchingCategories && matchingCategories.length > 0) {
            const categoryIds = matchingCategories.map(c => c.id).join(',')
            orFilter += `,category_id.in.(${categoryIds})`
          }
          query = query.or(orFilter)
          
          const { data, error } = await query
          if (error) throw error
          
          if (isMounted) {
            setSearchResults(data || [])
            setLoading(false)
          }
          return 
        }

        // 2. HOMEPAGE LOGIC
        if (isMounted) setIsSearching(false)

        // Build seasonal query based on current season
        const buildSeasonalQuery = () => {
          const config = SEASONAL_CONFIG[currentSeason]
          if (currentSeason === 'general' || config.keywords.length === 0) {
            // Fallback: get latest parcels
            return supabase
              .from("parcels")
              .select(`*, category:categories(id, name, slug)`)
              .limit(10)
              .order("created_at", { ascending: false })
          }
          
          // Search for seasonal parcels by category name containing keywords
          // First get matching category IDs
          return supabase
            .from("categories")
            .select("id, name")
            .or(config.keywords.map(k => `name.ilike.%${k}%`).join(','))
        }

        const [categoriesRes, featuredRes, seasonalCategoriesRes] = await Promise.all([
          supabase.from("categories").select("*").order("name", { ascending: true }),
          supabase.from("parcels").select(`*, category:categories(id, name, slug)`).limit(10).order("created_at", { ascending: false }),
          buildSeasonalQuery()
        ]);

        if (featuredRes.data && isMounted) setFeaturedParcels(featuredRes.data);
        
        // Fetch seasonal parcels if we found matching categories
        if (currentSeason !== 'general' && seasonalCategoriesRes.data && 'id' in (seasonalCategoriesRes.data[0] || {})) {
          const categoryIds = (seasonalCategoriesRes.data as { id: string }[]).map(c => c.id)
          if (categoryIds.length > 0) {
            const { data: seasonalData } = await supabase
              .from("parcels")
              .select(`*, category:categories(id, name, slug)`)
              .in('category_id', categoryIds)
              .limit(10)
              .order("created_at", { ascending: false })
            
            if (seasonalData && isMounted) setSeasonalParcels(seasonalData)
          }
        } else if (seasonalCategoriesRes.data && isMounted) {
          // For general season, the query already returned parcels
          setSeasonalParcels(seasonalCategoriesRes.data as Parcel[])
        }
        
        if (categoriesRes.data) {
          const catsWithProducts = await Promise.all(
            categoriesRes.data.map(async (category) => {
              const { data: pData } = await supabase
                .from("parcels")
                .select(`*, category:categories(id, name, slug)`)
                .eq("category_id", category.id)
                .order("created_at", { ascending: false })
                .limit(8)
              return { ...category, parcels: pData || [] }
            })
          )
          if (isMounted) setCategoriesWithParcels(catsWithProducts.filter(c => c.parcels && c.parcels.length > 0))
        }

        if (isMounted) setLoading(false)
      } catch (error) {
        console.error(error)
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [searchQuery])

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={searchQuery ? `/?q=${encodeURIComponent(searchQuery)}` : "/"}
      />

      <main className="min-h-screen bg-slate-50 font-sans pb-24 overflow-x-hidden">
        
        {isSearching ? (
          /* === SEARCH RESULTS === */
          <div className="container mx-auto px-4 pt-4 md:pt-6">
             <div className="bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm mb-4 flex justify-between items-center sticky top-16 z-40 border border-slate-100/80">
                 <h1 className="text-sm md:text-lg font-bold text-slate-800 flex items-center gap-2">
                     <div className="p-1.5 bg-pink-100 rounded-lg">
                        <Search className="w-4 h-4 text-pink-600" />
                     </div>
                     <span>Hasil: <span className="text-pink-600">"{searchQuery}"</span></span>
                 </h1>
                 <Button onClick={() => setSearchParams({})} variant="ghost" size="sm" className="text-xs text-slate-500 h-8 hover:bg-slate-100 rounded-lg">Reset</Button>
             </div>

             {searchResults.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
                     {searchResults.map((parcel) => (
                         <ParcelCard key={parcel.id} parcel={parcel} />
                     ))}
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                     <div className="p-4 bg-slate-50 rounded-full mb-4">
                        <PackageX className="w-12 h-12 md:w-16 md:h-16 text-slate-300" />
                     </div>
                     <p className="text-slate-500 mb-2">Produk tidak ditemukan</p>
                     <Button onClick={() => setSearchParams({})} variant="link" className="text-pink-600 font-semibold">Lihat Semua Produk</Button>
                 </div>
             )}
          </div>
        ) : (
          /* === HOMEPAGE === */
          <>
            {/* 1. HERO SECTION */}
            <section className="bg-slate-50 pb-6 pt-4">
              <div className="container mx-auto px-4">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-pink-600 to-purple-700 min-h-[160px] md:h-[300px] flex items-center shadow-md">
                  
                  {/* Text Content */}
                  <div className="relative z-20 px-4 py-5 md:px-12 md:py-0 w-full md:w-2/3 text-white">
                    <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold mb-2 border border-white/20">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Official Store</span>
                    </div>
                    
                    <h1 className="text-lg md:text-4xl lg:text-5xl font-extrabold leading-tight mb-2 md:mb-4 pr-20 md:pr-0">
                      Parcel Terbaik Cirebon <br className="hidden md:block"/> 
                      Untuk Silaturahmi Keluarga
                    </h1>
                    
                    <p className="text-[10px] md:text-base text-pink-100 mb-3 md:mb-4 max-w-xs md:max-w-lg line-clamp-2 md:line-clamp-none">
                      Hampers Lebaran, Natal & Imlek Premium. Kirim kehangatan untuk kerabat.
                    </p>
                    
                    <Button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-pink-700 font-bold rounded-lg px-4 h-8 text-xs md:h-12 md:text-sm shadow-lg hover:bg-pink-50 border-0">
                      Belanja Sekarang
                    </Button>
                  </div>

                  {/* Hero Image - Hidden on small mobile, visible on larger screens */}
                  <div className="absolute right-0 bottom-0 top-0 z-10 w-28 md:w-1/2 flex items-end justify-end pointer-events-none opacity-60 md:opacity-100">
                     <img 
                        src="/hero-image.avif" 
                        alt="Parcel Cirebon Terbaik" 
                        // @ts-ignore
                        fetchpriority="high"
                        width="450"
                        height="450"
                        className="h-full w-auto object-cover object-center md:h-auto md:w-96 md:object-contain md:translate-y-6" 
                     />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. STATIC CATEGORY SHOWCASE - Hardcoded for SEO (No Database Dependency) */}
            <section className="py-4 md:py-6">
              <div className="container mx-auto px-4">
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-slate-800">Pilih Kategori Parcel</h2>
                  <p className="text-xs md:text-sm text-slate-500">Temukan parcel sesuai momen spesial Anda</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {/* Static categories - always visible for SEO */}
                  {[
                    { name: 'Parcel Lebaran', slug: 'parcel-lebaran', emoji: '🕌', image: '/parcel-lebaran.png', overlay: 'from-emerald-600/80 to-green-500/80', border: 'border-emerald-200', desc: 'Kurma, kue kering & sirup' },
                    { name: 'Parcel Natal', slug: 'parcel-natal', emoji: '🎄', image: '/natal.png', overlay: 'from-blue-600/80 to-sky-500/80', border: 'border-blue-200', desc: 'Cookies, cokelat & hampers' },
                    { name: 'Parcel Imlek', slug: 'parcel-imlek', emoji: '🧧', image: '/parcel-imlek.png', overlay: 'from-red-600/80 to-amber-500/80', border: 'border-red-200', desc: 'Kue keranjang & jeruk' },
                    { name: 'Hampers Imlek', slug: 'hampers-imlek', emoji: '🏮', image: '/parcel-imlek.png', overlay: 'from-rose-600/80 to-orange-500/80', border: 'border-rose-200', desc: 'Hampers premium Imlek' },
                  ].map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/produk/${cat.slug}`}
                        className={`group relative aspect-[4/3] md:aspect-[3/2] rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 ${cat.border}`}
                      >
                        {/* Background Image - Static for SEO */}
                        <img
                          src={cat.image}
                          alt={`${cat.name} Cirebon - Lipink Parcel`}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />

                        {/* Glassmorphism Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${cat.overlay} backdrop-blur-[2px] group-hover:backdrop-blur-[1px] transition-all`} />

                        {/* Glass Card Effect */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                          <span className="text-3xl md:text-4xl mb-2 drop-shadow-lg">{cat.emoji}</span>
                          <h3 className="text-white font-bold text-sm md:text-lg drop-shadow-lg">{cat.name}</h3>
                          <p className="text-white/90 text-[10px] md:text-xs mt-1">{cat.desc}</p>

                          {/* Hover indicator */}
                          <div className="mt-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] md:text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Lihat Semua <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. SEASONAL FEATURED SECTION (Dynamic - loads after fetch) */}
            {(seasonalParcels.length > 0 || featuredParcels.length > 0) && (
              <section className="py-4 md:py-6" aria-label="Featured Products">
                 <div className="container mx-auto px-4">
                    {/* Modern Soft Pink Container */}
                    <div className="relative bg-gradient-to-br from-pink-50 via-rose-50/50 to-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-pink-100/50 overflow-hidden">

                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                             <div className={`bg-gradient-to-br ${seasonConfig.gradient} p-2 md:p-2.5 rounded-xl shadow-md`}>
                               <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                             </div>
                             <div>
                                <h2 className="text-sm md:text-xl font-bold text-slate-800">
                                  {seasonConfig.emoji} {seasonConfig.title}
                                </h2>
                                <p className="text-[10px] md:text-xs text-slate-500 hidden md:block">
                                  {currentSeason !== 'general' ? 'Spesial musim ini' : 'Produk paling diminati'}
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] md:text-xs font-semibold text-rose-600 bg-white/80 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-pink-200/50 shadow-sm">
                             <span>{currentSeason !== 'general' ? seasonConfig.emoji : '🔥'}</span>
                             <span className="hidden sm:inline">{currentSeason !== 'general' ? 'Seasonal' : 'Trending'}</span>
                          </div>
                       </div>

                       <div className="relative -mx-4 md:-mx-6 px-4 md:px-6">
                          <div className="flex overflow-x-auto gap-2.5 md:gap-3 pb-2 snap-x snap-mandatory hide-scrollbar">
                          {loading ? [1,2,3,4].map(i => <ParcelSkeleton key={i} />) : (
                             (seasonalParcels.length > 0 ? seasonalParcels : featuredParcels).map((parcel) => (
                                <div key={parcel.id} className="w-[145px] md:w-[210px] flex-shrink-0 snap-start">
                                   <ParcelCard parcel={{
                                      ...parcel,
                                      image_url: getOptimizedImage(parcel.image_url, 400)
                                   }} />
                                </div>
                             ))
                          )}
                          </div>
                       </div>
                    </div>
                 </div>
              </section>
            )}

            {/* STATIC SEO CONTENT - Rich text for crawlers (after products for better UX) */}
            <div className="container mx-auto px-4 space-y-6 my-6">
              {/* About Section */}
              <section className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 md:p-8 border border-pink-100">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">Toko Parcel & Hampers Terbaik di Cirebon</h2>
                <div className="prose prose-sm md:prose-base max-w-none text-slate-600">
                  <p className="leading-relaxed mb-4">
                    Selamat datang di <strong>Lipink Parcel Cirebon</strong> - pusat parcel dan hampers premium terpercaya dengan pengalaman lebih dari <strong>6 tahun</strong> melayani kebutuhan hadiah dan bingkisan di wilayah Cirebon dan sekitarnya. Kami menyediakan berbagai pilihan parcel berkualitas untuk setiap momen spesial Anda.
                  </p>
                  <p className="leading-relaxed mb-4">
                    Dari <strong>parcel Lebaran</strong> yang penuh berkah, <strong>parcel Natal</strong> yang hangat, hingga <strong>parcel Imlek</strong> yang membawa keberuntungan - semua tersedia dengan kualitas terjamin dan harga terjangkau mulai dari <strong>Rp50.000</strong>. Setiap parcel kami dikemas dengan penuh perhatian menggunakan bahan premium.
                  </p>
                  <p className="leading-relaxed">
                    Dengan layanan pengiriman yang mencakup <strong>seluruh Indonesia</strong> dan ongkir mulai dari <strong>Rp25.000</strong>, Lipink Parcel menjadi pilihan tepat untuk mengirim kasih sayang kepada keluarga, kerabat, rekan kerja, maupun klien bisnis.
                  </p>
                </div>
              </section>

              {/* Keunggulan - Static */}
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 text-center">Mengapa Memilih Lipink Parcel?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="group p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-pink-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">6+ Tahun Pengalaman</h4>
                    <p className="text-xs text-slate-500">Terpercaya sejak 2018 dengan ribuan pelanggan puas</p>
                  </div>
                  <div className="group p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Truck className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">Kirim se-Indonesia</h4>
                    <p className="text-xs text-slate-500">Ongkir mulai Rp25.000, tersedia same-day delivery</p>
                  </div>
                  <div className="group p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">Kualitas Terjamin</h4>
                    <p className="text-xs text-slate-500">Produk premium dengan garansi kepuasan</p>
                  </div>
                  <div className="group p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">Fast Response</h4>
                    <p className="text-xs text-slate-500">Layanan via WhatsApp setiap hari 08.00-21.00</p>
                  </div>
                </div>
              </section>

              {/* Layanan Parcel - Static */}
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">Layanan Parcel Lengkap untuk Setiap Momen</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-pink-500" />
                      Parcel untuk Hari Raya
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Parcel Lebaran</strong> - Kurma premium, kue kering, sirup, dan perlengkapan ibadah untuk berbagi kebahagiaan Idul Fitri</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Parcel Natal</strong> - Cookies, cokelat, dekorasi natal, dan hadiah keluarga untuk merayakan Natal penuh sukacita</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Parcel Imlek</strong> - Kue keranjang, jeruk mandarin, dan hampers bernuansa merah-emas untuk Tahun Baru Imlek</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-500" />
                      Parcel untuk Acara Spesial
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Hampers Ulang Tahun</strong> - Kado spesial untuk orang tersayang dengan pilihan isi yang bisa di-custom</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Parcel Pernikahan</strong> - Seserahan dan hampers elegan untuk momen sakral pernikahan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Parcel Corporate</strong> - Bingkisan profesional untuk klien, partner bisnis, dan karyawan</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Jangkauan Pengiriman - Static */}
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-500" />
                  Jangkauan Pengiriman Parcel
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Lipink Parcel melayani pengiriman ke seluruh wilayah <strong>Ciayumajakuning</strong> (Cirebon, Indramayu, Majalengka, Kuningan) dengan layanan <strong>same-day delivery</strong> untuk area Cirebon Kota. Untuk pengiriman ke luar kota dan <strong>seluruh Indonesia</strong>, kami bekerja sama dengan ekspedisi terpercaya seperti JNE, J&T, SiCepat, AnterAja, dan Pos Indonesia.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="font-semibold text-slate-700 text-sm">Cirebon Kota</p>
                    <p className="text-xs text-green-600">Same-day delivery</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="font-semibold text-slate-700 text-sm">Kab. Cirebon</p>
                    <p className="text-xs text-slate-500">1 hari kerja</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="font-semibold text-slate-700 text-sm">Majalengka</p>
                    <p className="text-xs text-slate-500">1-2 hari kerja</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="font-semibold text-slate-700 text-sm">Indramayu</p>
                    <p className="text-xs text-slate-500">1-2 hari kerja</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="font-semibold text-slate-700 text-sm">Kuningan</p>
                    <p className="text-xs text-slate-500">1-2 hari kerja</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3 text-center border border-pink-200">
                    <p className="font-semibold text-pink-700 text-sm">Seluruh Indonesia</p>
                    <p className="text-xs text-pink-600">Via ekspedisi</p>
                  </div>
                </div>
              </section>

              {/* FAQ Section - Modern Accordion Style */}
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6">Pertanyaan Umum Seputar Parcel Cirebon</h3>
                <div className="space-y-3">
                  {[
                    {
                      q: "Berapa ongkos kirim parcel ke Cirebon dan sekitarnya?",
                      a: "Ongkir mulai dari Rp25.000 untuk area Cirebon, Majalengka, Indramayu, dan Kuningan. Same-day delivery tersedia untuk Cirebon Kota dengan pemesanan sebelum jam 12.00. Untuk pengiriman ke luar Jawa Barat dan seluruh Indonesia, kami menggunakan ekspedisi terpercaya dengan tarif sesuai jarak dan berat paket."
                    },
                    {
                      q: "Apa saja pilihan parcel yang tersedia di Lipink?",
                      a: "Kami menyediakan berbagai jenis parcel: parcel Lebaran (kurma, kue kering, sirup), parcel Natal (cookies, cokelat, dekorasi), parcel Imlek (kue keranjang, jeruk mandarin), hampers ulang tahun, parcel pernikahan/seserahan, dan parcel corporate. Harga mulai Rp50.000 hingga Rp2.000.000 sesuai kebutuhan."
                    },
                    {
                      q: "Bagaimana cara memesan parcel di Lipink Cirebon?",
                      a: "Pemesanan sangat mudah! Anda bisa menghubungi kami via WhatsApp di 0812-2220-8580, pilih parcel yang diinginkan, konfirmasi alamat pengiriman, lakukan pembayaran, dan parcel akan segera kami proses. Anda juga bisa berkunjung langsung ke toko kami di Jl. Garuda No.4, Pekiringan, Cirebon."
                    },
                    {
                      q: "Apakah bisa custom isi parcel sesuai keinginan?",
                      a: "Tentu bisa! Kami menerima pesanan custom parcel sesuai budget dan preferensi Anda. Anda bisa memilih sendiri isi parcel, jenis kemasan, dan kartu ucapan. Konsultasikan keinginan Anda dengan admin kami untuk mendapatkan rekomendasi terbaik."
                    },
                    {
                      q: "Apakah ada garansi untuk parcel yang dikirim?",
                      a: "Ya, kami memberikan garansi penggantian jika parcel rusak akibat kesalahan kami atau ekspedisi. Setiap parcel dikemas dengan bubble wrap, kardus tebal, dan packing khusus untuk memastikan parcel sampai dalam kondisi sempurna."
                    },
                    {
                      q: "Berapa lama waktu pengerjaan parcel?",
                      a: "Untuk parcel ready stock, pengerjaan hanya butuh 1-2 jam. Untuk parcel custom atau pesanan dalam jumlah besar, waktu pengerjaan 1-3 hari kerja tergantung kompleksitas. Kami sarankan memesan H-3 untuk hari raya agar tidak kehabisan stok."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        className="w-full px-4 py-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between gap-3"
                        onClick={(e) => {
                          const content = e.currentTarget.nextElementSibling as HTMLElement;
                          const icon = e.currentTarget.querySelector('svg');
                          if (content.style.maxHeight) {
                            content.style.maxHeight = '';
                            icon?.classList.remove('rotate-180');
                          } else {
                            content.style.maxHeight = content.scrollHeight + 'px';
                            icon?.classList.add('rotate-180');
                          }
                        }}
                      >
                        <span className="font-medium text-slate-700 text-sm">{faq.q}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0" />
                      </button>
                      <div className="max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
                        <p className="px-4 py-3 text-sm text-slate-600 bg-white">{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Lokasi Toko */}
              <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white">
                <h3 className="text-lg md:text-xl font-bold mb-4">Kunjungi Toko Parcel Lipink Cirebon</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Alamat Toko</p>
                        <p className="text-slate-300 text-sm">Jl. Garuda No.4, Pekiringan, Kec. Kesambi, Kota Cirebon, Jawa Barat 45131</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <a href="https://wa.me/628122208580" className="text-green-400 hover:text-green-300 text-sm">0812-2220-8580</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Jam Operasional</p>
                        <p className="text-slate-300 text-sm">Setiap hari, 08.00 - 21.00 WIB</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-sm text-slate-300 mb-3">Temukan kami juga di:</p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.instagram.com/lipink2003/" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Instagram</a>
                      <a href="https://shopee.co.id/lipink2003" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Shopee</a>
                      <a href="https://www.tokopedia.com/giftland" target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Tokopedia</a>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer SEO Text */}
              <nav className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">Informasi Lainnya</h3>
                <div className="flex flex-wrap justify-center gap-2 text-sm mb-4">
                  <Link to="/blog" className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded-full font-medium transition-colors">Blog & Tips Parcel</Link>
                  <Link to="/return-policy" className="bg-slate-50 text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-full font-medium transition-colors">Kebijakan Pengembalian</Link>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400 text-center leading-relaxed">
                    Lipink Parcel Cirebon - Toko parcel terpercaya untuk hampers Lebaran, parcel Natal, hampers Imlek, parcel ulang tahun, seserahan pernikahan, dan bingkisan corporate.
                    Melayani pengiriman ke Cirebon, Majalengka, Indramayu, Kuningan, dan seluruh Indonesia.
                  </p>
                </div>
              </nav>
            </div>

            {/* FAQPage Structured Data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Berapa ongkos kirim parcel ke Cirebon dan sekitarnya?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Ongkir mulai dari Rp25.000 untuk area Cirebon, Majalengka, Indramayu, dan Kuningan. Same-day delivery tersedia untuk Cirebon Kota. Bisa kirim se-Indonesia dengan minimal pembelian!"
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Apa saja pilihan parcel yang tersedia di Lipink?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Kami menyediakan parcel Lebaran, parcel Natal, parcel Imlek, hampers ulang tahun, parcel pernikahan, dan parcel corporate dengan harga mulai Rp50.000 hingga Rp2.000.000."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Bagaimana cara memesan parcel di Lipink Cirebon?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Anda bisa memesan via WhatsApp di 0812-2220-8580 atau kunjungi langsung toko kami di Jl. Garuda No.4, Pekiringan, Cirebon. Kami buka setiap hari pukul 08.00-21.00 WIB."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Apakah bisa custom isi parcel sesuai keinginan?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Ya, kami menerima pesanan custom parcel! Anda bisa memilih sendiri isi parcel sesuai budget dan preferensi. Hubungi admin kami untuk konsultasi gratis."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Apakah ada garansi untuk parcel yang dikirim?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Ya, kami memberikan garansi penggantian jika parcel rusak saat pengiriman. Setiap parcel dikemas dengan bubble wrap dan kardus tebal untuk keamanan maksimal."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Berapa lama waktu pengerjaan parcel?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Untuk parcel ready stock, pengerjaan hanya butuh 1-2 jam. Untuk parcel custom atau pesanan dalam jumlah besar, waktu pengerjaan 1-3 hari kerja."
                    }
                  }
                ]
              })
            }} />

            {/* 3. CATEGORY FEEDS */}
            <div id="catalog" className="container mx-auto px-4 space-y-3 md:space-y-4 pb-8 pt-2">
                {categoriesWithParcels.map((category, index) => (
                  <section 
                    key={category.id} 
                    className={`bg-white py-4 px-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 ${index > 1 ? 'content-visibility-auto' : ''}`}
                  >
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <h2 className="text-sm md:text-lg font-bold text-slate-800 flex items-center gap-2">
                               <span className="text-base md:text-xl">{getCategoryEmoji(category.name)}</span> 
                               {category.name}
                            </h2>
                            <Link to={`/produk/${category.slug}`} className="text-pink-600 text-xs md:text-sm font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all group">
                               Lihat Semua <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                        
                        <div className="relative -mx-4 px-4">
                          <div className="flex overflow-x-auto gap-2.5 md:gap-3 pb-2 snap-x snap-mandatory hide-scrollbar">
                            {category.parcels?.map((parcel: any) => (
                                <div key={parcel.id} className="w-[145px] md:w-[210px] flex-shrink-0 snap-start">
                                    <ParcelCard parcel={{
                                        ...parcel,
                                        image_url: getOptimizedImage(parcel.image_url, 400)
                                    }} />
                                </div>
                            ))}
                          </div>
                        </div>
                  </section>
                ))}
            </div>
          </>
        )}
      </main>

      {/* Floating WA Button */}
      <a 
        href={createWhatsAppUrl("Halo Admin, saya mau tanya produk parcel...")} 
        target="_blank" 
        rel="noreferrer" 
        className="fixed bottom-20 md:bottom-8 right-4 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 md:p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        aria-label="Chat WhatsApp"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        <span className="hidden md:inline font-semibold text-sm">Chat Admin</span>
      </a>

      <Suspense fallback={<div className="h-12 w-full bg-white" />}>
         <Footer />
      </Suspense>
    </>
  )
}