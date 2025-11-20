import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Trophy, Wallet, AlertCircle } from "lucide-react";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: "tournament",
      title: "Match Starting Soon",
      message: "Free Fire Friday Rush starts in 30 minutes",
      time: "5 min ago",
      read: false,
      icon: Trophy,
    },
    {
      id: 2,
      type: "withdrawal",
      title: "Withdrawal Approved",
      message: "₹2,000 has been transferred to your UPI",
      time: "1 hour ago",
      read: false,
      icon: Wallet,
    },
    {
      id: 3,
      type: "result",
      title: "Tournament Result",
      message: "You won 1st place in BGMI Squad Showdown!",
      time: "2 hours ago",
      read: true,
      icon: Trophy,
    },
    {
      id: 4,
      type: "announcement",
      title: "New Features",
      message: "Check out the new tournament filters",
      time: "1 day ago",
      read: true,
      icon: Bell,
    },
    {
      id: 5,
      type: "alert",
      title: "Important Update",
      message: "Room ID for tonight's match has been updated",
      time: "2 days ago",
      read: true,
      icon: AlertCircle,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tournament":
        return "text-primary";
      case "withdrawal":
        return "text-accent";
      case "result":
        return "text-secondary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Notifications</h1>
            </div>
            <Badge variant="secondary" className="glass">
              {notifications.filter((n) => !n.read).length} New
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                className={`glass border-border p-4 hover:border-primary/50 transition-all ${
                  !notification.read ? "border-primary/30" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
