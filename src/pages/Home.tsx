"use client"

import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { SEO } from "@/components/SEO"
import { ParcelCard } from "@/components/ParcelCard"
import { Button } from "@/components/ui/button"
import { getOptimizedImage } from "@/utils/imageOptimizer" // Import the helper
import {
  TrendingUp,
  ChevronRight,
  Search,
  PackageX,
  Sparkles,
  MessageCircle
} from "lucide-react"
import { createWhatsAppUrl } from "@/constants/whatsapp"

// --- LAZY LOAD NON-CRITICAL COMPONENTS ---
// Fixes "Eliminate render-blocking resources" by moving heavy footer off main bundle
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

// --- SEO CONFIGURATION ---
const SEO_CONFIG = {
  business: {
    name: "Lipink Parcel Cirebon",
    description: "Pusat Parcel & Hampers Terlengkap di Cirebon. Menyediakan parcel Lebaran, Natal, Imlek.",
    tagline: "Kirim Kebahagiaan, Sambung Silaturahmi",
  },
}

// ... (Interfaces for Category and Parcel remain the same) ...
interface Category { id: string; name: string; slug: string; parcels?: Parcel[] }
interface Parcel { id: string; name: string; slug: string; description: string; image_url: string; price: number; category: { id: string; name: string; slug: string }; created_at?: string }

const getCategoryEmoji = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('lebaran')) return '🕌'
  if (lower.includes('natal')) return '🎄'
  if (lower.includes('imlek')) return '🧧'
  return '🎁'
}

const ParcelSkeleton = () => (
  <div className="min-w-[150px] md:min-w-[180px] h-64 bg-slate-200 rounded-xl animate-pulse snap-start" />
)

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("q") || ""
  
  const [categoriesWithParcels, setCategoriesWithParcels] = useState<Category[]>([])
  const [featuredParcels, setFeaturedParcels] = useState<Parcel[]>([])
  const [searchResults, setSearchResults] = useState<Parcel[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  // --- SEO LOGIC (Kept largely the same) ---
  const seoData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) {
      return {
        title: "Toko Parcel & Hampers Cirebon Terlengkap | Lipink",
        description: SEO_CONFIG.business.description
      }
    }
    const capitalizedQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
    return {
      title: `Jual ${capitalizedQuery} Cirebon Murah & Lengkap | Lipink`,
      description: `Sedang mencari ${searchQuery} di Cirebon? Dapatkan penawaran harga terbaik.`
    }
  }, [searchQuery]);

  // --- DATA FETCHING (Kept the same) ---
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true)
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
          if (error && isMounted) throw error
          if (isMounted) {
            setSearchResults(data || [])
            setLoading(false)
          }
          return 
        }

        if (isMounted) setIsSearching(false)
        const { data: categoriesData } = await supabase.from("categories").select("*").order("name", { ascending: true })
        const { data: featuredData } = await supabase.from("parcels").select(`*, category:categories(id, name, slug)`).limit(10).order("created_at", { ascending: false })
        if (featuredData && isMounted) setFeaturedParcels(featuredData)

        if (categoriesData) {
          const catsWithProducts = await Promise.all(
            categoriesData.map(async (category) => {
              const { data: pData } = await supabase.from("parcels").select(`*, category:categories(id, name, slug)`).eq("category_id", category.id).order("created_at", { ascending: false }).limit(10) 
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
        url={searchQuery ? `/?q=${encodeURIComponent(searchQuery)}` : "/"}
      />

      {isSearching ? (
        <main className="min-h-screen bg-[#F3F4F6] pb-24 font-sans pt-8">
           {/* ... Search UI (Same as before) ... */}
           {/* Ensure ParcelCard uses getOptimizedImage internally or pass it here */}
        </main>
      ) : (
        <main className="min-h-screen bg-[#F3F4F6] pb-24 font-sans">
          
          {/* HERO SECTION - OPTIMIZED FOR LCP */}
          <section className="bg-white pb-6 pt-4 lg:pt-8 shadow-sm content-visibility-auto">
            <div className="container mx-auto px-4">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-600 to-purple-800 min-h-[200px] lg:min-h-[300px] flex items-center shadow-lg">
                
                {/* CSS Pattern (Lightweight) */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                
                <div className="relative z-20 px-6 lg:px-12 py-8 w-full md:w-2/3 text-white">
                  {/* ... Text Content ... */}
                  <h1 className="text-2xl lg:text-5xl font-extrabold leading-tight mb-3 drop-shadow-sm">
                    {SEO_CONFIG.business.tagline}
                  </h1>
                  <p className="text-pink-100 text-xs lg:text-lg mb-6 max-w-[80%] md:max-w-lg leading-relaxed opacity-90">
                    {SEO_CONFIG.business.description}
                  </p>
                  <Button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-pink-700 font-bold rounded-xl px-6 h-10 lg:h-12 shadow-md">
                    Belanja Sekarang
                  </Button>
                </div>

                {/* --- LCP OPTIMIZATION HERE --- */}
                <div className="absolute right-0 bottom-0 z-10 w-1/2 md:w-auto h-full flex items-end justify-end pointer-events-none">
                   <div className="absolute inset-0 bg-gradient-to-t from-purple-800/80 via-transparent to-transparent md:hidden"></div>
                   
                   {/* 1. Use WebP if possible for hero-image. 
                       2. fetchPriority="high" tells browser to load this BEFORE JS 
                       3. Explicit width/height prevents layout shift */}
                   <img 
                      src="/hero-image.png" 
                      alt="Parcel Cirebon Header" 
                      fetchPriority="high" 
                      loading="eager"
                      width="450"
                      height="450"
                      className="w-40 md:w-80 lg:w-[450px] object-contain object-bottom transform translate-y-2 md:translate-y-4 md:translate-x-4 drop-shadow-2xl" 
                   />
                </div>
              </div>
            </div>
          </section>

          {/* FEATURED SECTION */}
          <section className="bg-white py-6 mb-3 border-y border-slate-100">
             {/* ... Header ... */}
              <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {loading ? [1,2,3].map(i => <div key={i} className="min-w-[150px]"><ParcelSkeleton /></div>) : (
                    featuredParcels.map((parcel) => (
                      <div key={parcel.id} className="min-w-[150px] md:min-w-[180px] snap-start">
                         {/* Pass optimized prop if your card supports it, or update ParcelCard to use helper */}
                         <ParcelCard parcel={{
                             ...parcel,
                             image_url: getOptimizedImage(parcel.image_url, 300) // Resize to 300px WebP
                         }} />
                      </div>
                    ))
                )}
              </div>
          </section>

          {/* CATALOG SECTIONS */}
          <div id="catalog" className="container mx-auto px-4 space-y-4">
              {loading ? [1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse"/>) : (
                categoriesWithParcels.map((category) => (
                  <div key={category.id} className="bg-white py-4 px-4 rounded-2xl shadow-sm border border-slate-100">
                        {/* ... Header ... */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-slate-800">{getCategoryEmoji(category.name)} {category.name}</h2>
                            <Link to={`/produk/${category.slug}`} className="text-pink-600 text-xs font-bold">Lihat Semua</Link>
                        </div>
                        
                        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scroll-smooth hide-scrollbar snap-x">
                          {category.parcels?.map((parcel: any) => (
                              <div key={parcel.id} className="min-w-[160px] md:min-w-[200px] snap-start">
                                  <ParcelCard parcel={{
                                      ...parcel,
                                      // Lazy loading applied automatically by browser for below-fold images if loading="lazy" is in Card
                                      image_url: getOptimizedImage(parcel.image_url, 300)
                                  }} />
                              </div>
                          ))}
                        </div>
                  </div>
                ))
              )}
          </div>
        </main>
      )}

      <a href={createWhatsAppUrl("Halo...")} target="_blank" rel="noreferrer" className="fixed bottom-6 right-4 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg">
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Footer Lazy Loaded inside Suspense */}
      <Suspense fallback={<div className="h-20 bg-slate-100" />}>
         <Footer />
      </Suspense>
    </>
  )
}