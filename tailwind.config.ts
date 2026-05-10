import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        shell: "1280px"
      },
      spacing: {
        section: "24px"
      },
      boxShadow: {
        "glow-mint": "0 0 28px -6px rgba(45, 212, 191, 0.45), 0 0 12px -4px rgba(52, 211, 153, 0.25)",
        "glow-blue": "0 0 28px -6px rgba(56, 189, 248, 0.4), 0 0 12px -4px rgba(59, 130, 246, 0.22)",
        "nav-active":
          "0 0 24px -4px rgba(45, 212, 191, 0.5), inset 0 0 0 1px rgba(45, 212, 191, 0.35)"
      },
      colors: {
        oneai: {
          navy: "#0B1020",
          blue: "#1D4ED8",
          silver: "#C0CAD8",
          surface: "#11182D"
        }
      }
    }
  },
  plugins: []
};

export default config;
