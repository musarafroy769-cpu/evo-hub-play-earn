-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create admin settings table for QR code
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Policies for admin settings
CREATE POLICY "Anyone can view admin settings"
ON public.admin_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.admin_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (p_user_id, p_type, p_title, p_message);
END;
$$;

-- Trigger for withdrawal approval notification
CREATE OR REPLACE FUNCTION notify_withdrawal_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'withdrawal',
      CASE 
        WHEN NEW.status = 'approved' THEN 'Withdrawal Approved'
        ELSE 'Withdrawal Rejected'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN '₹' || NEW.amount || ' has been transferred to your UPI'
        ELSE 'Your withdrawal request of ₹' || NEW.amount || ' was rejected'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER withdrawal_status_notification
AFTER UPDATE ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION notify_withdrawal_status();

-- Trigger for deposit approval notification
CREATE OR REPLACE FUNCTION notify_deposit_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'deposit',
      CASE 
        WHEN NEW.status = 'approved' THEN 'Deposit Approved'
        ELSE 'Deposit Rejected'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN '₹' || NEW.amount || ' has been added to your wallet'
        ELSE 'Your deposit request of ₹' || NEW.amount || ' was rejected'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER deposit_status_notification
AFTER UPDATE ON public.deposit_requests
FOR EACH ROW
EXECUTE FUNCTION notify_deposit_status();

-- Trigger for tournament live notification
CREATE OR REPLACE FUNCTION notify_tournament_live()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'ongoing' AND (OLD.status IS NULL OR OLD.status != 'ongoing') THEN
    -- Notify all participants
    INSERT INTO public.notifications (user_id, type, title, message)
    SELECT 
      tp.user_id,
      'tournament',
      'Tournament is Live!',
      NEW.title || ' has started. Room ID: ' || COALESCE(NEW.room_id, 'TBA')
    FROM public.tournament_participants tp
    WHERE tp.tournament_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tournament_live_notification
AFTER UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION notify_tournament_live();