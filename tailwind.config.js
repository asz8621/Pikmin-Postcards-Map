/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      xs: '480px',
      sm: '576px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      backgroundImage: {
        login: "url('@/assets/images/login_bg.png')",
      },
    },
  },
  plugins: [],
}
