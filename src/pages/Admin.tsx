import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminParcels } from '@/components/admin/AdminParcels';

export const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (!isAdmin) {
        navigate('/');
        return;
      }
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <>
      <SEO
        title="Admin Panel - Lipink Parcels"
        description="Manage categories and parcels for Lipink parcels e-commerce site."
        url="/admin"
        noindex={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="parcels">Parcels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>
          
          <TabsContent value="parcels">
            <AdminParcels />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};