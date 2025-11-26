import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Wallet, CreditCard, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Withdrawal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get the default tab from URL parameter
  const defaultTab = searchParams.get('tab') || 'deposit';
  
  // Withdrawal states
  const [upiId, setUpiId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  
  // Deposit states
  const [depositAmount, setDepositAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [depositorName, setDepositorName] = useState("");
  const [depositorPhone, setDepositorPhone] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  
  const MIN_WITHDRAWAL = 15;

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchWithdrawalRequests();
      fetchDepositRequests();
      fetchSavedUpiId();
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

  const fetchSavedUpiId = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('upi_id')
      .eq('id', user.id)
      .single();

    if (!error && data && data.upi_id) {
      setUpiId(data.upi_id);
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
      setWithdrawalRequests(data);
    }
  };

  const fetchDepositRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('deposit_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDepositRequests(data);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request a withdrawal",
        variant: "destructive",
      });
      return;
    }

    if (!upiId.trim()) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawPhone.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount < MIN_WITHDRAWAL) {
      toast({
        title: "Amount Too Low",
        description: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw this amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount,
        upi_id: upiId.trim(),
        phone_number: withdrawPhone.trim(),
        status: 'pending',
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
      setWithdrawAmount("");
      setUpiId("");
      setWithdrawPhone("");
      fetchWithdrawalRequests();
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to deposit",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter the transaction ID",
        variant: "destructive",
      });
      return;
    }

    if (!depositorName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter the depositor name",
        variant: "destructive",
      });
      return;
    }

    if (!depositorPhone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter the depositor phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('deposit_requests')
      .insert({
        user_id: user.id,
        amount,
        transaction_id: transactionId.trim(),
        depositor_name: depositorName.trim(),
        depositor_phone: depositorPhone.trim(),
        status: 'pending',
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit deposit request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Deposit request submitted. Admin will verify and approve.",
      });
      setDepositAmount("");
      setTransactionId("");
      setDepositorName("");
      setDepositorPhone("");
      fetchDepositRequests();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Wallet</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Wallet Balance */}
        <Card className="glass border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold text-primary">₹{walletBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Deposit & Withdrawal Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass border-border">
            <TabsTrigger value="deposit" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdrawal" className="gap-2">
              <Wallet className="w-4 h-4" />
              Withdrawal
            </TabsTrigger>
          </TabsList>

          {/* Deposit Tab */}
          <TabsContent value="deposit" className="space-y-6">
            <Card className="glass border-border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Deposit Money
              </h2>
              
              <div className="bg-muted/30 p-4 rounded-lg mb-6 space-y-3">
                <p className="text-sm font-medium">Payment Instructions:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Scan the QR code or use our UPI ID to make payment</li>
                  <li>After payment, enter the transaction details below</li>
                  <li>Admin will verify and add money to your wallet</li>
                </ol>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-500 font-medium">
                    ⚠️ Your money will be credited within 24 hours after verification
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 mb-6 p-6 bg-white rounded-lg">
                <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg">
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Scan QR Code to Pay</p>
                <p className="font-mono font-bold text-foreground">UPI ID: evohub@upi</p>
              </div>

              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount (₹)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="Enter deposit amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="glass border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="txn-id">Transaction ID *</Label>
                  <Input
                    id="txn-id"
                    type="text"
                    placeholder="Enter UPI transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="glass border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositor-name">Depositor Name *</Label>
                  <Input
                    id="depositor-name"
                    type="text"
                    placeholder="Name as per UPI account"
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    className="glass border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositor-phone">Phone Number *</Label>
                  <Input
                    id="depositor-phone"
                    type="tel"
                    placeholder="Phone number used for payment"
                    value={depositorPhone}
                    onChange={(e) => setDepositorPhone(e.target.value)}
                    className="glass border-border"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gaming hover:shadow-neon-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit Deposit Request"}
                </Button>
              </form>
            </Card>

            {/* Deposit History */}
            <Card className="glass border-border p-6">
              <h2 className="text-xl font-bold mb-4">Deposit History</h2>
              <div className="space-y-4">
                {depositRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No deposit requests yet
                  </p>
                ) : (
                  depositRequests.map((request) => (
                    <div key={request.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(request.status)}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg">₹{Number(request.amount).toFixed(2)}</p>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              TXN ID: {request.transaction_id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Name: {request.depositor_name}
                            </p>
                            {request.admin_notes && (
                              <p className="text-sm text-muted-foreground italic">
                                Note: {request.admin_notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Withdrawal Tab */}
          <TabsContent value="withdrawal" className="space-y-6">
            <Card className="glass border-border p-6">
              <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>
              
              <div className="bg-muted/30 p-4 rounded-lg mb-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Minimum withdrawal: <span className="font-bold text-primary">₹{MIN_WITHDRAWAL}</span>
                </p>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-500 font-medium">
                    ⚠️ Withdrawal will take up to 24 hours to credit to your account
                  </p>
                </div>
              </div>

              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (₹)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder={`Enter amount (Min: ₹${MIN_WITHDRAWAL})`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="glass border-border"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="upi">UPI ID *</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs text-primary"
                      onClick={() => navigate('/payment')}
                    >
                      Manage Payment Methods
                    </Button>
                  </div>
                  <Input
                    id="upi"
                    type="text"
                    placeholder="username@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="glass border-border"
                  />
                  {upiId && (
                    <p className="text-xs text-muted-foreground">
                      ✓ Using saved UPI ID from payment methods
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdraw-phone">Phone Number *</Label>
                  <Input
                    id="withdraw-phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    className="glass border-border"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gaming hover:shadow-neon-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Submit Request"}
                </Button>
              </form>
            </Card>

            {/* Withdrawal History */}
            <Card className="glass border-border p-6">
              <h2 className="text-xl font-bold mb-4">Withdrawal History</h2>
              <div className="space-y-4">
                {withdrawalRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No withdrawal requests yet
                  </p>
                ) : (
                  withdrawalRequests.map((request) => (
                    <div key={request.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(request.status)}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg">₹{Number(request.amount).toFixed(2)}</p>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              UPI: {request.upi_id}
                            </p>
                            {request.transaction_id && (
                              <p className="text-sm text-muted-foreground">
                                Transaction ID: {request.transaction_id}
                              </p>
                            )}
                            {request.admin_notes && (
                              <p className="text-sm text-muted-foreground italic">
                                Note: {request.admin_notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Withdrawal;