import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassMorphismProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "active";
  blur?: "none" | "sm" | "md" | "lg";
}

const GlassMorphism = React.forwardRef<HTMLDivElement, GlassMorphismProps>(
  ({ className, variant = "default", blur = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-morphism",
          {
            "hover:bg-glass-hover active:bg-glass-active": variant === "hover",
            "bg-glass-active": variant === "active",
            "backdrop-blur-none": blur === "none",
            "backdrop-blur-sm": blur === "sm",
            "backdrop-blur-md": blur === "md",
            "backdrop-blur-lg": blur === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
GlassMorphism.displayName = "GlassMorphism";

interface GlassCardProps extends GlassMorphismProps {
  withHover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, withHover, ...props }, ref) => {
    return (
      <GlassMorphism
        ref={ref}
        className={cn(
          "rounded-xl p-6",
          {
            "transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg": withHover,
          },
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "glass-morphism inline-flex items-center justify-center rounded-full font-medium transition-all duration-300",
          {
            "bg-primary-glass text-primary hover:bg-primary/20": variant === "primary",
            "bg-secondary-glass text-secondary hover:bg-secondary/20": variant === "secondary",
            "bg-accent-glass text-accent hover:bg-accent/20": variant === "accent",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2": size === "md",
            "px-6 py-3 text-lg": size === "lg",
            "cursor-not-allowed opacity-50": isLoading,
          },
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "glass-morphism w-full rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground",
          "focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
          {
            "border-destructive focus:ring-destructive": error,
          },
          className
        )}
        {...props}
      />
    );
  }
);
GlassInput.displayName = "GlassInput";

// Floating AI Chat Container component
interface FloatingAIChatProps extends GlassMorphismProps {
  expanded?: boolean;
  onToggle?: () => void;
}

const FloatingAIChat = React.forwardRef<HTMLDivElement, FloatingAIChatProps>(
  ({ className, expanded, onToggle, children, ...props }, ref) => {
    return (
      <GlassMorphism
        ref={ref}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 cursor-pointer transition-all duration-500",
          {
            "rounded-full w-auto h-auto": !expanded,
            "rounded-xl w-[90vw] h-[80vh] max-w-[400px] max-h-[600px]": expanded,
          },
          "hover:shadow-glass-lg focus:ring-2 focus:ring-primary/50",
          "md:bottom-8 md:right-8",
          "animate-float hover:animate-none",
          className
        )}
        onClick={onToggle}
        {...props}
      >
        {children}
      </GlassMorphism>
    );
  }
);
FloatingAIChat.displayName = "FloatingAIChat";

export { 
  GlassMorphism,
  GlassCard,
  GlassButton,
  GlassInput,
  FloatingAIChat,
  type GlassMorphismProps,
  type GlassCardProps,
  type GlassButtonProps,
  type GlassInputProps,
  type FloatingAIChatProps
};