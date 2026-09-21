-- ==============================================================================
-- 1. Enable Geolocation Extensions
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ==============================================================================
-- 2. Add New Columns to Businesses Table
-- ==============================================================================
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Optional: Index on lat/lng for faster earthdistance queries
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING gist (ll_to_earth(lat, lng));

-- ==============================================================================
-- 3. Trigger to Auto-Update average_rating and review_count
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE businesses
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = NEW.business_id
      ),
      review_count = (
        SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id
      )
    WHERE id = NEW.business_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE businesses
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = OLD.business_id
      ),
      review_count = (
        SELECT COUNT(*) FROM reviews WHERE business_id = OLD.business_id
      )
    WHERE id = OLD.business_id;
  END IF;
  RETURN NULL; -- After trigger doesn't need to return row
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_business_rating ON reviews;
CREATE TRIGGER trigger_update_business_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

-- Backfill existing ratings
UPDATE businesses b
SET 
  average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE business_id = b.id), 0),
  review_count = (SELECT COUNT(*) FROM reviews WHERE business_id = b.id);

-- ==============================================================================
-- 4. RPC Function for Geospatial + Full Filter Search
-- ==============================================================================
-- This function allows us to search businesses by distance, category, city, and text.
-- It returns the distance in kilometers.
CREATE OR REPLACE FUNCTION search_businesses_geo(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC,
  p_category_slug TEXT DEFAULT NULL,
  p_city_slug TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT 0,
  p_limit INTEGER DEFAULT 24,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  verification_tier TEXT,
  is_featured BOOLEAN,
  cover_image_url TEXT,
  last_confirmed_at TIMESTAMPTZ,
  category_id UUID,
  city_id UUID,
  lat NUMERIC,
  lng NUMERIC,
  average_rating NUMERIC,
  review_count INTEGER,
  distance_km NUMERIC,
  category_name TEXT,
  category_slug TEXT,
  city_name TEXT,
  city_slug TEXT,
  state_name TEXT,
  subscription_tier TEXT,
  total_count BIGINT
) AS $$
DECLARE
  v_category_id UUID;
  v_city_id UUID;
  v_total_count BIGINT;
BEGIN
  -- Resolve Category ID
  IF p_category_slug IS NOT NULL THEN
    SELECT c.id INTO v_category_id FROM categories c WHERE c.slug = p_category_slug;
  END IF;

  -- Resolve City ID
  IF p_city_slug IS NOT NULL THEN
    SELECT c.id INTO v_city_id FROM cities c WHERE c.slug = p_city_slug;
  END IF;

  -- First, get the total count for pagination (ignoring offset/limit)
  SELECT COUNT(*) INTO v_total_count
  FROM businesses b
  WHERE b.is_active = true
    AND (v_category_id IS NULL OR b.category_id = v_category_id)
    AND (v_city_id IS NULL OR b.city_id = v_city_id)
    AND (p_min_rating = 0 OR b.average_rating >= p_min_rating)
    AND (
      p_search_query IS NULL 
      OR p_search_query = '' 
      OR b.search_vector @@ websearch_to_tsquery('english', p_search_query)
    )
    AND (
      p_lat IS NULL OR p_lng IS NULL OR b.lat IS NULL OR b.lng IS NULL OR p_radius_km IS NULL OR
      (earth_distance(ll_to_earth(p_lat, p_lng), ll_to_earth(b.lat, b.lng)) / 1000) <= p_radius_km
    );

  -- Then return the paginated results
  RETURN QUERY
  SELECT 
    b.id, b.name, b.slug, b.address, b.phone, b.whatsapp,
    b.verification_tier, b.is_featured, b.cover_image_url, b.last_confirmed_at,
    b.category_id, b.city_id, b.lat, b.lng, b.average_rating, b.review_count,
    CASE 
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND b.lat IS NOT NULL AND b.lng IS NOT NULL 
      THEN (earth_distance(ll_to_earth(p_lat, p_lng), ll_to_earth(b.lat, b.lng)) / 1000)::NUMERIC
      ELSE NULL::NUMERIC
    END AS distance_km,
    cat.name AS category_name,
    cat.slug AS category_slug,
    cit.name AS city_name,
    cit.slug AS city_slug,
    st.name AS state_name,
    b.subscription_tier,
    v_total_count AS total_count
  FROM businesses b
  JOIN categories cat ON b.category_id = cat.id
  JOIN cities cit ON b.city_id = cit.id
  JOIN states st ON cit.state_id = st.id
  WHERE b.is_active = true
    AND (v_category_id IS NULL OR b.category_id = v_category_id)
    AND (v_city_id IS NULL OR b.city_id = v_city_id)
    AND (p_min_rating = 0 OR b.average_rating >= p_min_rating)
    AND (
      p_search_query IS NULL 
      OR p_search_query = '' 
      OR b.search_vector @@ websearch_to_tsquery('english', p_search_query)
    )
    AND (
      p_lat IS NULL OR p_lng IS NULL OR b.lat IS NULL OR b.lng IS NULL OR p_radius_km IS NULL OR
      (earth_distance(ll_to_earth(p_lat, p_lng), ll_to_earth(b.lat, b.lng)) / 1000) <= p_radius_km
    )
  ORDER BY 
    CASE 
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN earth_distance(ll_to_earth(p_lat, p_lng), ll_to_earth(b.lat, b.lng))
      ELSE 0
    END ASC,
    CASE b.subscription_tier WHEN 'premium' THEN 0 WHEN 'pro' THEN 1 ELSE 2 END ASC,
    b.is_featured DESC, 
    b.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 5. Helper function: Random Lat/Lng Generator for Testing (Enugu Area)
-- ==============================================================================
-- This populates all existing businesses with random coordinates near Enugu for testing.
-- Enugu coordinates: ~6.4402, 7.4943
UPDATE businesses
SET 
  lat = 6.4402 + (random() * 0.1 - 0.05),
  lng = 7.4943 + (random() * 0.1 - 0.05)
WHERE lat IS NULL OR lng IS NULL;
