-- Add description and prize breakdown columns to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN description TEXT,
ADD COLUMN position_prizes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN per_kill_prize NUMERIC DEFAULT 0;