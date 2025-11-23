import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface DepositManagementProps {
  requests: DepositRequest[];
  onRefresh: () => void;
}

export const DepositManagement = ({ requests, onRefresh }: DepositManagementProps) => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openDialog = (request: DepositRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes("");
    setDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    setIsLoading(true);

    try {
      const updates: any = {
        status: actionType === "approve" ? "approved" : "rejected",
        admin_notes: adminNotes.trim() || null,
      };

      // Update deposit request status
      const { error: updateError } = await supabase
        .from('deposit_requests')
        .update(updates)
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // If approved, add amount to user's wallet
      if (actionType === "approve") {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', selectedRequest.user_id)
          .single();

        if (profileError) throw profileError;

        const newBalance = Number(profile.wallet_balance || 0) + Number(selectedRequest.amount);

        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', selectedRequest.user_id);

        if (balanceError) throw balanceError;
      }

      toast({
        title: "Success",
        description: `Deposit request ${actionType}ed successfully`,
      });
      setDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    <>
      <Card className="glass border-border p-6">
        <h2 className="text-xl font-bold mb-4">Deposit Requests</h2>
        
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No deposit requests found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Depositor Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
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
                      {request.transaction_id}
                    </TableCell>
                    <TableCell>{request.depositor_name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.depositor_phone}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Deposit Request
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Approve this deposit and add funds to user's wallet"
                : "Reject this deposit request"}
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
                  <span className="text-muted-foreground">Transaction ID:</span>{" "}
                  <span className="font-mono">{selectedRequest.transaction_id}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Depositor:</span>{" "}
                  <span>{selectedRequest.depositor_name}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <span className="font-mono">{selectedRequest.depositor_phone}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  Admin Notes (Optional)
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isLoading}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {isLoading ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};