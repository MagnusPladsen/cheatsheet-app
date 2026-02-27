export interface Theme {
  id: string;
  name: string;
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

/** Mix accent into a neutral gray for subtle tinting */
function tint(gray: string, accent: string, amount: number): string {
  const gr = parseInt(gray.slice(1, 3), 16);
  const gg = parseInt(gray.slice(3, 5), 16);
  const gb = parseInt(gray.slice(5, 7), 16);
  const ar = parseInt(accent.slice(1, 3), 16);
  const ag = parseInt(accent.slice(3, 5), 16);
  const ab = parseInt(accent.slice(5, 7), 16);
  const mix = (g: number, a: number) => Math.round(g + (a - g) * amount);
  return '#' + [mix(gr, ar), mix(gg, ag), mix(gb, ab)]
    .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
    .join('');
}

function build(accent: string): Record<string, string> {
  return {
    'bg-primary': '#0a0a0a',
    'bg-secondary': '#121212',
    'bg-card': '#141414',
    'bg-card-hover': tint('#1c1c1c', accent, 0.04),
    'accent': accent,
    'accent-light': lighten(accent, 50),
    'accent-dim': rgba(accent, 0.06),
    'accent-glow': rgba(accent, 0.1),
    'text-primary': '#c8c8c8',
    'text-secondary': tint('#888888', accent, 0.08),
    'text-muted': tint('#555555', accent, 0.06),
    'border': tint('#222222', accent, 0.05),
    'border-hover': tint('#333333', accent, 0.08),
    'badge-custom': accent,
    'badge-default': '#1c1c1c',
    'kbd-bg': '#080808',
    'kbd-border': tint('#222222', accent, 0.05),
    'warm': accent,
    'warm-dim': rgba(accent, 0.06),
  };
}

export const THEMES: Theme[] = [
  { id: 'hacker', name: 'hacker', accent: '#00ff88', colors: build('#00ff88') },
  { id: 'tokyo-night', name: 'tokyo night', accent: '#7aa2f7', colors: build('#7aa2f7') },
  { id: 'dracula', name: 'dracula', accent: '#bd93f9', colors: build('#bd93f9') },
  { id: 'catppuccin', name: 'catppuccin', accent: '#cba6f7', colors: build('#cba6f7') },
  { id: 'nord', name: 'nord', accent: '#88c0d0', colors: build('#88c0d0') },
  { id: 'one-dark', name: 'one dark', accent: '#61afef', colors: build('#61afef') },
  { id: 'gruvbox', name: 'gruvbox', accent: '#fabd2f', colors: build('#fabd2f') },
  { id: 'kanagawa', name: 'kanagawa', accent: '#7e9cd8', colors: build('#7e9cd8') },
  { id: 'monokai', name: 'monokai', accent: '#ffd866', colors: build('#ffd866') },
  { id: 'rose-pine', name: 'rose pine', accent: '#c4a7e7', colors: build('#c4a7e7') },
  { id: 'solarized', name: 'solarized', accent: '#268bd2', colors: build('#268bd2') },
  { id: 'ember', name: 'ember', accent: '#ff6b6b', colors: build('#ff6b6b') },
];
