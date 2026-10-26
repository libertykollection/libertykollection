/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        /* Body — DM Sans (Liberty body & buttons font) */
        sans:    ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        /* Headings & Titles — Figtree (Liberty signature heading font) */
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        serif:   ['var(--font-display)', 'Georgia', 'serif'],
        /* UI labels / nav / buttons — Figtree */
        ui:      ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        /* Legacy compat */
        poppins: ['var(--font-display)', 'sans-serif'],
      },
      colors: {
        theme: {
          primary: 'var(--theme-primary)',
          'primary-hover': 'var(--theme-primary-hover)',
          'primary-dark': 'var(--theme-primary-dark)',
          'primary-contrast': 'var(--theme-primary-contrast)',
          secondary: 'var(--theme-secondary)',
          'secondary-hover': 'var(--theme-secondary-hover)',
          dark: 'var(--theme-dark)',
          'dark-surface': 'var(--theme-dark-surface)',
          'dark-border': 'var(--theme-dark-border)',
          light: 'var(--theme-light)',
          'light-hover': 'var(--theme-light-hover)',
          surface: 'var(--theme-surface)',
          muted: 'var(--theme-muted)',
          border: 'var(--theme-border)',
          'border-subtle': 'var(--theme-border-subtle)',
          sale: 'var(--theme-sale)',
          success: 'var(--theme-success)',
        },
        brand: {
          DEFAULT: 'var(--theme-primary)',
          primary: 'var(--theme-primary)',
          hover: 'var(--theme-primary-hover)',
          dark: 'var(--theme-dark)',
          darker: 'var(--theme-dark-surface)',
          light: 'var(--theme-light)',
          'light-hover': 'var(--theme-light-hover)',
          border: 'var(--theme-border)',
          surface: 'var(--theme-surface)',
          accent: 'var(--theme-primary)',
          'accent-glow': 'var(--brand-accent-glow)',
          gold: 'var(--theme-secondary)',
          'gold-light': 'var(--theme-light)',
          orange: 'var(--theme-secondary)',
        },
      },
    },
  },
  plugins: [],
};
