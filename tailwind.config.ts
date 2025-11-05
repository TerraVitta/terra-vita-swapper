import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx,css}",
    "./index.html"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, var(--verdigris), var(--emerald))',
        'gradient-secondary': 'linear-gradient(135deg, var(--emerald), var(--lightgreen))',
        'gradient-accent': 'linear-gradient(135deg, var(--lightgreen), var(--verdigris))',
      },
      colors: {
        verdigris: "hsl(var(--verdigris))",
        emerald: "hsl(var(--emerald))",
        lightgreen: "hsl(var(--lightgreen))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: {
          DEFAULT: "hsl(var(--verdigris))",
          glass: "var(--primary-glass)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--emerald))",
          glass: "var(--secondary-glass)",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--lightgreen))",
          glass: "var(--accent-glass)",
          foreground: "hsl(var(--accent-foreground))",
        },
        glass: {
          DEFAULT: "var(--glass-bg)",
          border: "var(--glass-border)",
          shadow: "var(--glass-shadow)",
          inner: "var(--glass-inner)",
          backdrop: "var(--glass-backdrop)"
        }
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
        "glass-sm": "0 2px 15px rgba(0, 0, 0, 0.08)",
        "glass-lg": "0 8px 40px rgba(0, 0, 0, 0.12)",
        "glass-inner": "var(--glass-inner)",
      },
      backdropBlur: {
        glass: "[var(--glass-backdrop)]"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        }
      },
    animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-down": "fade-down 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
      }
    }
  },
  plugins: [animate]
};
  },
  plugins: [animate]
    }
  },
  plugins: [animate]
};

export default config;
