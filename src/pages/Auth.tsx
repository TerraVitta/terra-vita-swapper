import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Leaf, Mail, Lock } from "lucide-react";
import FluidRibbons from "@/components/FluidRibbons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIChatButton } from "@/components/AIChatButton";

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { username, password }
      });

      if (error) throw error;

      if (data?.success && data?.isAdmin) {
        localStorage.setItem('ecomart_admin_session', 'true');
        toast.success("Admin login successful!");
        navigate("/admin");
      } else {
        toast.error("Invalid admin credentials");
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error("Failed to login as admin");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome to Ecomart! Check your email to verify.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        navigate("/");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <FluidRibbons />
      
      {/* AI Chat and Theme Toggle - Increased z-index */}
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-3">
        <ThemeToggle />
        <AIChatButton />
      </div>
      
      <Card className="w-full max-w-5xl grid md:grid-cols-2 gap-0 overflow-hidden shadow-2xl relative z-10">
        {/* Left side - Illustration */}
        <div className="bg-gradient-to-br from-primary to-accent p-12 flex flex-col justify-center items-center text-primary-foreground">
          <div className="mb-8">
            <Leaf className="w-24 h-24 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-center">Ecomart</h2>
          <p className="text-center text-lg opacity-90 font-semibold">
            Shop Clean. Live Green.
          </p>
        </div>

        {/* Right side - Auth form */}
        <div className="p-12 flex flex-col justify-center bg-card">
          <h1 className="text-3xl font-bold mb-2 text-card-foreground">
            {isAdminLogin ? "Admin Login" : isSignUp ? "Join Ecomart" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isAdminLogin 
              ? "Access the admin dashboard" 
              : isSignUp 
                ? "Start earning EcoPoints for sustainable choices" 
                : "Continue your eco-friendly journey"}
          </p>

          {isAdminLogin ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Loading..." : "Admin Sign In"}
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isAdminLogin ? (
              <button
                onClick={() => setIsAdminLogin(false)}
                className="text-accent font-medium hover:underline"
                type="button"
              >
                Back to user login
              </button>
            ) : (
              <>
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-accent font-medium hover:underline"
                  type="button"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
                {" | "}
                <button
                  onClick={() => setIsAdminLogin(true)}
                  className="text-accent font-medium hover:underline"
                  type="button"
                >
                  Admin
                </button>
              </>
            )}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
