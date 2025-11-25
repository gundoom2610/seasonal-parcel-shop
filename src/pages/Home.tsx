"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { SEO } from "@/components/SEO"
import { ParcelCard } from "@/components/ParcelCard"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Star,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Search,
  PackageX
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

// --- HELPER: Get Emoji based on Category Name ---
const getCategoryEmoji = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('lebaran') || lower.includes('idul') || lower.includes('fitri')) return '🕌'
  if (lower.includes('natal') || lower.includes('christmas')) return '🎄'
  if (lower.includes('imlek') || lower.includes('chinese')) return '🧧'
  if (lower.includes('bayi') || lower.includes('baby') || lower.includes('lahiran')) return '👶'
  if (lower.includes('makanan') || lower.includes('food') || lower.includes('snack')) return '🍪'
  if (lower.includes('pecah') || lower.includes('belah') || lower.includes('keramik')) return '🍽️'
  if (lower.includes('buah') || lower.includes('fruit')) return '🍎'
  if (lower.includes('sembako')) return '🍚'
  if (lower.includes('ulang') || lower.includes('ultah') || lower.includes('birthday')) return '🎂'
  if (lower.includes('corporate') || lower.includes('kantor')) return '🏢'
  if (lower.includes('wedding') || lower.includes('nikah')) return '💍'
  return '🎁'
}

// --- HELPER: Category Styling ---
const getCategoryStyle = (index: number) => {
  const styles = [
    { bg: "bg-pink-100", border: "border-pink-200" },
    { bg: "bg-blue-100", border: "border-blue-200" },
    { bg: "bg-green-100", border: "border-green-200" },
    { bg: "bg-purple-100", border: "border-purple-200" },
    { bg: "bg-orange-100", border: "border-orange-200" },
    { bg: "bg-teal-100", border: "border-teal-200" },
  ]
  return styles[index % styles.length]
}

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
  
  const [loading, setLoading] = useState(true)

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // -------------------------------------------
        // 1. SEARCH MODE
        // -------------------------------------------
        if (searchQuery) {
          setIsSearching(true)
          
          const { data: searchData, error } = await supabase
            .from("parcels")
            .select(`*, category:categories(id, name, slug)`)
            .ilike('name', `%${searchQuery}%`) // Search by name (case insensitive)
            .order("created_at", { ascending: false })

          if (error) throw error
          if (searchData) setSearchResults(searchData)
          
          setLoading(false)
          return // Stop execution (don't fetch homepage data)
        }

        // -------------------------------------------
        // 2. NORMAL HOMEPAGE MODE
        // -------------------------------------------
        setIsSearching(false)

        // A. Fetch Categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true })

        if (categoriesData) setCategories(categoriesData)

        // B. Fetch Featured (Top 10)
        const { data: featuredData } = await supabase
          .from("parcels")
          .select(`*, category:categories(id, name, slug)`)
          .limit(10)
          .order("created_at", { ascending: false })

        if (featuredData) setFeaturedParcels(featuredData)

        // C. Fetch Products grouped by Category
        if (categoriesData) {
          const catsWithProducts = await Promise.all(
            categoriesData.map(async (category) => {
              const { data: pData } = await supabase
                .from("parcels")
                .select(`*, category:categories(id, name, slug)`)
                .eq("category_id", category.id)
                .order("created_at", { ascending: false })
                .limit(10) 
              return { ...category, parcels: pData || [] }
            })
          )
          setCategoriesWithParcels(catsWithProducts.filter(c => c.parcels && c.parcels.length > 0))
        }

        setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery]) // Re-run effect when URL search params change

  // --- VIEW: LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">
           {searchQuery ? "Mencari produk..." : "Menyiapkan etalase..."}
        </p>
      </div>
    )
  }

  // --- VIEW: SEARCH RESULTS ---
  if (isSearching) {
    return (
      <main className="min-h-screen bg-[#F3F4F6] pb-24 font-sans pt-6">
         <div className="container mx-auto px-4">
            
            {/* Search Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                   <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                       <Search className="w-6 h-6 text-pink-600" />
                       Hasil Pencarian
                   </h1>
                   <p className="text-slate-500 text-sm mt-1">
                       Menampilkan hasil untuk <span className="font-bold text-pink-600">"{searchQuery}"</span>
                   </p>
                </div>
                <Button 
                   onClick={() => setSearchParams({})}
                   variant="outline"
                   size="sm"
                   className="text-slate-500 border-slate-200"
                >
                   Reset
                </Button>
            </div>

            {/* Results Grid */}
            {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {searchResults.map((parcel) => (
                        <div key={parcel.id} className="w-full">
                           <ParcelCard parcel={parcel} />
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <PackageX className="w-16 h-16 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                        Maaf, kami tidak menemukan produk dengan nama "{searchQuery}". Coba kata kunci lain atau lihat kategori kami.
                    </p>
                    <Button 
                        onClick={() => setSearchParams({})} 
                        className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                        Lihat Semua Produk
                    </Button>
                </div>
            )}
         </div>
      </main>
    )
  }

  // --- VIEW: NORMAL HOMEPAGE ---
  return (
    <>
      <SEO
        title={`${SEO_CONFIG.business.name} | Official Store`}
        description={SEO_CONFIG.business.description}
        url="/"
      />

      <main className="min-h-screen bg-[#F3F4F6] pb-24 font-sans">
        
        {/* HERO SECTION */}
        <section className="bg-white pb-6 pt-4 lg:pt-8 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-600 to-purple-800 min-h-[200px] lg:min-h-[320px] flex items-center shadow-lg">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-20 px-6 lg:px-12 py-8 w-full md:w-2/3 text-white">
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold mb-3 border border-white/20 shadow-sm">
                  <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300 animate-pulse" />
                  <span className="tracking-wide uppercase">Official Store Cirebon</span>
                </div>
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
                 <img 
                    src="/hero-image.png" 
                    alt="Parcel Header" 
                    className="w-40 md:w-80 lg:w-[450px] object-contain object-bottom transform translate-y-2 md:translate-y-4 md:translate-x-4 drop-shadow-2xl" 
                 />
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY NAV */}
        <section className="bg-white py-5 shadow-sm border-t border-slate-50 mb-3">
          <div className="container mx-auto px-4">
            {categories.length > 0 ? (
              <div className="flex overflow-x-auto gap-3 lg:gap-8 pb-2 lg:justify-center no-scrollbar px-2">
                {categories.map((cat, idx) => {
                  const style = getCategoryStyle(idx);
                  const emoji = getCategoryEmoji(cat.name);
                  
                  return (
                    <Link
                      key={cat.id}
                      to={`/produk/${cat.slug}`}
                      className="flex flex-col items-center gap-2 min-w-[72px] group"
                    >
                      <div className={`w-12 h-12 lg:w-16 lg:h-16 ${style.bg} rounded-[20px] lg:rounded-[24px] flex items-center justify-center border ${style.border} transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md shadow-sm`}>
                         <span className="text-2xl lg:text-3xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform">
                           {emoji}
                         </span>
                      </div>
                      <span className="text-[10px] lg:text-xs font-semibold text-center text-slate-700 leading-tight line-clamp-2 max-w-[72px] group-hover:text-pink-600 transition-colors">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        {/* REKOMENDASI / TERLARIS */}
        {featuredParcels.length > 0 && (
          <section className="bg-white py-6 mb-3 border-y border-slate-100">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-600" />
                  <h2 className="text-lg lg:text-xl font-bold text-slate-800">Paling Laris</h2>
                </div>
              </div>
              <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {featuredParcels.map((parcel) => (
                  <div key={parcel.id} className="min-w-[150px] md:min-w-[180px] snap-start">
                     <ParcelCard parcel={parcel} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* STICKY FILTER BAR */}
        <div id="catalog" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
          <div className="container mx-auto px-4 py-3">
             <div className="flex overflow-x-auto gap-2 no-scrollbar">
                <Link to="/?">
                  <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full px-5 h-9 text-xs font-bold border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-200 bg-white"
                  >
                      Semua Produk
                  </Button>
                </Link>
                {categories.map((cat) => (
                    <Link key={cat.id} to={`/produk/${cat.slug}`}>
                      <Button 
                          variant="outline"
                          size="sm"
                          className="rounded-full px-5 h-9 text-xs font-bold whitespace-nowrap border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-200 bg-white"
                      >
                          {cat.name}
                      </Button>
                    </Link>
                ))}
             </div>
          </div>
        </div>

        {/* MAIN FEED */}
        <div className="container mx-auto px-4 pt-4">
             <div className="space-y-4">
                {categoriesWithParcels.map((category) => (
                    <div key={category.id} className="bg-white py-4 px-4 md:px-6 rounded-2xl shadow-sm border border-slate-100">
                          {/* Section Header */}
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                              <span>{getCategoryEmoji(category.name)}</span>
                              {category.name}
                            </h2>
                            <Link 
                              to={`/produk/${category.slug}`}
                              className="text-pink-600 h-8 text-xs font-bold hover:bg-pink-50 flex items-center gap-1 pr-0 px-2 rounded-md transition-colors"
                            >
                              Lihat Semua <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                          
                          {/* Horizontal Scroll Row */}
                          <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth hide-scrollbar snap-x">
                            {category.parcels?.map((parcel) => (
                                <div key={parcel.id} className="min-w-[160px] md:min-w-[200px] snap-start">
                                    <ParcelCard parcel={parcel} />
                                </div>
                            ))}
                          </div>
                    </div>
                ))}
             </div>
        </div>

      </main>

      {/* WhatsApp Floating Button */}
      <a 
        href={createWhatsAppUrl("Halo, saya mau tanya produk parcel")}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-4 z-50 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-all duration-300 flex items-center gap-2 animate-in slide-in-from-bottom-4"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden md:inline font-bold text-sm">Chat Admin</span>
      </a>

      <Footer />
    </>
  )
} 