"use client"

import { Link } from "react-router-dom"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Star, ShoppingCart, Heart } from "lucide-react"
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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price)
  }

  const handleWhatsAppOrder = () => {
    const message = `Hi! Saya tertarik memesan ${parcel.name} seharga ${formatPrice(parcel.price)}. Bisa berikan detail lebih lanjut?`
    const whatsappUrl = createWhatsAppUrl(message, parcel.image_url)
    window.open(whatsappUrl, "_blank")
  }

  const rating = parcel.rating || 4.5
  const reviewsCount = parcel.reviews_count || Math.floor(Math.random() * 50) + 15

  // Always show 20% discount for better UI
  const discountPercentage = 20
  const currentPrice = parcel.price
  const originalPrice = Math.round(currentPrice / (1 - discountPercentage / 100))
  const savings = originalPrice - currentPrice

  return (
    <Card className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-pink-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] w-full h-full flex flex-col">
      {/* Image Container */}
      <div className="relative flex-shrink-0">
        <Link to={`/produk/${parcel.category.slug}/${parcel.slug}`}>
          <div className="aspect-square relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-pink-50 to-purple-50">
            {/* Main Image */}
            <img
              src={parcel.image_url || "/placeholder.svg?height=300&width=300&query=hampers gift box"}
              alt={parcel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Discount Badge */}
            <div className="absolute top-3 right-3 z-20">
              <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                -{discountPercentage}%
              </Badge>
            </div>

            {/* Wishlist Button */}
            <button className="absolute top-3 left-3 z-20 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg">
              <Heart className="w-4 h-4 text-pink-500 hover:fill-current transition-colors" />
            </button>

            {/* Quick Actions - Mobile Hidden, Desktop Visible on Hover */}
            <div className="absolute bottom-3 left-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:block">
              <div className="flex gap-2">
                <Button
                  onClick={handleWhatsAppOrder}
                  size="sm"
                  className="flex-1 bg-green-500/90 hover:bg-green-600 text-white backdrop-blur-sm rounded-xl text-xs font-medium shadow-lg border-0"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90 hover:bg-white text-gray-800 backdrop-blur-sm rounded-xl shadow-lg border-white/50"
                >
                  <ShoppingCart className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Content */}
      <CardContent className="p-3 md:p-4 flex-1 flex flex-col">
        <div className="space-y-2 md:space-y-3 flex-1">
          {/* Category Badge */}
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-0 text-xs font-medium px-2 py-1 rounded-full w-fit"
          >
            {parcel.category.name}
          </Badge>

          {/* Product Name */}
          <Link to={`/produk/${parcel.category.slug}/${parcel.slug}`}>
            <h3 className="font-bold text-sm md:text-base hover:text-pink-600 transition-colors line-clamp-2 leading-tight text-gray-800 min-h-[2.5rem] md:min-h-[3rem]">
              {parcel.name}
            </h3>
          </Link>

          {/* Description - Hidden on Mobile */}
          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed hidden md:block">
            {parcel.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 md:w-4 md:h-4 ${
                    i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({rating}) • {reviewsCount} ulasan
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-end justify-between pt-1 md:pt-2">
            <div className="flex-1">
              {/* Current Price */}
              <div className="flex items-center gap-2 mb-1">
                <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(currentPrice)}
                </p>
                <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200">
                  Hemat {discountPercentage}%
                </Badge>
              </div>

              {/* Original Price & Savings */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs md:text-sm text-gray-500 line-through font-medium">
                  {formatPrice(originalPrice)}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-green-600 font-semibold">Hemat {formatPrice(savings)}</span>
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Special Offer Text */}
              <p className="text-xs text-orange-600 font-medium mt-1 bg-gradient-to-r from-orange-50 to-yellow-50 px-2 py-1 rounded-full border border-orange-200 w-fit">
                🔥 Promo Spesial Website!
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer - Mobile Only */}
      <CardFooter className="p-3 md:hidden pt-0 mt-auto">
        <Button
          onClick={handleWhatsAppOrder}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-2.5 font-semibold text-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat & Pesan Sekarang
          </div>
        </Button>
      </CardFooter>

      {/* Subtle border glow effect */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-pink-200 transition-colors duration-300 pointer-events-none" />

      {/* Modern floating elements */}
      <div className="absolute -top-1 -right-1 w-16 h-16 bg-gradient-to-br from-pink-400/10 to-purple-500/10 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-1 -left-1 w-12 h-12 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  )
}
