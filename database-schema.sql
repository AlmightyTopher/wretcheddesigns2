-- Wretched Designs 2 - Supabase Database Schema
-- Run this entire script in your Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Apparel', 'Custom printed clothing and accessories'),
('Cups', 'Drinkware and mugs'),
('Art', 'Digital art and prints'),
('Accessories', 'Various accessories and items');

-- 2. Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  stripe_price_id VARCHAR(255),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);

-- 3. Create gallery table
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_gallery_featured ON gallery(is_featured);
CREATE INDEX idx_gallery_order ON gallery(display_order);

-- 4. Create blogs table
CREATE TABLE blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_published ON blogs(is_published);
CREATE INDEX idx_blogs_published_at ON blogs(published_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public can read published blogs" ON blogs FOR SELECT USING (is_published = true);

-- 6. Insert sample gallery data with your 14 art images
INSERT INTO gallery (title, description, image_url, alt_text, is_featured, display_order) VALUES
('Digital Chaos 1', 'Abstract digital artwork featuring vibrant colors and chaotic patterns', '/Images/Art/0e24c8e1-ad42-4b6c-b538-672c737cec86.jpg', 'Colorful abstract digital art', true, 1),
('Neon Dreams', 'Cyberpunk-inspired artwork with neon colors and futuristic elements', '/Images/Art/212c84dc-0494-4fb2-950d-1a450d86abf6.jpg', 'Neon cyberpunk digital art', false, 2),
('Geometric Visions', 'Clean geometric patterns with bold color combinations', '/Images/Art/36f583e6-dae6-4858-a57e-b25c34e3b0da.jpg', 'Geometric pattern artwork', false, 3),
('Urban Decay', 'Industrial-themed artwork with gritty urban aesthetics', '/Images/Art/478cb881-8222-440c-9f67-e3e39fb24e5d.jpg', 'Urban industrial digital art', true, 4),
('Liquid Energy', 'Flowing liquid forms with dynamic energy patterns', '/Images/Art/4fb77fbe-3d28-40ce-9243-a683afc07b50.jpg', 'Liquid energy abstract art', false, 5),
('Digital Landscape', 'Surreal landscape created with digital techniques', '/Images/Art/51eb4dbf-9652-4c3b-8c35-0934874ec938.jpg', 'Digital landscape artwork', false, 6),
('Cosmic Storm', 'Space-themed artwork with cosmic storms and nebulae', '/Images/Art/56961627-4033-4cb0-a2ac-e6bd5315788d.jpg', 'Cosmic storm digital art', false, 7),
('Fractal Dreams', 'Complex fractal patterns with mesmerizing detail', '/Images/Art/6d986137-e20f-4f93-b67b-a8daa5870786.jpg', 'Fractal pattern artwork', false, 8),
('Neon City', 'Futuristic cityscape with neon lighting effects', '/Images/Art/87d3c5db-9cb0-4b1e-b039-af2a2bec69b1.jpg', 'Neon city digital artwork', true, 9),
('Abstract Flow', 'Flowing abstract forms with smooth color transitions', '/Images/Art/97cf6413-a320-4ba1-9d79-657133be2631.jpg', 'Abstract flowing artwork', false, 10),
('Digital Portal', 'Portal-themed artwork with dimensional effects', '/Images/Art/c8805ead-8f45-4031-bdc8-ada903582fba.jpg', 'Digital portal artwork', false, 11),
('Cyber Interface', 'Futuristic interface design with glowing elements', '/Images/Art/ca028ff7-530d-4d1f-9599-a5121425a313.jpg', 'Cyber interface digital art', false, 12),
('Quantum Field', 'Quantum physics-inspired artwork with particle effects', '/Images/Art/f121373f-f6f9-4c19-a8c2-a774c43fbb71.jpg', 'Quantum field digital art', false, 13),
('Digital Explosion', 'Explosive energy patterns with dynamic composition', '/Images/Art/f1e6e2ad-a738-4382-ab87-18e819284d2c.jpg', 'Digital explosion artwork', false, 14);
