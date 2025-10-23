import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, ShoppingBag, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import FluidRibbons from "@/components/FluidRibbons";

const SellerDashboard = () => {
  const navigate = useNavigate();

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
            <h1 className="text-4xl font-bold text-foreground mb-2">Seller Dashboard 🌿</h1>
            <p className="text-muted-foreground text-lg">Manage your eco-friendly products</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Listings</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Orders</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Points Earned</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-glow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Plus className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Create Listing</CardTitle>
              </div>
              <CardDescription>
                Add a new eco-friendly product to the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                New Product
              </Button>
            </CardContent>
          </Card>

          <Card className="card-glow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Browse Suggestions</CardTitle>
              </div>
              <CardDescription>
                See items suggested by buyer scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="lg">
                View Suggestions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* My Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5" />
              <CardTitle>My Listings</CardTitle>
            </div>
            <CardDescription>Manage your active products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No listings yet. Create your first eco-friendly product!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
