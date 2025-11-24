import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Award, Crown, Medal, TrendingUp } from "lucide-react";
import { useEffect, useState, useMemo, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/SkeletonCard";

interface PlayerStats {
  user_id: string;
  username: string;
  avatar_url: string | null;
  game_type: string | null;
  total_earnings: number;
  total_wins: number;
  total_kills: number;
  matches_played: number;
  avg_position: number;
}

const Leaderboard = () => {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"earnings" | "wins" | "kills">("earnings");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLeaderboard(true);
  }, [timeFilter, gameFilter, sortBy]);

  const fetchLeaderboard = async (reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      const limit = 20;
      
      // Use the optimized database function
      const { data, error } = await supabase.rpc("get_leaderboard_stats", {
        p_game_type: gameFilter === "all" ? null : gameFilter,
        p_time_filter: timeFilter,
        p_limit: limit,
        p_offset: currentPage * limit,
      });

      if (error) throw error;

      if (reset) {
        setPlayers(data || []);
        setPage(0);
      } else {
        setPlayers((prev) => [...prev, ...(data || [])]);
      }
      
      setHasMore(data && data.length === limit);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((p) => p + 1);
      fetchLeaderboard(false);
    }
  };

  // Memoize sorted players to avoid unnecessary recalculations
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      switch (sortBy) {
        case "earnings":
          return b.total_earnings - a.total_earnings;
        case "wins":
          return Number(b.total_wins) - Number(a.total_wins);
        case "kills":
          return Number(b.total_kills) - Number(a.total_kills);
        default:
          return 0;
      }
    });
  }, [players, sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = [
        "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
        "bg-gray-400/20 text-gray-400 border-gray-400/30",
        "bg-amber-600/20 text-amber-600 border-amber-600/30",
      ];
      return <Badge className={colors[rank - 1]}>#{rank}</Badge>;
    }
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const PlayerCard = ({ player, rank }: { player: PlayerStats; rank: number }) => (
    <Card
      className={`glass border-border p-4 transition-all ${
        rank <= 3 ? "border-primary/50 shadow-lg shadow-primary/10" : "hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex flex-col items-center justify-center w-12">
          {getRankIcon(rank)}
          {!getRankIcon(rank) && (
            <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="w-12 h-12 border-2 border-primary/30">
          <AvatarImage src={player.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold">
            {player.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm truncate">{player.username}</h4>
            {rank <= 3 && getRankBadge(rank)}
          </div>
          <p className="text-xs text-muted-foreground">
            {player.matches_played} matches • Avg #{player.avg_position.toFixed(1)}
          </p>
          {player.game_type && (
            <Badge variant="outline" className="text-xs mt-1">
              {player.game_type}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="text-right">
          {sortBy === "earnings" && (
            <>
              <p className="text-lg font-bold text-primary">₹{player.total_earnings.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </>
          )}
          {sortBy === "wins" && (
            <>
              <p className="text-lg font-bold text-secondary">{player.total_wins}</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </>
          )}
          {sortBy === "kills" && (
            <>
              <p className="text-lg font-bold text-accent">{player.total_kills}</p>
              <p className="text-xs text-muted-foreground">Kills</p>
            </>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Earnings</p>
          <p className="text-sm font-bold text-primary">₹{player.total_earnings.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Wins</p>
          <p className="text-sm font-bold text-secondary">{player.total_wins}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Kills</p>
          <p className="text-sm font-bold text-accent">{player.total_kills}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Leaderboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="glass border-border p-4 mb-6">
          <div className="space-y-3">
            {/* Time Period */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Time Period</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Game Type */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Game Type</label>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="BGMI">BGMI</SelectItem>
                  <SelectItem value="Free Fire">Free Fire</SelectItem>
                  <SelectItem value="PUBG Mobile">PUBG Mobile</SelectItem>
                  <SelectItem value="Call of Duty Mobile">Call of Duty Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Sort Tabs */}
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as any)} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="earnings" className="gap-2">
              <Award className="w-4 h-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="wins" className="gap-2">
              <Trophy className="w-4 h-4" />
              Wins
            </TabsTrigger>
            <TabsTrigger value="kills" className="gap-2">
              <Target className="w-4 h-4" />
              Kills
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 Highlight */}
        {sortedPlayers.length >= 3 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" />
              Top 3 Champions
            </h3>
            <div className="space-y-3">
              {sortedPlayers.slice(0, 3).map((player, index) => (
                <PlayerCard key={player.user_id} player={player} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        {/* All Rankings */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">All Rankings</h3>
          {loading && players.length === 0 ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : sortedPlayers.length === 0 ? (
            <Card className="glass border-border p-8">
              <p className="text-center text-muted-foreground">No players found</p>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {sortedPlayers.slice(3).map((player, index) => (
                  <PlayerCard key={player.user_id} player={player} rank={index + 4} />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
