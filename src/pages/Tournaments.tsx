import { useState, useEffect, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Trophy, Copy, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ffTournament from "@/assets/ff-tournament.jpg";
import bgmiTournament from "@/assets/bgmi-tournament.jpg";

interface Tournament {
  id: string;
  title: string;
  game_type: string;
  mode: string;
  entry_fee: number;
  prize_pool: number;
  per_kill_prize: number;
  total_slots: number;
  filled_slots: number;
  scheduled_at: string;
  status: string;
  image_url: string | null;
  room_id: string | null;
  room_password: string | null;
}

const Tournaments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [liveTournaments, setLiveTournaments] = useState<Tournament[]>([]);
  const [userGameType, setUserGameType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('game_type')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setUserGameType(data.game_type);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [user]);

  const fetchTournaments = useCallback(async () => {
    try {
      let query = supabase
        .from('tournaments')
        .select('id, title, game_type, mode, entry_fee, prize_pool, per_kill_prize, total_slots, filled_slots, scheduled_at, status, image_url, room_id, room_password')
        .eq('status', 'upcoming')
        .order('scheduled_at', { ascending: true })
        .limit(20);

      // Only filter by game type if user has one set
      if (userGameType) {
        query = query.eq('game_type', userGameType);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userGameType, toast]);

  const fetchLiveTournaments = useCallback(async () => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('tournaments')
        .select('id, title, game_type, mode, entry_fee, prize_pool, per_kill_prize, total_slots, filled_slots, scheduled_at, status, image_url, room_id, room_password')
        .eq('status', 'ongoing')
        .order('scheduled_at', { ascending: false })
        .limit(10);

      // Only filter by game type if user has one set
      if (userGameType) {
        query = query.eq('game_type', userGameType);
      }

      const { data: tournamentsData, error: tournamentsError } = await query;

      if (tournamentsError) throw tournamentsError;

      setLiveTournaments(tournamentsData || []);
    } catch (error) {
      console.error('Error fetching live tournaments:', error);
    }
  }, [user?.id, userGameType]);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchTournaments();
      fetchLiveTournaments();
      
      // Subscribe to tournament updates
      const channel = supabase
        .channel('tournament-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tournaments',
            filter: `status=eq.ongoing`
          },
          () => {
            fetchLiveTournaments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchUserProfile, fetchTournaments, fetchLiveTournaments]);

  const LiveTournamentCard = memo(({ tournament }: { tournament: Tournament }) => {
    const gameImage = tournament.game_type?.toUpperCase() === 'FF' ? ffTournament : bgmiTournament;
    
    return (
      <Card className="glass border-primary/50 overflow-hidden animate-pulse-slow">
        <div className="relative">
          <img 
            src={tournament.image_url || gameImage} 
            alt={tournament.title}
            className="w-full h-32 object-cover"
          />
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <Badge className="bg-card/90 backdrop-blur text-foreground border-primary/30">
              {tournament.game_type}
            </Badge>
            <Badge className="bg-red-500/90 backdrop-blur text-white animate-pulse">
              🔴 LIVE NOW
            </Badge>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <h4 className="font-bold text-lg">{tournament.title}</h4>
          
          <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Room ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-primary">
                  {tournament.room_id || 'Not Set'}
                </span>
                {tournament.room_id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(tournament.room_id!, 'Room ID')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'Room ID' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Password:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-primary">
                  {tournament.room_password || 'Not Set'}
                </span>
                {tournament.room_password && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(tournament.room_password!, 'Password')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'Password' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Prize Pool</p>
              <p className="text-base font-bold text-primary">₹{tournament.prize_pool}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Per Kill Prize</p>
              <p className="text-base font-bold text-green-500">₹{tournament.per_kill_prize || 0}</p>
            </div>
          </div>

          <Button 
            className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all"
            asChild
          >
            <Link to={`/tournament/${tournament.id}`}>
              View Full Details
            </Link>
          </Button>
        </div>
      </Card>
    );
  });

  const TournamentCard = memo(({ tournament }: { tournament: Tournament }) => {
    const gameImage = tournament.game_type?.toUpperCase() === 'FF' ? ffTournament : bgmiTournament;
    
    return (
      <Link to={`/tournament/${tournament.id}`}>
        <Card className="glass border-border overflow-hidden hover:border-primary/50 transition-all group">
          <div className="relative">
            <img 
              src={tournament.image_url || gameImage} 
              alt={tournament.title}
              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 right-2 flex justify-between">
              <Badge className="bg-card/90 backdrop-blur text-foreground border-primary/30">
                {tournament.game_type}
              </Badge>
              <Badge className="bg-secondary/90 backdrop-blur text-secondary-foreground">
                {tournament.mode}
              </Badge>
            </div>
            {tournament.entry_fee === 0 && (
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-accent/90 backdrop-blur text-accent-foreground border-accent/50">
                  Free Entry
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h4 className="font-bold mb-3">{tournament.title}</h4>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Prize Pool</p>
                <p className="text-base font-bold text-primary">₹{tournament.prize_pool}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entry Fee</p>
                <p className="text-base font-bold">{tournament.entry_fee === 0 ? "Free" : `₹${tournament.entry_fee}`}</p>
              </div>
            </div>

            {tournament.per_kill_prize > 0 && (
              <div className="mb-4 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-500 font-medium">
                  💰 Per Kill Bonus: ₹{tournament.per_kill_prize}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{tournament.filled_slots}/{tournament.total_slots}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{new Date(tournament.scheduled_at).toLocaleString()}</span>
              </div>
            </div>

            <Button className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all">
              View Details
            </Button>
          </div>
        </Card>
      </Link>
    );
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">
              {userGameType ? `${userGameType} Tournaments` : 'Tournaments'}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Tournaments Section */}
            {liveTournaments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <h2 className="text-lg font-bold">Live Tournaments - Join Now!</h2>
                </div>
                <div className="space-y-4">
                  {liveTournaments.map((tournament) => (
                    <LiveTournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Tournaments Section */}
            <div>
              {liveTournaments.length > 0 && (
                <h2 className="text-lg font-bold mb-4">Upcoming Tournaments</h2>
              )}
              
              {tournaments.length === 0 ? (
                <Card className="glass border-border p-8">
                  <p className="text-center text-muted-foreground">
                    {userGameType 
                      ? `No ${userGameType} tournaments available at the moment`
                      : 'No tournaments available. Please set your game type in your profile.'}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;