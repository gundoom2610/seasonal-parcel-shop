import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  image?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  canonical?: string;
  noindex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEO = ({
  title,
  description,
  keywords,
  url,
  image,
  ogImage,
  type = 'website',
  structuredData,
  canonical,
  noindex = false,
  author = "Lipink Parcel Cirebon",
  publishedTime,
  modifiedTime
}: SEOProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lipinkparcel.com';
  const fullUrl = `${siteUrl}${url}`;
  const canonicalUrl = canonical || fullUrl;

  // Image Logic
  const rawImage = image || ogImage || "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=630&fit=crop&auto=format";
  const finalImage = rawImage.startsWith('http') ? rawImage : `${siteUrl}${rawImage}`;

  // --- 1. BASE SCHEMA (Organization/Website) ---
  // Used on every page
  const baseSchema = [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Lipink Parcel Cirebon",
      "description": description,
      "publisher": {
        "@id": `${siteUrl}/#organization`
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Lipink Parcel Cirebon",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
        "width": 112,
        "height": 112
      },
      "sameAs": [
        "https://instagram.com/lipink2003",
        "https://shopee.co.id/lipink2003",
        "https://www.tokopedia.com/giftland"
      ]
    }
  ];

  // --- 2. LOCAL BUSINESS SCHEMA (Homepage Only) ---
  const localBusinessSchema = {
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    "name": "Lipink Parcel Cirebon",
    "image": finalImage,
    "telephone": "+62-812-2220-8580",
    "email": "hello@lipinkparcel.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Garuda No.4, Pekiringan",
      "addressLocality": "Cirebon",
      "addressRegion": "Jawa Barat",
      "postalCode": "45131",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -6.7063,
      "longitude": 108.5492
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "08:00",
      "closes": "20:00"
    },
    "priceRange": "Rp 50.000 - Rp 2.000.000",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1200",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // --- 3. CONSTRUCT FINAL GRAPH ---
  let graphData = [...baseSchema];

  if (type === 'product' && structuredData) {
    // If it's a product page, add the specific Product schema passed from parent
    graphData.push(structuredData as any);
  } else {
    // If it's homepage or other pages, add LocalBusiness
    graphData.push(localBusinessSchema as any);
  }

  const finalJsonLd = {
    "@context": "https://schema.org",
    "@graph": graphData
  };

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:secure_url" content={finalImage} />
      <meta property="og:site_name" content="Lipink Parcel Cirebon" />
      <meta property="og:locale" content="id_ID" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalJsonLd)}
      </script>
    </Helmet>
  );
};