import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
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
    <Card className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.02] shadow-lg bg-white border-0 overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        <Link to={`/parcel/${parcel.category.slug}/${parcel.slug}`}>
          <div className="aspect-[4/3] relative overflow-hidden rounded-t-2xl">
            <img
              src={parcel.image_url || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'}
              alt={parcel.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Badge className="absolute top-4 left-4 bg-white/90 text-primary border-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
              {parcel.category.name}
            </Badge>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100">
              <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-relaxed">
                  {parcel.description}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
      
      <CardFooter className="p-6 space-y-5">
        <div className="space-y-4 flex-1">
          <Link to={`/parcel/${parcel.category.slug}/${parcel.slug}`}>
            <h3 className="font-bold text-xl hover:text-primary transition-colors line-clamp-2 leading-tight font-serif">
              {parcel.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between pt-2">
            <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {formatPrice(parcel.price)}
            </p>
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="text-sm">★★★★★</span>
              <span className="text-xs text-gray-500 ml-1">(4.9)</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleWhatsAppOrder}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3 font-semibold group"
        >
          <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Pesan via WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
};