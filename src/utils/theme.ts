// Shared by the header button and the terminal `theme` command. State lives in localStorage and is
// restored before first paint by the inline script in Base.astro.
export const ACCENTS = ['green', 'amber', 'cyan', 'violet'] as const;
export type Accent = (typeof ACCENTS)[number];
export type Scheme = 'light' | 'dark' | 'auto';

const root = () => document.documentElement;

export function currentScheme(): Scheme {
  const s = root().dataset.scheme;
  return s === 'light' || s === 'dark' ? s : 'auto';
}

/** The scheme the page is actually showing right now, resolving "auto" against the system setting. */
export function effectiveScheme(): 'light' | 'dark' {
  const s = currentScheme();
  if (s !== 'auto') return s;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function setScheme(scheme: Scheme) {
  if (scheme === 'auto') delete root().dataset.scheme;
  else root().dataset.scheme = scheme;
  try { localStorage.setItem('scheme', scheme); } catch {}
}

export function toggleScheme(): 'light' | 'dark' {
  const next = effectiveScheme() === 'dark' ? 'light' : 'dark';
  setScheme(next);
  return next;
}

export function currentAccent(): Accent {
  const a = root().dataset.accent as Accent | undefined;
  return a && ACCENTS.includes(a) ? a : 'green';
}

export function setAccent(accent: Accent) {
  if (accent === 'green') delete root().dataset.accent;
  else root().dataset.accent = accent;
  try { localStorage.setItem('accent', accent); } catch {}
}
