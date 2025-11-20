import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, Clock, Trophy, Calendar, MapPin, Shield } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ffTournament from "@/assets/ff-tournament.jpg";

const TournamentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const tournament = {
    id: 1,
    title: "Free Fire Friday Rush",
    game: "Free Fire",
    mode: "Solo",
    prize: "₹5,000",
    entry: "₹50",
    slots: "48/100",
    date: "Friday, Nov 22, 2024",
    time: "8:00 PM IST",
    map: "Bermuda",
    organizer: "Evo Hub Official",
    image: ffTournament,
    prizeBreakdown: [
      { position: "1st Place", amount: "₹2,000" },
      { position: "2nd Place", amount: "₹1,200" },
      { position: "3rd Place", amount: "₹800" },
      { position: "4th-10th", amount: "₹150 each" },
    ],
    rules: [
      "No emulators allowed",
      "Must join match 10 minutes before start time",
      "Screenshot proof required for kills",
      "Any cheating will result in instant ban",
      "Room ID will be shared 30 minutes before match",
    ],
  };

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

      <div className="max-w-lg mx-auto pb-6">
        {/* Tournament Image */}
        <div className="relative">
          <img 
            src={tournament.image} 
            alt={tournament.title}
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Badge className="bg-card/90 backdrop-blur text-foreground border-primary/30">
              {tournament.game}
            </Badge>
            <Badge className="bg-secondary/90 backdrop-blur text-secondary-foreground">
              {tournament.mode}
            </Badge>
          </div>
        </div>

        <div className="px-4 space-y-6 -mt-12 relative z-10">
          {/* Title Card */}
          <Card className="glass border-primary/30 p-6">
            <h2 className="text-2xl font-bold mb-2">{tournament.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              by {tournament.organizer}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Prize Pool</p>
                <p className="text-2xl font-bold text-primary">{tournament.prize}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entry Fee</p>
                <p className="text-2xl font-bold">{tournament.entry}</p>
              </div>
            </div>
          </Card>

          {/* Match Info */}
          <Card className="glass border-border p-6">
            <h3 className="text-lg font-bold mb-4">Match Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-xs text-muted-foreground">{tournament.date}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-xs text-muted-foreground">{tournament.time}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Map</p>
                  <p className="text-xs text-muted-foreground">{tournament.map}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Slots Available</p>
                  <p className="text-xs text-muted-foreground">{tournament.slots} players</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Prize Breakdown */}
          <Card className="glass border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Prize Breakdown</h3>
            </div>
            <div className="space-y-2">
              {tournament.prizeBreakdown.map((prize, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/30"
                >
                  <span className="text-sm font-medium">{prize.position}</span>
                  <span className="text-sm font-bold text-primary">{prize.amount}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Rules */}
          <Card className="glass border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Tournament Rules</h3>
            </div>
            <ul className="space-y-2">
              {tournament.rules.map((rule, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-muted-foreground">{rule}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Join Button */}
          <div className="sticky bottom-20 pt-4 bg-gradient-to-t from-background via-background to-transparent">
            <Button className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all py-6 text-lg">
              Join Tournament for {tournament.entry}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
