// client/tailwind.config.js
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'gnome': {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
            },
                       animation: {
                'tap': 'tap 0.3s cubic-bezier(0.4, 0, 0.6, 1)',
                'float': 'float 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'bounce-in': 'bounce-in 0.5s cubic-bezier(0.36, 0, 0.66, 1.54)',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'bounce-in': {
                    '0%': { transform: 'scale(0)' },
                    '80%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                },
            },
        },
    },

    plugins: [],
};