import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Leaf, ShoppingBag, TrendingUp } from "lucide-react";
import FluidRibbons from "@/components/FluidRibbons";
import { GlassCard, GlassButton, GlassInput } from "@/components/ui/glass";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buyer?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/buyer");
    }
  };

  const categories = [
    { name: "Fashion", icon: "👗", color: "from-pink-500/10 to-rose-500/10" },
    { name: "Home", icon: "🏡", color: "from-blue-500/10 to-cyan-500/10" },
    { name: "Beauty", icon: "💄", color: "from-purple-500/10 to-pink-500/10" },
    { name: "Food", icon: "🍎", color: "from-green-500/10 to-emerald-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-theme relative overflow-hidden">
      <FluidRibbons />

      {/* Hero Section */}
      <main className="relative z-10">
        {/* Header */}
        <header className="container py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Ecomart
            </span>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton variant="secondary" onClick={() => navigate("/auth")}>
              Sign In
            </GlassButton>
            <GlassButton variant="primary" className="hover:scale-105" onClick={() => navigate("/auth")}>
              Get Started
            </GlassButton>
          </div>
        </header>

        {/* Hero Content */}
        <section className="container py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Shop Sustainably, Live Better</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Discover Eco-Friendly
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Products You'll Love
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your marketplace for sustainable living. Browse thousands of eco-conscious products from verified sellers.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <GlassInput
                  type="text"
                  placeholder="Search for eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg focus:scale-[1.02] transition-transform"
                />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <GlassButton 
                variant="primary"
                size="lg" 
                className="hover:scale-105 transition-transform"
                onClick={() => navigate("/buyer")}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Products
              </GlassButton>
              <GlassButton 
                variant="secondary"
                size="lg"
                className="hover:scale-105 transition-transform"
                onClick={() => navigate("/auth")}
              >
                Start Selling
              </GlassButton>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="container pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Explore by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <GlassCard
                  key={category.name}
                  withHover
                  className={`cursor-pointer bg-gradient-to-br ${category.color}`}
                  onClick={() => navigate("/buyer")}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 text-center">
                    <div className="text-5xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container pb-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <GlassCard withHover className="animate-fade-in">
              <div className="p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-primary-glass flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">100% Eco-Friendly</h3>
                <p className="text-muted-foreground">
                  Every product is verified for sustainability and environmental impact.
                </p>
              </div>
            </GlassCard>

            <GlassCard withHover className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-secondary-glass flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-secondary">AI-Powered Search</h3>
                <p className="text-muted-foreground">
                  Get intelligent product recommendations based on your preferences.
                </p>
              </div>
            </GlassCard>

            <GlassCard withHover className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-accent-glass flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-accent animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-accent">Earn EcoPoints</h3>
                <p className="text-muted-foreground">
                  Get rewarded for every sustainable purchase you make.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10">
        <GlassCard className="rounded-none border-t-[1px] border-x-0 border-b-0">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  © 2025 Ecomart. Shop Sustainably.
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-primary">Made for India & UAE</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-secondary">1000+ Products</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </footer>
    </div>
  );
};

export default Landing;
