import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Trophy, Mail, Lock, User, Phone, Gamepad2, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [gameType, setGameType] = useState<string>("");
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(loginEmail, loginPassword);
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameType) {
      return;
    }
    setIsLoading(true);
    const result = await signUp(signupEmail, signupPassword, username, phone, gameUid, gameType);
    setIsLoading(false);
    
    if (!result.error) {
      setShowVerifyDialog(true);
    }
  };


  return (
    <>
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent className="glass border-primary/30">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              Verify Your Email
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-2">
              <p>
                We've sent a verification link to <strong>{signupEmail}</strong>
              </p>
              <p className="text-muted-foreground">
                Please check your email and click the verification link to activate your account.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={() => setShowVerifyDialog(false)}
              className="w-full bg-gradient-gaming"
            >
              Got it!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
              Evo Hub
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Play • Win • Earn</p>
        </div>

        <Card className="glass border-primary/30 p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 glass border-border"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 glass border-border"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <Button variant="link" className="w-full text-sm text-primary">
                  Forgot password?
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your game ID name"
                      className="pl-10 glass border-border"
                      value={username}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setUsername(value);
                      }}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your game ID name (letters only, no numbers or symbols)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 glass border-border"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-10 glass border-border"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="game-type">Select Game</Label>
                  <Select value={gameType} onValueChange={setGameType} required>
                    <SelectTrigger className="glass border-border">
                      <SelectValue placeholder="Choose your game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FF">Free Fire (FF)</SelectItem>
                      <SelectItem value="BGMI">BGMI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="game-uid">Game UID</Label>
                  <div className="relative">
                    <Gamepad2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="game-uid"
                      type="text"
                      placeholder="Enter your game UID"
                      className="pl-10 glass border-border"
                      value={gameUid}
                      onChange={(e) => setGameUid(e.target.value)}
                      required
                    />
                  </div>
                  <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ Enter the correct UID of your game. If you provide wrong UID, your money will NOT be credited!
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 glass border-border"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gaming hover:shadow-neon-primary transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;
