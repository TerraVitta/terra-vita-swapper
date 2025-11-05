import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

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
    // Custom glass effect variants
    backdropBlur: {
      'glass': 'blur(12px)',
      'glass-sm': 'blur(8px)',
      'glass-lg': 'blur(16px)',
    },
    extend: {
      colors: {
        // Core brand colors
        verdigris: '#38A3A5',
        emerald: '#57CC99',
        'light-green': '#80ED99',
        
        // Glass effect colors
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.1)',
          border: {
            light: 'rgba(255, 255, 255, 0.2)',
            dark: 'rgba(0, 0, 0, 0.2)',
          }
        },
        
        // System colors with glass effects
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--verdigris)",
          hover: "var(--verdigris-hover)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "var(--emerald)",
          hover: "var(--emerald-hover)",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "var(--light-green)",
          hover: "var(--light-green-hover)",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "var(--glass-background)",
          foreground: "var(--glass-foreground)",
        },
        card: {
          DEFAULT: "var(--glass-background)",
          foreground: "var(--glass-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--glass-background)",
          foreground: "var(--glass-foreground)",
          primary: "var(--verdigris)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "var(--emerald)",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "var(--glass-border)",
          ring: "var(--glass-border)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '2lg': '1rem',
        '3lg': '1.5rem',
        '4lg': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
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
        "float": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        "glow": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        "shimmer": {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        "scale-in": {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        "blur-in": {
          '0%': { filter: 'blur(12px)', opacity: '0' },
          '100%': { filter: 'blur(0)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "scale-in": "scale-in 0.2s ease-out",
        "blur-in": "blur-in 0.3s ease-out",
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.15)',
        'glass-inner': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
        'glass-border': '0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [
    // @ts-ignore
    require("tailwindcss-animate"),
    plugin(({ addUtilities }) => {
      addUtilities({
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 4px 30px rgba(0, 0, 0, 0.1)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 4px 30px rgba(0, 0, 0, 0.2)',
        },
        '.glass-hover': {
          'transition': 'all 0.3s ease',
          '&:hover': {
            'background': 'rgba(255, 255, 255, 0.2)',
            'border': '1px solid rgba(255, 255, 255, 0.3)',
          },
        },
        '.glass-dark-hover': {
          'transition': 'all 0.3s ease',
          '&:hover': {
            'background': 'rgba(0, 0, 0, 0.2)',
            'border': '1px solid rgba(255, 255, 255, 0.2)',
          },
        },
        '.glass-border': {
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-glow': {
          'box-shadow': '0 0 20px rgba(56, 163, 165, 0.3)',
        },
      });
    }),
  ],
} satisfies Config;
