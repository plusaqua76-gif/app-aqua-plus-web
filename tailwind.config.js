/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  safelist: [
    // Colores para las cards de parámetros
    'bg-sky-700',
    'bg-sky-600',
    'bg-sky-500',
    'bg-sky-400',
    'shadow-sky-500',
    'border-sky-600/50',
    'text-sky-400',
    'hover:bg-sky-600/10',
    'focus:ring-sky-500',
    'after:bg-sky-700',
    'before:bg-sky-400',

    'bg-emerald-700',
    'bg-emerald-600',
    'bg-emerald-500',
    'bg-emerald-400',
    'shadow-emerald-500',
    'border-emerald-600/50',
    'text-emerald-400',
    'hover:bg-emerald-600/10',
    'focus:ring-emerald-500',
    'after:bg-emerald-700',
    'before:bg-emerald-400',

    'bg-purple-700',
    'bg-purple-600',
    'bg-purple-500',
    'bg-purple-400',
    'shadow-purple-500',
    'border-purple-600/50',
    'text-purple-400',
    'hover:bg-purple-600/10',
    'focus:ring-purple-500',
    'after:bg-purple-700',
    'before:bg-purple-400',
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('flowbite/plugin')
  ]
}
