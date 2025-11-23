-- Add room details columns to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN room_id TEXT,
ADD COLUMN room_password TEXT;