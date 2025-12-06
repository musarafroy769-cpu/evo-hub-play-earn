import { Home, Trophy, History, TrendingUp, User } from "lucide-react";
import { NavLink } from "./NavLink";
import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Trophy, label: "Tournaments", path: "/tournaments" },
    { icon: TrendingUp, label: "Leaderboard", path: "/leaderboard" },
    { icon: History, label: "History", path: "/history" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Gradient glow effect at top */}
      <div className="fixed top-0 left-0 right-0 h-40 bg-gradient-glow pointer-events-none z-0" />
      
      {/* Header with wallet and notifications */}
      <AppHeader />
      
      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Bottom Navigation - optimized for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border z-50 safe-area-bottom">
        <div className="w-full px-2 sm:max-w-lg sm:mx-auto sm:px-4">
          <div className="flex items-center justify-around py-2 sm:py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-2 rounded-lg transition-all min-w-[56px] touch-manipulation"
                activeClassName="text-primary"
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${
                        isActive ? "text-primary drop-shadow-[0_0_8px_hsl(195_100%_50%)]" : "text-muted-foreground"
                      }`} 
                    />
                    <span className={`text-[10px] sm:text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};
