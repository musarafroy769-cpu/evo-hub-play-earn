import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, Shield, Globe, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Notifications */}
        <Card className="glass border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Notifications</h3>
          </div>
          <Separator className="mb-4" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive match reminders and updates
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="glass border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Appearance</h3>
          </div>
          <Separator className="mb-4" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                disabled
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="glass border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Privacy & Security</h3>
          </div>
          <Separator className="mb-4" />
          
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Privacy Policy
            </Button>
          </div>
        </Card>

        {/* Language */}
        <Card className="glass border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Language</h3>
          </div>
          <Separator className="mb-4" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Current Language</span>
            <span className="text-sm text-primary font-semibold">English</span>
          </div>
        </Card>

        {/* App Info */}
        <Card className="glass border-border p-6">
          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>Evo Hub</p>
            <p>Version 1.0.0</p>
            <p>© 2024 Evo Hub. All rights reserved.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
