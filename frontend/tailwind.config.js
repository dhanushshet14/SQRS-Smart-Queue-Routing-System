/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm gradient colors
        'warm-orange': '#ff7849',
        'warm-pink': '#ff6b9d',
        'warm-purple': '#c44569',
        'warm-blue': '#546de5',
        'warm-teal': '#3dc1d3',
        'warm-green': '#00d2d3',
        
        // Routing Score Colors with warm tones
        'rs-high': '#00d2d3', // Warm teal for RS >= 0.8
        'rs-medium': '#ff7849', // Warm orange for RS 0.6-0.79
        'rs-low': '#ff6b9d', // Warm pink for RS < 0.6
        
        // Status Colors with warm palette
        'status-available': '#00d2d3',
        'status-busy': '#ff7849',
        'status-offline': '#778ca3',
        
        // Sentiment Colors
        'sentiment-positive': '#00d2d3',
        'sentiment-neutral': '#778ca3',
        'sentiment-negative': '#ff6b9d',
        
        // Tier Colors
        'tier-premium': '#c44569',
        'tier-standard': '#546de5',
        'tier-basic': '#778ca3'
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #ff7849 0%, #ff6b9d 25%, #c44569 50%, #546de5 75%, #3dc1d3 100%)',
        'warm-gradient-soft': 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 25%, #fd79a8 50%, #6c5ce7 75%, #74b9ff 100%)',
        'hero-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 120, 73, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 120, 73, 0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}