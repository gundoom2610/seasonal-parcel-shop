import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ParcelCard } from '@/components/ParcelCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
}

export const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredParcels, setFeaturedParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        // Fetch featured parcels with category info
        const { data: parcelsData } = await supabase
          .from('parcels')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .limit(6)
          .order('created_at', { ascending: false });

        setCategories(categoriesData || []);
        setFeaturedParcels(parcelsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Seasonal Parcels - Premium Gift Boxes for Every Celebration"
        description="Discover our curated collection of seasonal gift parcels for Lebaran, Christmas, and Lunar New Year. Premium quality products delivered with care."
        url="/"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Seasonal Parcels
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrate every season with our carefully curated gift parcels. 
            Perfect for Lebaran, Christmas, and Lunar New Year celebrations.
          </p>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
                  <Button asChild className="w-full">
                    <Link to={`/parcel/${category.slug}`}>
                      View Products
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          {featuredParcels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredParcels.map((parcel) => (
                <ParcelCard key={parcel.id} parcel={parcel} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};