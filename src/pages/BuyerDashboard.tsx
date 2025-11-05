import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Award, Leaf, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartDrawer } from "@/components/CartDrawer";
import FluidRibbons from "@/components/FluidRibbons";
import { useCart } from "@/hooks/useCart";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(50);
  const { addItem } = useCart();
  const catalogRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  const handleAddToCart = (product: any) => {
    addItem(product);
    setPoints(points + 10);
    toast.success(`${product.name} added! +10 EcoPoints earned 🎉`);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const allTags = products.flatMap(p => p.tags || []);
  const categories = ["all", ...Array.from(new Set(allTags))];
  const filteredProducts = activeTab === "all" 
    ? products 
    : products.filter(p => p.tags?.includes(activeTab));

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="app-background" />
      <FluidRibbons />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="glass sticky top-0 z-50 border-b border-glass-border backdrop-blur-lg">
          <div className="container flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl p-2">
                <Leaf className="h-6 w-6 text-verdigris" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-verdigris via-emerald to-light-green bg-clip-text text-transparent">
                EcoMart
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Card className="glass flex items-center gap-2 px-4 py-2">
                <Award className="h-5 w-5 text-emerald" />
                <span className="font-medium">{points} points</span>
              </Card>
              
              <div className="flex items-center gap-2">
                <CartDrawer />
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut}
                  className="glass-hover rounded-full"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>        {/* Main Content */}
        <main className="container py-12 smooth-scroll">
          {/* Hero Section */}
          <section className="relative mb-16 text-center">
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-verdigris via-emerald to-light-green bg-clip-text text-transparent">
                Shop Sustainably
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Discover {products.length}+ eco-friendly products from India & UAE
              </p>
              <Button 
                onClick={scrollToCatalog} 
                size="lg" 
                className="glass-glow-hover"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                View Catalog
              </Button>
            </div>
          </section>

          {/* Points Card - Mobile */}
          <Card className="sm:hidden mb-8 glass">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-emerald" />
                <div>
                  <p className="text-sm text-muted-foreground">Your EcoPoints</p>
                  <p className="text-2xl font-bold">{points}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Catalog */}
          <section ref={catalogRef} id="catalog">
            <div className="glass rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-glass-border">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald" />
                  <h2 className="text-xl font-semibold">Product Catalog</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Browse by category</p>
              </div>
              
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="glass rounded-2xl p-2 mb-8 inline-flex">
                    <TabsList className="bg-transparent">
                      {categories.map(cat => (
                        <TabsTrigger 
                          key={cat} 
                          value={cat}
                          className="data-[state=active]:glass-glow data-[state=active]:text-verdigris capitalize"
                        >
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  
                  {categories.map(cat => (
                    <TabsContent key={cat} value={cat} className="mt-6">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                          Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="glass animate-pulse">
                              <div className="aspect-square bg-muted/10" />
                              <CardContent className="p-6">
                                <div className="h-4 w-3/4 bg-muted/10 rounded mb-4" />
                                <div className="h-4 w-1/2 bg-muted/10 rounded" />
                              </CardContent>
                            </Card>
                          ))
                        ) : filteredProducts.length === 0 ? (
                          <div className="col-span-full text-center py-12 text-muted-foreground">
                            No products found in this category
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <Card 
                              key={product.id} 
                              className="glass group cursor-pointer overflow-hidden hover:glass-glow transition-all duration-300"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              <div className="aspect-square overflow-hidden">
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                  {product.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-4">
                                  <Badge variant="secondary" className="glass text-xs">
                                    <Award className="w-3 h-3 mr-1" />
                                    {product.sustainability_score}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {product.tags?.[0] || 'Product'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xl bg-gradient-to-r from-verdigris to-emerald bg-clip-text text-transparent">
                                    {product.currency === 'INR' ? '₹' : 'د.إ'} {product.price.toFixed(2)}
                                  </span>
                                  <Button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product);
                                    }}
                                    className="glass-glow-hover"
                                    size="sm"
                                  >
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Add
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="glass border-t border-glass-border mt-16">
          <div className="container py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald" />
                <span className="text-sm text-muted-foreground">
                  © 2025 Ecomart. Shop Sustainably.
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Made for India & UAE</span>
                <span>•</span>
                <span>{products.length}+ Products</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BuyerDashboard;
