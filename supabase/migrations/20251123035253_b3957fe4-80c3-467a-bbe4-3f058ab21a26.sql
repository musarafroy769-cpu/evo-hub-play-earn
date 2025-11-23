-- Create deposit_requests table
CREATE TABLE public.deposit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_id TEXT NOT NULL,
  depositor_name TEXT NOT NULL,
  depositor_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for deposit requests
CREATE POLICY "Users can create deposit requests" 
ON public.deposit_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deposit requests" 
ON public.deposit_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposit requests" 
ON public.deposit_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update deposit requests" 
ON public.deposit_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_deposit_requests_updated_at
BEFORE UPDATE ON public.deposit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();