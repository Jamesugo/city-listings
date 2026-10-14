-- Public read access for the location reference tables.
-- These tables are lookup data and should remain readable, but should not
-- be seeded or mutated from this access script.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.states, public.cities TO anon, authenticated;

ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "States are publicly readable" ON public.states;
CREATE POLICY "States are publicly readable"
  ON public.states
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Cities are publicly readable" ON public.cities;
CREATE POLICY "Cities are publicly readable"
  ON public.cities
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Any reference data seeding should be managed in a dedicated migration or
-- application bootstrap script, not inside a server access policy file.
