import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, Trophy, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import ffTournament from "@/assets/ff-tournament.jpg";
import bgmiTournament from "@/assets/bgmi-tournament.jpg";

const Tournaments = () => {
  const tournaments = [
    {
      id: 1,
      title: "Free Fire Friday Rush",
      game: "Free Fire",
      mode: "Solo",
      prize: "₹5,000",
      entry: "₹50",
      slots: "48/100",
      time: "Tonight 8:00 PM",
      status: "upcoming",
      image: ffTournament,
    },
    {
      id: 2,
      title: "BGMI Squad Showdown",
      game: "BGMI",
      mode: "Squad",
      prize: "₹10,000",
      entry: "₹100",
      slots: "32/64",
      time: "Tomorrow 6:00 PM",
      status: "upcoming",
      image: bgmiTournament,
    },
    {
      id: 3,
      title: "FF Duo Championship",
      game: "Free Fire",
      mode: "Duo",
      prize: "₹8,000",
      entry: "₹75",
      slots: "40/80",
      time: "Saturday 7:00 PM",
      status: "upcoming",
      image: ffTournament,
    },
    {
      id: 4,
      title: "BGMI Solo Battle",
      game: "BGMI",
      mode: "Solo",
      prize: "₹6,000",
      entry: "Free",
      slots: "85/100",
      time: "Sunday 5:00 PM",
      status: "upcoming",
      image: bgmiTournament,
    },
  ];

  const TournamentCard = ({ tournament }: { tournament: typeof tournaments[0] }) => (
    <Link to={`/tournament/${tournament.id}`}>
      <Card className="glass border-border overflow-hidden hover:border-primary/50 transition-all group">
        <div className="relative">
          <img 
            src={tournament.image} 
            alt={tournament.title}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <Badge className="bg-card/90 backdrop-blur text-foreground border-primary/30">
              {tournament.game}
            </Badge>
            <Badge className="bg-secondary/90 backdrop-blur text-secondary-foreground">
              {tournament.mode}
            </Badge>
          </div>
          {tournament.entry === "Free" && (
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
              <p className="text-base font-bold text-primary">{tournament.prize}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entry Fee</p>
              <p className="text-base font-bold">{tournament.entry}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{tournament.slots}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{tournament.time}</span>
            </div>
          </div>

          <Button className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all">
            View Details
          </Button>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Tournaments</h1>
            </div>
            <Button variant="outline" size="icon" className="glass border-primary/30">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="free-fire">Free Fire</TabsTrigger>
            <TabsTrigger value="bgmi">BGMI</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </TabsContent>

          <TabsContent value="free-fire" className="space-y-4">
            {tournaments
              .filter((t) => t.game === "Free Fire")
              .map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
          </TabsContent>

          <TabsContent value="bgmi" className="space-y-4">
            {tournaments
              .filter((t) => t.game === "BGMI")
              .map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tournaments;
