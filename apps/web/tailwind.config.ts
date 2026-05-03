import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette — from Roman Shades + Athens references
        nox:      '#07050F',  // page background
        deep:     '#0E0A1A',  // card background
        stone:    '#2A1E14',  // border, dividers
        sand:     '#D9A78B',  // primary accent
        parch:    '#F2E0D5',  // primary text
        willa:    '#B8A070',  // secondary accent
        hadria:   '#8B3A3A',  // danger / berserker
        bellona:  '#722020',  // deep red
        olivine:  '#9AAA60',  // success / bred
        questa:   '#7A6070',  // muted purple
        minerva:  '#7A8A9A',  // oracle blue-grey
        sky:      '#85D3F2',  // sky / oracle
        sky2:     '#5FB6D9',  // deeper sky
        gold:     '#C9A84C',  // divine gold
        'gold-b': '#F0C040',  // bright gold
        marble:   '#EDE8DC',  // light marble
      },
      fontFamily: {
        cinzel:       ['"Cinzel"', 'serif'],
        'cinzel-dec': ['"Cinzel Decorative"', 'serif'],
        fell:         ['"IM Fell English"', 'serif'],
        josefin:      ['"Josefin Sans"', 'sans-serif'],
      },
      animation: {
        'flame':      'flame 1.1s ease-in-out infinite',
        'drift':      'drift 5s ease-in-out infinite',
        'marquee':    'marquee 24s linear infinite',
        'twinkle':    'twinkle 2.2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'fade-in':    'fadeIn 0.6s ease-out forwards',
        'slide-up':   'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        flame: {
          '0%,100%': { transform: 'scaleY(1) scaleX(1)' },
          '33%':     { transform: 'scaleY(1.16) scaleX(.88)' },
          '66%':     { transform: 'scaleY(.93) scaleX(1.07)' },
        },
        drift: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.15' },
          '50%':     { opacity: '0.85' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@tailwindcss/typography')],
}

export default config
