import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  username: string;
  wallet_balance: number;
  mobile_number: string | null;
  game_type: string | null;
  game_uid: string | null;
}

interface UserManagementProps {
  users: Profile[];
  onRefresh: () => Promise<void>;
}

export const UserManagement = ({ users, onRefresh }: UserManagementProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [amount, setAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.game_uid?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMoney = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const newBalance = (selectedUser.wallet_balance || 0) + parseFloat(amount);

      const { error } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ₹${amount} to ${selectedUser.username}'s wallet`,
      });

      setIsDialogOpen(false);
      setAmount("");
      setSelectedUser(null);
      await onRefresh();
    } catch (error) {
      console.error("Error adding money:", error);
      toast({
        title: "Error",
        description: "Failed to add money",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by username or game UID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass border-border"
        />
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="glass border-border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{user.username}</h3>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {user.game_uid && (
                    <span>Game UID: {user.game_uid}</span>
                  )}
                  {user.game_type && (
                    <span>Game: {user.game_type}</span>
                  )}
                  {user.mobile_number && (
                    <span>Mobile: {user.mobile_number}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Wallet className="w-4 h-4" />
                    ₹{user.wallet_balance?.toFixed(2) || "0.00"}
                  </div>
                </div>

                <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setSelectedUser(null);
                    setAmount("");
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Money
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-border">
                    <DialogHeader>
                      <DialogTitle>Add Money to Wallet</DialogTitle>
                      <DialogDescription>
                        Add money to {user.username}'s wallet
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Current Balance</Label>
                        <div className="text-2xl font-bold text-primary">
                          ₹{user.wallet_balance?.toFixed(2) || "0.00"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Add (₹)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          className="glass border-border"
                        />
                      </div>

                      <Button
                        onClick={handleAddMoney}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? "Processing..." : "Add Money"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card className="glass border-border p-8">
            <p className="text-center text-muted-foreground">
              No users found
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
