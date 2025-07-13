import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  url?: string;
  structuredData?: object;
}

export const SEO = ({ title, description, ogImage, url, structuredData }: SEOProps) => {
  const siteUrl = window.location.origin;
  const fullUrl = url ? `${siteUrl}${url}` : window.location.href;
  const defaultOgImage = `${siteUrl}/placeholder.svg`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};