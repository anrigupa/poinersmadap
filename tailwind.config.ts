import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        icy: {
          50: "#F2F7FC",
          100: "#E6F0F9",
          200: "#CFE2F3",
          300: "#B8D0E8",
          500: "#2575FC",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(circle at 50% 55%, #F5FAFF 0%, #E6F0F9 45%, #B8D0E8 100%)",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotateY(0deg)" },
          "50%": { transform: "translateY(-12px) rotateY(4deg)" },
        },
      },
      animation: {
        "float-slow": "floatSlow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
