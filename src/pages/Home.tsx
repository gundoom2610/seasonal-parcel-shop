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
  Sparkles
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
  if (lower.includes('makanan') || lower.includes('food') || lower.includes('snack')) return '🍪'
  if (lower.includes('pecah') || lower.includes('belah') || lower.includes('keramik')) return '🍽️'
  if (lower.includes('buah') || lower.includes('fruit')) return '🍎'
  return '🎁'
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

  // --- 1. SMART SEO GENERATOR (OPTIMIZED 50-60 CHARS) ---
  const seoData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    // A. Default Home SEO
    // Logic: Brand + Main Keyword + Location
    // Length: ~52 chars
    if (!query) {
      return {
        title: "Toko Parcel & Hampers Cirebon Terlengkap | Lipink",
        description: "Pusat Parcel & Hampers di Cirebon sejak 2003. Menyediakan aneka parcel makanan, keramik, dan kue kering untuk Lebaran, Natal, Imlek. Pengiriman aman."
      }
    }

    // B. Holiday Specific SEO
    
    // 🎄 Natal SEO
    // Length: ~55 chars
    if (query.includes('natal') || query.includes('christmas')) {
      return {
        title: "Jual Parcel Natal & Hampers Christmas Cirebon 2024",
        description: "Kirim kehangatan Natal dengan koleksi Parcel Natal Cirebon terbaik. Tersedia hampers keramik, makanan, dan kue kering premium. Pesan sekarang!"
      }
    }

    // 🕌 Lebaran SEO
    // Length: ~58 chars
    if (query.includes('lebaran') || query.includes('fitri') || query.includes('idul')) {
      return {
        title: "Jual Parcel Lebaran Cirebon & Hampers Idul Fitri",
        description: "Koleksi Parcel Lebaran Cirebon terlengkap. Hantaran Idul Fitri mewah harga terjangkau untuk keluarga dan relasi bisnis. Gratis kartu ucapan."
      }
    }

    // 🧧 Imlek SEO
    // Length: ~50 chars
    if (query.includes('imlek') || query.includes('sincia') || query.includes('chinese')) {
      return {
        title: "Jual Parcel Imlek & Hampers Sincia Cirebon Hoki",
        description: "Sambut Tahun Baru Imlek dengan Parcel Imlek Cirebon yang membawa keberuntungan. Desain merah emas elegan, isi premium. Gong Xi Fa Cai!"
      }
    }

    // 🔍 Generic Search SEO
    // Template: "Jual [Keyword] Cirebon Murah | Lipink"
    const capitalizedQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
    return {
      title: `Jual ${capitalizedQuery} Cirebon Murah & Lengkap | Lipink`,
      description: `Sedang mencari ${searchQuery} di Cirebon? Dapatkan penawaran harga terbaik untuk ${searchQuery} dengan kualitas premium hanya di Lipink Parcel Cirebon.`
    }

  }, [searchQuery]);

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
          
          // Step A: Find Categories matching the query first
          const { data: matchingCategories } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', `%${searchQuery}%`)

          // Step B: Build Parcel Query (Name OR Category match)
          let query = supabase
            .from("parcels")
            .select(`*, category:categories(id, name, slug)`)
            .order("created_at", { ascending: false })

          const nameFilter = `name.ilike.%${searchQuery}%`
          let orFilter = nameFilter
          
          if (matchingCategories && matchingCategories.length > 0) {
            const categoryIds = matchingCategories.map(c => c.id).join(',')
            orFilter += `,category_id.in.(${categoryIds})`
          }

          query = query.or(orFilter)

          const { data, error } = await query

          if (error) throw error
          setSearchResults(data || [])
          
          setLoading(false)
          return 
        }

        // -------------------------------------------
        // 2. NORMAL HOMEPAGE MODE
        // -------------------------------------------
        setIsSearching(false)

        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true })

        if (categoriesData) setCategories(categoriesData)

        const { data: featuredData } = await supabase
          .from("parcels")
          .select(`*, category:categories(id, name, slug)`)
          .limit(10)
          .order("created_at", { ascending: false })

        if (featuredData) setFeaturedParcels(featuredData)

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
  }, [searchQuery])

  // --- VIEW: LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">
           {searchQuery ? `Mencari "${searchQuery}"...` : "Memuat halaman..."}
        </p>
      </div>
    )
  }

  // --- VIEW: SEARCH RESULTS ---
  if (isSearching) {
    return (
      <>
        {/* DYNAMIC SEO INJECTED HERE */}
        <SEO 
          title={seoData.title} 
          description={seoData.description} 
          url={`/?q=${encodeURIComponent(searchQuery)}`}
        />

        <main className="min-h-screen bg-[#F3F4F6] pb-24 font-sans pt-8">
          <div className="container mx-auto px-4">
              
              {/* Header */}
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <Search className="w-6 h-6 text-pink-600" />
                          <h1 className="text-2xl font-bold text-slate-800">
                              Hasil Pencarian
                          </h1>
                      </div>
                      <p className="text-slate-600">
                          Menampilkan hasil untuk <span className="font-bold text-pink-600">"{searchQuery}"</span>
                          <span className="text-slate-400 text-sm ml-2">({searchResults.length} produk)</span>
                      </p>
                  </div>
                  <Button 
                    onClick={() => setSearchParams({})} 
                    variant="outline"
                    className="w-fit"
                  >
                    Kembali ke Beranda
                  </Button>
              </div>

              {/* Results */}
              {searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                      {searchResults.map((parcel) => (
                          <div key={parcel.id} className="h-full">
                            <ParcelCard parcel={parcel} />
                          </div>
                      ))}
                  </div>
              ) : (
                  /* No Results Found */
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                      <div className="bg-slate-50 p-6 rounded-full mb-4">
                          <PackageX className="w-12 h-12 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Tidak ditemukan</h3>
                      <p className="text-slate-500 text-center max-w-xs mb-6">
                          Maaf, produk "{searchQuery}" tidak tersedia. Coba kata kunci lain seperti "Natal", "Lebaran", atau "Keramik".
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
        <Footer />
      </>
    )
  }

  // --- VIEW: NORMAL HOMEPAGE ---
  return (
    <>
      {/* DEFAULT SEO INJECTED HERE */}
      <SEO
        title={seoData.title}
        description={seoData.description}
        url="/"
      />

      <main className="min-h-screen bg-[#F3F4F6] pb-24 font-sans">
        
        {/* HERO SECTION */}
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

        {/* CATEGORY FEEDS */}
        <div id="catalog" className="container mx-auto px-4 space-y-4">
            {categoriesWithParcels.map((category) => (
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
            ))}
         </div>
      </main>

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