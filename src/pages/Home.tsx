import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import heroBanner from "@/assets/hero-banner.jpg";
import ffTournament from "@/assets/ff-tournament.jpg";
import bgmiTournament from "@/assets/bgmi-tournament.jpg";

interface Tournament {
  id: string;
  title: string;
  game_type: string;
  entry_fee: number;
  prize_pool: number;
  per_kill_prize: number;
  total_slots: number;
  filled_slots: number;
  scheduled_at: string;
  image_url: string | null;
}

const Home = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userGameType, setUserGameType] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('game_type')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserGameType(data.game_type);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [user?.id]);

  const fetchTournaments = useCallback(async () => {
    if (!userGameType) return;
    
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, title, game_type, entry_fee, prize_pool, per_kill_prize, total_slots, filled_slots, scheduled_at, image_url')
        .eq('status', 'upcoming')
        .eq('game_type', userGameType)
        .order('scheduled_at', { ascending: true })
        .limit(2);

      if (!error && data) {
        setTournaments(data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  }, [userGameType]);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id, fetchUserProfile]);

  useEffect(() => {
    if (userGameType) {
      fetchTournaments();
    }
  }, [userGameType, fetchTournaments]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <img 
          src={heroBanner} 
          alt="Hero Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="relative z-10 max-w-lg mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
            Join Epic Battles
          </h2>
          <p className="text-white/90 text-sm drop-shadow-md">
            Compete in tournaments and win amazing prizes
          </p>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Featured Tournaments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Featured Tournaments</h3>
            <Link to="/tournaments" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {tournaments.length === 0 ? (
              <Card className="glass border-border p-8">
                <p className="text-center text-muted-foreground">
                  {userGameType 
                    ? `No ${userGameType} tournaments available at the moment`
                    : 'No tournaments available. Please set your game type in your profile.'}
                </p>
              </Card>
            ) : (
              tournaments.map((tournament) => {
                const gameImage = tournament.game_type?.toUpperCase() === 'FF' ? ffTournament : bgmiTournament;
                
                return (
                  <Link key={tournament.id} to={`/tournament/${tournament.id}`}>
                    <Card 
                      className="glass border-border overflow-hidden hover:border-primary/50 transition-all group"
                    >
                    <div className="relative">
                      <img 
                        src={tournament.image_url || gameImage} 
                        alt={tournament.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-card/90 backdrop-blur text-foreground border-primary/30">
                          {tournament.game_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-bold mb-2">{tournament.title}</h4>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Prize Pool</p>
                          <p className="text-lg font-bold text-primary">₹{tournament.prize_pool}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Entry Fee</p>
                          <p className="text-lg font-bold">{tournament.entry_fee === 0 ? "Free" : `₹${tournament.entry_fee}`}</p>
                        </div>
                      </div>

                      {tournament.per_kill_prize > 0 && (
                        <div className="mb-4 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <p className="text-xs text-green-500 font-medium">
                            💰 Kill Bonus: ₹{tournament.per_kill_prize} per kill
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{tournament.filled_slots}/{tournament.total_slots} slots</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(tournament.scheduled_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all">
                        View Details
                      </Button>
                    </div>
                  </Card>
                  </Link>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
