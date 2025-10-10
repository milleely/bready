import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        'golden-crust': {
          primary: '#e3c462',
          light: '#fdf885',
          medium: '#e7d791',
          dark: '#604b21',
        },
      },
      backgroundImage: {
        'golden-gradient': 'linear-gradient(135deg, #e3c462, #fdf885)',
        'golden-gradient-dark': 'linear-gradient(135deg, #e3c462, #604b21)',
        'golden-gradient-medium': 'linear-gradient(135deg, #e7d791, #e3c462)',
      },
    },
  },
};

export default config;
