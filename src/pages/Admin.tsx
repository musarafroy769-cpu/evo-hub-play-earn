import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, XCircle, Clock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [transactionId, setTransactionId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchWithdrawalRequests();
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

  const fetchWithdrawalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Fetch usernames separately with better error handling
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

  const openDialog = (request: WithdrawalRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setTransactionId("");
    setAdminNotes("");
    setDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    if (actionType === "approve" && !transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter a transaction ID to approve",
        variant: "destructive",
      });
      return;
    }

    const updates: any = {
      status: actionType === "approve" ? "approved" : "rejected",
      admin_notes: adminNotes.trim() || null,
    };

    if (actionType === "approve") {
      updates.transaction_id = transactionId.trim();
    }

    const { error } = await supabase
      .from('withdrawal_requests')
      .update(updates)
      .eq('id', selectedRequest.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Request ${actionType}ed successfully`,
      });
      setDialogOpen(false);
      fetchWithdrawalRequests();
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
        <Card className="glass border-border p-6">
          <h2 className="text-xl font-bold mb-4">Withdrawal Requests</h2>
          
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No withdrawal requests found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>UPI ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.profiles?.username || "Unknown"}
                      </TableCell>
                      <TableCell className="text-primary font-bold">
                        ₹{Number(request.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {request.upi_id}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {request.transaction_id || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openDialog(request, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDialog(request, "reject")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {request.status === "approved" ? "Approved" : "Rejected"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Withdrawal Request
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Enter the transaction ID to approve this withdrawal"
                : "Add a note explaining why this request is being rejected"}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">User:</span>{" "}
                  <span className="font-medium">{selectedRequest.profiles?.username}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Amount:</span>{" "}
                  <span className="font-bold text-primary">
                    ₹{Number(selectedRequest.amount).toFixed(2)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">UPI ID:</span>{" "}
                  <span className="font-mono">{selectedRequest.upi_id}</span>
                </p>
              </div>

              {actionType === "approve" && (
                <div className="space-y-2">
                  <Label htmlFor="txn-id">Transaction ID *</Label>
                  <Input
                    id="txn-id"
                    placeholder="Enter transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="glass border-border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">
                  Admin Notes {actionType === "reject" && "(Optional)"}
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="glass border-border"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
