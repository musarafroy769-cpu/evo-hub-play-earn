import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Wallet, 
  Settings, 
  LogOut, 
  Trophy, 
  Target,
  ChevronRight,
  CreditCard
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const user = {
    username: "ProGamer123",
    email: "progamer@example.com",
    phone: "+91 98765 43210",
    ffUid: "123456789",
    bgmiUid: "987654321",
    balance: "₹1,250",
    matchesPlayed: 12,
    wins: 3,
    totalEarnings: "₹4,200",
  };

  const MenuButton = ({ 
    icon: Icon, 
    label, 
    to 
  }: { 
    icon: any; 
    label: string; 
    to?: string;
  }) => (
    <Link to={to || "#"}>
      <Button
        variant="ghost"
        className="w-full justify-between glass hover:border-primary/30 border border-transparent"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <span>{label}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Button>
    </Link>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="glass border-primary/30 p-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="bg-gradient-gaming text-2xl">
                {user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{user.username}</h2>
              <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Pro Player
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{user.matchesPlayed}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Target className="w-5 h-5 mx-auto mb-1 text-secondary" />
              <p className="text-lg font-bold">{user.wins}</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Wallet className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-lg font-bold">{user.totalEarnings}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </div>
          </div>
        </Card>

        {/* Game UIDs */}
        <Card className="glass border-border p-6">
          <h3 className="text-lg font-bold mb-4">Game IDs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium">Free Fire UID</p>
                <p className="text-xs text-muted-foreground mt-1">{user.ffUid}</p>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm font-medium">BGMI UID</p>
                <p className="text-xs text-muted-foreground mt-1">{user.bgmiUid}</p>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>
        </Card>

        {/* Wallet */}
        <Card className="glass border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-primary">{user.balance}</p>
            </div>
            <Wallet className="w-12 h-12 text-primary/30" />
          </div>
          <Link to="/withdrawal">
            <Button className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all">
              <CreditCard className="w-4 h-4 mr-2" />
              Withdraw Money
            </Button>
          </Link>
        </Card>

        {/* Menu Options */}
        <div className="space-y-2">
          <MenuButton icon={User} label="Edit Profile" to="/edit-profile" />
          <MenuButton icon={CreditCard} label="Payment Methods" to="/payment" />
          <MenuButton icon={Settings} label="Settings" to="/settings" />
          <MenuButton icon={Trophy} label="Leaderboard" to="/leaderboard" />
        </div>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full glass border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
