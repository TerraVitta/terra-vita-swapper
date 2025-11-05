import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      colors: {
        verdigris: "#38A3A5",
        emerald: "#57CC99",
        lightgreen: "#80ED99",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--verdigris)",
          light: "color-mix(in srgb, var(--verdigris) 80%, transparent)",
          glass: "color-mix(in srgb, var(--verdigris) 40%, transparent)",
        },
        secondary: {
          DEFAULT: "var(--emerald)",
          light: "color-mix(in srgb, var(--emerald) 80%, transparent)",
          glass: "color-mix(in srgb, var(--emerald) 40%, transparent)",
        },
        accent: {
          DEFAULT: "var(--lightgreen)",
          light: "color-mix(in srgb, var(--lightgreen) 80%, transparent)",
          glass: "color-mix(in srgb, var(--lightgreen) 40%, transparent)",
        },
        glass: {
          border: "rgba(255, 255, 255, 0.08)",
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          hover: "rgba(255, 255, 255, 0.15)",
          active: "rgba(255, 255, 255, 0.2)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xl: "24px",
        "2xl": "32px",
        full: "9999px",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
        "glass-lg": "0 8px 40px rgba(0, 0, 0, 0.15)",
        "glass-inner": "inset 0 2px 4px rgba(255, 255, 255, 0.05)",
        "glass-border": "inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
            backdropFilter: "blur(0px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
            backdropFilter: "blur(8px)",
          }
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95) translateY(10px)",
            opacity: "0",
            backdropFilter: "blur(0px)"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
            backdropFilter: "blur(8px)"
          }
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)"
          },
          "50%": {
            transform: "translateY(-10px)"
          }
        },
        "blur-in": {
          "0%": {
            backdropFilter: "blur(0px)"
          },
          "100%": {
            backdropFilter: "blur(8px)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "accordion-up": "accordion-up 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "float": "float 6s ease-in-out infinite",
        "blur-in": "blur-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
