// Tailwind v4 via its PostCSS plugin (the Next.js equivalent of the
// @tailwindcss/vite plugin the old Vite build used). Tokens + directives
// still live in the single source of truth: src/index.css (bridged by
// app/globals.css).
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
