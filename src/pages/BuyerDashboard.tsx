import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, List, Award, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import FluidRibbons from "@/components/FluidRibbons";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(50); // Starter points

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen p-6 relative">
      <FluidRibbons />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, Eco Warrior! 🌱</h1>
            <p className="text-muted-foreground text-lg">Scan your cart and discover greener alternatives</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Points Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">Your EcoPoints</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Keep making sustainable choices!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{points}</p>
            <p className="mt-2 text-primary-foreground/90">Earn 10 points per eco swap</p>
          </CardContent>
        </Card>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-glow cursor-pointer transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Scan Cart</CardTitle>
              </div>
              <CardDescription>
                Upload a screenshot or paste your shopping list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Start Scan
              </Button>
            </CardContent>
          </Card>

          <Card className="card-glow cursor-pointer transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <List className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Browse Eco Products</CardTitle>
              </div>
              <CardDescription>
                Explore curated sustainable alternatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="lg">
                View Catalog
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest eco-friendly actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>No scans yet. Start by uploading your first cart!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerDashboard;
