import { useCallback } from 'react';
import { updateSitemap } from '@/utils/sitemap';
import { useToast } from '@/hooks/use-toast';

export const useSitemap = () => {
  const { toast } = useToast();

  const regenerateSitemap = useCallback(async (showToast: boolean = false) => {
    try {
      // Check if we're in development or production
      const isDev = import.meta.env.DEV;
      
      await updateSitemap(!isDev); // Save to storage only in production
      
      if (showToast) {
        toast({
          title: "Success",
          description: `Sitemap updated successfully! ${isDev ? '(Development mode)' : ''}`,
        });
      }
    } catch (error) {
      console.error('Error regenerating sitemap:', error);
      
      if (showToast) {
        toast({
          title: "Warning",
          description: "Failed to update sitemap, but your changes were saved.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  return { regenerateSitemap };
};