"use client"

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { SEO } from "@/components/SEO"
import { ParcelCard } from "@/components/ParcelCard"
import { getOptimizedImage } from "@/utils/imageOptimizer"
import { trackEvent } from "@/utils/analytics"

// Lazy load Footer for better initial load
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })))
import {
  Grid,
  SortAsc,
  ChevronDown,
  Tag,
  Package,
  Shield,
  Truck,
  Heart,
  Star,
  Filter,
  X,
  MapPin,
  Clock,
  Award,
  Users,
  Zap,
  Gift,
} from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
}

interface Parcel {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  price: number
  category: Category
  rating?: number
  reviews_count?: number
  discount_percentage?: number
  created_at?: string
}

// SEO Keywords for better search visibility
const CATEGORY_SEO_KEYWORDS = {
  lebaran: "parcel lebaran cirebon, hampers lebaran, parcel idul fitri, kado lebaran, bingkisan lebaran cirebon",
  natal: "parcel natal cirebon, hampers natal, kado natal, bingkisan natal, christmas gift cirebon",
  imlek: "parcel imlek cirebon, hampers imlek, kado sincia, bingkisan imlek, chinese new year gift cirebon",
  default: "parcel cirebon, hampers cirebon, toko parcel, jual parcel, bingkisan cirebon"
};

const getCategoryKeywords = (categoryName: string): string => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('lebaran')) return CATEGORY_SEO_KEYWORDS.lebaran;
  if (lower.includes('natal')) return CATEGORY_SEO_KEYWORDS.natal;
  if (lower.includes('imlek')) return CATEGORY_SEO_KEYWORDS.imlek;
  return CATEGORY_SEO_KEYWORDS.default;
};

export const SEO_CONFIG = {
  siteName: "Lipink Parcel Cirebon",
  siteUrl: "https://www.parcelcirebon.com",
  businessName: "Lipink Parcel Cirebon",
  businessType: "LocalBusiness",
  areaServed: ["Cirebon", "Majalengka", "Indramayu", "Kuningan"],
  description:
    "Pusat Parcel & Hampers Terlengkap di Cirebon. Menyediakan parcel Lebaran, Natal, Imlek, dan Kado Spesial dengan kualitas premium dan pengiriman aman ke seluruh wilayah Ciayumajakuning.",
  keywords:
    "parcel cirebon, hampers cirebon, toko parcel cirebon, parcel lebaran cirebon, parcel natal cirebon, parcel imlek cirebon, hampers majalengka, hampers indramayu, kado cirebon",
  author: "Lipink Parcel Cirebon",
  telephone: "+62 812-2220-8580",
  email: "hello@parcelcirebon.com",
  address: {
    streetAddress: "Jl. Garuda No.4, Pekiringan, Kec. Kesambi",
    addressLocality: "Kota Cirebon",
    addressRegion: "Jawa Barat",
    postalCode: "45131",
    addressCountry: "ID",
  },
  socialMedia: {
    instagram: "https://www.instagram.com/lipink2003/",
    facebook: "https://m.facebook.com/happybeargiftland/",
    whatsapp: "https://api.whatsapp.com/send?phone=628122208580",
    shopee: "https://shopee.co.id/lipink2003",
    tokopedia: "https://www.tokopedia.com/giftland",
  },
}

// Generate JSON-LD structured data
const generateJsonLd = (category: Category, parcels: Parcel[]) => {
  const minPrice = parcels.length > 0 ? Math.min(...parcels.map((p) => p.price)) : 0
  const maxPrice = parcels.length > 0 ? Math.max(...parcels.map((p) => p.price)) : 0
  const avgRating =
    parcels.length > 0
      ? Math.round((parcels.reduce((acc, p) => acc + (p.rating || 4.5), 0) / parcels.length) * 10) / 10
      : 4.5

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SEO_CONFIG.siteUrl}/produk/${category.slug}`,
        url: `${SEO_CONFIG.siteUrl}/produk/${category.slug}`,
        name: `${category.name} Premium - ${SEO_CONFIG.siteName}`,
        description: `Koleksi ${category.name} premium dengan ${parcels.length} produk berkualitas. Harga mulai Rp${minPrice.toLocaleString("id-ID")}. Pengiriman ke Cirebon, Majalengka, Indramayu.`,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SEO_CONFIG.siteUrl}/#website`,
          url: SEO_CONFIG.siteUrl,
          name: SEO_CONFIG.siteName,
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Beranda",
              item: SEO_CONFIG.siteUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Produk",
              item: `${SEO_CONFIG.siteUrl}/produk`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `${SEO_CONFIG.siteUrl}/produk/${category.slug}`,
            },
          ],
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SEO_CONFIG.siteUrl}/#business`,
        name: SEO_CONFIG.businessName,
        description: SEO_CONFIG.description,
        url: SEO_CONFIG.siteUrl,
        telephone: SEO_CONFIG.telephone,
        email: SEO_CONFIG.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: SEO_CONFIG.address.streetAddress,
          addressLocality: SEO_CONFIG.address.addressLocality,
          addressRegion: SEO_CONFIG.address.addressRegion,
          postalCode: SEO_CONFIG.address.postalCode,
          addressCountry: SEO_CONFIG.address.addressCountry,
        },
        areaServed: SEO_CONFIG.areaServed.map((area) => ({
          "@type": "City",
          name: area,
        })),
        sameAs: Object.values(SEO_CONFIG.socialMedia),
      },
      {
        "@type": "CollectionPage",
        "@id": `${SEO_CONFIG.siteUrl}/produk/${category.slug}#collection`,
        name: `Koleksi ${category.name}`,
        description: category.description || `Temukan ${parcels.length} produk ${category.name} berkualitas premium`,
        numberOfItems: parcels.length,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          lowPrice: minPrice,
          highPrice: maxPrice,
          offerCount: parcels.length,
          availability: "https://schema.org/InStock",
        },
        aggregateRating:
          parcels.length > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: avgRating,
                reviewCount: parcels.reduce((acc, p) => acc + (p.reviews_count || 0), 0),
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
      },
    ],
  }
}

export const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high" | "popular">("newest")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)

  // Sort options - defined as constant
  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "price_low", label: "Harga Terendah" },
    { value: "price_high", label: "Harga Tertinggi" },
    { value: "popular", label: "Terpopuler" },
  ]

  // Memoize expensive calculations - MUST be before any early returns
  const { minPrice, maxPrice, avgRating } = useMemo(() => {
    if (parcels.length === 0) return { minPrice: 0, maxPrice: 0, avgRating: 4.5 }
    const prices = parcels.map(p => p.price)
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgRating: Math.round((parcels.reduce((acc, p) => acc + (p.rating || 4.5), 0) / parcels.length) * 10) / 10
    }
  }, [parcels])

  // Memoize SEO data for this category
  const categoryKeywords = useMemo(() => 
    category ? getCategoryKeywords(category.name) : CATEGORY_SEO_KEYWORDS.default
  , [category])

  // Memoize active filters count
  const activeFiltersCount = useMemo(() =>
    (selectedRating > 0 ? 1 : 0) +
    (showDiscountOnly ? 1 : 0) +
    (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0)
  , [selectedRating, showDiscountOnly, priceRange, minPrice, maxPrice])

  // Memoized filter and sort parcels for performance
  const filteredAndSortedParcels = useMemo(() => {
    return [...parcels]
      .filter((parcel) => {
        if (parcel.price < priceRange[0] || parcel.price > priceRange[1]) return false
        if (selectedRating > 0 && selectedRating < 4 && (parcel.rating || 0) < selectedRating) return false
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price_low":
            return a.price - b.price
          case "price_high":
            return b.price - a.price
          case "popular":
            return (b.reviews_count || 0) - (a.reviews_count || 0)
          default:
            return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
        }
      })
  }, [parcels, priceRange, selectedRating, sortBy])

  // Optimized data fetching with proper loading states
  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return

      try {
        setLoading(true)

        // Fetch category first for immediate page render
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", categorySlug)
          .single()

        if (categoryError) throw categoryError

        if (categoryData) {
          setCategory(categoryData)
          setLoading(false) // Allow page to render with category info

          // Then fetch parcels in background
          const { data: parcelsData, error: parcelsError } = await supabase
            .from("parcels")
            .select(`
              *,
              category:categories(id, name, slug)
            `)
            .eq("category_id", categoryData.id)
            .order("created_at", { ascending: false })

          if (parcelsError) throw parcelsError

          setParcels(parcelsData || [])
          setDataLoaded(true)

          // Set initial price range based on actual data
          if (parcelsData && parcelsData.length > 0) {
            const prices = parcelsData.map((p) => p.price)
            setPriceRange([Math.min(...prices), Math.max(...prices)])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [categorySlug])

  // Scroll to top when category changes
  useEffect(() => {
    if (categorySlug) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }, [categorySlug])

  // Track category view
  useEffect(() => {
    if (category && dataLoaded) {
      trackEvent('view_item_list', {
        item_list_id: category.id,
        item_list_name: category.name,
        items_count: parcels.length,
      })
    }
  }, [category, dataLoaded, parcels.length])

  // Loading skeleton for initial page load
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Hero skeleton */}
            <div className="text-center space-y-6 py-12">
              <div className="h-16 bg-gradient-to-r from-pink-200 to-purple-300 rounded-2xl w-2/3 mx-auto"></div>
              <div className="h-6 bg-pink-200 rounded-xl w-4/5 mx-auto"></div>
              <div className="flex justify-center gap-4 mt-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-pink-200 rounded-2xl w-32"></div>
                ))}
              </div>
            </div>

            {/* Filter skeleton */}
            <div className="bg-white/70 rounded-3xl p-6">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-pink-200 rounded-xl w-40"></div>
                <div className="h-10 bg-pink-200 rounded-2xl w-32"></div>
              </div>
            </div>

            {/* Products grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/70 rounded-3xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-br from-pink-200 to-purple-300 aspect-square"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-pink-200 rounded-xl"></div>
                    <div className="h-4 bg-pink-200 rounded-lg w-3/4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-pink-200 rounded-xl w-1/2"></div>
                      <div className="h-10 bg-pink-200 rounded-full w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Grid className="w-16 h-16 text-pink-500" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Kategori Tidak Ditemukan
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Kategori yang Anda cari tidak tersedia atau mungkin telah dipindahkan.
          </p>
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={`Jual ${category.name} Cirebon Terlengkap & Murah | ${SEO_CONFIG.siteName}`}
        description={`Beli ${category.name} berkualitas premium di ${SEO_CONFIG.businessName}. ✓ ${parcels.length}+ pilihan produk ✓ Harga mulai Rp${minPrice.toLocaleString("id-ID")} ✓ Pengiriman Cirebon, Majalengka, Indramayu. Pesan sekarang!`}
        url={`/produk/${category.slug}`}
        canonical={`${SEO_CONFIG.siteUrl}/produk/${category.slug}`}
        image={category.image_url}
        type="website"
        keywords={`${category.name}, ${categoryKeywords}, ${SEO_CONFIG.keywords}`}
      />
      {dataLoaded && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateJsonLd(category, parcels)),
          }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Clean Modern Hero Section */}
          <div className="text-center py-8 md:py-12 mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              {category.name}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              {category.description ||
                `Temukan koleksi ${category.name} eksklusif yang dirancang khusus untuk momen istimewa Anda.`}
            </p>

            {/* Clean Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8 px-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full shadow-sm border border-pink-100">
                <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                <span className="text-xs md:text-sm font-medium text-gray-700">Garansi Kualitas</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full shadow-sm border border-pink-100">
                <Truck className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                <span className="text-xs md:text-sm font-medium text-gray-700">Pengiriman Cirebon</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full shadow-sm border border-pink-100">
                <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                <span className="text-xs md:text-sm font-medium text-gray-700">Terpercaya</span>
              </div>
            </div>
          </div>

          {/* Special Product Description - Shows when discount filter is active */}
          {showDiscountOnly && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 md:p-6 mb-6 shadow-lg">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-orange-800 mb-2">Produk Spesial</h3>
                  <p className="text-sm md:text-base text-orange-700 leading-relaxed">
                    Kami sedang ada diskon 20% untuk pemesanan via website. Semua produk dalam kategori ini mendapat
                    perlakuan khusus dengan kemasan premium dan quality control ekstra ketat untuk memastikan kepuasan
                    Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tokopedia/Shopee Style Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-6 border border-pink-100 sticky top-4 z-30">
            <div className="p-3 md:p-4">
              <div className="flex items-center justify-between gap-2 md:gap-4">
                {/* Left side - Results count and filters */}
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-xs md:text-sm text-gray-600">
                    {filteredAndSortedParcels.length} dari {parcels.length} produk
                  </span>

                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg border border-pink-200 hover:border-pink-300 transition-colors relative"
                  >
                    <Filter className="w-3 h-3 md:w-4 md:h-4 text-pink-600" />
                    <span className="text-xs md:text-sm font-medium text-gray-700">Filter</span>
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Active filters display - Hidden on mobile */}
                  <div className="hidden lg:flex items-center gap-2">
                    {selectedRating > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <Star className="w-3 h-3" />
                        {selectedRating}+ bintang
                        <button onClick={() => setSelectedRating(0)} className="ml-1 hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {showDiscountOnly && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-orange-700 rounded-full text-sm">
                        <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">%</span>
                        </div>
                        Produk Spesial
                        <button onClick={() => setShowDiscountOnly(false)} className="ml-1 hover:text-orange-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side - Sort */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg border border-pink-200 hover:border-pink-300 transition-colors"
                  >
                    <SortAsc className="w-3 h-3 md:w-4 md:h-4 text-pink-600" />
                    <span className="text-xs md:text-sm font-medium text-gray-700 hidden sm:inline">
                      {sortOptions.find((opt) => opt.value === sortBy)?.label}
                    </span>
                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-pink-600" />
                  </button>

                  {showSortMenu && (
                    <div className="absolute top-full right-0 mt-2 w-40 md:w-48 bg-white rounded-xl shadow-xl border border-pink-200 z-40 overflow-hidden">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as any)
                            setShowSortMenu(false)
                          }}
                          className={`w-full text-left px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm transition-colors ${
                            sortBy === option.value
                              ? "bg-pink-50 text-pink-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
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

          {/* Filter Modal/Drawer */}
          {showFilters && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)} />

              {/* Filter Panel */}
              <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-0 md:right-auto md:w-80 lg:w-96 bg-white z-50 rounded-t-2xl md:rounded-none shadow-2xl">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">Filter Produk</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-6 max-h-[70vh] md:max-h-full overflow-y-auto">
                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Rentang Harga</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || maxPrice])}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Rp{minPrice.toLocaleString("id-ID")} - Rp{maxPrice.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Rating</h4>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            selectedRating === rating
                              ? "border-pink-300 bg-pink-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-700">{rating} ke atas</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discount Filter */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Penawaran</h4>
                    <button
                      onClick={() => setShowDiscountOnly(!showDiscountOnly)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        showDiscountOnly ? "border-pink-300 bg-pink-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Tag className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700">Produk Spesial</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="p-4 md:p-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedRating(0)
                        setShowDiscountOnly(false)
                        setPriceRange([minPrice, maxPrice])
                      }}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-colors"
                    >
                      Terapkan ({filteredAndSortedParcels.length})
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Products Grid */}
          {!dataLoaded ? (
            // Loading state for products
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mb-16">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/70 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="bg-gradient-to-br from-pink-200 to-purple-300 aspect-square"></div>
                  <div className="p-3 md:p-6 space-y-2 md:space-y-4">
                    <div className="h-4 md:h-5 bg-pink-200 rounded-lg"></div>
                    <div className="h-3 md:h-4 bg-pink-200 rounded-lg w-3/4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 md:h-5 bg-pink-200 rounded-lg w-1/2"></div>
                      <div className="h-6 md:h-8 bg-pink-200 rounded-full w-8 md:w-10"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedParcels.length === 0 ? (
            <div className="text-center py-16 md:py-20 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 mx-4 md:mx-0">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-pink-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Package className="w-10 h-10 md:w-12 md:h-12 text-pink-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">Tidak Ada Produk</h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-md mx-auto px-4">
                Tidak ada produk yang sesuai dengan filter yang dipilih.
              </p>
              <button
                onClick={() => {
                  setSelectedRating(0)
                  setShowDiscountOnly(false)
                  setPriceRange([minPrice, maxPrice])
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 md:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mb-16">
              {filteredAndSortedParcels.map((parcel, index) => (
                <article 
                  key={parcel.id} 
                  className="group transform transition-all duration-300 hover:scale-[1.02]"
                  itemScope 
                  itemType="https://schema.org/Product"
                >
                  <ParcelCard 
                    parcel={{
                      ...parcel,
                      image_url: getOptimizedImage(parcel.image_url, index < 4 ? 400 : 300)
                    }} 
                  />
                </article>
              ))}
            </div>
          )}

          {/* Enhanced SEO Content Section */}
          {dataLoaded && (
            <div className="space-y-8 md:space-y-12">
              {/* Main Content */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-pink-100">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Mengapa Memilih {category.name} dari {SEO_CONFIG.businessName}?
                </h2>
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3 md:space-y-4">
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      Koleksi {category.name} kami hadir dengan {parcels.length} pilihan produk berkualitas premium yang
                      telah dipilih secara khusus untuk memberikan pengalaman terbaik di wilayah Cirebon dan sekitarnya.
                    </p>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      Dengan harga mulai dari Rp{minPrice.toLocaleString("id-ID")}, kami menjamin kepuasan dan kualitas
                      yang tak tertandingi untuk setiap pembelian Anda.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 md:p-6 border border-pink-100">
                    <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-gray-900">Keunggulan Kami</h3>
                    <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
                      <li className="flex items-center gap-2 md:gap-3">
                        <Award className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                        <span className="text-gray-700">Produk berkualitas premium dengan garansi</span>
                      </li>
                      <li className="flex items-center gap-2 md:gap-3">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                        <span className="text-gray-700">
                          Siap pengiriman ke seluruh kota Cirebon dan wilayah 3 Cirebon seperti Majalengka, Indramayu
                        </span>
                      </li>
                      <li className="flex items-center gap-2 md:gap-3">
                        <Gift className="w-3 h-3 md:w-4 md:h-4 text-pink-500" />
                        <span className="text-gray-700">Kemasan eksklusif untuk setiap produk</span>
                      </li>
                      <li className="flex items-center gap-2 md:gap-3">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                        <span className="text-gray-700">Customer service 24/7 untuk bantuan</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Local SEO Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-pink-100">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Layanan {category.name} Terbaik di Cirebon
                </h2>
                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Cirebon Kota</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Pengiriman same day untuk area Cirebon Kota dengan layanan express
                    </p>
                  </div>
                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <Truck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Majalengka</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Pengiriman 1-2 hari kerja ke seluruh wilayah Majalengka
                    </p>
                  </div>
                  <div className="text-center p-4 md:p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Indramayu</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Layanan pengiriman cepat dan aman ke seluruh Indramayu
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced FAQ Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-pink-100">
                <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Pertanyaan Umum tentang {category.name}
                </h2>
                <div className="space-y-4 md:space-y-6">
                  <div className="border-l-4 border-pink-400 pl-4 md:pl-6 py-3 md:py-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                      Berapa rentang harga {category.name} yang tersedia?
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      Harga {category.name} di toko kami sangat bervariasi, mulai dari Rp
                      {minPrice.toLocaleString("id-ID")}
                      hingga Rp{maxPrice.toLocaleString("id-ID")}. Kami menyediakan berbagai pilihan sesuai dengan
                      budget dan kebutuhan spesifik Anda.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-400 pl-4 md:pl-6 py-3 md:py-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                      Apakah ada pengiriman gratis untuk {category.name}?
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      Ya! Kami menyediakan pengiriman gratis untuk pembelian {category.name} dengan minimal order
                      Rp500.000 ke seluruh wilayah Cirebon, Majalengka, dan Indramayu. Untuk pembelian di bawah minimal
                      order, biaya pengiriman mulai dari Rp15.000.
                    </p>
                  </div>

                  <div className="border-l-4 border-rose-400 pl-4 md:pl-6 py-3 md:py-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                      Bagaimana cara memilih {category.name} yang tepat?
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      Pertimbangkan budget Anda, preferensi penerima hadiah, dan jenis acara. Gunakan fitur filter dan
                      sorting untuk mempermudah pencarian. Produk dengan rating tinggi dan review positif biasanya
                      menjadi pilihan yang aman dan memuaskan.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-400 pl-4 md:pl-6 py-3 md:py-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                      Apakah bisa custom {category.name} sesuai keinginan?
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      Tentu saja! Kami menyediakan layanan custom {category.name} sesuai dengan keinginan dan budget
                      Anda. Hubungi customer service kami di WhatsApp {SEO_CONFIG.telephone} untuk konsultasi gratis dan
                      penawaran khusus.
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Testimonials */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-pink-100">
                <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Apa Kata Pelanggan Kami
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 md:p-6 border border-pink-100">
                    <div className="flex items-center gap-1 mb-3 md:mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 mb-3 md:mb-4 italic">
                      "{category.name} yang saya pesan sangat berkualitas dan kemasan nya cantik banget! Pengiriman ke
                      Cirebon juga cepat, terima kasih!"
                    </p>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base">Sari W.</p>
                        <p className="text-xs md:text-sm text-gray-600">Cirebon</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 md:p-6 border border-pink-100">
                    <div className="flex items-center gap-1 mb-3 md:mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 mb-3 md:mb-4 italic">
                      "Pelayanan ramah, produk sesuai ekspektasi. Sudah beberapa kali order {category.name}
                      di sini dan selalu puas!"
                    </p>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base">Budi S.</p>
                        <p className="text-xs md:text-sm text-gray-600">Majalengka</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 md:p-6 border border-pink-100">
                    <div className="flex items-center gap-1 mb-3 md:mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 mb-3 md:mb-4 italic">
                      "Recommended banget! {category.name} nya unik dan berkualitas. Pengiriman ke Indramayu juga aman
                      dan cepat."
                    </p>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base">Maya R.</p>
                        <p className="text-xs md:text-sm text-gray-600">Indramayu</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Suspense fallback={<div className="h-24 bg-white" />}>
        <Footer />
      </Suspense>
    </>
  )
}
