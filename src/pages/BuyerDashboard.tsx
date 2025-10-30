import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Award, Leaf } from "lucide-react";
import { toast } from "sonner";
import { ChatbotDialog } from "@/components/ChatbotDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductSidebar } from "@/components/ProductSidebar";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(50);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-theme">
      <ChatbotDialog />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-theme">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Ecomart</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{points} Points</span>
            </div>
            <CartDrawer />
            <ThemeToggle />
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 smooth-scroll">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Shop Sustainably</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Discover eco-friendly products from India & UAE
          </p>
          <ProductSidebar />
        </section>

        {/* Points Card - Mobile */}
        <Card className="sm:hidden mb-8 bg-gradient-to-r from-primary/10 to-accent/10 transition-theme">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Your EcoPoints</p>
                <p className="text-2xl font-bold">{points}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card transition-theme mt-16">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                © 2025 Ecomart. Shop Sustainably.
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Made for India & UAE</span>
              <span>•</span>
              <span>Eco-friendly Products</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BuyerDashboard;
