import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
