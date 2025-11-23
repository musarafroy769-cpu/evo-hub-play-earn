-- Add phone_number column to withdrawal_requests table
ALTER TABLE public.withdrawal_requests 
ADD COLUMN phone_number text;