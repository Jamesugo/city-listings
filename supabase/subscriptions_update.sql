-- ==============================================================================
-- 1. Add Subscription Tier and Lead Tracking to Businesses
-- ==============================================================================
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS call_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_gallery TEXT[] DEFAULT '{}';

-- ==============================================================================
-- 2. Business Promos Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS business_promos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  active_until TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_business_promos_business_id ON business_promos (business_id);
CREATE INDEX IF NOT EXISTS idx_business_promos_active_until ON business_promos (active_until);

-- ==============================================================================
-- 3. Atomic Lead Tracking RPC Functions
-- ==============================================================================
CREATE OR REPLACE FUNCTION increment_page_views(biz_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET page_views = COALESCE(page_views, 0) + 1
  WHERE id = biz_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_whatsapp_clicks(biz_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET whatsapp_clicks = COALESCE(whatsapp_clicks, 0) + 1
  WHERE id = biz_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_call_clicks(biz_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET call_clicks = COALESCE(call_clicks, 0) + 1
  WHERE id = biz_id;
END;
$$ LANGUAGE plpgsql;
