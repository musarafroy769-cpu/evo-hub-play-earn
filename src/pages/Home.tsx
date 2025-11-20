import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Trophy, Users, Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import ffTournament from "@/assets/ff-tournament.jpg";
import bgmiTournament from "@/assets/bgmi-tournament.jpg";

const Home = () => {
  const featuredTournaments = [
    {
      id: 1,
      title: "Free Fire Friday Rush",
      game: "Free Fire",
      prize: "₹5,000",
      entry: "₹50",
      slots: "48/100",
      time: "Tonight 8:00 PM",
      image: ffTournament,
    },
    {
      id: 2,
      title: "BGMI Squad Showdown",
      game: "BGMI",
      prize: "₹10,000",
      entry: "₹100",
      slots: "32/64",
      time: "Tomorrow 6:00 PM",
      image: bgmiTournament,
    },
  ];

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
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-primary/30">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">₹1,250</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
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
            {featuredTournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                className="glass border-border overflow-hidden hover:border-primary/50 transition-all group"
              >
                <div className="relative">
                  <img 
                    src={tournament.image} 
                    alt={tournament.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-card/90 backdrop-blur text-foreground border-primary/30">
                      {tournament.game}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-bold mb-2">{tournament.title}</h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Prize Pool</p>
                      <p className="text-lg font-bold text-primary">{tournament.prize}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Fee</p>
                      <p className="text-lg font-bold">{tournament.entry}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{tournament.slots} slots</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{tournament.time}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all">
                    Join Tournament
                  </Button>
                </div>
              </Card>
            ))}
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
