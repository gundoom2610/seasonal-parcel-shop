"use client"

import { useState, useEffect, useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { SEO } from "@/components/SEO"
import { ParcelCard } from "@/components/ParcelCard"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  ChevronRight,
  Search,
  PackageX,
  Sparkles,
  MessageCircle,
  Loader2
} from "lucide-react"
import { createWhatsAppUrl } from "@/constants/whatsapp"

// --- SEO CONFIGURATION ---
const SEO_CONFIG = {
  business: {
    name: "Lipink Parcel Cirebon",
    description: "Pusat Parcel & Hampers Terlengkap di Cirebon. Menyediakan parcel Lebaran, Natal, Imlek, dan Kado Spesial.",
    tagline: "Kirim Kebahagiaan, Sambung Silaturahmi",
  },
  metrics: { rating: 4.9, reviewCount: 1200 },
}

// --- TYPES ---
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parcels?: Parcel[]
}

interface Parcel {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  price: number
  category: { id: string; name: string; slug: string }
  rating?: number
  reviews_count?: number
  created_at?: string
}

// --- HELPER: Get Emoji ---
const getCategoryEmoji = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('lebaran') || lower.includes('idul') || lower.includes('fitri')) return '🕌'
  if (lower.includes('natal') || lower.includes('christmas')) return '🎄'
  if (lower.includes('imlek') || lower.includes('chinese')) return '🧧'
  if (lower.includes('makanan') || lower.includes('food') || lower.includes('snack')) return '🍪'
  if (lower.includes('pecah') || lower.includes('belah') || lower.includes('keramik')) return '🍽️'
  if (lower.includes('buah') || lower.includes('fruit')) return '🍎'
  return '🎁'
}

// --- COMPONENT: PRODUCT SKELETON (For loading state) ---
const ParcelSkeleton = () => (
  <div className="min-w-[150px] md:min-w-[180px] h-64 bg-slate-200 rounded-xl animate-pulse snap-start" />
)

export const Home = () => {
  // --- STATE ---
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("q") || ""

  // Data States
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesWithParcels, setCategoriesWithParcels] = useState<Category[]>([])
  const [featuredParcels, setFeaturedParcels] = useState<Parcel[]>([])
  
  // Search State
  const [searchResults, setSearchResults] = useState<Parcel[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Loading State
  const [loading, setLoading] = useState(true)

  // --- SEO LOGIC ---
  const seoData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) {
      return {
        title: "Toko Parcel & Hampers Cirebon Terlengkap | Lipink",
        description: "Pusat Parcel & Hampers di Cirebon sejak 2003. Menyediakan aneka parcel makanan, keramik, dan kue kering untuk Lebaran, Natal, Imlek. Pengiriman aman."
      }
    }
    // ... (Keep existing SEO logic logic here) ...
    // Note: Copied logic for brevity
    const capitalizedQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
    return {
      title: `Jual ${capitalizedQuery} Cirebon Murah & Lengkap | Lipink`,
      description: `Sedang mencari ${searchQuery} di Cirebon? Dapatkan penawaran harga terbaik.`
    }
  }, [searchQuery]);

  // --- DATA FETCHING ---
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Handle Search Logic
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

        // Handle Home Logic
        if (isMounted) setIsSearching(false)
        const { data: categoriesData } = await supabase.from("categories").select("*").order("name", { ascending: true })
        if (categoriesData && isMounted) setCategories(categoriesData)

        const { data: featuredData } = await supabase.from("parcels").select(`*, category:categories(id, name, slug)`).limit(10).order("created_at", { ascending: false })
        if (featuredData && isMounted) setFeaturedParcels(featuredData)

        if (categoriesData) {
          const catsWithProducts = await Promise.all(
            categoriesData.map(async (category) => {
              const { data: pData } = await supabase.from("parcels").select(`*, category:categories(id, name, slug)`).eq("category_id", category.id).order("created_at", { ascending: false }).limit(10) 
              return { ...category, parcels: pData || [] }
            })
          )
          if (isMounted) {
            setCategoriesWithParcels(catsWithProducts.filter(c => c.parcels && c.parcels.length > 0))
          }
        }
        if (isMounted) setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [searchQuery])

  // =========================================================
  // RENDER STRATEGY: 
  // We NEVER return early. We always render SEO + Structure.
  // =========================================================

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        url={searchQuery ? `/?q=${encodeURIComponent(searchQuery)}` : "/"}
      />

      {/* --- SCENARIO 1: SEARCH MODE --- */}
      {isSearching ? (
        <main className="min-h-screen bg-[#F3F4F6] pb-24 font-sans pt-8">
          <div className="container mx-auto px-4">
            
            {/* Header / H1 - Always Visible */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-6 h-6 text-pink-600" />
                  <h1 className="text-2xl font-bold text-slate-800">
                    {/* If loading, keep the H1 but maybe show a spinner icon next to it */}
                    Hasil Pencarian {loading && <span className="inline-block w-4 h-4 ml-2 animate-spin border-2 border-pink-500 rounded-full border-t-transparent"/>}
                  </h1>
                </div>
                <p className="text-slate-600">
                  Menampilkan hasil untuk <span className="font-bold text-pink-600">"{searchQuery}"</span>
                </p>
              </div>
              <Button onClick={() => setSearchParams({})} variant="outline" className="w-fit">
                Kembali ke Beranda
              </Button>
            </div>

            {/* Content: Loading Skeleton OR Real Data */}
            {loading ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {[1,2,3,4,5,6,7,8,9,10].map(i => <ParcelSkeleton key={i} />)}
               </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {searchResults.map((parcel) => (
                  <div key={parcel.id} className="h-full">
                    <ParcelCard parcel={parcel} />
                  </div>
                ))}
              </div>
            ) : (
              /* No Results */
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <PackageX className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Tidak ditemukan</h3>
                <p className="text-slate-500 text-center max-w-xs mb-6">
                  Maaf, produk "{searchQuery}" tidak tersedia.
                </p>
                <Button onClick={() => setSearchParams({})} className="bg-pink-600 hover:bg-pink-700 text-white">
                  Lihat Semua Produk
                </Button>
              </div>
            )}
          </div>
        </main>
      ) : (
        /* --- SCENARIO 2: HOME MODE --- */
        <main className="min-h-screen bg-[#F3F4F6] pb-24 font-sans">
          
          {/* HERO SECTION - Always Visible (Contains H1) */}
          {/* This ensures SEO Bots see the H1 immediately */}
          <section className="bg-white pb-6 pt-4 lg:pt-8 shadow-sm">
            <div className="container mx-auto px-4">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-600 to-purple-800 min-h-[200px] lg:min-h-[300px] flex items-center shadow-lg">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-20 px-6 lg:px-12 py-8 w-full md:w-2/3 text-white">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold mb-3 border border-white/20 shadow-sm">
                    <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300 animate-pulse" />
                    <span className="tracking-wide uppercase">Official Store Cirebon</span>
                  </div>
                  {/* VITAL FOR SEO: H1 IS HERE */}
                  <h1 className="text-2xl lg:text-5xl font-extrabold leading-tight mb-3 drop-shadow-sm">
                    {SEO_CONFIG.business.tagline}
                  </h1>
                  <p className="text-pink-100 text-xs lg:text-lg mb-6 max-w-[80%] md:max-w-lg leading-relaxed opacity-90">
                    {SEO_CONFIG.business.description}
                  </p>
                  <Button 
                    onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-pink-700 hover:bg-pink-50 border-none font-bold rounded-xl px-6 h-10 lg:h-12 shadow-md hover:shadow-lg transition-all"
                  >
                    Belanja Sekarang
                  </Button>
                </div>

                <div className="absolute right-0 bottom-0 z-10 w-1/2 md:w-auto h-full flex items-end justify-end pointer-events-none">
                   <div className="absolute inset-0 bg-gradient-to-t from-purple-800/80 via-transparent to-transparent md:hidden"></div>
                   <img src="/hero-image.png" alt="Parcel Header" className="w-40 md:w-80 lg:w-[450px] object-contain object-bottom transform translate-y-2 md:translate-y-4 md:translate-x-4 drop-shadow-2xl" />
                </div>
              </div>
            </div>
          </section>

          {/* REKOMENDASI / TERLARIS */}
          {/* While loading, we show skeletons instead of hiding the section completely */}
          <section className="bg-white py-6 mb-3 border-y border-slate-100">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-600" />
                  <h2 className="text-lg lg:text-xl font-bold text-slate-800">Paling Laris</h2>
                </div>
              </div>
              
              <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {loading ? (
                    // Skeleton Loading for Trending
                    [1,2,3,4].map(i => <div key={i} className="min-w-[150px]"><ParcelSkeleton /></div>)
                ) : (
                    featuredParcels.map((parcel) => (
                      <div key={parcel.id} className="min-w-[150px] md:min-w-[180px] snap-start">
                         <ParcelCard parcel={parcel} />
                      </div>
                    ))
                )}
              </div>
            </div>
          </section>

          {/* CATALOG SECTIONS */}
          <div id="catalog" className="container mx-auto px-4 space-y-4">
              {loading ? (
                // Skeleton Loading for Categories
                [1,2,3].map(i => (
                  <div key={i} className="bg-white py-4 px-4 rounded-2xl shadow-sm border border-slate-100 h-64 animate-pulse">
                     <div className="h-6 w-1/3 bg-slate-200 rounded mb-4" />
                     <div className="flex gap-4 overflow-hidden">
                        <div className="h-40 w-32 bg-slate-200 rounded" />
                        <div className="h-40 w-32 bg-slate-200 rounded" />
                        <div className="h-40 w-32 bg-slate-200 rounded" />
                     </div>
                  </div>
                ))
              ) : (
                categoriesWithParcels.map((category) => (
                  <div key={category.id} className="bg-white py-4 px-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                             <span>{getCategoryEmoji(category.name)}</span>
                             {category.name}
                          </h2>
                          <Link to={`/produk/${category.slug}`} className="text-pink-600 text-xs font-bold flex items-center">
                            Lihat Semua <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scroll-smooth hide-scrollbar snap-x">
                          {category.parcels?.map((parcel: any) => (
                              <div key={parcel.id} className="min-w-[160px] md:min-w-[200px] snap-start">
                                  <ParcelCard parcel={parcel} />
                              </div>
                          ))}
                        </div>
                  </div>
                ))
              )}
          </div>
        </main>
      )}

      {/* Floating Chat Button */}
      <a 
        href={createWhatsAppUrl("Halo, saya mau tanya produk parcel")}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-4 z-50 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-all duration-300 flex items-center gap-2"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden md:inline font-bold text-sm">Chat Admin</span>
      </a>

      <Footer />
    </>
  )
}