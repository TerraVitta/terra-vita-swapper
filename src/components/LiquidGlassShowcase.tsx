import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Droplet, Gem } from "lucide-react";

/**
 * Showcase component demonstrating various liquid glass effects
 * Can be used to preview different glass styles and animations
 */
const LiquidGlassShowcase = () => {
  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Hero Section with Main Glass Panel */}
      <div className="glass-panel liquid-shimmer glass-breathe rounded-3xl p-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light">
          <Gem className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Liquid Crystal Glass</span>
        </div>
        <h1 className="text-5xl font-bold">
          Ultra-Realistic Glass Effects
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience the most advanced liquid glass aesthetic with chromatic aberration,
          internal luminescence, and physically-based rendering.
        </p>
      </div>

      {/* Glass Variants Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Light Glass */}
        <Card className="glass-light liquid-shimmer rounded-2xl p-6 space-y-4">
          <Droplet className="h-8 w-8 text-primary" />
          <h3 className="text-xl font-bold">Light Glass</h3>
          <p className="text-muted-foreground">
            Ultra-transparent with minimal blur, perfect for subtle overlays
          </p>
          <Button className="glass-button w-full">
            Explore
          </Button>
        </Card>

        {/* Standard Glass */}
        <Card className="glass-panel liquid-shimmer crystal-edge rounded-2xl p-6 space-y-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h3 className="text-xl font-bold">Standard Glass</h3>
          <p className="text-muted-foreground">
            Balanced translucency with chromatic aberration edges
          </p>
          <Button className="glass-button w-full">
            Explore
          </Button>
        </Card>

        {/* Heavy Glass */}
        <Card className="glass-heavy liquid-shimmer glass-refraction rounded-2xl p-6 space-y-4">
          <Gem className="h-8 w-8 text-primary" />
          <h3 className="text-xl font-bold">Heavy Glass</h3>
          <p className="text-muted-foreground">
            Maximum depth with strong blur and internal refraction
          </p>
          <Button className="glass-button w-full">
            Explore
          </Button>
        </Card>
      </div>

      {/* Animated Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-panel liquid-shimmer liquid-flow rounded-2xl p-8 space-y-4">
          <h3 className="text-2xl font-bold">Liquid Flow Animation</h3>
          <p className="text-muted-foreground">
            Watch as light moves through the glass like flowing water
          </p>
        </div>

        <div className="glass-panel liquid-shimmer glass-breathe rounded-2xl p-8 space-y-4">
          <h3 className="text-2xl font-bold">Breathing Effect</h3>
          <p className="text-muted-foreground">
            Subtle pulsing animation that brings the glass to life
          </p>
        </div>
      </div>

      {/* Interactive Button Showcase */}
      <div className="glass-panel rounded-2xl p-8 space-y-6">
        <h3 className="text-2xl font-bold text-center">Interactive Glass Buttons</h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button className="glass-button">
            <Sparkles className="mr-2 h-4 w-4" />
            Standard
          </Button>
          <Button className="glass-button btn-glow">
            <Droplet className="mr-2 h-4 w-4" />
            With Glow
          </Button>
          <Button className="glass-button liquid-shimmer">
            <Gem className="mr-2 h-4 w-4" />
            Shimmer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiquidGlassShowcase;
