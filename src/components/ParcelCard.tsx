import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

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
    const message = `Hi! I'm interested in ordering ${parcel.name} for ${formatPrice(parcel.price)}. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-1 shadow-soft gradient-card border-0 overflow-hidden">
      <CardContent className="p-0">
        <Link to={`/parcel/${parcel.category.slug}/${parcel.slug}`}>
          <div className="aspect-square relative overflow-hidden">
            <img
              src={parcel.image_url || '/placeholder.svg'}
              alt={parcel.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Badge className="absolute top-3 left-3 bg-gradient-primary text-white border-0 px-3 py-1">
              {parcel.category.name}
            </Badge>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
      
      <CardFooter className="p-6 space-y-4">
        <div className="space-y-3 flex-1">
          <Link to={`/parcel/${parcel.category.slug}/${parcel.slug}`}>
            <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-2">
              {parcel.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {parcel.description}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {formatPrice(parcel.price)}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleWhatsAppOrder}
          className="w-full bg-green-600 hover:bg-green-700 text-white shadow-soft hover:shadow-elegant transition-all duration-300"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Pesan via WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
};