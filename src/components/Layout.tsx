import { Home, Trophy, History, Bell, User } from "lucide-react";
import { NavLink } from "./NavLink";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Trophy, label: "Tournaments", path: "/tournaments" },
    { icon: History, label: "History", path: "/history" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Gradient glow effect at top */}
      <div className="fixed top-0 left-0 right-0 h-40 bg-gradient-glow pointer-events-none z-0" />
      
      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border z-50">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all"
                activeClassName="text-primary"
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={`w-6 h-6 transition-all ${
                        isActive ? "text-primary drop-shadow-[0_0_8px_hsl(195_100%_50%)]" : "text-muted-foreground"
                      }`} 
                    />
                    <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
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
