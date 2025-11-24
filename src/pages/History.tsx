import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Trophy, 
  CreditCard,
  Download,
  Calendar as CalendarIcon,
  Filter
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SkeletonTransactionCard } from "@/components/SkeletonCard";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "entry_fee" | "prize";
  amount: number;
  status: string;
  date: string;
  description: string;
  reference?: string;
}

const History = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [loading, setLoading] = useState(true);

  // Stats
  const totalDeposits = filteredTransactions
    .filter(t => t.type === "deposit" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = filteredTransactions
    .filter(t => t.type === "withdrawal" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalEntryFees = filteredTransactions
    .filter(t => t.type === "entry_fee")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalPrizes = filteredTransactions
    .filter(t => t.type === "prize")
    .reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    if (user) {
      fetchAllTransactions();
    }
  }, [user]);

  useEffect(() => {
    applyDateFilter();
  }, [dateRange, transactions]);

  const fetchAllTransactions = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch deposits with limit
      const { data: deposits } = await supabase
        .from("deposit_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      // Fetch withdrawals with limit
      const { data: withdrawals } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      // Fetch tournament entries with limit
      const { data: entries } = await supabase
        .from("tournament_participants")
        .select(`
          id,
          joined_at,
          tournament:tournaments(title, entry_fee)
        `)
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })
        .limit(100);

      // Fetch prize winnings with limit
      const { data: prizes } = await supabase
        .from("tournament_results")
        .select(`
          id,
          prize_amount,
          created_at,
          tournament:tournaments(title)
        `)
        .eq("user_id", user.id)
        .gt("prize_amount", 0)
        .order("created_at", { ascending: false })
        .limit(100);

      // Combine all transactions
      const allTransactions: Transaction[] = [];

      // Add deposits
      deposits?.forEach((d) => {
        allTransactions.push({
          id: d.id,
          type: "deposit",
          amount: d.amount,
          status: d.status,
          date: d.created_at,
          description: "Wallet Deposit",
          reference: d.transaction_id,
        });
      });

      // Add withdrawals
      withdrawals?.forEach((w) => {
        allTransactions.push({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          status: w.status,
          date: w.created_at || "",
          description: "Wallet Withdrawal",
          reference: w.transaction_id || undefined,
        });
      });

      // Add tournament entries
      entries?.forEach((e: any) => {
        allTransactions.push({
          id: e.id,
          type: "entry_fee",
          amount: e.tournament.entry_fee,
          status: "completed",
          date: e.joined_at || "",
          description: `Entry Fee - ${e.tournament.title}`,
        });
      });

      // Add prize winnings
      prizes?.forEach((p: any) => {
        allTransactions.push({
          id: p.id,
          type: "prize",
          amount: p.prize_amount,
          status: "completed",
          date: p.created_at || "",
          description: `Prize Won - ${p.tournament.title}`,
        });
      });

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = useCallback(() => {
    if (!dateRange.from && !dateRange.to) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.date);
      if (dateRange.from && txDate < dateRange.from) return false;
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (txDate > endOfDay) return false;
      }
      return true;
    });

    setFilteredTransactions(filtered);
  }, [dateRange, transactions]);

  const exportToCSV = useCallback(() => {
    const headers = ["Date", "Type", "Description", "Amount", "Status", "Reference"];
    const rows = filteredTransactions.map((t) => [
      format(new Date(t.date), "yyyy-MM-dd HH:mm"),
      t.type.replace("_", " ").toUpperCase(),
      t.description,
      t.amount.toFixed(2),
      t.status.toUpperCase(),
      t.reference || "-",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaction-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Transaction history exported");
  }, [filteredTransactions]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case "withdrawal":
        return <ArrowUpCircle className="w-5 h-5 text-orange-500" />;
      case "entry_fee":
        return <CreditCard className="w-5 h-5 text-red-500" />;
      case "prize":
        return <Trophy className="w-5 h-5 text-primary" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      approved: { className: "bg-green-500/20 text-green-500 border-green-500/30", label: "Approved" },
      pending: { className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", label: "Pending" },
      rejected: { className: "bg-red-500/20 text-red-500 border-red-500/30", label: "Rejected" },
      completed: { className: "bg-primary/20 text-primary border-primary/30", label: "Completed" },
    };

    const variant = variants[status] || variants.completed;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <Card className="glass border-border p-4 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          {getTransactionIcon(transaction.type)}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1 truncate">{transaction.description}</h4>
            <p className="text-xs text-muted-foreground">
              {format(new Date(transaction.date), "MMM dd, yyyy 'at' HH:mm")}
            </p>
            {transaction.reference && (
              <p className="text-xs text-muted-foreground mt-1">
                Ref: {transaction.reference}
              </p>
            )}
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p
            className={cn(
              "font-bold text-base",
              transaction.type === "deposit" || transaction.type === "prize"
                ? "text-green-500"
                : "text-red-500"
            )}
          >
            {transaction.type === "deposit" || transaction.type === "prize" ? "+" : "-"}₹
            {transaction.amount.toFixed(2)}
          </p>
          {getStatusBadge(transaction.status)}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Transaction History</h1>
            </div>
            <Button onClick={exportToCSV} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="glass border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Deposits</p>
            <p className="text-xl font-bold text-green-500">₹{totalDeposits.toFixed(2)}</p>
          </Card>
          <Card className="glass border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Withdrawals</p>
            <p className="text-xl font-bold text-orange-500">₹{totalWithdrawals.toFixed(2)}</p>
          </Card>
          <Card className="glass border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Entry Fees Paid</p>
            <p className="text-xl font-bold text-red-500">₹{totalEntryFees.toFixed(2)}</p>
          </Card>
          <Card className="glass border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Prizes Won</p>
            <p className="text-xl font-bold text-primary">₹{totalPrizes.toFixed(2)}</p>
          </Card>
        </div>

        {/* Date Filter */}
        <Card className="glass border-border p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {(dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange({})}
              >
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Transactions Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 glass mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="deposit">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
            <TabsTrigger value="entry_fee">Entries</TabsTrigger>
            <TabsTrigger value="prize">Prizes</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <SkeletonTransactionCard key={i} />
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <Card className="glass border-border p-8">
                <p className="text-center text-muted-foreground">No transactions found</p>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            )}
          </TabsContent>

          {["deposit", "withdrawal", "entry_fee", "prize"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-3">
              {filteredTransactions.filter((t) => t.type === type).length === 0 ? (
                <Card className="glass border-border p-8">
                  <p className="text-center text-muted-foreground">
                    No {type.replace("_", " ")} transactions found
                  </p>
                </Card>
              ) : (
                filteredTransactions
                  .filter((t) => t.type === type)
                  .map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default History;
