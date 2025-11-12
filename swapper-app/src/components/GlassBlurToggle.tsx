import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplet, Sparkles } from "lucide-react";

const GlassBlurToggle = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);

  useEffect(() => {
    // Apply blur state to CSS variables with smooth transition
    const root = document.documentElement;
    root.style.setProperty('--blur-enabled', blurEnabled ? '1' : '0');
    
    // Add transition class to all glass elements
    const glassElements = document.querySelectorAll('.glass-panel, .glass-light, .glass-heavy, .glass-button');
    glassElements.forEach(el => {
      el.classList.add('transition-glass');
      setTimeout(() => el.classList.remove('transition-glass'), 500);
    });
  }, [blurEnabled]);

  const toggleBlur = () => {
    setBlurEnabled(prev => !prev);
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
      <Button
        onClick={toggleBlur}
        className="glass-panel liquid-shimmer crystal-edge rounded-2xl px-5 py-3 h-auto border-0 hover:scale-105 transition-all duration-500 group relative overflow-hidden shadow-xl"
        title={blurEnabled ? "Switch to Crystal Clear Mode (Disable Blur)" : "Switch to Frosted Glass Mode (Enable Blur)"}
      >
        {/* Inner radial glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Specular highlight */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
        
        <div className="relative flex items-center gap-2.5 z-10">
          {blurEnabled ? (
            <>
              <Droplet className="h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <span className="font-semibold text-sm tracking-wide">Frosted</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <span className="font-semibold text-sm tracking-wide">Crystal</span>
            </>
          )}
        </div>

        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping" />
        </div>
        
        {/* Animated border shimmer */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />
      </Button>
      
      {/* Status indicator tooltip */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="glass-light rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap">
          {blurEnabled ? "Frosted Glass Mode" : "Crystal Clear Mode"}
        </div>
      </div>
    </div>
  );
};

export default GlassBlurToggle;
