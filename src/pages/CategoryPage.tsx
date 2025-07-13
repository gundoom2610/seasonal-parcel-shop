import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ParcelCard } from '@/components/ParcelCard';

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

export const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return;

      try {
        // Fetch category
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (categoryData) {
          setCategory(categoryData);

          // Fetch parcels in this category
          const { data: parcelsData } = await supabase
            .from('parcels')
            .select(`
              *,
              category:categories(id, name, slug)
            `)
            .eq('category_id', categoryData.id)
            .order('created_at', { ascending: false });

          setParcels(parcelsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
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
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground">The requested category could not be found.</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${category.name} Parcels - Seasonal Gift Boxes`}
        description={`Browse our collection of premium ${category.name} gift parcels. Perfect for celebrating the season with loved ones.`}
        url={`/parcel/${category.slug}`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.name} Parcels
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of {category.name} gift parcels, 
            perfect for celebrating this special season.
          </p>
        </div>

        {parcels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No products available in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parcels.map((parcel) => (
              <ParcelCard key={parcel.id} parcel={parcel} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};