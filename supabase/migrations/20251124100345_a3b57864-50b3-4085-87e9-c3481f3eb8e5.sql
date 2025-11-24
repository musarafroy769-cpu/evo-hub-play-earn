-- Create an optimized function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard_stats(
  p_game_type TEXT DEFAULT NULL,
  p_time_filter TEXT DEFAULT 'all',
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  game_type TEXT,
  total_earnings NUMERIC,
  total_wins BIGINT,
  total_kills BIGINT,
  matches_played BIGINT,
  avg_position NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  date_filter TIMESTAMP;
BEGIN
  -- Calculate date filter
  CASE p_time_filter
    WHEN 'week' THEN 
      date_filter := NOW() - INTERVAL '7 days';
    WHEN 'month' THEN 
      date_filter := NOW() - INTERVAL '1 month';
    ELSE 
      date_filter := '1970-01-01'::TIMESTAMP;
  END CASE;

  RETURN QUERY
  WITH player_stats AS (
    SELECT 
      tr.user_id,
      p.username,
      p.avatar_url,
      t.game_type,
      COALESCE(SUM(tr.prize_amount), 0) as total_earnings,
      COUNT(CASE WHEN tr.position = 1 THEN 1 END) as total_wins,
      COALESCE(SUM(tr.kills), 0) as total_kills,
      COUNT(*) as matches_played,
      ROUND(AVG(tr.position), 1) as avg_position
    FROM tournament_results tr
    INNER JOIN tournaments t ON tr.tournament_id = t.id
    INNER JOIN profiles p ON tr.user_id = p.id
    WHERE tr.created_at >= date_filter
      AND (p_game_type IS NULL OR t.game_type = p_game_type)
    GROUP BY tr.user_id, p.username, p.avatar_url, t.game_type
  )
  SELECT * FROM player_stats
  ORDER BY total_earnings DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_results_user_created 
  ON tournament_results(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_results_tournament 
  ON tournament_results(tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournaments_game_type 
  ON tournaments(game_type);

CREATE INDEX IF NOT EXISTS idx_tournaments_status_scheduled 
  ON tournaments(status, scheduled_at);

-- Add index for deposit and withdrawal queries
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_created 
  ON deposit_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_created 
  ON withdrawal_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_participants_user 
  ON tournament_participants(user_id, joined_at DESC);