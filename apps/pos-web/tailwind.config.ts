import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#152033',
        clay: '#f0dfcf',
        coral: '#ff7a59',
        sand: '#f7f1e7'
      },
      boxShadow: {
        panel: '0 24px 80px rgba(21, 32, 51, 0.18)'
      },
      backgroundImage: {
        aura: 'radial-gradient(circle at top left, rgba(255, 122, 89, 0.28), transparent 34%), radial-gradient(circle at 85% 15%, rgba(21, 32, 51, 0.18), transparent 24%), linear-gradient(135deg, #f7f1e7 0%, #efe1d4 100%)'
      }
    }
  },
  plugins: []
};

export default config;
