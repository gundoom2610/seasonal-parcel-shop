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

export const generateSitemap = async (): Promise<string> => {
  const domain = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';
  
  // Static routes
  const staticRoutes: SitemapUrl[] = [
    { url: '/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
    { url: '/produk', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.8 },
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

export const saveSitemapToStorage = async (sitemapContent: string): Promise<void> => {
  try {
    // Save to Supabase storage
    const { error } = await supabase.storage
      .from('public')
      .upload('sitemap.xml', new Blob([sitemapContent], { type: 'application/xml' }), {
        upsert: true,
        contentType: 'application/xml'
      });

    if (error) {
      console.error('Error saving sitemap to storage:', error);
      throw error;
    }

    console.log('✅ Sitemap saved to storage successfully');
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

export const updateSitemap = async (saveToStorage: boolean = true): Promise<void> => {
  try {
    console.log('🔄 Updating sitemap...');
    const sitemapContent = await generateSitemap();
    
    if (saveToStorage) {
      await saveSitemapToStorage(sitemapContent);
    } else {
      // For development, just log the sitemap
      console.log('Generated sitemap:', sitemapContent);
    }
    
    console.log('✅ Sitemap updated successfully');
  } catch (error) {
    console.error('❌ Error updating sitemap:', error);
    throw error;
  }
};