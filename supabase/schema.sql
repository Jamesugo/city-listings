-- ================================================================
-- NaijaList — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor when you create your project.
-- Phase 1 tables only. Phase 2+ tables are commented out.
-- ================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- CATEGORIES
-- ================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '🏢',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- STATES
-- ================================================================
CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- CITIES
-- ================================================================
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state_id UUID REFERENCES states(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- BUSINESSES
-- ================================================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  description TEXT DEFAULT '',
  hours JSONB DEFAULT '{}',
  verification_tier TEXT DEFAULT 'none' CHECK (verification_tier IN ('none', 'phone', 'cac')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  gallery TEXT[] DEFAULT '{}',
  last_confirmed_at TIMESTAMPTZ,
  page_views INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index (used in Phase 3)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, ''))
    ) STORED;

CREATE INDEX idx_businesses_search ON businesses USING GIN (search_vector);
CREATE INDEX idx_businesses_category ON businesses (category_id);
CREATE INDEX idx_businesses_city ON businesses (city_id);
CREATE INDEX idx_businesses_slug ON businesses (slug);
CREATE INDEX idx_businesses_active ON businesses (is_active) WHERE is_active = true;
CREATE INDEX idx_businesses_featured ON businesses (is_featured) WHERE is_featured = true;

-- Auto-update `updated_at` on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- PHASE 2+ TABLES (uncomment when ready)
-- ================================================================

-- USERS (for business owners and reviewers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  body TEXT DEFAULT '',
  owner_response TEXT,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (business_id, user_id) -- one review per user per business
);

-- ================================================================
-- SEED: Enugu State
-- ================================================================
INSERT INTO states (name, slug) VALUES ('Enugu', 'enugu');

-- Get the state ID for FK references
DO $$
DECLARE enugu_state_id UUID;
BEGIN
  SELECT id INTO enugu_state_id FROM states WHERE slug = 'enugu';

  INSERT INTO cities (name, slug, state_id) VALUES
    ('Enugu', 'enugu-city', enugu_state_id),
    ('Nsukka', 'nsukka', enugu_state_id),
    ('Awgu', 'awgu', enugu_state_id),
    ('Oji River', 'oji-river', enugu_state_id),
    ('Agbani', 'agbani', enugu_state_id);
END $$;

INSERT INTO categories (name, slug, icon, description) VALUES
  ('Food & Restaurants', 'food-restaurants', '🍽️', 'Restaurants, fast food, canteens, food vendors and caterers.'),
  ('Retail & Shopping', 'retail-shopping', '🛍️', 'Supermarkets, boutiques, markets, and online stores.'),
  ('Health & Wellness', 'health-wellness', '🏥', 'Clinics, hospitals, pharmacies, gyms and wellness centres.'),
  ('Professional Services', 'professional-services', '💼', 'Lawyers, accountants, consultants and business advisors.'),
  ('Auto & Transport', 'auto-transport', '🚗', 'Mechanics, spare parts dealers, car hire and logistics.'),
  ('Home Services', 'home-services', '🏠', 'Plumbers, electricians, painters, cleaners and contractors.'),
  ('Beauty & Personal Care', 'beauty-personal-care', '💅', 'Salons, barbershops, spas, and cosmetics vendors.'),
  ('Education & Tutoring', 'education-tutoring', '📚', 'Schools, tutorial centres, coaching and training services.'),
  ('Hotels & Lodging', 'hotels-lodging', '🏨', 'Hotels, guesthouses, Airbnb and short-stay apartments.'),
  ('Events & Entertainment', 'events-entertainment', '🎉', 'Event planners, DJs, photographers, venues and décor.'),
  ('Finance & Insurance', 'finance-insurance', '🏦', 'Microfinance, insurance agents, forex and money transfer.'),
  ('Tech & Digital Services', 'tech-digital', '💻', 'Web developers, graphic designers, IT support and repairs.');
