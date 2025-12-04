// Google Analytics Event Tracking Utility
// GA4 Measurement ID: G-FY46ZJDZQ4

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Generic event tracking function
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (isGtagAvailable()) {
    window.gtag('event', eventName, parameters);
  }
};

// ============ E-COMMERCE EVENTS ============

// Track when user views a product
export const trackViewItem = (product: {
  id: string;
  name: string;
  category: string;
  price: number;
}) => {
  trackEvent('view_item', {
    currency: 'IDR',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
    }]
  });
};

// Track when user views a category/collection
export const trackViewItemList = (
  listName: string,
  products: Array<{ id: string; name: string; category: string; price: number }>
) => {
  trackEvent('view_item_list', {
    item_list_name: listName,
    items: products.map((product, index) => ({
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      index: index,
    }))
  });
};

// Track when user clicks on a product
export const trackSelectItem = (product: {
  id: string;
  name: string;
  category: string;
  price: number;
}) => {
  trackEvent('select_item', {
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
    }]
  });
};

// Track add to cart (or in this case, WhatsApp order intent)
export const trackAddToCart = (product: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}) => {
  trackEvent('add_to_cart', {
    currency: 'IDR',
    value: product.price * product.quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: product.quantity,
    }]
  });
};

// Track begin checkout (WhatsApp order)
export const trackBeginCheckout = (product: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}) => {
  trackEvent('begin_checkout', {
    currency: 'IDR',
    value: product.price * product.quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: product.quantity,
    }]
  });
};

// ============ ENGAGEMENT EVENTS ============

// Track search
export const trackSearch = (searchTerm: string) => {
  trackEvent('search', {
    search_term: searchTerm,
  });
};

// Track share
export const trackShare = (method: string, contentType: string, itemId: string) => {
  trackEvent('share', {
    method: method,
    content_type: contentType,
    item_id: itemId,
  });
};

// Track page view (for SPA navigation)
export const trackPageView = (pagePath: string, pageTitle: string) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

// ============ CUSTOM EVENTS ============

// Track WhatsApp click
export const trackWhatsAppClick = (source: string, productName?: string) => {
  trackEvent('whatsapp_click', {
    source: source,
    product_name: productName || 'general',
  });
};

// Track category view
export const trackCategoryView = (categoryName: string, categorySlug: string, productCount: number) => {
  trackEvent('category_view', {
    category_name: categoryName,
    category_slug: categorySlug,
    product_count: productCount,
  });
};

// Track blog article view
export const trackBlogView = (articleTitle: string, articleSlug: string, category: string) => {
  trackEvent('blog_view', {
    article_title: articleTitle,
    article_slug: articleSlug,
    category: category,
  });
};

// Track filter usage
export const trackFilterUsage = (filterType: string, filterValue: string) => {
  trackEvent('filter_usage', {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// Track sort usage
export const trackSortUsage = (sortBy: string) => {
  trackEvent('sort_usage', {
    sort_by: sortBy,
  });
};

// Track external link click (Shopee, Tokopedia, etc.)
export const trackOutboundLink = (url: string, linkName: string) => {
  trackEvent('click', {
    event_category: 'outbound',
    event_label: linkName,
    transport_type: 'beacon',
    link_url: url,
  });
};

// Track scroll depth
export const trackScrollDepth = (percentage: number, pagePath: string) => {
  trackEvent('scroll', {
    percent_scrolled: percentage,
    page_path: pagePath,
  });
};

// Track time on page
export const trackTimeOnPage = (seconds: number, pagePath: string) => {
  trackEvent('timing_complete', {
    name: 'time_on_page',
    value: seconds,
    page_path: pagePath,
  });
};
