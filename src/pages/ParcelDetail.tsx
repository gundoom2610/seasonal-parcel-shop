import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Parcel {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  category: Category;
  created_at: string;
}

export const ParcelDetail = () => {
  const { categorySlug, parcelSlug } = useParams<{ categorySlug: string; parcelSlug: string }>();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParcel = async () => {
      if (!categorySlug || !parcelSlug) return;

      try {
        const { data } = await supabase
          .from('parcels')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .eq('slug', parcelSlug)
          .single();

        if (data && data.category.slug === categorySlug) {
          setParcel(data);
        }
      } catch (error) {
        console.error('Error fetching parcel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParcel();
  }, [categorySlug, parcelSlug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  const handleWhatsAppOrder = () => {
    if (!parcel) return;
    
    const message = `Hi! I'm interested in ordering ${parcel.name} for ${formatPrice(parcel.price)}. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStructuredData = () => {
    if (!parcel) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": parcel.name,
      "image": parcel.image_url || `${window.location.origin}/placeholder.svg`,
      "description": parcel.description,
      "category": parcel.category.name,
      "offers": {
        "@type": "Offer",
        "price": parcel.price.toString(),
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock"
      },
      "brand": {
        "@type": "Brand",
        "name": "Seasonal Parcels"
      }
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The requested product could not be found.</p>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${parcel.name} - ${parcel.category.name} Parcel`}
        description={parcel.description}
        ogImage={parcel.image_url}
        url={`/parcel/${parcel.category.slug}/${parcel.slug}`}
        structuredData={getStructuredData()}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/parcel/${parcel.category.slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {parcel.category.name}
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <img
              src={parcel.image_url || '/placeholder.svg'}
              alt={parcel.name}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 left-4">
              {parcel.category.name}
            </Badge>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {parcel.name}
              </h1>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(parcel.price)}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {parcel.description}
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleWhatsAppOrder}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Order via WhatsApp
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Click the button above to place your order through WhatsApp. 
                We'll respond quickly with payment details and delivery information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};