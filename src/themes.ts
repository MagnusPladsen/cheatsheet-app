export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  accent: string;
  colors: Record<string, string>;
}

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function lighten(hex: string, amt: number): string {
  const c = (i: number) => Math.max(0, Math.min(255, parseInt(hex.slice(i, i + 2), 16) + amt));
  return '#' + [c(1), c(3), c(5)].map(v => v.toString(16).padStart(2, '0')).join('');
}

interface BaseColors {
  bg: string; bgSec: string; bgCard: string; bgCardHov: string;
  accent: string; text: string; textSec: string; textMut: string;
  border: string; borderHov: string; kbdBg: string;
}

function build(c: BaseColors): Record<string, string> {
  return {
    'bg-primary': c.bg,
    'bg-secondary': c.bgSec,
    'bg-card': c.bgCard,
    'bg-card-hover': c.bgCardHov,
    'accent': c.accent,
    'accent-light': lighten(c.accent, 50),
    'accent-dim': rgba(c.accent, 0.06),
    'accent-glow': rgba(c.accent, 0.1),
    'text-primary': c.text,
    'text-secondary': c.textSec,
    'text-muted': c.textMut,
    'border': c.border,
    'border-hover': c.borderHov,
    'badge-custom': c.accent,
    'badge-default': c.bgCardHov,
    'kbd-bg': c.kbdBg,
    'kbd-border': c.border,
    'warm': c.accent,
    'warm-dim': rgba(c.accent, 0.06),
  };
}

export const THEMES: Theme[] = [
  {
    id: 'hacker', name: 'hacker', isDark: true, accent: '#00ff88',
    colors: build({
      bg: '#0a0a0a', bgSec: '#121212', bgCard: '#141414', bgCardHov: '#1c1c1c',
      accent: '#00ff88', text: '#c8c8c8', textSec: '#888888', textMut: '#555555',
      border: '#222222', borderHov: '#333333', kbdBg: '#080808',
    }),
  },
  {
    id: 'tokyo-night', name: 'tokyo night', isDark: true, accent: '#7aa2f7',
    colors: build({
      bg: '#1a1b26', bgSec: '#24283b', bgCard: '#24283b', bgCardHov: '#414868',
      accent: '#7aa2f7', text: '#c0caf5', textSec: '#a9b1d6', textMut: '#565f89',
      border: '#3b4261', borderHov: '#4a5170', kbdBg: '#16161e',
    }),
  },
  {
    id: 'dracula', name: 'dracula', isDark: true, accent: '#bd93f9',
    colors: build({
      bg: '#282a36', bgSec: '#343746', bgCard: '#343746', bgCardHov: '#44475a',
      accent: '#bd93f9', text: '#f8f8f2', textSec: '#b0adc0', textMut: '#6272a4',
      border: '#6272a4', borderHov: '#7181b3', kbdBg: '#21222c',
    }),
  },
  {
    id: 'catppuccin-mocha', name: 'catppuccin mocha', isDark: true, accent: '#cba6f7',
    colors: build({
      bg: '#1e1e2e', bgSec: '#313244', bgCard: '#313244', bgCardHov: '#45475a',
      accent: '#cba6f7', text: '#cdd6f4', textSec: '#a6adc8', textMut: '#6c7086',
      border: '#585b70', borderHov: '#676a7f', kbdBg: '#181825',
    }),
  },
  {
    id: 'catppuccin-latte', name: 'catppuccin latte', isDark: false, accent: '#8839ef',
    colors: build({
      bg: '#eff1f5', bgSec: '#e6e9ef', bgCard: '#e6e9ef', bgCardHov: '#dce0e8',
      accent: '#8839ef', text: '#4c4f69', textSec: '#6c6f85', textMut: '#9ca0b0',
      border: '#ccd0da', borderHov: '#acb0be', kbdBg: '#dce0e8',
    }),
  },
  {
    id: 'nord', name: 'nord', isDark: true, accent: '#88c0d0',
    colors: build({
      bg: '#2e3440', bgSec: '#3b4252', bgCard: '#3b4252', bgCardHov: '#434c5e',
      accent: '#88c0d0', text: '#d8dee9', textSec: '#b0b8c8', textMut: '#4c566a',
      border: '#4c566a', borderHov: '#5b6579', kbdBg: '#272c36',
    }),
  },
  {
    id: 'one-dark', name: 'one dark', isDark: true, accent: '#61afef',
    colors: build({
      bg: '#282c34', bgSec: '#21252b', bgCard: '#2c313a', bgCardHov: '#3e4451',
      accent: '#61afef', text: '#abb2bf', textSec: '#9da5b4', textMut: '#5c6370',
      border: '#3b4048', borderHov: '#4a4f57', kbdBg: '#21252b',
    }),
  },
  {
    id: 'gruvbox-dark', name: 'gruvbox dark', isDark: true, accent: '#fabd2f',
    colors: build({
      bg: '#282828', bgSec: '#3c3836', bgCard: '#3c3836', bgCardHov: '#504945',
      accent: '#fabd2f', text: '#ebdbb2', textSec: '#a89984', textMut: '#928374',
      border: '#665c54', borderHov: '#756b63', kbdBg: '#1d2021',
    }),
  },
  {
    id: 'kanagawa', name: 'kanagawa', isDark: true, accent: '#7e9cd8',
    colors: build({
      bg: '#1f1f28', bgSec: '#2a2a37', bgCard: '#2a2a37', bgCardHov: '#363646',
      accent: '#7e9cd8', text: '#dcd7ba', textSec: '#c8c093', textMut: '#727169',
      border: '#54546d', borderHov: '#63637c', kbdBg: '#16161d',
    }),
  },
  {
    id: 'monokai-pro', name: 'monokai pro', isDark: true, accent: '#ffd866',
    colors: build({
      bg: '#222222', bgSec: '#2d2a2e', bgCard: '#2d2a2e', bgCardHov: '#403e41',
      accent: '#ffd866', text: '#f7f1ff', textSec: '#c1c0c0', textMut: '#727072',
      border: '#5b595c', borderHov: '#6a686b', kbdBg: '#19181a',
    }),
  },
  {
    id: 'rose-pine', name: 'rose pine', isDark: true, accent: '#c4a7e7',
    colors: build({
      bg: '#191724', bgSec: '#1f1d2e', bgCard: '#1f1d2e', bgCardHov: '#26233a',
      accent: '#c4a7e7', text: '#e0def4', textSec: '#908caa', textMut: '#6e6a86',
      border: '#403d52', borderHov: '#4f4c61', kbdBg: '#16141f',
    }),
  },
  {
    id: 'solarized-dark', name: 'solarized dark', isDark: true, accent: '#268bd2',
    colors: build({
      bg: '#002b36', bgSec: '#073642', bgCard: '#073642', bgCardHov: '#094856',
      accent: '#268bd2', text: '#839496', textSec: '#93a1a1', textMut: '#586e75',
      border: '#586e75', borderHov: '#677d84', kbdBg: '#00232c',
    }),
  },
];
