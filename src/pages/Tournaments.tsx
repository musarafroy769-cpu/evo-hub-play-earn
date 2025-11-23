import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Trophy } from "lucide-react";
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
  total_slots: number;
  filled_slots: number;
  scheduled_at: string;
  status: string;
  image_url: string | null;
}

const Tournaments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userGameType, setUserGameType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchTournaments();
    }
  }, [user]);

  const fetchUserProfile = async () => {
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
  };

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'upcoming')
        .order('scheduled_at', { ascending: true });

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
  };

  // Filter tournaments based on user's game type
  const filteredTournaments = userGameType
    ? tournaments.filter(t => t.game_type.toUpperCase() === userGameType.toUpperCase())
    : tournaments;

  const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
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
  };

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
        ) : filteredTournaments.length === 0 ? (
          <Card className="glass border-border p-8">
            <p className="text-center text-muted-foreground">
              {userGameType 
                ? `No ${userGameType} tournaments available at the moment`
                : 'No tournaments available. Please set your game type in your profile.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;
