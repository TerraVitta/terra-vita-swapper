import { Leaf, Award, Sparkles, ShoppingBag } from "lucide-react";

export const ProjectsSidebar = () => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
      <div className="p-6 border-b border-border/20">
        <h2 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          <Leaf className="w-5 h-5 text-accent" />
          Ecomart
        </h2>
        <p className="text-xs text-muted-foreground mt-2">Smart Sustainable Shopping</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            What We Offer
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              40+ Curated Eco Products
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              India & UAE Selections
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Verified Sustainability Scores
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Rewards on Every Purchase
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Shop Smart
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShoppingBag className="w-3 h-3 text-accent" />
              Browse by category
            </li>
            <li className="flex items-center gap-2">
              <ShoppingBag className="w-3 h-3 text-accent" />
              Compare sustainability
            </li>
            <li className="flex items-center gap-2">
              <ShoppingBag className="w-3 h-3 text-accent" />
              Earn EcoPoints
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};
