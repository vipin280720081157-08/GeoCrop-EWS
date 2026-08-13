/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",
        primaryLight: "#E6F0E7",
        secondary: "#1565C0",
        secondaryLight: "#E5EEFA",
        accent: "#F9A825",
        accentLight: "#FDF3DE",
        success: "#43A047",
        successLight: "#E8F5E9",
        warning: "#FB8C00",
        warningLight: "#FFF3E0",
        error: "#D32F2F",
        errorLight: "#FDECEA",
        bg: "#F5F7FA",
        darkBg: "#12181B",
        card: "#FFFFFF",
        darkCard: "#1E272C",
        sidebar: "#263238",
        sidebarHover: "#37474F",
        borderC: "#E0E0E0",
        darkBorderC: "#37474F",
        textPrimary: "#263238",
        darkTextPrimary: "#ECEFF1",
        textSecondary: "#607D8B",
        darkTextSecondary: "#90A4AE",
        textDisabled: "#9E9E9E",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "Source Sans Pro", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0px 2px 6px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
