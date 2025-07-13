-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parcels table
CREATE TABLE public.parcels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  price INTEGER NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Categories are publicly readable" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Parcels are publicly readable" 
ON public.parcels 
FOR SELECT 
USING (true);

-- Create policies for admin access (only lipink2003@gmail.com)
CREATE POLICY "Admin can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.email() = 'lipink2003@gmail.com');

CREATE POLICY "Admin can manage parcels" 
ON public.parcels 
FOR ALL 
USING (auth.email() = 'lipink2003@gmail.com');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parcels_updated_at
  BEFORE UPDATE ON public.parcels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Create storage policies
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Admin can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'products' AND auth.email() = 'lipink2003@gmail.com');

CREATE POLICY "Admin can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'products' AND auth.email() = 'lipink2003@gmail.com');

CREATE POLICY "Admin can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'products' AND auth.email() = 'lipink2003@gmail.com');

-- Insert sample categories
INSERT INTO public.categories (name, slug) VALUES 
('Lebaran', 'lebaran'),
('Christmas', 'christmas'),
('Lunar New Year', 'lunar-new-year');