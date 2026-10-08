// Line icons for DevOps concepts on a 48x48 grid, drawn in currentColor. Shared by Icon.astro and Backdrop.astro.
// Each value is the inner SVG markup; the wrapping <svg> sets stroke, width and caps.

const helmSpokes = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  const p = (r: number) => `${(24 + r * Math.cos(a)).toFixed(1)}`;
  const q = (r: number) => `${(24 + r * Math.sin(a)).toFixed(1)}`;
  return `<line x1="${p(4)}" y1="${q(4)}" x2="${p(19)}" y2="${q(19)}"/>`;
}).join('');

export const icons = {
  cloud: '<path d="M14 35h20a8 8 0 0 0 1.2-15.9A11 11 0 0 0 14.3 21.6 7 7 0 0 0 14 35z"/><path d="M20 27l4 4 6-7"/>',
  helm: `<circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="3.5"/>${helmSpokes}`,
  pipeline:
    '<rect x="3" y="17" width="11" height="14" rx="2.5"/><rect x="18.5" y="17" width="11" height="14" rx="2.5"/><rect x="34" y="17" width="11" height="14" rx="2.5"/><path d="M14 24h4.5M29.5 24H34M31 21l3 3-3 3"/>',
  pulse: '<path d="M4 26h10l4-12 6 24 5-16 3 4h12"/><path d="M4 40h40" opacity="0.5"/>',
  git: '<circle cx="14" cy="11" r="4"/><circle cx="14" cy="37" r="4"/><circle cx="35" cy="17" r="4"/><path d="M14 15v18"/><path d="M14 29c0-8 21-4 21-12"/>',
  container: '<path d="M24 6l15 8v18l-15 8-15-8V14z"/><path d="M24 22v18M9 14l15 8 15-8"/>',
  shield: '<path d="M24 6l14 5v11c0 9-6 16-14 20-8-4-14-11-14-20V11z"/><path d="M17 24l5 5 9-10"/>',
  scan: '<circle cx="21" cy="21" r="11"/><path d="M29 29l11 11"/><path d="M16 21h10M21 16v10"/>',
  deploy: '<path d="M24 39V12"/><path d="M13 23l11-11 11 11"/><path d="M10 42h28"/>',
  monitor: '<rect x="5" y="9" width="38" height="25" rx="3"/><path d="M10 22h7l3-7 5 13 3-6h10"/><path d="M17 42h14M24 34v8"/>',
  server: '<rect x="7" y="8" width="34" height="12" rx="2.5"/><rect x="7" y="25" width="34" height="12" rx="2.5"/><circle cx="14" cy="14" r="1.4"/><circle cx="14" cy="31" r="1.4"/><path d="M21 14h14M21 31h14"/>',
  database: '<ellipse cx="24" cy="12" rx="14" ry="5"/><path d="M10 12v24c0 2.8 6.3 5 14 5s14-2.2 14-5V12"/><path d="M10 24c0 2.8 6.3 5 14 5s14-2.2 14-5"/>',
} as const;

export type IconName = keyof typeof icons;
