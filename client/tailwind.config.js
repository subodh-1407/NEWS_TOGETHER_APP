/** @type {import('tailwindcss').Config} */
const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const accent = Object.fromEntries(shades.map(shade => [shade, 'var(--nt-accent)']));
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        black: '#111827',
        white: '#f9fafb',
        blue: { 50:'#fffbeb',100:'#fef3c7',200:'#f59e0b',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#334155',900:'#1e293b',950:'#1f2937' },
        gray: { 100:'var(--nt-gray-100, #f3f4f6)',200:'var(--nt-gray-200, #e5e7eb)',300:'var(--nt-gray-300, #d1d5db)',400:'var(--nt-gray-400, #9ca3af)',500:'var(--nt-gray-500, #6b7280)',600:'var(--nt-gray-600, #4b5563)',700:'var(--nt-gray-700, #374151)',800:'var(--nt-gray-800, #273449)',900:'var(--nt-gray-900, #1f2937)' },
      },
      textColor: { black: 'var(--nt-black-text, #111827)', white: 'var(--nt-white-text, #f9fafb)', blue: accent },
      borderColor: { white: 'var(--nt-border)', black: 'var(--nt-border)', blue: accent },
      ringColor: { blue: accent },
      backgroundColor: { black:'var(--nt-black-bg, #111827)', white:'var(--nt-white-bg, #f9fafb)', gray:{700:'var(--nt-bg-gray-700, #374151)',800:'var(--nt-bg-gray-800, #273449)'}, blue: { ...Object.fromEntries(shades.map(shade => [shade, 'var(--nt-accent-fill)'])),800:'var(--nt-bg-blue-800, #334155)',900:'var(--nt-bg-blue-900, #1e293b)',950:'var(--nt-bg-blue-950, #1f2937)' } },
      boxShadowColor: { blue: accent },
    },
  },
  plugins: [],
};
