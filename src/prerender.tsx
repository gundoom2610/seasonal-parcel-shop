import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Navbar } from '@/components/Navbar';
import { Home } from '@/pages/Home';
import { CategoryPage } from '@/pages/CategoryPage';
import { ParcelDetail } from '@/pages/ParcelDetail';
import { BlogList } from '@/pages/BlogList';
import { BlogDetail } from '@/pages/BlogDetail';
import { ReturnPolicy } from '@/pages/ReturnPolicy';
import { Routes, Route } from 'react-router-dom';
import { blogPosts } from '@/data/blogs';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseServer = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

interface PrerenderData {
  url: string;
}

interface PrerenderResult {
  html: string;
  links?: Set<string>;
  head?: {
    lang?: string;
    title?: string;
    elements?: Set<{ type: string; props: Record<string, string> }>;
  };
}

// Fetch all product routes from database
async function fetchProductRoutes(): Promise<string[]> {
  const routes: string[] = [];

  try {
    // Fetch categories
    const { data: categories } = await supabaseServer
      .from('categories')
      .select('slug');

    if (categories) {
      categories.forEach((cat: { slug: string }) => {
        routes.push(`/produk/${cat.slug}`);
      });
    }

    // Fetch parcels with category
    const { data: parcels } = await supabaseServer
      .from('parcels')
      .select('slug, categories(slug)');

    if (parcels) {
      parcels.forEach((parcel: any) => {
        const categorySlug = parcel.categories?.slug || parcel.categories?.[0]?.slug;
        if (categorySlug) {
          routes.push(`/produk/${categorySlug}/${parcel.slug}`);
        }
      });
    }
  } catch (error) {
    console.warn('Failed to fetch product routes:', error);
  }

  return routes;
}

// Extract links from rendered HTML
function extractLinks(html: string): Set<string> {
  const links = new Set<string>();
  const hrefRegex = /href="(\/[^"#?]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    // Only include internal links, exclude auth/admin
    if (href && !href.startsWith('/auth') && !href.startsWith('/admin')) {
      links.add(href);
    }
  }

  return links;
}

export async function prerender(data: PrerenderData): Promise<PrerenderResult> {
  const { url } = data;
  const queryClient = new QueryClient();

  // Mock AuthProvider for SSR (no auth during prerender)
  const MockAuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  const App = () => (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <MockAuthProvider>
          <TooltipProvider>
            <StaticRouter location={url}>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/produk/:categorySlug" element={<CategoryPage />} />
                <Route path="/produk/:categorySlug/:parcelSlug" element={<ParcelDetail />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
              </Routes>
            </StaticRouter>
          </TooltipProvider>
        </MockAuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );

  const html = renderToString(<App />);

  // Extract links from rendered HTML for crawling
  const links = extractLinks(html);

  // Add known blog routes
  blogPosts.forEach(post => {
    links.add(`/blog/${post.slug}`);
  });

  // Fetch and add product routes from database
  const productRoutes = await fetchProductRoutes();
  productRoutes.forEach(route => links.add(route));

  return {
    html,
    links,
    head: {
      lang: 'id',
    },
  };
}
