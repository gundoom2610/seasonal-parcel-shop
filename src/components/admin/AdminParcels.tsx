import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSitemap } from '@/hooks/useSitemap';
import { Plus, Edit, Trash2, Upload, RefreshCw } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Parcel {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  category_id: string;
  category: Category;
}

export const AdminParcels = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '',
    image_url: ''
  });
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [regeneratingSitemap, setRegeneratingSitemap] = useState(false);
  const { toast } = useToast();
  const { regenerateSitemap } = useSitemap();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [parcelsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('parcels')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);
      
      setParcels(parcelsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      price: parseInt(formData.price)
    };
    
    try {
      if (editingParcel) {
        const { error } = await supabase
          .from('parcels')
          .update(submitData)
          .eq('id', editingParcel.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Parcel updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('parcels')
          .insert([submitData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Parcel created successfully!",
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
      fetchData();
      
      // Auto-regenerate sitemap after successful operation
      regenerateSitemap(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (parcel: Parcel) => {
    setEditingParcel(parcel);
    setFormData({
      name: parcel.name,
      slug: parcel.slug,
      description: parcel.description,
      price: parcel.price.toString(),
      category_id: parcel.category_id,
      image_url: parcel.image_url
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this parcel?')) return;
    
    try {
      const { error } = await supabase
        .from('parcels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Parcel deleted successfully!",
      });
      
      fetchData();
      
      // Auto-regenerate sitemap after successful deletion
      regenerateSitemap(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleManualSitemapRegeneration = async () => {
    setRegeneratingSitemap(true);
    try {
      await regenerateSitemap(true);
    } finally {
      setRegeneratingSitemap(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      category_id: '',
      image_url: ''
    });
    setEditingParcel(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  if (loading) {
    return <div>Loading parcels...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Parcels</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleManualSitemapRegeneration}
            disabled={regeneratingSitemap}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${regeneratingSitemap ? 'animate-spin' : ''}`} />
            {regeneratingSitemap ? 'Updating...' : 'Update Sitemap'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Parcel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingParcel ? 'Edit Parcel' : 'Add New Parcel'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (IDR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button type="button" disabled={uploading} variant="outline">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.image_url && (
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
                
                <Button type="submit" className="w-full">
                  {editingParcel ? 'Update Parcel' : 'Create Parcel'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parcels.map((parcel) => (
          <Card key={parcel.id}>
            <CardHeader>
              <div className="aspect-video relative overflow-hidden rounded">
                <img
                  src={parcel.image_url || '/placeholder.svg'}
                  alt={parcel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg">{parcel.name}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {parcel.category.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(parcel)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(parcel.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {parcel.description}
              </p>
              <p className="font-bold text-primary">
                {formatPrice(parcel.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                Slug: {parcel.slug}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};