import { Wallet, Bell, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
export const AppHeader = () => {
  const {
    user
  } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      // Fetch wallet balance
      const {
        data: profile
      } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
      if (profile) {
        setWalletBalance(profile.wallet_balance || 0);
      }

      // Fetch unread notifications count
      const {
        count
      } = await supabase.from('notifications').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', user.id).eq('read', false);
      setUnreadCount(count || 0);
    };
    fetchData();

    // Subscribe to profile changes
    const profileChannel = supabase.channel('profile-changes').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${user.id}`
    }, payload => {
      if (payload.new && 'wallet_balance' in payload.new) {
        setWalletBalance(payload.new.wallet_balance || 0);
      }
    }).subscribe();

    // Subscribe to notification changes
    const notificationChannel = supabase.channel('notification-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, async () => {
      console.log('Notification change detected, updating unread count');
      const {
        count
      } = await supabase.from('notifications').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', user.id).eq('read', false);
      console.log('New unread count:', count);
      setUnreadCount(count || 0);
    }).subscribe();
    return () => {
      profileChannel.unsubscribe();
      notificationChannel.unsubscribe();
    };
  }, [user?.id]);
  return <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="w-full px-3 sm:max-w-lg sm:mx-auto sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-shrink">
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-gaming bg-clip-text text-transparent truncate">
              MxA Evo Hub
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Play • Win • Earn</p>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Notification Icon */}
            <Link to="/notifications">
              <div className="relative glass p-1.5 sm:p-2 rounded-full border border-border hover:border-primary hover:bg-primary/10 transition-all cursor-pointer touch-manipulation">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 sm:h-5 min-w-4 sm:min-w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs bg-red-500 text-white border-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>}
              </div>
            </Link>

            {/* Wallet */}
            <Link to="/withdrawal?tab=deposit">
              <div className="flex items-center gap-1 sm:gap-2 glass px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all cursor-pointer touch-manipulation">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-semibold">₹{walletBalance.toFixed(2)}</span>
                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>;
};