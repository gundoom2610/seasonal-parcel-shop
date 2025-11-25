"use client"

import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Star, MapPin, ShieldCheck, Zap } from "lucide-react"
import { createWhatsAppUrl } from "@/constants/whatsapp"

interface Parcel {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  price: number
  rating?: number
  reviews_count?: number
  discount_percentage?: number
  category: {
    name: string
    slug: string
  }
}

interface ParcelCardProps {
  parcel: Parcel
}

export const ParcelCard = ({ parcel }: ParcelCardProps) => {
  // Format Price: Rp 150.000
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace("Rp", "Rp")
  }

  // Format Sold Count: 1.2rb+
  const formatSold = (count: number) => {
    if (count > 1000) return `${(count / 1000).toFixed(1)}RB+`
    return `${count}+`
  }

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link navigation
    e.stopPropagation() // Prevent bubbling

    // 1. Get the base domain (e.g., https://lipinkparcel.com or localhost:5173)
    const baseUrl = window.location.origin
    
    // 2. Construct the Full Product URL
    const productUrl = `${baseUrl}/produk/${parcel.category.slug}/${parcel.slug}`

    // 3. Create the Message with the Link
    const message = `Halo Admin Lipink Parcel 👋\n\nSaya tertarik dengan produk ini:\n\n🛍️ *${parcel.name}*\n💰 Harga: ${formatPrice(parcel.price)}\n🔗 Link: ${productUrl}\n\nMohon info stoknya ya. Terima kasih!`

    // 4. Send to WhatsApp
    const whatsappUrl = createWhatsAppUrl(message, parcel.image_url)
    window.open(whatsappUrl, "_blank")
  }

  // --- MOCK DATA LOGIC ---
  const rating = parcel.rating || 4.9
  const soldCount = parcel.reviews_count ? parcel.reviews_count * 5 : Math.floor(Math.random() * 100) + 20
  
  // Shopee-style Discount Logic
  const discountPercentage = 25 
  const currentPrice = parcel.price
  const originalPrice = Math.round(currentPrice / (1 - discountPercentage / 100))
  const savings = originalPrice - currentPrice

  return (
    <Card className="group relative flex flex-col w-full h-full overflow-hidden rounded-lg bg-white border border-slate-100 shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
      
      <Link to={`/produk/${parcel.category.slug}/${parcel.slug}`} className="flex flex-col h-full">
        
        {/* === IMAGE SECTION === */}
        <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
          <img
            src={parcel.image_url || "/placeholder.svg?height=400&width=400"}
            alt={parcel.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* === SHOPEE STYLE PROMO TAG (Top Right) === */}
          <div className="absolute top-0 right-0 z-10">
             <div className="bg-yellow-400 text-red-600 flex flex-col items-center justify-center px-1.5 py-1 min-w-[40px] md:min-w-[45px] h-[45px] md:h-[50px] shadow-sm relative">
                {/* Small tail effect */}
                <div className="absolute bottom-[-4px] left-0 right-0 h-1 bg-yellow-400 clip-path-triangle" style={{clipPath: "polygon(0 0, 50% 100%, 100% 0)"}}></div>
                
                <span className="text-[10px] leading-none font-bold">DISKON</span>
                <span className="text-sm md:text-base font-extrabold leading-none">{discountPercentage}%</span>
             </div>
          </div>

          {/* "Official" / "Star+" Badge (Top Left) */}
          <div className="absolute top-2 left-2">
             <div className="bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] shadow-sm flex items-center gap-1 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 fill-white text-red-600" />
                Official
             </div>
          </div>
        </div>

        {/* === CONTENT SECTION === */}
        <CardContent className="flex flex-col p-2.5 md:p-3 gap-1 flex-1">
          
          {/* Title */}
          <h3 className="text-xs md:text-sm text-slate-800 font-normal leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-red-600 transition-colors">
            {parcel.name}
          </h3>

          {/* Shopee Style Price Block */}
          <div className="mt-1">
            {/* Discount Label (Hemat Rp...) */}
            <div className="bg-pink-100 text-pink-600 text-[9px] w-fit px-1 rounded-[2px] font-bold mb-0.5 border border-pink-200">
               Hemat {formatPrice(savings).replace("Rp", "")}
            </div>

            {/* Main Price */}
            <p className="text-sm md:text-lg font-bold text-red-600 truncate">
              {formatPrice(parcel.price)}
            </p>
            
            {/* Coret Price */}
            <div className="flex items-center gap-1 h-4">
               <span className="text-[10px] md:text-xs text-slate-400 line-through">
                  {formatPrice(originalPrice)}
               </span>
            </div>
          </div>

          {/* Location & Trust Signals */}
          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
             <MapPin className="w-3 h-3 text-slate-400" />
             <span className="truncate">Kota Cirebon</span>
          </div>

          {/* Rating & Sold (Bottom Row) */}
          <div className="mt-auto pt-2 flex items-center gap-2 border-t border-slate-50/50">
             <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] md:text-xs text-slate-700">{rating}</span>
             </div>
             <span className="text-[10px] text-slate-300">|</span>
             <div className="text-[10px] md:text-xs text-slate-500">
                Terjual {formatSold(soldCount)}
             </div>
          </div>

        </CardContent>

        {/* === ACTION BUTTON === */}
        <div className="px-2.5 pb-3 md:px-3 md:pb-3 mt-auto">
          <Button
            onClick={handleWhatsAppOrder}
            variant="outline"
            className="w-full h-8 text-xs font-bold border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all rounded-md flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Beli Sekarang
          </Button>
        </div>

      </Link>
    </Card>
  )
}