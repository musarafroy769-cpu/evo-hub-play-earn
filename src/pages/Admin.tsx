import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Wallet as WalletIcon, Trophy, Users, QrCode, Upload, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { WithdrawalManagement } from "@/components/admin/WithdrawalManagement";
import { DepositManagement } from "@/components/admin/DepositManagement";
import { TournamentManagement } from "@/components/admin/TournamentManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { LiveTournamentManagement } from "@/components/admin/LiveTournamentManagement";

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
  const [completedTournaments, setCompletedTournaments] = useState<Tournament[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [liveTournaments, setLiveTournaments] = useState<Tournament[]>([]);
  const [tournamentStats, setTournamentStats] = useState({
    totalCreated: 0,
    totalCompleted: 0,
    totalPrizesDistributed: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);

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

  const fetchUpcomingTournaments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'upcoming')
        .order('scheduled_at', { ascending: true });

      if (!error && data) {
        setUpcomingTournaments(data.map(t => ({
          ...t,
          position_prizes: Array.isArray(t.position_prizes) ? t.position_prizes : []
        })));
      }
    } catch (error) {
      console.error('Error fetching upcoming tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load upcoming tournaments",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchCompletedTournaments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false });

      if (!error && data) {
        setCompletedTournaments(data.map(t => ({
          ...t,
          position_prizes: Array.isArray(t.position_prizes) ? t.position_prizes : []
        })));
      }
    } catch (error) {
      console.error('Error fetching completed tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament history",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchTournamentStats = useCallback(async () => {
    try {
      const { count: totalCreated } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true });

      const { count: totalCompleted } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { data: resultsData } = await supabase
        .from('tournament_results')
        .select('prize_amount');

      const totalPrizes = resultsData?.reduce((sum, r) => sum + (r.prize_amount || 0), 0) || 0;

      setTournamentStats({
        totalCreated: totalCreated || 0,
        totalCompleted: totalCompleted || 0,
        totalPrizesDistributed: totalPrizes,
      });
    } catch (error) {
      console.error('Error fetching tournament stats:', error);
    }
  }, []);

  const fetchLiveTournaments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'ongoing')
        .order('scheduled_at', { ascending: false });

      if (!error && data) {
        setLiveTournaments(data.map(t => ({
          ...t,
          position_prizes: Array.isArray(t.position_prizes) ? t.position_prizes : []
        })));
      }
    } catch (error) {
      console.error('Error fetching live tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load live tournaments",
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

  const fetchQrCode = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'deposit_qr_code')
        .maybeSingle();

      if (!error && data) {
        setQrCodeUrl(data.setting_value);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchWithdrawalRequests(), 
      fetchDepositRequests(), 
      fetchUpcomingTournaments(),
      fetchCompletedTournaments(),
      fetchLiveTournaments(),
      fetchUsers(), 
      fetchQrCode(),
      fetchTournamentStats()
    ]);
  }, [fetchWithdrawalRequests, fetchDepositRequests, fetchUpcomingTournaments, fetchCompletedTournaments, fetchLiveTournaments, fetchUsers, fetchQrCode, fetchTournamentStats]);

  const handleQrCodeUpdate = async () => {
    if (!qrCodeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a QR code URL",
        variant: "destructive",
      });
      return;
    }

    setUploadingQr(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'deposit_qr_code',
          setting_value: qrCodeUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "QR code updated successfully",
      });
    } catch (error) {
      console.error('Error updating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to update QR code",
        variant: "destructive",
      });
    } finally {
      setUploadingQr(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, fetchData]);

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
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="glass border-border">
            <TabsTrigger value="live" className="gap-2">
              <Target className="w-4 h-4" />
              Live Matches
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Trophy className="w-4 h-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="deposits" className="gap-2">
              <WalletIcon className="w-4 h-4" />
              Deposits
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <WalletIcon className="w-4 h-4" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Trophy className="w-4 h-4" />
              Tournament History
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="qr-code" className="gap-2">
              <QrCode className="w-4 h-4" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            <LiveTournamentManagement 
              tournaments={liveTournaments}
              onRefresh={fetchData}
            />
          </TabsContent>

          <TabsContent value="upcoming">
            <TournamentManagement 
              tournaments={upcomingTournaments}
              onRefresh={fetchUpcomingTournaments}
            />
          </TabsContent>

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

          <TabsContent value="history">
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tournaments</p>
                      <p className="text-2xl font-bold">{tournamentStats.totalCreated}</p>
                    </div>
                  </div>
                </Card>

                <Card className="glass border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <Trophy className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{tournamentStats.totalCompleted}</p>
                    </div>
                  </div>
                </Card>

                <Card className="glass border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-yellow-500/10">
                      <WalletIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prizes Distributed</p>
                      <p className="text-2xl font-bold">₹{tournamentStats.totalPrizesDistributed.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Completed Tournaments Table */}
              <TournamentManagement 
                tournaments={completedTournaments}
                onRefresh={fetchCompletedTournaments}
              />
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement 
              users={users}
              onRefresh={fetchUsers}
            />
          </TabsContent>

          <TabsContent value="qr-code">
            <Card className="glass border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <QrCode className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Deposit QR Code</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="qr-url">QR Code Image URL</Label>
                  <Input
                    id="qr-url"
                    type="url"
                    placeholder="https://example.com/qr-code.png"
                    value={qrCodeUrl}
                    onChange={(e) => setQrCodeUrl(e.target.value)}
                    className="glass mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload your QR code image to a hosting service and paste the URL here
                  </p>
                </div>

                {qrCodeUrl && (
                  <div className="border border-border rounded-lg p-4 glass">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code Preview" 
                      className="max-w-xs mx-auto rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleQrCodeUpdate}
                  disabled={uploadingQr}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingQr ? "Updating..." : "Update QR Code"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;