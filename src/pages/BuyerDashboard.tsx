import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, List, Award, LogOut, Leaf } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { HourglassLoader } from "@/components/HourglassLoader";
import { Chatbot } from "@/components/Chatbot";
import { ProjectsSidebar } from "@/components/ProjectsSidebar";
import { SustainabilityResults } from "@/components/SustainabilityResults";

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
  const [points, setPoints] = useState(50);
  const [loading, setLoading] = useState(false);
  const [sustainabilityResults, setSustainabilityResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  const handleScan = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setSustainabilityResults([]);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Call OCR function
        toast.info("Scanning your cart...");
        const { data: ocrData, error: ocrError } = await supabase.functions.invoke('scan-cart', {
          body: { imageData: base64 }
        });

        if (ocrError) throw ocrError;

        if (ocrData?.success && ocrData.items?.length > 0) {
          toast.success(`Found ${ocrData.items.length} items!`);
          
          // Check sustainability
          toast.info("Analyzing sustainability...");
          const { data: sustainData, error: sustainError } = await supabase.functions.invoke('check-sustainability', {
            body: { items: ocrData.items }
          });

          if (sustainError) throw sustainError;

          if (sustainData?.success) {
            setSustainabilityResults(sustainData.analysis);
            toast.success("Analysis complete!");
          }
        } else {
          toast.error("No items found in the image. Please try again.");
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan cart. Please try again.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddToCart = (productName: string) => {
    setPoints(points + 10);
    toast.success(`${productName} added! +10 EcoPoints earned 🎉`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Glowing Grid Backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0" 
           style={{
             background: `linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px),
                         linear-gradient(180deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} 
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="relative z-10 flex h-screen w-[95%] mx-auto my-[5vh] backdrop-blur-[20px] rounded-[20px] overflow-hidden shadow-[0_0_40px_hsl(var(--primary)_/_0.4)] bg-card/5">
        {/* Sidebar */}
        <ProjectsSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border/20">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ecomart Buyer
              </h1>
              <p className="text-muted-foreground mt-2">Shop Clean. Live Green.</p>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="border-primary/50 hover:bg-primary/10">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Content Area with Products and Chatbot */}
          <div className="flex-1 flex gap-4 p-6 overflow-hidden">
            {/* Products Section */}
            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
              {/* Points Card */}
              <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
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
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="card-glow cursor-pointer transition-all bg-card/40 backdrop-blur-sm border-primary/30">
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

                <Card className="card-glow cursor-pointer transition-all bg-card/40 backdrop-blur-sm border-primary/30">
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
                <Card className="bg-card/40 backdrop-blur-sm border-primary/30">
                  <CardContent className="py-8">
                    <HourglassLoader />
                    <p className="text-center text-muted-foreground mt-4">Analyzing your cart...</p>
                  </CardContent>
                </Card>
              )}

              {/* Sustainability Results */}
              {sustainabilityResults.length > 0 && (
                <SustainabilityResults results={sustainabilityResults} />
              )}

              {/* Demo Products */}
              <Card className="bg-card/40 backdrop-blur-sm border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-accent" />
                    <CardTitle>Eco-Friendly Products</CardTitle>
                  </div>
                  <CardDescription>Discover sustainable alternatives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEMO_PRODUCTS.map((product) => (
                      <Card key={product.id} className="card-glow hover:shadow-lg transition-all bg-card/60 backdrop-blur-sm border-primary/20">
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

            {/* Chatbot Section */}
            <div className="w-[400px] flex-shrink-0 hidden lg:block">
              <Chatbot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
