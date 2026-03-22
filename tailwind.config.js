/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // RPG Dark Theme palette
        'rpg-bg':       '#1A202C', // page background – very dark slate
        'rpg-card':     '#2D3748', // cards / panels
        'rpg-border':   '#4A5568', // borders
        'rpg-gold':     '#D69E2E', // accent / primary buttons / stats
        'rpg-gold-light': '#ECC94B',
        'rpg-success':  '#48BB78', // success / victory
        'rpg-danger':   '#F56565', // error / defeat
        'rpg-text':     '#E2E8F0', // body text – off-white/cream
        'rpg-muted':    '#A0AEC0', // secondary text
      },
      fontFamily: {
        rpg: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 0 2px #D69E2E',
        'gold-lg': '0 0 16px 2px #D69E2E66',
      },
    },
  },
  plugins: [],
};
