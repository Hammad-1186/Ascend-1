import type { Config } from 'tailwindcss';

// Every colour comes from a CSS variable in src/styles/theme.css,
// so the whole app can be re-themed (or a light theme added) in one place.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        app: token('bg'),
        surface: token('surface'),
        line: token('border'),
        field: token('field'),
        'field-line': token('field-border'),
        muted: token('muted'),
        danger: token('danger'),
        info: token('info'),
        sidebar: { from: token('sidebar-from'), to: token('sidebar-to') },
        primary: { DEFAULT: token('primary'), 2: token('primary-2'), soft: token('primary-soft') },
      },
    },
  },
  plugins: [],
};

export default config;
