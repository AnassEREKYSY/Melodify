/** @type {import('tailwindcss').Config} */
// Colours are CSS variables from src/styles.scss (see DESIGN.md).
const v = n => `rgb(var(--${n}) / <alpha-value>)`;
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), raised: v('raised'), line: v('line'),
        ink: { DEFAULT: v('ink'), muted: v('ink-muted'), faint: v('ink-faint') },
        accent: { DEFAULT: v('accent'), hover: v('accent-hover'), ink: v('accent-ink') },
        danger: v('danger'),
      },
      fontFamily: { sans: ['"Inter Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      fontSize: { '2xs': ['11px', '16px'] },
      borderRadius: { card: '12px' },
      maxWidth: { page: '1280px' },
    },
  },
  plugins: [],
};
