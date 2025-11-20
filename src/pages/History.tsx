import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Award } from "lucide-react";

const History = () => {
  const matches = [
    {
      id: 1,
      tournament: "Free Fire Friday Rush",
      game: "Free Fire",
      date: "Nov 15, 2024",
      position: 1,
      kills: 12,
      earnings: "₹2,000",
      status: "won",
    },
    {
      id: 2,
      tournament: "BGMI Squad Showdown",
      game: "BGMI",
      date: "Nov 12, 2024",
      position: 5,
      kills: 8,
      earnings: "₹150",
      status: "completed",
    },
    {
      id: 3,
      tournament: "FF Duo Championship",
      game: "Free Fire",
      date: "Nov 10, 2024",
      position: 3,
      kills: 15,
      earnings: "₹800",
      status: "completed",
    },
  ];

  const MatchCard = ({ match }: { match: typeof matches[0] }) => (
    <Card className="glass border-border p-4 hover:border-primary/50 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold mb-1">{match.tournament}</h4>
          <p className="text-xs text-muted-foreground">{match.date}</p>
        </div>
        {match.status === "won" && (
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
          <p className="text-sm font-bold">{match.kills}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <Award className="w-4 h-4 mx-auto mb-1 text-accent" />
          <p className="text-xs text-muted-foreground">Earned</p>
          <p className="text-sm font-bold text-primary">{match.earnings}</p>
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
            <p className="text-2xl font-bold text-primary mb-1">12</p>
            <p className="text-xs text-muted-foreground">Matches</p>
          </Card>
          <Card className="glass border-border p-4 text-center">
            <p className="text-2xl font-bold text-secondary mb-1">3</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </Card>
          <Card className="glass border-border p-4 text-center">
            <p className="text-2xl font-bold text-accent mb-1">₹4.2K</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="won">Won</TabsTrigger>
            <TabsTrigger value="completed">Played</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </TabsContent>

          <TabsContent value="won" className="space-y-4">
            {matches
              .filter((m) => m.status === "won")
              .map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {matches
              .filter((m) => m.status === "completed")
              .map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;
