import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, TrendingUp, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// LiquidEther is rendered globally via the app layout

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effect */}
      {/* Background is provided globally */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="border-b border-primary/10 pb-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold font-playfair text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-foreground/60">Oversee. Moderate. Optimize.</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="text-foreground border-primary/20 hover:bg-foreground/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="border border-primary/10 rounded-lg p-6 bg-background/40 backdrop-blur-sm">
            <p className="text-foreground/60 text-sm mb-2">Total Users</p>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>

          <div className="border border-primary/10 rounded-lg p-6 bg-background/40 backdrop-blur-sm">
            <p className="text-foreground/60 text-sm mb-2">Active Sellers</p>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>

          <div className="border border-primary/10 rounded-lg p-6 bg-background/40 backdrop-blur-sm">
            <p className="text-foreground/60 text-sm mb-2">Products Listed</p>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>

          <div className="border border-primary/10 rounded-lg p-6 bg-background/40 backdrop-blur-sm">
            <p className="text-foreground/60 text-sm mb-2">Scans Processed</p>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="border border-primary/10 rounded-lg p-8 bg-background/40 backdrop-blur-sm hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-playfair">Manage Users</h3>
            </div>
            <p className="text-foreground/60 mb-6 text-sm">
              View and modify user roles
            </p>
            <Button className="w-full bg-primary text-background hover:bg-primary/90 font-semibold h-10">
              User Management
            </Button>
          </div>

          <div className="border border-primary/10 rounded-lg p-8 bg-background/40 backdrop-blur-sm hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-playfair">Review Products</h3>
            </div>
            <p className="text-foreground/60 mb-6 text-sm">
              Moderate seller listings
            </p>
            <Button variant="outline" className="w-full border-primary/20 text-foreground hover:bg-foreground/10 font-semibold h-10">
              Product Review
            </Button>
          </div>

          <div className="border border-primary/10 rounded-lg p-8 bg-background/40 backdrop-blur-sm hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-playfair">Analytics</h3>
            </div>
            <p className="text-foreground/60 mb-6 text-sm">
              View platform insights
            </p>
            <Button variant="outline" className="w-full border-primary/20 text-foreground hover:bg-foreground/10 font-semibold h-10">
              View Reports
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border border-primary/10 rounded-lg p-8 bg-background/40 backdrop-blur-sm">
          <h3 className="text-xl font-bold font-playfair mb-2">Recent Activity</h3>
          <p className="text-foreground/60 text-sm mb-6">Latest actions across EcoMart</p>
          <div className="text-center py-12 text-foreground/60">
            <p>No activity to display yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
