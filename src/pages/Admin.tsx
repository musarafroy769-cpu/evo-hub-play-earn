import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Wallet as WalletIcon, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { WithdrawalManagement } from "@/components/admin/WithdrawalManagement";
import { TournamentManagement } from "@/components/admin/TournamentManagement";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  upi_id: string;
  status: string;
  transaction_id: string | null;
  admin_notes: string | null;
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface Tournament {
  id: string;
  title: string;
  game_type: string;
  mode: string;
  entry_fee: number;
  prize_pool: number;
  total_slots: number;
  filled_slots: number;
  scheduled_at: string;
  status: string;
  image_url: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const checkAdminRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (!error && data) {
        setIsAdmin(true);
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchWithdrawalRequests(), fetchTournaments()]);
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const requestsWithProfiles = await Promise.all(
          data.map(async (request) => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', request.user_id)
                .maybeSingle();
              
              return {
                ...request,
                profiles: profile || { username: 'Unknown' }
              };
            } catch (err) {
              console.error('Error fetching profile for user:', request.user_id, err);
              return {
                ...request,
                profiles: { username: 'Unknown' }
              };
            }
          })
        );
        setRequests(requestsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive",
      });
    }
  };

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (!error && data) {
        setTournaments(data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="withdrawals" className="space-y-6">
          <TabsList className="glass border-border">
            <TabsTrigger value="withdrawals" className="gap-2">
              <WalletIcon className="w-4 h-4" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="gap-2">
              <Trophy className="w-4 h-4" />
              Tournaments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawals">
            <WithdrawalManagement 
              requests={requests} 
              onRefresh={fetchWithdrawalRequests}
            />
          </TabsContent>

          <TabsContent value="tournaments">
            <TournamentManagement 
              tournaments={tournaments}
              onRefresh={fetchTournaments}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
