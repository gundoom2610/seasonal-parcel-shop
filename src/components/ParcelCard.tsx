import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Star, ShoppingCart } from 'lucide-react';
import { createWhatsAppUrl } from '@/constants/whatsapp';

interface Parcel {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  category: {
    name: string;
    slug: string;
  };
}

interface ParcelCardProps {
  parcel: Parcel;
}

export const ParcelCard = ({ parcel }: ParcelCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi! Saya tertarik memesan ${parcel.name} seharga ${formatPrice(parcel.price)}. Bisa berikan detail lebih lanjut?`;
    const whatsappUrl = createWhatsAppUrl(message, parcel.image_url);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="group relative overflow-hidden rounded-3xl bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] w-full max-w-sm mx-auto h-full flex flex-col">
      {/* Image Container */}
      <div className="relative flex-shrink-0">
        <Link to={`/produk/${parcel.category.slug}/${parcel.slug}`}>
          <div className="aspect-square relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-100 to-gray-200">
            {/* Blurred Background for non-square images */}
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-30"
              style={{
                backgroundImage: `url(${parcel.image_url || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'})`
              }}
            />
            
            {/* Main Image */}
            <img
              src={parcel.image_url || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'}
              alt={parcel.name}
              className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
            
            {/* Category Badge */}
            <Badge className="absolute top-4 left-4 z-30 bg-white/95 text-gray-800 border-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm hover:bg-white transition-colors">
              {parcel.category.name}
            </Badge>
            
            {/* Discount Badge */}
            <div className="absolute top-4 right-4 z-30">
              <Badge className="bg-red-500 text-white border-0 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                DISKON 20%
              </Badge>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="absolute bottom-4 left-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <div className="flex gap-2">
                <Button
                  onClick={handleWhatsAppOrder}
                  className="flex-1 bg-green-500/90 hover:bg-green-600 text-white backdrop-blur-md rounded-xl py-2 px-4 text-sm font-medium shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Chat Sekarang</span>
                  <span className="sm:hidden">Chat</span>
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/90 hover:bg-white text-gray-800 backdrop-blur-md rounded-xl py-2 px-3 shadow-lg border-white/30 transition-all duration-200 hover:scale-105"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Content */}
      <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="space-y-3 sm:space-y-4 flex-1">
          <Link to={`/produk/${parcel.category.slug}/${parcel.slug}`}>
            <h3 className="font-bold text-lg sm:text-xl hover:text-primary transition-colors line-clamp-2 leading-tight font-serif text-gray-800 min-h-[3.5rem]">
              {parcel.name}
            </h3>
          </Link>
          
          <p className="text-sm sm:text-base text-gray-600 line-clamp-2 leading-relaxed flex-1">
            {parcel.description}
          </p>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-500 ml-1">(4.9)</span>
            <span className="text-xs text-gray-400 ml-1">• {Math.floor(Math.random() * 30) + 10} ulasan</span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {formatPrice(parcel.price)}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-gray-500 line-through">
                  {formatPrice(parcel.price * 1.25)}
                </p>
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                  Hemat 20%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Footer */}
      <CardFooter className="p-4 sm:p-6 pt-0 mt-auto">
        <Button 
          onClick={handleWhatsAppOrder}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3 sm:py-4 font-semibold group text-sm sm:text-base relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
            Chat & Pesan Sekarang
          </div>
        </Button>
      </CardFooter>
      
      {/* Subtle border glow effect */}
      <div className="absolute inset-0 rounded-3xl border border-gray-100 group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
      
      {/* Modern floating elements */}
      <div className="absolute -top-1 -right-1 w-20 h-20 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Card>
  );
};