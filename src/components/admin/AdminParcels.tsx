import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSitemap } from '@/hooks/useSitemap';
import { Plus, Edit2, Trash2, Upload, RefreshCw, Image as ImageIcon, Search } from 'lucide-react';

// --- IMAGE COMPRESSION UTILITY ---
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (img.width > maxWidth) {
          const scaleFactor = maxWidth / img.width;
          newWidth = maxWidth;
          newHeight = img.height * scaleFactor;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- TYPES ---
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '', // This stores the raw numeric string (e.g. "100000")
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
          .select(`*, category:categories(id, name, slug)`)
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

  // --- IMAGE UPLOAD HANDLER ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      toast({ title: "Optimizing...", description: "Compressing image for faster loading." });
      const compressedBlob = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const compressedFile = new File([compressedBlob], fileName, { type: 'image/webp' });

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, compressedFile, { upsert: true, contentType: 'image/webp' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('products').getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      
      const originalSize = (file.size / 1024).toFixed(0);
      const newSize = (compressedBlob.size / 1024).toFixed(0);

      toast({ 
        title: "Success", 
        description: `Image optimized! Reduced from ${originalSize}KB to ${newSize}KB.` 
      });

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // --- HANDLE SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please select a category before saving.",
        variant: "destructive",
      });
      return;
    }

    // Safely parse the raw price string to an integer
    const priceInt = formData.price ? parseInt(formData.price) : 0;
    const submitData = { ...formData, price: priceInt };
    
    try {
      if (editingParcel) {
        const { error } = await supabase.from('parcels').update(submitData).eq('id', editingParcel.id);
        if (error) throw error;
        toast({ title: "Success", description: "Parcel updated successfully!" });
      } else {
        const { error } = await supabase.from('parcels').insert([submitData]);
        if (error) throw error;
        toast({ title: "Success", description: "Parcel created successfully!" });
      }
      
      resetForm();
      setIsDialogOpen(false);
      fetchData();
      regenerateSitemap(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      const { error } = await supabase.from('parcels').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Parcel deleted successfully!" });
      fetchData();
      regenerateSitemap(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleManualSitemapRegeneration = async () => {
    setRegeneratingSitemap(true);
    try { await regenerateSitemap(true); } finally { setRegeneratingSitemap(false); }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', price: '', category_id: '', image_url: '' });
    setEditingParcel(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  // --- HELPER FOR INPUT DISPLAY ---
  const formatInputPrice = (val: string) => {
    if (!val) return '';
    // Format raw number string to "100.000"
    return new Intl.NumberFormat('id-ID').format(Number(val));
  };

  const filteredParcels = parcels.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center animate-pulse">Loading data...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">Parcels</h2>
              <p className="text-xs text-slate-500">{parcels.length} Items Total</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={handleManualSitemapRegeneration}
                disabled={regeneratingSitemap}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-2 ${regeneratingSitemap ? 'animate-spin' : ''}`} />
                {regeneratingSitemap ? 'Updating...' : 'Sitemap'}
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white shadow-md transition-all active:scale-95">
                    <Plus className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Add New</span>
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto rounded-xl">
                  <DialogHeader>
                    <DialogTitle>{editingParcel ? 'Edit Parcel' : 'Add New Parcel'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Image Upload Area */}
                    <div className="flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4">
                        {formData.image_url ? (
                          <div className="relative group w-32 h-32 md:w-40 md:h-40">
                             <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                             <label htmlFor="image-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg text-white font-medium text-xs">
                                Change Image
                             </label>
                          </div>
                        ) : (
                          <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-slate-300" />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                           <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                           {!formData.image_url && (
                             <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-upload')?.click()} disabled={uploading}>
                               <Upload className="h-4 w-4 mr-2" /> Upload Image
                             </Button>
                           )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Parcel Lebaran Gold" />
                      </div>
                      
                      <div className="space-y-2 col-span-1">
                         <Label htmlFor="category">Category</Label>
                         <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* --- MODIFIED PRICE INPUT --- */}
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor="price">Price (IDR)</Label>
                        <Input 
                          id="price" 
                          type="text" // Changed from number to text
                          placeholder="0"
                          value={formatInputPrice(formData.price)} // Show dotted format (100.000)
                          onChange={(e) => {
                            // Remove non-numeric characters (dots) to save raw number
                            const rawValue = e.target.value.replace(/\D/g, '');
                            setFormData(prev => ({ ...prev, price: rawValue }));
                          }}
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-xs text-slate-500">Auto-generated Slug</Label>
                      <Input id="slug" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} required className="bg-slate-50 font-mono text-xs" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Product details..." />
                    </div>
                    
                    <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 mt-2">
                      {editingParcel ? 'Save Changes' : 'Create Parcel'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input 
                placeholder="Search parcels..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200"
             />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {filteredParcels.map((parcel) => (
            <div 
              key={parcel.id} 
              className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img
                  src={parcel.image_url || '/placeholder.svg'}
                  alt={parcel.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                   <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-normal shadow-sm hover:bg-white text-slate-800">
                     {parcel.category?.name}
                   </Badge>
                </div>
              </div>

              <div className="p-3 md:p-4 flex flex-col flex-1 gap-1">
                <h3 className="font-semibold text-slate-800 text-sm md:text-base line-clamp-1" title={parcel.name}>
                  {parcel.name}
                </h3>
                <p className="text-pink-600 font-bold text-sm md:text-base">
                  {formatPrice(parcel.price)}
                </p>
                
                <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[60px]">
                    {parcel.slug}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => handleEdit(parcel)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(parcel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredParcels.length === 0 && (
           <div className="text-center py-20 text-slate-400">
              <p>No parcels found matching "{searchTerm}"</p>
           </div>
        )}
      </div>
    </div>
  );
};