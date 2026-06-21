
CREATE TABLE public.road_complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  road_name TEXT NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  authority TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.road_complaints TO anon, authenticated;
GRANT ALL ON public.road_complaints TO service_role;
ALTER TABLE public.road_complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view complaints" ON public.road_complaints FOR SELECT USING (true);
CREATE POLICY "Anyone can submit complaints" ON public.road_complaints FOR INSERT WITH CHECK (true);
