-- Create trigger to notify participants when tournament goes live
CREATE TRIGGER trigger_notify_tournament_live
  AFTER UPDATE ON public.tournaments
  FOR EACH ROW
  WHEN (NEW.status = 'ongoing' AND (OLD.status IS NULL OR OLD.status != 'ongoing'))
  EXECUTE FUNCTION public.notify_tournament_live();