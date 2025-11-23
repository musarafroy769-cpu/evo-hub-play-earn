-- Create tournament results table to store winners
CREATE TABLE public.tournament_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  position INTEGER NOT NULL,
  kills INTEGER DEFAULT 0,
  prize_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view tournament results"
ON public.tournament_results
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tournament results"
ON public.tournament_results
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_tournament_results_tournament_id ON public.tournament_results(tournament_id);
CREATE INDEX idx_tournament_results_user_id ON public.tournament_results(user_id);