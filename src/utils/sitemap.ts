// utils/sitemap.ts
import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

interface ProductData {
  slug: string;
  updated_at: string;
  created_at: string;
  categories?: {
    slug: string;
    updated_at: string;
    created_at: string;
  };
}

interface CategoryData {
  slug: string;
  updated_at: string;
  created_at: string;
}

// Client-side sitemap generation (for preview/development)
export const generateSitemap = async (): Promise<string> => {
  const domain = import.meta.env.VITE_SITE_URL || 'https://www.parcelcirebon.com';
  
  // Static routes
  const staticRoutes: SitemapUrl[] = [
    { url: '/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
  ];

  try {
    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at, created_at')
      .order('updated_at', { ascending: false });

    if (categoriesError) {
      console.error('Error fetching categories for sitemap:', categoriesError);
      throw categoriesError;
    }

    // Fetch all products with their categories
    const { data: products, error: productsError } = await supabase
      .from('parcels')
      .select(`
        slug, 
        updated_at, 
        created_at,
        categories (
          slug,
          updated_at,
          created_at
        )
      `)
      .order('updated_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products for sitemap:', productsError);
      throw productsError;
    }

    // Generate category URLs
    const categoryUrls: SitemapUrl[] = (categories || []).map((category: CategoryData) => ({
      url: `/produk/${category.slug}`,
      lastmod: category.updated_at || category.created_at,
      changefreq: 'weekly',
      priority: 0.7
    }));

    // Generate product URLs with proper category/product structure
    const productUrls: SitemapUrl[] = (products || [])
      .filter((product: ProductData) => product.categories?.slug) // Only include products with categories
      .map((product: ProductData) => ({
        url: `/produk/${product.categories!.slug}/${product.slug}`,
        lastmod: product.updated_at || product.created_at,
        changefreq: 'weekly',
        priority: 0.6
      }));

    // Combine all URLs
    const allUrls = [...staticRoutes, ...categoryUrls, ...productUrls];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(item => `  <url>
    <loc>${domain}${item.url}</loc>
    <lastmod>${new Date(item.lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};

// Secure sitemap save using Edge Function (admin auth required)
export const saveSitemapToStorage = async (): Promise<void> => {
  try {
    // Get current session for admin verification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required to generate sitemap');
    }

    console.log('🔄 Calling Edge Function to generate sitemap...');

    // Call the Edge Function with authentication
    const { data, error } = await supabase.functions.invoke('generate-sitemap', {
      body: {},
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate sitemap');
    }

    console.log('✅ Sitemap generated successfully!');
    console.log(`📊 Generated ${data.urls_generated} URLs`);
    
  } catch (error) {
    console.error('Error in saveSitemapToStorage:', error);
    throw error;
  }
};

// Alternative: Save to local public folder (for development)
export const saveSitemapToPublic = async (sitemapContent: string): Promise<void> => {
  try {
    // This would work in a Node.js environment, but not in browser
    // For Vite, we'll use a different approach
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    // Create download link (for manual download if needed)
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Sitemap ready for download');
  } catch (error) {
    console.error('Error in saveSitemapToPublic:', error);
    throw error;
  }
};

// Main function to update sitemap
export const updateSitemap = async (saveToStorage: boolean = true): Promise<void> => {
  try {
    console.log('🔄 Updating sitemap...');
    
    if (saveToStorage) {
      // Use secure Edge Function for production
      await saveSitemapToStorage();
    } else {
      // For development preview only
      const sitemapContent = await generateSitemap();
      console.log('Generated sitemap preview:', sitemapContent);
    }
    
    console.log('✅ Sitemap updated successfully');
  } catch (error) {
    console.error('❌ Error updating sitemap:', error);
    throw error;
  }
};