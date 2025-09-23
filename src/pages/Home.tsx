"use client"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { SEO } from "@/components/SEO"
import { ParcelCard } from "@/components/ParcelCard"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import {
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  Shield,
  Truck,
  Heart,
  Gift,
  Package,
  Star,
  Clock,
  Award,
  ChevronDown,
  Filter,
  Search,
} from "lucide-react"
import { createWhatsAppUrl } from "@/constants/whatsapp"

// Advanced SEO Configuration - Updated without free shipping and same day delivery
const SEO_CONFIG = {
  // Business Information
  business: {
    name: "Lipink Parcel Cirebon",
    legalName: "CV. Lipink Parcel Indonesia",
    description:
      "Toko parcel dan hampers premium terpercaya di Cirebon dengan kualitas terbaik untuk berbagai acara spesial seperti Lebaran, Natal, dan Imlek",
    tagline: "Parcel Premium untuk Setiap Momen Istimewa",
    foundedYear: "2019",
    employeeCount: "10-50",
  },
  // Contact & Location
  contact: {
    phone: "+62 812-3456-7890",
    whatsapp: "+62 812-3456-7890",
    email: "hello@lipinkparcel.com",
    website: "https://lipinkparcel.com",
  },
  address: {
    street: "Jl. Raya Cirebon No. 123",
    city: "Cirebon",
    state: "Jawa Barat",
    postalCode: "45111",
    country: "Indonesia",
    countryCode: "ID",
  },
  // Service Areas - Updated delivery times
  serviceAreas: [
    {
      name: "Cirebon",
      type: "primary",
      deliveryTime: "1-2 Hari",
      wikidata: "https://www.wikidata.org/wiki/Q10467",
    },
    {
      name: "Majalengka",
      type: "secondary",
      deliveryTime: "2-3 Hari",
      wikidata: "https://www.wikidata.org/wiki/Q10467",
    },
    {
      name: "Indramayu",
      type: "secondary",
      deliveryTime: "2-3 Hari",
      wikidata: "https://www.wikidata.org/wiki/Q10467",
    },
  ],
  // Business Hours
  hours: {
    monday: "08:00-20:00",
    tuesday: "08:00-20:00",
    wednesday: "08:00-20:00",
    thursday: "08:00-20:00",
    friday: "08:00-20:00",
    saturday: "08:00-20:00",
    sunday: "08:00-20:00",
    timezone: "Asia/Jakarta",
  },
  // Social Media
  social: {
    instagram: "https://instagram.com/lipinkparcel",
    facebook: "https://facebook.com/lipinkparcel",
    whatsapp: "https://wa.me/6281234567890",
    tokopedia: "https://tokopedia.com/lipinkparcel",
    shopee: "https://shopee.co.id/lipinkparcel",
    tiktok: "https://tiktok.com/@lipinkparcel",
    youtube: "https://youtube.com/@lipinkparcel",
  },
  // Business Metrics
  metrics: {
    rating: 4.8,
    reviewCount: 500,
    customerCount: 1000,
    experienceYears: 5,
    productCount: 50, // Will be updated dynamically
    categoryCount: 6, // Will be updated dynamically
  },
  // Pricing - Removed free shipping
  pricing: {
    currency: "IDR",
    minPrice: 50000,
    maxPrice: 2000000,
    priceRange: "Rp 50.000 - Rp 2.000.000",
  },
  // SEO Keywords
  keywords: {
    primary: ["parcel cirebon", "hampers cirebon", "parcel premium cirebon"],
    secondary: ["parcel lebaran cirebon", "parcel natal cirebon", "parcel imlek cirebon"],
    local: ["parcel majalengka", "parcel indramayu", "hampers jawa barat"],
    occasions: ["parcel lebaran", "hampers natal", "parcel imlek", "hampers ulang tahun"],
    products: ["parcel makanan", "hampers premium", "parcel keramik", "hampers eksklusif"],
  },
  // Content
  content: {
    heroTitle: "Parcel Cirebon Premium",
    heroSubtitle: "untuk Setiap Momen Istimewa",
    heroDescription: "Hadirkan kebahagiaan dengan parcel premium berkualitas tinggi untuk Lebaran, Natal, dan Imlek",
    trustBadges: [
      { text: "Garansi Kualitas 100%", icon: "shield" },
      { text: "Pengiriman Terpercaya", icon: "truck" },
      { text: "Customer Service 24/7", icon: "clock" },
    ],
  },
  // Category Descriptions
  categoryDescriptions: {
    lebaran:
      "Koleksi parcel spesial Idul Fitri dengan kemasan mewah dan isi berkualitas premium untuk merayakan kemenangan",
    christmas: "Hampers Natal istimewa dengan sentuhan elegan untuk berbagi kebahagiaan bersama keluarga",
    "lunar-new-year": "Parcel Imlek penuh makna dengan simbol keberuntungan untuk tahun yang penuh berkah",
    "set-bekal-anak": "Parcel bekal anak dengan produk berkualitas dan kemasan menarik untuk si kecil",
    default: "Koleksi produk premium untuk momen istimewa Anda",
  },
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  updated_at: string
  parcels?: Parcel[]
}

interface Parcel {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  price: number
  category: {
    id: string
    name: string
    slug: string
  }
  rating?: number
  reviews_count?: number
  created_at?: string
}

export const Home = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesWithParcels, setCategoriesWithParcels] = useState<Category[]>([])
  const [featuredParcels, setFeaturedParcels] = useState<Parcel[]>([])
  const [filteredParcels, setFilteredParcels] = useState<Parcel[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("semua")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [productsLoaded, setProductsLoaded] = useState(false)

  useEffect(() => {
    // Scroll to top when component loads
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })

    const fetchData = async () => {
      try {
        // Phase 1: Load page structure first (categories only)
        setLoading(true)
        setCategoriesLoading(true)

        // Fetch categories first for immediate page render
        const { data: categoriesData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(6)

        if (categoryError) {
          console.error("Error fetching categories:", categoryError)
          setCategoriesLoading(false)
          setLoading(false)
          return
        }

        // Set categories immediately (without products) to render page structure
        const categoriesWithoutProducts = (categoriesData || []).map((category) => ({
          ...category,
          parcels: [], // Empty initially
        }))

        setCategories(categoriesWithoutProducts)
        setLoading(false) // Page can render now
        setCategoriesLoading(false)

        // Phase 2: Fetch featured products (for "Produk Terlaris" section)
        const { data: featuredData } = await supabase
          .from("parcels")
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .limit(24) // Increased to show more products
          .order("created_at", { ascending: false })

        setFeaturedParcels(featuredData || [])
        setFilteredParcels(featuredData || [])

        // Phase 3: Fetch products for each category (10 products per category)
        const categoriesWithParcels = await Promise.all(
          (categoriesData || []).map(async (category) => {
            const { data: parcelsData } = await supabase
              .from("parcels")
              .select(`
                id,
                name,
                slug,
                description,
                image_url,
                price,
                rating,
                reviews_count,
                created_at,
                category:categories(id, name, slug)
              `)
              .eq("category_id", category.id)
              .order("created_at", { ascending: false })
              .limit(10) // Changed from 4 to 10

            return {
              ...category,
              parcels: parcelsData || [],
            }
          }),
        )

        // Update categories with products
        setCategories(categoriesWithParcels)
        setCategoriesWithParcels(categoriesWithParcels.filter(cat => cat.parcels && cat.parcels.length > 0))

        // Update SEO config with dynamic data
        const totalProducts = categoriesWithParcels.reduce((acc, cat) => acc + (cat.parcels?.length || 0), 0)
        SEO_CONFIG.metrics.categoryCount = categoriesWithParcels.length
        SEO_CONFIG.metrics.productCount = totalProducts
        setProductsLoaded(true)
      } catch (error) {
        console.error("Error fetching data:", error)
        setCategoriesLoading(false)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter products based on selected category
  useEffect(() => {
    if (selectedCategory === "semua") {
      setFilteredParcels(featuredParcels)
    } else {
      const filtered = featuredParcels.filter(
        (parcel) => parcel.category.slug === selectedCategory
      )
      setFilteredParcels(filtered)
    }
  }, [selectedCategory, featuredParcels])

  // Generate dynamic SEO data
  const generateSEOData = () => {
    const totalProducts = categories.reduce((acc, cat) => acc + (cat.parcels?.length || 0), 0)
    const totalCategories = categories.length

    return {
      title: `${SEO_CONFIG.content.heroTitle} - ${SEO_CONFIG.business.tagline} | ${SEO_CONFIG.business.name}`,
      description: `🎁 ${SEO_CONFIG.business.description} dengan ${totalProducts}+ produk premium di ${totalCategories} kategori. Rating ${SEO_CONFIG.metrics.rating}/5 dari ${SEO_CONFIG.metrics.reviewCount}+ pelanggan. ${SEO_CONFIG.serviceAreas.map((area) => area.name).join(", ")}. Pesan sekarang via WhatsApp! ✨`,
      keywords: [
        ...SEO_CONFIG.keywords.primary,
        ...SEO_CONFIG.keywords.secondary,
        ...SEO_CONFIG.keywords.local,
        ...SEO_CONFIG.keywords.occasions,
        ...SEO_CONFIG.keywords.products,
      ].join(", "),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${SEO_CONFIG.contact.website}/#business`,
        name: SEO_CONFIG.business.name,
        legalName: SEO_CONFIG.business.legalName,
        description: `${SEO_CONFIG.business.description} dengan ${totalProducts}+ produk berkualitas tinggi`,
        foundingDate: SEO_CONFIG.business.foundedYear,
        numberOfEmployees: SEO_CONFIG.business.employeeCount,
        address: {
          "@type": "PostalAddress",
          streetAddress: SEO_CONFIG.address.street,
          addressLocality: SEO_CONFIG.address.city,
          addressRegion: SEO_CONFIG.address.state,
          addressCountry: SEO_CONFIG.address.countryCode,
          postalCode: SEO_CONFIG.address.postalCode,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "-6.7063",
          longitude: "108.5492",
        },
        telephone: SEO_CONFIG.contact.phone,
        email: SEO_CONFIG.contact.email,
        url: SEO_CONFIG.contact.website,
        openingHoursSpecification: Object.entries(SEO_CONFIG.hours)
          .filter(([key]) => key !== "timezone")
          .map(([day, hours]) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
            opens: (hours as string).split("-")[0],
            closes: (hours as string).split("-")[1],
          })),
        priceRange: SEO_CONFIG.pricing.priceRange,
        image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=630&fit=crop",
        areaServed: SEO_CONFIG.serviceAreas.map((area) => ({
          "@type": "City",
          name: area.name,
          "@id": area.wikidata,
        })),
        sameAs: Object.values(SEO_CONFIG.social),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: SEO_CONFIG.metrics.rating.toString(),
          reviewCount: SEO_CONFIG.metrics.reviewCount.toString(),
          bestRating: "5",
          worstRating: "1",
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: SEO_CONFIG.pricing.currency,
          lowPrice: SEO_CONFIG.pricing.minPrice.toString(),
          highPrice: SEO_CONFIG.pricing.maxPrice.toString(),
          offerCount: totalProducts.toString(),
          availability: "https://schema.org/InStock",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `Katalog ${SEO_CONFIG.business.name}`,
          itemListElement: categories.map((category, index) => ({
            "@type": "OfferCatalog",
            name: category.name,
            description:
              category.description ||
              SEO_CONFIG.categoryDescriptions[category.slug as keyof typeof SEO_CONFIG.categoryDescriptions] ||
              SEO_CONFIG.categoryDescriptions.default,
            numberOfItems: category.parcels?.length || 0,
            position: index + 1,
          })),
        },
        potentialAction: {
          "@type": "OrderAction",
          target: SEO_CONFIG.social.whatsapp,
          deliveryMethod: "https://schema.org/OnSitePickup",
        },
      },
    }
  }

  const seoData = generateSEOData()
  const totalProducts = categories.reduce((acc, cat) => acc + (cat.parcels?.length || 0), 0)
  const totalCategories = categories.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Skeleton */}
          <div className="text-center py-20 animate-pulse">
            <div className="h-16 bg-gradient-to-r from-pink-200 to-purple-300 rounded-2xl w-2/3 mx-auto mb-6"></div>
            <div className="h-6 bg-pink-200 rounded-xl w-4/5 mx-auto mb-8"></div>
            <div className="flex justify-center gap-4">
              <div className="h-12 bg-pink-200 rounded-2xl w-40"></div>
            </div>
          </div>

          {/* Categories Skeleton */}
          <div className="space-y-16">
            {Array.from({ length: 3 }).map((_, catIndex) => (
              <div key={catIndex} className="space-y-6">
                <div className="h-8 bg-pink-200 rounded-xl w-64 mx-auto animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white/70 rounded-3xl shadow-lg overflow-hidden animate-pulse">
                      <div className="bg-gradient-to-br from-pink-200 to-purple-300 aspect-square"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-pink-200 rounded-xl"></div>
                        <div className="h-4 bg-pink-200 rounded-lg w-3/4"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-5 bg-pink-200 rounded-xl w-1/2"></div>
                          <div className="h-8 bg-pink-200 rounded-full w-10"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        url="/"
        keywords={seoData.keywords}
        structuredData={seoData.structuredData}
      />
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        {/* Enhanced Hero Section with Mobile-First Design */}
        <section className="relative overflow-hidden py-6 md:py-16 lg:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-white/30 to-purple-100/50"></div>

          {/* SEO-optimized structured content */}
          <div className="container mx-auto px-4 relative z-10" itemScope itemType="https://schema.org/Store">
            {/* Mobile: Text First, Image Below | Desktop: Side by Side */}
            <div className="max-w-7xl mx-auto">
              {/* Mobile Layout */}
              <div className="block lg:hidden space-y-6">
                {/* Mobile Text Content */}
                <div className="text-center animate-fade-in">
                  {/* Enhanced Badge with Trust Signals */}
                  <div className="inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 rounded-full px-4 py-2 mb-4 shadow-lg">
                    <Gift className="w-4 h-4 text-pink-600 mr-2" />
                    <span className="text-pink-700 font-semibold text-sm">
                      {SEO_CONFIG.business.tagline}
                    </span>
                  </div>

                  {/* Mobile Heading - More Compact */}
                  <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" itemProp="name">
                    <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent block">
                      Parcel Premium Cirebon
                    </span>
                    <span className="text-lg text-gray-700 font-medium block mt-1">
                      {totalProducts}+ Produk untuk Momen Istimewa
                    </span>
                  </h1>

                  {/* Mobile Description - Concise */}
                  <p className="text-sm text-gray-600 mb-4 px-2" itemProp="description">
                    Parcel berkualitas tinggi untuk 
                    <span className="text-rose-600 font-semibold"> Lebaran</span>,
                    <span className="text-purple-600 font-semibold"> Natal</span>, dan
                    <span className="text-pink-600 font-semibold"> Imlek</span>
                  </p>

                  {/* Mobile Trust Indicators */}
                  <div className="flex justify-center gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-pink-100">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-semibold text-gray-700">
                        {SEO_CONFIG.metrics.rating}/5
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-pink-100">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span className="text-xs font-semibold text-gray-700">Terjamin</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-pink-100">
                      <Truck className="w-3 h-3 text-blue-500" />
                      <span className="text-xs font-semibold text-gray-700">1-2 Hari</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Hero Image - Smaller and Cleaner */}
                <div className="animate-fade-in px-4" style={{ animationDelay: "0.2s" }}>
                  <div className="relative group max-w-sm mx-auto">
                    <div className="bg-white rounded-2xl p-2 shadow-xl border border-pink-100/50">
                      <img
                        src="/hero-image.png"
                        alt="Parcel Premium Cirebon - Hampers Berkualitas untuk Lebaran, Natal, dan Imlek"
                        className="w-full h-auto rounded-xl object-cover aspect-[4/3]"
                        loading="eager"
                      />
                    </div>
                    {/* Subtle floating badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                </div>

                {/* Mobile CTA */}
                <div className="text-center px-4">
                  <Button
                    size="default"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 text-sm font-bold shadow-lg rounded-2xl transition-all duration-300"
                    onClick={() =>
                      window.open(
                        createWhatsAppUrl(
                          `🎁 Halo! Saya tertarik dengan parcel premium dari ${SEO_CONFIG.business.name}. Mohon info lebih lanjut!`,
                        ),
                        "_blank",
                      )
                    }
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat untuk Harga Terbaik
                  </Button>
                </div>
              </div>

              {/* Desktop Layout - Same as Before */}
              <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
                {/* Desktop Text Content */}
                <div className="text-left animate-fade-in">
                  {/* Enhanced Badge with Trust Signals */}
                  <div className="inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 rounded-full px-6 py-3 mb-6 shadow-lg">
                    <Gift className="w-5 h-5 text-pink-600 mr-2" />
                    <span className="text-pink-700 font-semibold text-base">
                      {SEO_CONFIG.business.tagline} • Rating {SEO_CONFIG.metrics.rating}/5
                    </span>
                  </div>

                  {/* SEO-optimized Main Heading */}
                  <h1 className="text-5xl xl:text-6xl font-bold mb-6 leading-tight" itemProp="name">
                    <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
                      {SEO_CONFIG.content.heroTitle}
                    </span>
                    <br />
                    <span className="text-3xl xl:text-4xl text-gray-700 font-medium">
                      {totalProducts}+ Produk {SEO_CONFIG.content.heroSubtitle}
                    </span>
                  </h1>

                  {/* Enhanced Subtitle with Local SEO */}
                  <div className="text-lg xl:text-xl text-gray-600 mb-8 leading-relaxed" itemProp="description">
                    <p className="mb-3">
                      {SEO_CONFIG.content.heroDescription} untuk
                      <span className="text-rose-600 font-semibold"> Lebaran</span>,
                      <span className="text-purple-600 font-semibold"> Natal</span>, dan
                      <span className="text-pink-600 font-semibold"> Imlek</span>.
                    </p>
                    <p className="text-base">
                      <span itemProp="areaServed">
                        Pengiriman ke {SEO_CONFIG.serviceAreas.map((area) => area.name).join(", ")}
                      </span>{" "}
                      •
                      <span className="text-blue-600 font-semibold">
                        {" "}
                        {SEO_CONFIG.serviceAreas[0].deliveryTime} {SEO_CONFIG.serviceAreas[0].name}
                      </span>
                    </p>
                  </div>

                  {/* Trust Indicators Row */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-pink-100">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">
                        {SEO_CONFIG.metrics.rating}/5 ({SEO_CONFIG.metrics.reviewCount}+)
                      </span>
                    </div>
                    {SEO_CONFIG.content.trustBadges.slice(0, 2).map((badge, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-pink-100"
                      >
                        {badge.icon === "shield" && <Shield className="w-4 h-4 text-green-500" />}
                        {badge.icon === "truck" && <Truck className="w-4 h-4 text-blue-500" />}
                        {badge.icon === "clock" && <Clock className="w-4 h-4 text-purple-500" />}
                        <span className="text-sm font-semibold text-gray-700">{badge.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced CTA Button */}
                  <div>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl rounded-2xl font-bold group transform hover:scale-105 transition-all duration-300"
                      onClick={() =>
                        window.open(
                          createWhatsAppUrl(
                            `🎁 Halo! Saya tertarik dengan parcel premium dari ${SEO_CONFIG.business.name}. Saya ingin mendapatkan harga terbaik untuk produk Anda. Bisa berikan informasi lebih lanjut?`,
                          ),
                          "_blank",
                        )
                      }
                    >
                      <MessageCircle className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                      Kontak Kami untuk Harga Terbaik!
                    </Button>
                  </div>
                </div>

                {/* Desktop Hero Image */}
                <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-4 shadow-2xl border border-white/20">
                      <img
                        src="/hero-image.png"
                        alt="Parcel Premium Cirebon - Hampers Berkualitas untuk Lebaran, Natal, dan Imlek"
                        className="w-full h-auto rounded-2xl shadow-xl object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                        loading="eager"
                      />
                    </div>
                    {/* Floating Elements */}
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Star className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-full filter blur-xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-rose-400/20 to-pink-500/20 rounded-full filter blur-xl animate-float-delayed"></div>
        </section>

        {/* Enhanced Trust Indicators with Rich Data */}
        <section className="py-6 md:py-8 bg-white/70 backdrop-blur-sm border-y border-pink-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
              <div className="animate-fade-in p-3 md:p-4" itemScope itemType="https://schema.org/Rating">
                <div
                  className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2"
                  itemProp="ratingValue"
                >
                  {SEO_CONFIG.metrics.reviewCount}+
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Pelanggan Puas</div>
              </div>
              <div className="animate-fade-in p-3 md:p-4" style={{ animationDelay: "0.1s" }}>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2">
                  {totalProducts}+
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Produk Premium</div>
              </div>
              <div className="animate-fade-in p-3 md:p-4" style={{ animationDelay: "0.2s" }}>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2">
                  {SEO_CONFIG.metrics.experienceYears}+
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Tahun Pengalaman</div>
              </div>
              <div className="animate-fade-in p-3 md:p-4" style={{ animationDelay: "0.3s" }}>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2">
                  {SEO_CONFIG.metrics.rating}/5
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Rating Pelanggan</div>
              </div>
            </div>
          </div>
        </section>

        {/* Products by Category Sections - 10 products each */}
        {categoriesWithParcels.length > 0 && (
          <section className="py-12 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 space-y-16">
              {categoriesWithParcels.map((category, categoryIndex) => (
                <div key={category.id} className="animate-fade-in" style={{ animationDelay: `${categoryIndex * 0.2}s` }}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {category.name}
                      </h2>
                      <p className="text-gray-600 text-sm md:text-base">
                        {category.description ||
                          SEO_CONFIG.categoryDescriptions[
                            category.slug as keyof typeof SEO_CONFIG.categoryDescriptions
                          ] ||
                          SEO_CONFIG.categoryDescriptions.default}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-pink-300 text-pink-600 hover:bg-pink-500 hover:text-white rounded-xl font-semibold"
                      asChild
                    >
                      <Link to={`/produk/${category.slug}`}>
                        Lihat Semua ({category.parcels?.length || 0})
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>

                  {/* Products Grid - Show 10 products */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {category.parcels?.slice(0, 10).map((parcel, index) => (
                      <div
                        key={parcel.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <ParcelCard parcel={parcel} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Featured Products with Filtering - Produk Terlaris */}
        <section
          className="py-16 bg-gradient-to-br from-pink-50 to-purple-50"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          <div className="container mx-auto px-4">
            {/* Appealing Copywriting Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 rounded-full px-6 py-3 mb-6 shadow-lg">
                <Search className="w-5 h-5 text-pink-600 mr-3" />
                <span className="text-pink-700 font-semibold text-lg">
                  Halo! Apa yang Anda cari untuk...
                </span>
              </div>

              <h2
                className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
                itemProp="name"
              >
                🎁 Momen Istimewa Anda? 🎁
              </h2>
              <p
                className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-2"
                itemProp="description"
              >
                Temukan parcel premium yang sempurna untuk setiap perayaan spesial Anda
              </p>
              <p className="text-sm text-gray-500">
                ✨ Dipercaya {SEO_CONFIG.metrics.reviewCount}+ pelanggan dengan rating {SEO_CONFIG.metrics.rating}/5 ✨
              </p>
            </div>

            {/* Responsive Filter Section */}
            <div className="mb-8">
              {/* Desktop Filter */}
              <div className="hidden md:flex justify-center items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-pink-100">
                  <Filter className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-semibold text-gray-700">Filter Kategori:</span>
                </div>
                <button
                  onClick={() => setSelectedCategory("semua")}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === "semua"
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105"
                      : "bg-white/80 text-gray-700 hover:bg-pink-100 border border-pink-200"
                  }`}
                >
                  🎯 Semua Produk ({featuredParcels.length})
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      selectedCategory === category.slug
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105"
                        : "bg-white/80 text-gray-700 hover:bg-pink-100 border border-pink-200"
                    }`}
                  >
                    {category.slug === "lebaran" && "🌙"} 
                    {category.slug === "christmas" && "🎄"} 
                    {category.slug === "lunar-new-year" && "🧧"} 
                    {category.slug === "set-bekal-anak" && "🎒"} 
                    {category.slug.includes("birthday") && "🎂"}
                    {!["lebaran", "christmas", "lunar-new-year", "set-bekal-anak"].some(slug => category.slug.includes(slug)) && !category.slug.includes("birthday") && "🎁"} {category.name}
                  </button>
                ))}
              </div>

              {/* Mobile Filter Dropdown */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full bg-white/90 backdrop-blur-sm border border-pink-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-pink-600" />
                    <span className="font-semibold text-gray-800">
                      {selectedCategory === "semua" 
                        ? `🎯 Semua Produk (${featuredParcels.length})`
                        : categories.find(cat => cat.slug === selectedCategory)?.name || "Pilih Kategori"
                      }
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-pink-600 transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Mobile Dropdown Menu */}
                {isFilterOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-pink-200 rounded-2xl shadow-2xl z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedCategory("semua")
                        setIsFilterOpen(false)
                      }}
                      className={`w-full px-6 py-4 text-left flex items-center gap-3 transition-colors ${
                        selectedCategory === "semua" 
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" 
                          : "hover:bg-pink-50"
                      }`}
                    >
                      <span className="text-xl">🎯</span>
                      <span className="font-semibold">Semua Produk ({featuredParcels.length})</span>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.slug)
                          setIsFilterOpen(false)
                        }}
                        className={`w-full px-6 py-4 text-left flex items-center gap-3 transition-colors ${
                          selectedCategory === category.slug 
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" 
                            : "hover:bg-pink-50"
                        }`}
                      >
                        <span className="text-xl">
                          {category.slug === "lebaran" && "🌙"} 
                          {category.slug === "christmas" && "🎄"} 
                          {category.slug === "lunar-new-year" && "🧧"} 
                          {category.slug === "set-bekal-anak" && "🎒"} 
                          {category.slug.includes("birthday") && "🎂"}
                          {!["lebaran", "christmas", "lunar-new-year", "set-bekal-anak"].some(slug => category.slug.includes(slug)) && !category.slug.includes("birthday") && "🎁"}
                        </span>
                        <span className="font-semibold">{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {filteredParcels.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
                  <ShoppingBag className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                  {selectedCategory === "semua" ? "Produk Segera Hadir" : "Belum Ada Produk"}
                </h3>
                <p className="text-gray-500 text-lg mb-6">
                  {selectedCategory === "semua" 
                    ? "Kami sedang mempersiapkan produk-produk terbaik untuk Anda"
                    : `Produk kategori ini sedang dalam persiapan. Coba kategori lainnya!`
                  }
                </p>
                <Button
                  variant="outline"
                  className="border-pink-300 text-pink-600 hover:bg-pink-500 hover:text-white rounded-2xl font-semibold px-8 py-3"
                  onClick={() => setSelectedCategory("semua")}
                >
                  Lihat Semua Produk
                </Button>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 font-medium">
                    Menampilkan <span className="font-bold text-pink-600">{filteredParcels.length}</span> produk
                    {selectedCategory !== "semua" && (
                      <span> untuk kategori <span className="font-bold text-purple-600">
                        {categories.find(cat => cat.slug === selectedCategory)?.name}
                      </span></span>
                    )}
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                  {filteredParcels.slice(0, 12).map((parcel, index) => (
                    <div
                      key={parcel.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      itemScope
                      itemType="https://schema.org/Product"
                      itemProp="itemListElement"
                    >
                      <ParcelCard parcel={parcel} />
                    </div>
                  ))}
                </div>

                {/* View All Products Button */}
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-purple-300 text-purple-600 hover:bg-purple-500 hover:text-white px-12 py-4 text-lg rounded-2xl font-semibold transition-all duration-300 group bg-transparent shadow-lg hover:shadow-xl"
                    asChild
                  >
                    <Link to="/produk">
                      Lihat Semua {totalProducts}+ Produk
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Enhanced Why Choose Us with Local SEO */}
        <section className="py-16 bg-white/70 backdrop-blur-sm" itemScope itemType="https://schema.org/Organization">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Mengapa Pilih {SEO_CONFIG.business.name}?
              </h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Komitmen kami untuk memberikan pengalaman terbaik dalam setiap pemesanan parcel di{" "}
                {SEO_CONFIG.address.city} dan sekitarnya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 group"
                itemScope
                itemType="https://schema.org/Service"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-800" itemProp="name">
                  Kualitas Terjamin
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" itemProp="description">
                  Semua produk telah melalui quality control ketat dengan garansi 100% untuk memastikan kepuasan Anda
                </p>
              </div>

              <div
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 group"
                itemScope
                itemType="https://schema.org/Service"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-800" itemProp="name">
                  Pengiriman Terpercaya
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" itemProp="description">
                  {SEO_CONFIG.serviceAreas[0].deliveryTime} {SEO_CONFIG.serviceAreas[0].name},{" "}
                  {SEO_CONFIG.serviceAreas[1].deliveryTime} {SEO_CONFIG.serviceAreas[1].name} &{" "}
                  {SEO_CONFIG.serviceAreas[2].name} dengan layanan pengiriman yang dapat diandalkan
                </p>
              </div>

              <div
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 group"
                itemScope
                itemType="https://schema.org/Service"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-800" itemProp="name">
                  Pelayanan 24/7
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" itemProp="description">
                  Customer service profesional siap membantu kapan saja dengan respon cepat via WhatsApp
                </p>
              </div>

              <div
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 group"
                itemScope
                itemType="https://schema.org/Service"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-800" itemProp="name">
                  Terpercaya
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" itemProp="description">
                  Dipercaya {SEO_CONFIG.metrics.reviewCount}+ pelanggan dengan rating {SEO_CONFIG.metrics.rating}/5 dan
                  testimoni positif
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Siap Berbelanja Parcel Premium?
            </h2>
            <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
              Dapatkan penawaran terbaik dan konsultasi gratis untuk kebutuhan parcel Anda
            </p>
            <Button
              size="lg"
              className="bg-white text-pink-600 hover:bg-gray-100 px-12 py-4 text-lg rounded-2xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() =>
                window.open(
                  createWhatsAppUrl(
                    `🎁 Halo! Saya ingin konsultasi dan mendapatkan penawaran terbaik untuk parcel premium dari ${SEO_CONFIG.business.name}. Mohon info lebih lanjut!`,
                  ),
                  "_blank",
                )
              }
            >
              <MessageCircle className="h-6 w-6 mr-3" />
              Hubungi Kami Sekarang
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}