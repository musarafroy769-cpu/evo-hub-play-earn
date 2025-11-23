import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Trophy, 
  Target,
  Calendar,
  Award,
  Shield,
  Radio,
  Lock,
  Copy
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ffTournament from "@/assets/ff-tournament.jpg";
import bgmiTournament from "@/assets/bgmi-tournament.jpg";

const TournamentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (id && user) {
      fetchTournamentDetails();
      checkIfJoined();
      fetchWalletBalance();
    }
  }, [id, user]);

  const fetchTournamentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfJoined = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      setHasJoined(!!data);
    } catch (error) {
      console.error('Error checking participation:', error);
    }
  };

  const fetchWalletBalance = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setWalletBalance(data.wallet_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const handleJoinTournament = async () => {
    if (!user || !tournament) return;

    if (hasJoined) {
      toast({
        title: "Already Joined",
        description: "You have already joined this tournament",
      });
      return;
    }

    if (tournament.filled_slots >= tournament.total_slots) {
      toast({
        title: "Tournament Full",
        description: "This tournament has reached maximum capacity",
        variant: "destructive",
      });
      return;
    }

    if (walletBalance < tournament.entry_fee) {
      toast({
        title: "Insufficient Balance",
        description: "Please add funds to your wallet",
        variant: "destructive",
      });
      return;
    }

    setJoining(true);
    try {
      // Deduct entry fee from wallet
      const newBalance = walletBalance - tournament.entry_fee;
      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

      if (walletError) throw walletError;

      // Add participant
      const { error: participantError } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
        });

      if (participantError) throw participantError;

      // Update filled slots
      const { error: tournamentError } = await supabase
        .from('tournaments')
        .update({ filled_slots: tournament.filled_slots + 1 })
        .eq('id', tournament.id);

      if (tournamentError) throw tournamentError;

      toast({
        title: "Success!",
        description: "You have joined the tournament",
      });

      setHasJoined(true);
      setWalletBalance(newBalance);
      setTournament({ ...tournament, filled_slots: tournament.filled_slots + 1 });
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast({
        title: "Error",
        description: "Failed to join tournament",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading tournament...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Tournament not found</p>
        <Button onClick={() => navigate('/tournaments')}>Back to Tournaments</Button>
      </div>
    );
  }

  const gameImage = tournament.game_type?.toUpperCase() === 'FF' ? ffTournament : bgmiTournament;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">Tournament Details</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Tournament Image */}
        <div className="relative rounded-2xl overflow-hidden">
          <img 
            src={tournament.image_url || gameImage} 
            alt={tournament.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary/90 backdrop-blur text-primary-foreground">
              {tournament.game_type}
            </Badge>
          </div>
        </div>

        {/* Tournament Info */}
        <Card className="glass border-border p-6">
          <h1 className="text-2xl font-bold mb-2">{tournament.title}</h1>
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline">{tournament.mode}</Badge>
            <Badge variant="outline" className="border-accent text-accent">
              {tournament.filled_slots}/{tournament.total_slots} Slots
            </Badge>
            {tournament.status === 'upcoming' && (
              <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                Upcoming
              </Badge>
            )}
            {tournament.status === 'live' && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30 animate-pulse">
                🔴 LIVE
              </Badge>
            )}
            {tournament.status === 'completed' && (
              <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">
                Completed
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground mb-1">Prize Pool</p>
              <p className="text-xl font-bold text-primary">₹{tournament.prize_pool}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Award className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-sm text-muted-foreground mb-1">Entry Fee</p>
              <p className="text-xl font-bold">
                {tournament.entry_fee === 0 ? "Free" : `₹${tournament.entry_fee}`}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {new Date(tournament.scheduled_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Mode</p>
                <p className="font-medium">{tournament.mode} ({tournament.total_slots} Players)</p>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Room Details - Show only if tournament is live and user has joined */}
          {tournament.status === 'live' && hasJoined && tournament.room_id && tournament.room_password && (
            <Card className="mb-6 p-4 bg-green-500/10 border-green-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-5 h-5 text-green-500 animate-pulse" />
                <h3 className="font-bold text-green-500">🔴 LIVE - Room Details</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Room ID
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={tournament.room_id}
                      className="glass border-border font-mono text-sm bg-background"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(tournament.room_id);
                        toast({
                          title: "Copied!",
                          description: "Room ID copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Room Password
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={tournament.room_password}
                      className="glass border-border font-mono text-sm bg-background"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(tournament.room_password);
                        toast({
                          title: "Copied!",
                          description: "Password copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-green-500 mt-3">
                ⚡ Use these details to join the game room. Good luck!
              </p>
            </Card>
          )}

          {/* Show live badge for non-joined users */}
          {tournament.status === 'live' && !hasJoined && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-green-500 animate-pulse" />
                <p className="text-sm text-green-500 font-medium">
                  🔴 This tournament is LIVE! Join now to get room details.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Wallet Balance:</span>
              <span className="font-semibold text-primary">₹{walletBalance.toFixed(2)}</span>
            </div>

            <Button
              onClick={handleJoinTournament}
              disabled={joining || hasJoined || tournament.filled_slots >= tournament.total_slots}
              className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all"
            >
              {joining ? "Joining..." : hasJoined ? "Already Joined" : 
                tournament.filled_slots >= tournament.total_slots ? "Tournament Full" :
                `Join Tournament - ${tournament.entry_fee === 0 ? "Free" : `₹${tournament.entry_fee}`}`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TournamentDetail;
