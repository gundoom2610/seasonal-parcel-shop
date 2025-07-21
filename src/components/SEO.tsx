import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  image?: string;
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
  image = "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=630&fit=crop&auto=format",
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
        "image": image,
        "telephone": "+62-xxx-xxxx-xxxx",
        "email": "info@lipinkparcel.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. Raya Cirebon",
          "addressLocality": "Cirebon",
          "addressRegion": "Jawa Barat",
          "postalCode": "45111",
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
          "ratingValue": "4.8",
          "reviewCount": "500",
          "bestRating": "5",
          "worstRating": "1"
        },
        "sameAs": [
          "https://instagram.com/lipinkparcel",
          "https://facebook.com/lipinkparcel",
          "https://www.tokopedia.com/lipinkparcel",
          "https://shopee.co.id/lipinkparcel"
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Parcel dan Hampers",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Parcel Lebaran Premium",
                "category": "Gift Hampers"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Parcel Natal Eksklusif",
                "category": "Gift Hampers"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Parcel Imlek Spesial",
                "category": "Gift Hampers"
              }
            }
          ]
        }
      },
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
          "target": `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
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
          "url": image
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
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Lipink Parcel Cirebon" />
      <meta property="og:locale" content="id_ID" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@lipinkparcel" />
      <meta name="twitter:creator" content="@lipinkparcel" />
      
      {/* Additional Meta Tags for Local SEO */}
      <meta name="geo.region" content="ID-JB" />
      <meta name="geo.placename" content="Cirebon" />
      <meta name="geo.position" content="-6.7063;108.5492" />
      <meta name="ICBM" content="-6.7063, 108.5492" />
      
      {/* Mobile and Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="format-detection" content="telephone=yes" />
      
      {/* Theme and Brand Colors */}
      <meta name="theme-color" content="#ec4899" />
      <meta name="msapplication-TileColor" content="#ec4899" />
      <meta name="msapplication-navbutton-color" content="#ec4899" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Language and Content */}
      <meta httpEquiv="content-language" content="id" />
      <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
      
      {/* Additional Article Meta Tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={author} />
          <meta property="article:section" content="Parcel dan Hampers" />
          <meta property="article:tag" content="parcel cirebon, hampers, gift" />
        </>
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://api.whatsapp.com" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Performance Hints */}
      <link rel="preload" href="/fonts/primary-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    </Helmet>
  );
};