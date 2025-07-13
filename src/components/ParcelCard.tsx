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
    <Card className="group hover:shadow-elegant transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] shadow-soft gradient-card border-0 overflow-hidden rounded-xl">
      <CardContent className="p-0">
        <Link to={`/parcel/${parcel.category.slug}/${parcel.slug}`}>
          <div className="aspect-square relative overflow-hidden rounded-t-xl">
            <img
              src={parcel.image_url || '/placeholder.svg'}
              alt={parcel.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Badge className="absolute top-4 left-4 bg-gradient-primary text-white border-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              {parcel.category.name}
            </Badge>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
      
      <CardFooter className="p-6 space-y-4">
        <div className="space-y-4 flex-1">
          <Link to={`/parcel/${parcel.category.slug}/${parcel.slug}`}>
            <h3 className="font-bold text-xl hover:text-primary transition-colors line-clamp-2 leading-tight">
              {parcel.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {parcel.description}
          </p>
          <div className="flex items-center justify-between pt-2">
            <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {formatPrice(parcel.price)}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleWhatsAppOrder}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-soft hover:shadow-elegant transition-all duration-300 rounded-lg py-3 font-semibold"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Pesan via WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
};