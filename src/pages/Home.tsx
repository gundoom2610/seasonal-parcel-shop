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
  Search,
  PackageX,
  Sparkles,
  MessageCircle
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
        description: `Cari Parcel Terbaik di Cirebon? Lipink Parcel menyediakan ${seasonalSEO.desc} untuk silaturahmi keluarga dan kerabat. Harga mulai Rp50.000. Gratis ongkir area Cirebon!`,
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

            {/* 2. SEASONAL FEATURED SECTION */}
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

            {/* STATIC SEO CONTENT - Keywords matching H1 for crawlers */}
            <section className="container mx-auto px-4 py-6 bg-white rounded-xl border border-slate-100 my-4">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Parcel Terbaik Cirebon untuk Silaturahmi Keluarga</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Lipink Parcel menyediakan parcel terbaik di Cirebon untuk momen silaturahmi keluarga Anda.
                Dengan pengalaman lebih dari 6 tahun, kami menghadirkan hampers berkualitas premium untuk
                Lebaran, Natal, dan Imlek. Pilih parcel Cirebon terbaik dengan harga mulai Rp50.000.
                Gratis ongkir untuk pengiriman area Cirebon!
              </p>
              <nav className="flex flex-wrap justify-center gap-3 text-sm border-t border-slate-100 pt-4">
                <Link to="/produk/parcel-lebaran" className="text-pink-600 hover:text-pink-700 font-medium">Parcel Lebaran</Link>
                <span className="text-slate-300">|</span>
                <Link to="/produk/parcel-natal" className="text-pink-600 hover:text-pink-700 font-medium">Parcel Natal</Link>
                <span className="text-slate-300">|</span>
                <Link to="/produk/parcel-imlek" className="text-pink-600 hover:text-pink-700 font-medium">Parcel Imlek</Link>
                <span className="text-slate-300">|</span>
                <Link to="/produk/hampers-imlek" className="text-pink-600 hover:text-pink-700 font-medium">Hampers Imlek</Link>
                <span className="text-slate-300">|</span>
                <Link to="/blog" className="text-purple-600 hover:text-purple-700 font-medium">Blog</Link>
                <span className="text-slate-300">|</span>
                <Link to="/return-policy" className="text-slate-600 hover:text-slate-700 font-medium">Kebijakan Pengembalian</Link>
              </nav>
            </section>

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