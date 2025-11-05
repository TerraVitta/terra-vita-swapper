/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verdigris: "hsl(181 38% 43%)",
        emerald: "hsl(157 54% 57%)",
        lightgreen: "hsl(140 80% 71%)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--verdigris))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--emerald))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--lightgreen))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
}