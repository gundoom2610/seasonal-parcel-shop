import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  image?: string;   // Primary image prop
  ogImage?: string; // Alias often used in other components
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

  // --- IMAGE LOGIC FIX ---
  // 1. Use 'image' prop first
  // 2. If missing, use 'ogImage' prop (alias)
  // 3. If both missing, use default Unsplash
  const rawImage = image || ogImage || "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=630&fit=crop&auto=format";
  
  // Ensure image URL is absolute (Open Graph requires absolute URLs)
  const finalImage = rawImage.startsWith('http') ? rawImage : `${siteUrl}${rawImage}`;

  // Default structured data for local business
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#organization`,
        "name": "Lipink Parcel Cirebon",
        "alternateName": "Lipink Parcel",
        "description": "Toko parcel premium dan hampers terpercaya di Cirebon untuk berbagai acara spesial sejak 2019",
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`,
          "width": 300,
          "height": 300
        },
        "image": finalImage, // Use calculated image
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
        "openingHours": "Mo-Su 08:00-20:00",
        "priceRange": "Rp 50.000 - Rp 2.000.000",
        "currenciesAccepted": "IDR",
        "paymentAccepted": "Cash, Transfer Bank, E-Wallet",
        "areaServed": {
          "@type": "City",
          "name": "Cirebon"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1200",
          "bestRating": "5",
          "worstRating": "1"
        },
        "sameAs": [
          "https://instagram.com/lipink2003",
          "https://shopee.co.id/lipink2003",
          "https://www.tokopedia.com/giftland"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Lipink Parcel Cirebon",
        "description": description,
        "publisher": {
          "@id": `${siteUrl}/#organization`
        }
      },
      {
        "@type": "WebPage",
        "@id": `${fullUrl}/#webpage`,
        "url": fullUrl,
        "name": title,
        "description": description,
        "isPartOf": {
          "@id": `${siteUrl}/#website`
        },
        "about": {
          "@id": `${siteUrl}/#organization`
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": finalImage
        },
        "datePublished": publishedTime || new Date().toISOString(),
        "dateModified": modifiedTime || new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`
        }
      }
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots Meta */}
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      <meta name="googlebot" content={noindex ? "noindex,nofollow" : "index,follow"} />
      
      {/* Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      
      {/* --- THE FIX: Using finalImage here --- */}
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:secure_url" content={finalImage} />
      
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Lipink Parcel Cirebon" />
      <meta property="og:locale" content="id_ID" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* --- THE FIX: Using finalImage here --- */}
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Theme and Brand Colors */}
      <meta name="theme-color" content="#ec4899" />
      <meta name="msapplication-TileColor" content="#ec4899" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};