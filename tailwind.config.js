/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./api/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./lib/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                love: '#FF6B6B',
                good: '#4ECDC4',
                world: '#45B7D1',
                paid: '#F7B731',
            }
        },
    },
    plugins: [],
}
