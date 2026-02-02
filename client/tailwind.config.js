/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode if needed, but we use variables
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Space Grotesk"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                background: 'var(--color-background)',
                surface: 'var(--color-surface)',
                surfaceHighlight: 'var(--color-surface-highlight)',
                border: 'var(--color-border)',
                primary: 'var(--color-primary)',
                primaryHighlight: 'var(--color-primary-highlight)',
                secondary: 'var(--color-secondary)',
                text: {
                    DEFAULT: 'var(--color-text)',
                    muted: 'var(--color-text-muted)',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.6s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
