import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Wallet, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Withdrawal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchWithdrawalRequests();
      fetchWalletBalance();
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setWalletBalance(Number(data.wallet_balance) || 0);
    }
  };

  const fetchWithdrawalRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to request withdrawal",
        variant: "destructive",
      });
      return;
    }

    const withdrawAmount = Number(amount);
    
    if (withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount: withdrawAmount,
        upi_id: upiId,
        status: 'pending'
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      });
      setUpiId("");
      setAmount("");
      fetchWithdrawalRequests();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-500 border-green-500/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
            <h1 className="text-lg font-bold">Withdrawal</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Wallet Balance */}
        <Card className="glass border-primary/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-primary">₹{walletBalance.toFixed(2)}</p>
            </div>
            <Wallet className="w-12 h-12 text-primary/30" />
          </div>
        </Card>

        {/* Withdrawal Form */}
        <Card className="glass border-border p-6">
          <h2 className="text-lg font-bold mb-4">Request Withdrawal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upi">UPI ID</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="upi"
                  type="text"
                  placeholder="yourname@upi"
                  className="pl-10 glass border-border"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  className="pl-10 glass border-border"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={walletBalance}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum withdrawal: ₹50
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Card>

        {/* Withdrawal History */}
        <Card className="glass border-border p-6">
          <h2 className="text-lg font-bold mb-4">Withdrawal History</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No withdrawal requests yet
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="font-bold text-lg">₹{Number(request.amount).toFixed(2)}</span>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      UPI: <span className="text-foreground">{request.upi_id}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.transaction_id && (
                      <p className="text-muted-foreground">
                        Transaction ID: <span className="text-foreground">{request.transaction_id}</span>
                      </p>
                    )}
                    {request.admin_notes && (
                      <p className="text-muted-foreground">
                        Note: <span className="text-foreground">{request.admin_notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Withdrawal;