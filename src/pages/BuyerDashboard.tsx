import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Award, Recycle, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIChatButton } from "@/components/AIChatButton";
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
    <div className="min-h-screen text-foreground transition-theme relative overflow-hidden">
      {/* Nature Background */}
      <div className="nature-bg">
        <div className="nature-gradient" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b glass-panel transition-theme">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Terra-Vita</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass-panel rounded-full counter-glow">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{points} Points</span>
            </div>
            <ThemeToggle />
            <AIChatButton />
            <CartDrawer />
            <Button onClick={handleSignOut} variant="outline" size="sm" className="glass-button">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 smooth-scroll relative z-10">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="glass-panel rounded-3xl p-8 md:p-12 text-center refract-hover">
            <h2 className="text-4xl font-bold mb-4">Shop Sustainably</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover {products.length}+ eco-friendly products
            </p>
            <Button onClick={scrollToCatalog} size="lg" className="btn-glow bio-glow gap-2">
              <ShoppingBag className="h-5 w-5" />
              View Catalog
            </Button>
          </div>
        </section>

        {/* Points Card - Mobile */}
        <div className="sm:hidden mb-8">
          <div className="glass-panel rounded-2xl p-6 flex items-center justify-between counter-glow">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Your EcoPoints</p>
                <p className="text-2xl font-bold">{points}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Catalog */}
        <section ref={catalogRef} id="catalog">
          <div className="glass-panel rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Recycle className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-bold">Product Catalog</h3>
            </div>
            <p className="text-muted-foreground mb-6">Browse by category</p>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-2 glass-panel">
                {categories.map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="capitalize glass-button data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
                        <div 
                          key={product.id} 
                          className="glass-panel rounded-2xl overflow-hidden refract-hover cursor-pointer group"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full glass-panel text-xs">
                                <Award className="w-3 h-3 text-primary" />
                                {product.sustainability_score}
                              </div>
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
                                className="btn-glow"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t mt-16 relative z-10">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                © 2025 Terra-Vita Swapper. Swap Sustainably.
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{products.length}+ Products</span>
              <span>•</span>
              <span>Global Community</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BuyerDashboard;
