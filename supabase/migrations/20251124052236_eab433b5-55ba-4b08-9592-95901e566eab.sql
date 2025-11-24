-- Add UPI ID column to profiles table for payment methods
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS upi_id text;