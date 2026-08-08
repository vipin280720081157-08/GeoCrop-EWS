/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        primaryLight: "var(--color-primary-light)",
        secondary: "var(--color-secondary)",
        secondaryLight: "var(--color-secondary-light)",
        accent: "var(--color-accent)",
        accentLight: "var(--color-accent-light)",
        success: "var(--color-success)",
        successLight: "var(--color-success-light)",
        warning: "var(--color-warning)",
        warningLight: "var(--color-warning-light)",
        error: "var(--color-error)",
        errorLight: "var(--color-error-light)",
        bg: "var(--color-bg)",
        card: "var(--color-card)",
        sidebar: "var(--color-sidebar)",
        sidebarHover: "var(--color-sidebar-hover)",
        borderC: "var(--color-border)",
        textPrimary: "var(--color-text-primary)",
        textSecondary: "var(--color-text-secondary)",
        textDisabled: "var(--color-text-disabled)",
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
