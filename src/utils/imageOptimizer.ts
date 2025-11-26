// src/utils/imageOptimizer.ts

// This function appends Supabase transformation parameters
export const getOptimizedImage = (url: string, width: number = 400) => {
  if (!url) return "/placeholder.svg"; // Fallback
  
  // If it's already a local asset or not a Supabase URL, return as is
  if (!url.includes("supabase.co")) return url;

  // Append Supabase Storage transformation parameters
  // format=webp: Solves "Modern Image Format"
  // quality=80: Reduces size without visible quality loss
  // width=X: Solves "Properly Size Images"
  return `${url}?width=${width}&format=webp&quality=80`;
};