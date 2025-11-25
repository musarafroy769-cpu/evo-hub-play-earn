import { useState, useEffect } from "react";
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
  CreditCard,
  Shield,
  Plus,
  Mail,
  HelpCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { signOut, user: authUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    matches: 0,
    wins: 0,
    earned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      Promise.all([checkAdminRole(), fetchProfile(), fetchUserStats()]).catch(console.error);
    } else {
      setLoading(false);
    }
  }, [authUser]);

  const checkAdminRole = async () => {
    if (!authUser) return;
    try {
      const { data } = await supabase
        .rpc('has_role', { _user_id: authUser.id, _role: 'admin' });
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const fetchProfile = async () => {
    if (!authUser) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!authUser) return;

    try {
      // Fetch tournament results for this user
      const { data: results, error } = await supabase
        .from('tournament_results')
        .select('position, prize_amount')
        .eq('user_id', authUser.id);

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      if (results && results.length > 0) {
        const matches = results.length;
        const wins = results.filter(r => r.position === 1).length;
        const earned = results.reduce((sum, r) => sum + (r.prize_amount || 0), 0);

        setStats({
          matches,
          wins,
          earned
        });
      }
    } catch (error) {
      console.error('Error in fetchUserStats:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="glass border-primary/30 p-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="bg-gradient-gaming text-2xl">
                {profile?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{profile?.username || 'User'}</h2>
              <p className="text-sm text-muted-foreground mb-2">{authUser?.email || ''}</p>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {profile?.game_type || 'Player'}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{stats.matches}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Target className="w-5 h-5 mx-auto mb-1 text-secondary" />
              <p className="text-lg font-bold">{stats.wins}</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Wallet className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-lg font-bold">₹{stats.earned.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </div>
          </div>
        </Card>

        {/* Wallet */}
        <Card className="glass border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-primary">₹{Number(profile?.wallet_balance || 0).toFixed(2)}</p>
            </div>
            <Wallet className="w-12 h-12 text-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/withdrawal?tab=deposit">
              <Button className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Add Money
              </Button>
            </Link>
            <Link to="/withdrawal?tab=withdrawal">
              <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                <CreditCard className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </Link>
          </div>
        </Card>

        {/* Admin Panel Button */}
        {isAdmin && (
          <Card className="glass border-purple-500/30 p-6">
            <Link to="/admin">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 transition-all">
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          </Card>
        )}

        {/* Menu Options */}
        <div className="space-y-2">
          <MenuButton icon={User} label="Edit Profile" to="/edit-profile" />
          <MenuButton icon={CreditCard} label="Payment Methods" to="/payment" />
          <MenuButton icon={Settings} label="Settings" to="/settings" />
          <MenuButton icon={Trophy} label="Leaderboard" to="/leaderboard" />
        </div>

        {/* Help and Support */}
        <Card className="glass border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold">Help & Support</h3>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Need assistance? Contact our support team
            </p>
            <a 
              href="mailto:evoasrenas59@gmail.com"
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Email Support</p>
                <p className="text-xs text-primary">evoasrenas59@gmail.com</p>
              </div>
            </a>
          </div>
        </Card>

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
