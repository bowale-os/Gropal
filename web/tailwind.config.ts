import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080808",
        "bg-card": "#0E0E0E",
        "bg-elevated": "#161616",
        "bg-hover": "#1C1C1C",
        border: "#242424",
        "border-warm": "#2E2A26",
        primary: "#FF6B2B",
        "primary-dim": "rgba(255,107,43,0.12)",
        "primary-glow": "rgba(255,107,43,0.3)",
        gold: "#FFD60A",
        "gold-dim": "rgba(255,214,10,0.12)",
        success: "#22FF88",
        "success-dim": "rgba(34,255,136,0.12)",
        warning: "#FFB800",
        "warning-dim": "rgba(255,184,0,0.12)",
        danger: "#FF3B3B",
        "danger-dim": "rgba(255,59,59,0.12)",
        ink: "#F5F0E8",
        "ink-muted": "#6B6560",
        "ink-dim": "#2E2B28",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "4px",
        btn: "3px",
        pill: "100px",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fade-in 0.3s ease forwards",
        "fox-float": "fox-float 4s ease-in-out infinite",
        "sonar-1": "sonar 2s ease-out infinite",
        "sonar-2": "sonar 2s ease-out 0.5s infinite",
        "sonar-3": "sonar 2s ease-out 1s infinite",
        "bounce-dot": "bounce-dot 1.4s ease-in-out infinite",
        "enter": "enter 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "mic-breathe": "mic-breathe 2.8s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 20px rgba(255,107,43,0.25)" },
          "50%": { boxShadow: "0 0 48px rgba(255,107,43,0.55)" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fox-float": {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        sonar: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "bounce-dot": {
          "0%,80%,100%": { transform: "scale(0)", opacity: "0.3" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        enter: {
          from: { transform: "translateY(14px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "mic-breathe": {
          "0%,100%": { boxShadow: "0 0 0 0px rgba(255,107,43,0.4),0 0 20px rgba(255,107,43,0.15)" },
          "50%": { boxShadow: "0 0 0 10px rgba(255,107,43,0.1),0 0 40px rgba(255,107,43,0.3)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
