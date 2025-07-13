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
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <Link to={`/parcel/${parcel.category.slug}/${parcel.slug}`}>
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <img
              src={parcel.image_url || '/placeholder.svg'}
              alt={parcel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Badge className="absolute top-2 left-2">
              {parcel.category.name}
            </Badge>
          </div>
        </Link>
      </CardContent>
      
      <CardFooter className="p-4 space-y-3">
        <div className="space-y-2 flex-1">
          <Link to={`/parcel/${parcel.category.slug}/${parcel.slug}`}>
            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
              {parcel.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {parcel.description}
          </p>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(parcel.price)}
          </p>
        </div>
        
        <Button 
          onClick={handleWhatsAppOrder}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Order via WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
};