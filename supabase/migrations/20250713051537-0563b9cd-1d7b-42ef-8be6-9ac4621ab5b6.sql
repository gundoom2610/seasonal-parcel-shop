-- Create profiles table for admin management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, is_admin)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.email = 'lipink2003@gmail.com' -- Set admin for this specific email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing RLS policies to use profiles table
DROP POLICY "Admin can manage categories" ON public.categories;
DROP POLICY "Admin can manage parcels" ON public.parcels;

CREATE POLICY "Admin can manage categories" 
ON public.categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can manage parcels" 
ON public.parcels 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Update storage policies
DROP POLICY "Admin can upload product images" ON storage.objects;
DROP POLICY "Admin can update product images" ON storage.objects;
DROP POLICY "Admin can delete product images" ON storage.objects;

CREATE POLICY "Admin can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'products' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can update product images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'products' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can delete product images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'products' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Add trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample parcels with Indonesian content
INSERT INTO public.parcels (name, slug, description, price, category_id, image_url) VALUES 
(
  'Parcel Lebaran Premium Deluxe', 
  'parcel-lebaran-premium-deluxe',
  'Parcel Lebaran eksklusif berisi kurma premium, kue kering spesial, dodol, dan berbagai makanan tradisional pilihan untuk merayakan Idul Fitri bersama keluarga tercinta.',
  350000,
  (SELECT id FROM public.categories WHERE slug = 'lebaran'),
  ''
),
(
  'Parcel Keramik Cantik Lebaran', 
  'parcel-keramik-cantik-lebaran',
  'Parcel Lebaran dengan toples keramik cantik berisi aneka kue kering premium, nastar, kastengel, dan permen tradisional. Keramik dapat digunakan kembali sebagai hiasan rumah.',
  275000,
  (SELECT id FROM public.categories WHERE slug = 'lebaran'),
  ''
),
(
  'Hampers Natal Istimewa', 
  'hampers-natal-istimewa',
  'Hampers Natal berisi wine premium, cookies import, cokelat Belgium, kue Natal tradisional, dan ornamen Natal cantik dalam kemasan mewah.',
  425000,
  (SELECT id FROM public.categories WHERE slug = 'christmas'),
  ''
),
(
  'Parcel Imlek Hoki', 
  'parcel-imlek-hoki',
  'Parcel Tahun Baru Imlek berisi kue keranjang, permen hoki, teh premium, manisan buah, dan berbagai makanan tradisional Tionghoa untuk membawa keberuntungan.',
  300000,
  (SELECT id FROM public.categories WHERE slug = 'lunar-new-year'),
  ''
);