-- Grant admin role to mm@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('970294af-dc20-45e5-be8b-12d77a96c45a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add index on profiles for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Add index on withdrawal_requests for faster admin queries
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);