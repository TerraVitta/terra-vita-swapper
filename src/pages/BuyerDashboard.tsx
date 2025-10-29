import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Award, Leaf, ShoppingBag, Heart } from "lucide-react";
import { toast } from "sonner";
import { ChatbotDialog } from "@/components/ChatbotDialog";
import { ProjectsSidebar } from "@/components/ProjectsSidebar";
import Aurora from "@/components/Aurora";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart } from "@/hooks/useCart";
import productsData from "@/data/products.json";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(50);
  const { addItem } = useCart();
  const catalogRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("all");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image: product.image,
    });
    setPoints(points + 10);
    toast.success(`${product.title} added! +10 EcoPoints earned 🎉`);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories = ["all", ...Array.from(new Set(productsData.map(p => p.category)))];
  const filteredProducts = activeTab === "all" 
    ? productsData 
    : productsData.filter(p => p.category === activeTab);

  // Handle keyboard navigation for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = categories.indexOf(activeTab);
      if (e.key === 'ArrowRight' && currentIndex < categories.length - 1) {
        setActiveTab(categories[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setActiveTab(categories[currentIndex - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, categories]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      <ChatbotDialog />

      <div className="relative z-10 flex h-screen w-[95%] mx-auto my-[5vh] backdrop-blur-[20px] rounded-[20px] overflow-hidden shadow-[0_0_40px_hsl(var(--primary)_/_0.4)] bg-card/5">
        {/* Sidebar */}
        <ProjectsSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border/20">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ecomart
              </h1>
              <p className="text-muted-foreground mt-2">Shop Sustainably • Live Better</p>
            </div>
            <div className="flex items-center gap-2">
              <CartDrawer />
              <ThemeToggle />
              <Button onClick={handleSignOut} variant="outline" size="sm" className="border-primary/50 hover:bg-primary/10">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

            {/* Quick Action */}
            <Card className="card-glow cursor-pointer transition-all bg-card/40 backdrop-blur-sm border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Explore Eco-Friendly Products</CardTitle>
                </div>
                <CardDescription>
                  Discover {productsData.length}+ sustainable products from India & UAE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={scrollToCatalog} className="w-full" size="lg">
                  View Catalog
                </Button>
              </CardContent>
            </Card>

            {/* Product Catalog */}
            <div ref={catalogRef} id="catalog">
              <Card className="bg-card/40 backdrop-blur-sm border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-accent" />
                    <CardTitle>Product Catalog</CardTitle>
                  </div>
                  <CardDescription>Browse by category with keyboard (←/→ arrows)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
                      {categories.map(cat => (
                        <TabsTrigger 
                          key={cat} 
                          value={cat}
                          className="capitalize focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {categories.map(cat => (
                      <TabsContent key={cat} value={cat} className="mt-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {filteredProducts.map((product) => (
                            <Card 
                              key={product.id} 
                              className="card-glow hover:shadow-lg transition-all bg-card/60 backdrop-blur-sm border-primary/20 cursor-pointer group"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              <CardContent className="p-4">
                                <div className="relative mb-3 overflow-hidden rounded-lg">
                                  <img 
                                    src={product.image} 
                                    alt={product.title}
                                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5">
                                    <Heart className="w-4 h-4 text-muted-foreground hover:text-accent hover:fill-accent transition-colors" />
                                  </div>
                                </div>
                                <h3 className="font-semibold mb-1 text-sm truncate">{product.title}</h3>
                                <Badge variant="secondary" className="mb-2 text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  {product.eco_score}
                                </Badge>
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.short}</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-accent">
                                    {product.currency === 'INR' ? '₹' : 'AED'} {product.price.toFixed(2)}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product);
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
