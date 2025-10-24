import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, List, Award, LogOut, Leaf } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import FluidRibbons from "@/components/FluidRibbons";
import { HourglassLoader } from "@/components/HourglassLoader";

const DEMO_PRODUCTS = [
  {
    id: "1",
    name: "Recycled Water Bottle",
    brand: "EcoFlow",
    price: 12.99,
    image: "🌊",
    eco_reason: "Made from 100% recycled ocean plastic",
    sustainability_score: 95
  },
  {
    id: "2",
    name: "Bamboo Toothbrush Set",
    brand: "GreenSmile",
    price: 8.50,
    image: "🦷",
    eco_reason: "Biodegradable bamboo handle, zero plastic",
    sustainability_score: 92
  },
  {
    id: "3",
    name: "Organic Cotton Tote",
    brand: "EarthCarry",
    price: 15.00,
    image: "👜",
    eco_reason: "100% organic cotton, fair trade certified",
    sustainability_score: 88
  },
  {
    id: "4",
    name: "Solar Power Bank",
    brand: "SunCharge",
    price: 29.99,
    image: "🔋",
    eco_reason: "Solar powered, reduces electronic waste",
    sustainability_score: 90
  }
];

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(50); // Starter points
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  const handleScan = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Demo scan complete! Check suggested products below.");
    }, 2000);
  };

  const handleAddToCart = (productName: string) => {
    setPoints(points + 10);
    toast.success(`${productName} added! +10 EcoPoints earned 🎉`);
  };

  return (
    <div className="min-h-screen p-6 relative">
      <FluidRibbons />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Ecomart Buyer
            </h1>
            <p className="text-muted-foreground text-lg font-semibold">Shop Clean. Live Green.</p>
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
              <Button className="w-full" size="lg" onClick={handleScan}>
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

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="py-8">
              <HourglassLoader />
              <p className="text-center text-muted-foreground mt-4">Scanning your cart...</p>
            </CardContent>
          </Card>
        )}

        {/* Demo Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-accent" />
              <CardTitle>Eco-Friendly Products</CardTitle>
            </div>
            <CardDescription>Discover sustainable alternatives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DEMO_PRODUCTS.map((product) => (
                <Card key={product.id} className="card-glow hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="text-5xl mb-3 text-center">{product.image}</div>
                    <h3 className="font-semibold mb-1 text-sm">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>
                    <Badge variant="secondary" className="mb-2 text-xs">
                      Score: {product.sustainability_score}
                    </Badge>
                    <p className="text-xs text-muted-foreground mb-3">{product.eco_reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-accent">${product.price}</span>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product.name)}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerDashboard;
