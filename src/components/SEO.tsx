import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  image?: string;   // Priority 1
  ogImage?: string; // Priority 2 (Backup)
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
  // 1. Define Base URL
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://parcelcirebon.com';

  // 2. Construct Full URL (Prevent double slashes or double domain)
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  const canonicalUrl = canonical || fullUrl;

  // 3. --- IMAGE LOGIC ---
  // Priority: image prop > ogImage prop > Default local image
  const imagePath = image || ogImage || "/og-image.png";
  
  // Ensure image URL is absolute (Required for OG Tags)
  // If it starts with http, use as is. If it's relative (like /og-image.png), prepend siteUrl.
  const finalImage = imagePath.startsWith('http') 
    ? imagePath 
    : `${siteUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;

  // 4. Schema Logic
  const baseSchema = [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Lipink Parcel Cirebon",
      "description": description,
      "publisher": { "@id": `${siteUrl}/#organization` }
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

  // Local Business Schema (Default for non-product pages)
  const localBusinessSchema = {
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    "name": "Lipink Parcel Cirebon",
    "image": finalImage,
    "telephone": "+62-812-2220-8580",
    "email": "hello@parcelcirebon.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Garuda No.4, Pekiringan",
      "addressLocality": "Cirebon",
      "addressRegion": "Jawa Barat",
      "postalCode": "45131",
      "addressCountry": "ID"
    },
    "priceRange": "Rp 50.000 - Rp 2.000.000"
  };

  let graphData = [...baseSchema];

  if (type === 'product' && structuredData) {
    graphData.push(structuredData as any);
  } else {
    graphData.push(localBusinessSchema as any);
  }

  const finalJsonLd = {
    "@context": "https://schema.org",
    "@graph": graphData
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      
      {/* Open Graph / Facebook / WhatsApp */}
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
      
      <script type="application/ld+json">
        {JSON.stringify(finalJsonLd)}
      </script>
    </Helmet>
  );
};