import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [upiId, setUpiId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPaymentMethod();
    }
  }, [user]);

  const fetchPaymentMethod = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('upi_id')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUpiId(data.upi_id || "");
      }
    } catch (error) {
      console.error('Error fetching payment method:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save payment method",
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

    // Basic UPI ID validation
    if (!upiId.includes('@')) {
      toast({
        title: "Invalid UPI ID",
        description: "UPI ID should be in format: username@bankname",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ upi_id: upiId.trim() })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save payment method",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <CreditCard className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Payment Methods</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="glass border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">UPI Payment Method</h2>
              <p className="text-sm text-muted-foreground">
                Save your UPI ID for faster withdrawals
              </p>
            </div>
          </div>

          {isFetching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSavePaymentMethod} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="upi-id">UPI ID *</Label>
                <Input
                  id="upi-id"
                  type="text"
                  placeholder="username@bankname"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="glass border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter your UPI ID (e.g., yourname@paytm, yourname@googlepay)
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Why save payment method?</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Withdraw winnings faster without entering UPI ID each time</li>
                  <li>Your UPI ID is securely encrypted and stored</li>
                  <li>Update anytime from this page</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-gaming hover:shadow-neon-primary"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Payment Method"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Payment;
