import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Award, Leaf, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ChatbotDialog } from "@/components/ChatbotDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CartDrawer } from "@/components/CartDrawer";
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
    addItem({
      id: product.id,
      title: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image_url,
    });
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
            Discover {products.length}+ eco-friendly products from India & UAE
          </p>
          <Button onClick={scrollToCatalog} size="lg" className="gap-2">
            <ShoppingBag className="h-5 w-5" />
            View Catalog
          </Button>
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

        {/* Product Catalog */}
        <section ref={catalogRef} id="catalog">
          <Card className="transition-theme">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                <CardTitle>Product Catalog</CardTitle>
              </div>
              <CardDescription>Browse by category</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-muted/50">
                  {categories.map(cat => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat}
                      className="capitalize"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map(cat => (
                  <TabsContent key={cat} value={cat} className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {loading ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                          No products found in this category
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <Card 
                            key={product.id} 
                            className="card-hover cursor-pointer overflow-hidden transition-theme group"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            <div className="aspect-square overflow-hidden">
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  {product.sustainability_score}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {product.tags?.[0] || 'Product'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <span className="font-bold text-lg text-primary">
                                  {product.currency === 'INR' ? '₹' : 'د.إ'} {product.price.toFixed(2)}
                                </span>
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product);
                                  }}
                                  className="transition-all"
                                >
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
            </CardContent>
          </Card>
        </section>
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
              <span>{products.length}+ Products</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BuyerDashboard;
