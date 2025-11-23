import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface MatchResult {
  id: string;
  tournament: {
    title: string;
    game_type: string;
    scheduled_at: string;
  };
  position: number;
  kills: number;
  prize_amount: number;
}

const History = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (user) {
      fetchMatchHistory();
    }
  }, [user]);

  const fetchMatchHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("tournament_results")
      .select(`
        id,
        position,
        kills,
        prize_amount,
        tournament:tournaments(title, game_type, scheduled_at)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching match history:", error);
      return;
    }

    if (data) {
      setMatches(data as any);
      setTotalMatches(data.length);
      setTotalWins(data.filter((m) => m.position === 1).length);
      setTotalEarnings(data.reduce((sum, m) => sum + (m.prize_amount || 0), 0));
    }
  };

  const MatchCard = ({ match }: { match: MatchResult }) => (
    <Card className="glass border-border p-4 hover:border-primary/50 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold mb-1">{match.tournament.title}</h4>
          <p className="text-xs text-muted-foreground">
            {format(new Date(match.tournament.scheduled_at), "MMM dd, yyyy")}
          </p>
        </div>
        {match.position === 1 && (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Winner
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <Trophy className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Position</p>
          <p className="text-sm font-bold">#{match.position}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <Target className="w-4 h-4 mx-auto mb-1 text-secondary" />
          <p className="text-xs text-muted-foreground">Kills</p>
          <p className="text-sm font-bold">{match.kills || 0}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <Award className="w-4 h-4 mx-auto mb-1 text-accent" />
          <p className="text-xs text-muted-foreground">Earned</p>
          <p className="text-sm font-bold text-primary">₹{match.prize_amount || 0}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Match History</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="glass border-border p-4 text-center">
            <p className="text-2xl font-bold text-primary mb-1">{totalMatches}</p>
            <p className="text-xs text-muted-foreground">Matches</p>
          </Card>
          <Card className="glass border-border p-4 text-center">
            <p className="text-2xl font-bold text-secondary mb-1">{totalWins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </Card>
          <Card className="glass border-border p-4 text-center">
            <p className="text-2xl font-bold text-accent mb-1">₹{totalEarnings.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="won">Won</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {matches.length === 0 ? (
              <Card className="glass border-border p-8">
                <p className="text-center text-muted-foreground">
                  No match history yet
                </p>
              </Card>
            ) : (
              matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            )}
          </TabsContent>

          <TabsContent value="won" className="space-y-4">
            {matches.filter((m) => m.position === 1).length === 0 ? (
              <Card className="glass border-border p-8">
                <p className="text-center text-muted-foreground">
                  No wins yet. Keep playing!
                </p>
              </Card>
            ) : (
              matches
                .filter((m) => m.position === 1)
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;
