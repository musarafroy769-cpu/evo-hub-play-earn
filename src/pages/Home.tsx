import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Trophy, Users, Clock, ChevronRight, Plus } from "lucide-react";
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
  total_slots: number;
  filled_slots: number;
  scheduled_at: string;
  image_url: string | null;
}

const Home = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userGameType, setUserGameType] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('game_type, wallet_balance')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserGameType(data.game_type);
        setWalletBalance(data.wallet_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [user?.id]);

  const fetchTournaments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'upcoming')
        .order('scheduled_at', { ascending: true })
        .limit(2);

      if (!error && data) {
        setTournaments(data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
      fetchTournaments();
    }
  }, [user?.id, fetchUserProfile, fetchTournaments]);

  // Filter tournaments based on user's game type
  const filteredTournaments = userGameType
    ? tournaments.filter(t => t.game_type.toUpperCase() === userGameType.toUpperCase())
    : tournaments;

  return (
    <div className="min-h-screen">
      {/* Header with wallet */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
                Evo Hub
              </h1>
              <p className="text-xs text-muted-foreground">Play • Win • Earn</p>
            </div>
            <Link to="/withdrawal?tab=deposit">
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all cursor-pointer">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">₹{walletBalance.toFixed(2)}</span>
                <Plus className="w-3 h-3 text-primary" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Quick Deposit Card */}
        <Link to="/withdrawal?tab=deposit">
          <Card className="glass border-primary/30 p-4 hover:border-primary hover:shadow-neon-primary transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Add Money to Wallet</p>
                  <p className="text-xs text-muted-foreground">Instant deposit via UPI</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
          </Card>
        </Link>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <img 
            src={heroBanner} 
            alt="Evo Hub Tournament" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
              NEW SEASON
            </Badge>
            <h2 className="text-2xl font-bold mb-2">Weekend Warriors</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Join the biggest tournaments this weekend
            </p>
            <Button className="bg-gradient-gaming hover:shadow-neon-primary transition-all">
              Join Now
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass border-border p-4 text-center hover:border-primary/50 transition-all">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">Tournaments</p>
          </Card>
          <Card className="glass border-border p-4 text-center hover:border-primary/50 transition-all">
            <Users className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold">1.2K</p>
            <p className="text-xs text-muted-foreground">Active Players</p>
          </Card>
          <Card className="glass border-border p-4 text-center hover:border-primary/50 transition-all">
            <Wallet className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">₹2L+</p>
            <p className="text-xs text-muted-foreground">Prize Pool</p>
          </Card>
        </div>

        {/* Featured Tournaments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Featured Tournaments</h3>
            <Link to="/tournaments" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {filteredTournaments.length === 0 ? (
              <Card className="glass border-border p-8">
                <p className="text-center text-muted-foreground">
                  {userGameType 
                    ? `No ${userGameType} tournaments available at the moment`
                    : 'No tournaments available. Please set your game type in your profile.'}
                </p>
              </Card>
            ) : (
              filteredTournaments.map((tournament) => {
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

        {/* Game Selection */}
        <div>
          <h3 className="text-lg font-bold mb-4">Select Your Game</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass border-border p-6 text-center hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:shadow-neon-primary transition-all">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <p className="font-bold mb-1">Free Fire</p>
              <p className="text-xs text-muted-foreground">12 Tournaments</p>
            </Card>
            <Card className="glass border-border p-6 text-center hover:border-secondary/50 transition-all cursor-pointer group">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center group-hover:shadow-neon-secondary transition-all">
                <Trophy className="w-8 h-8 text-secondary" />
              </div>
              <p className="font-bold mb-1">BGMI</p>
              <p className="text-xs text-muted-foreground">8 Tournaments</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
