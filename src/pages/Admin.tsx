import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Wallet as WalletIcon, Trophy, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { WithdrawalManagement } from "@/components/admin/WithdrawalManagement";
import { DepositManagement } from "@/components/admin/DepositManagement";
import { TournamentManagement } from "@/components/admin/TournamentManagement";
import { UserManagement } from "@/components/admin/UserManagement";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  upi_id: string;
  phone_number: string | null;
  status: string;
  transaction_id: string | null;
  admin_notes: string | null;
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  transaction_id: string;
  depositor_name: string;
  depositor_phone: string;
  status: string;
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
  room_id: string | null;
  room_password: string | null;
  description: string | null;
  position_prizes: any[];
  per_kill_prize: number;
}

interface Profile {
  id: string;
  username: string;
  wallet_balance: number;
  mobile_number: string | null;
  game_type: string | null;
  game_uid: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
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

  const fetchWithdrawalRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Get unique user IDs
        const userIds = [...new Set(data.map(r => r.user_id))];
        
        // Fetch all profiles in one query
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        setWithdrawalRequests(data.map(request => ({
          ...request,
          profiles: profileMap.get(request.user_id) || { username: 'Unknown' }
        })));
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchDepositRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('deposit_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Get unique user IDs
        const userIds = [...new Set(data.map(r => r.user_id))];
        
        // Fetch all profiles in one query
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        setDepositRequests(data.map(request => ({
          ...request,
          profiles: profileMap.get(request.user_id) || { username: 'Unknown' }
        })));
      }
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      toast({
        title: "Error",
        description: "Failed to load deposit requests",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchTournaments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('scheduled_at', { ascending: false });

      if (!error && data) {
        setTournaments(data.map(t => ({
          ...t,
          position_prizes: Array.isArray(t.position_prizes) ? t.position_prizes : []
        })));
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, wallet_balance, mobile_number, game_type, game_uid')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchData = useCallback(async () => {
    await Promise.all([fetchWithdrawalRequests(), fetchDepositRequests(), fetchTournaments(), fetchUsers()]);
  }, [fetchWithdrawalRequests, fetchDepositRequests, fetchTournaments, fetchUsers]);

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
              onClick={() => navigate("/")}
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
        <Tabs defaultValue="deposits" className="space-y-6">
          <TabsList className="glass border-border">
            <TabsTrigger value="deposits" className="gap-2">
              <WalletIcon className="w-4 h-4" />
              Deposits
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <WalletIcon className="w-4 h-4" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="gap-2">
              <Trophy className="w-4 h-4" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposits">
            <DepositManagement 
              requests={depositRequests} 
              onRefresh={fetchDepositRequests}
            />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalManagement 
              requests={withdrawalRequests} 
              onRefresh={fetchWithdrawalRequests}
            />
          </TabsContent>

          <TabsContent value="tournaments">
            <TournamentManagement 
              tournaments={tournaments}
              onRefresh={fetchTournaments}
            />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement 
              users={users}
              onRefresh={fetchUsers}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
