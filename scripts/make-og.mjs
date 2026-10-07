// Renders the social preview cards (/og-card/<name>/) to PNG files at <outputDir>/og/<name>.png using a
// locally installed Chromium-based browser. Then removes the card pages from dist/ so they are not deployed.
//
// Usage: node scripts/make-og.mjs [outputDir]     (default: dist; run `npm run build` first)
// Set CHROME_PATH to choose a browser.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { startServer } from './static-server.mjs';

const PORT = 4398;
const OUT_DIR = process.argv[2] ?? 'dist';
const CARDS_DIR = 'dist/og-card';

const candidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const browser = candidates.find((p) => existsSync(p));
if (!browser) { console.error('No Chromium-based browser found. Set CHROME_PATH.'); process.exit(1); }
if (!existsSync(CARDS_DIR)) { console.error(`${CARDS_DIR} not found. Run \`npm run build\` first.`); process.exit(1); }

const cards = readdirSync(CARDS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

// Run the browser without blocking the event loop (the static server lives in this same process).
function run(cmd, args) {
  return new Promise((done) => {
    const child = spawn(cmd, args, { stdio: 'ignore' });
    const timer = setTimeout(() => child.kill('SIGKILL'), 60_000);
    child.on('exit', (code) => { clearTimeout(timer); done(code); });
    child.on('error', () => { clearTimeout(timer); done(1); });
  });
}

mkdirSync(`${OUT_DIR}/og`, { recursive: true });
const server = await startServer('dist', PORT);

let status = 0;
try {
  for (const name of cards) {
    const out = `${OUT_DIR}/og/${name}.png`;
    const code = await run(
      browser,
      [
        '--headless=new', '--disable-gpu', ...(process.env.CI ? ['--no-sandbox'] : []),
        '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630',
        '--virtual-time-budget=3000', `--screenshot=${out}`, `http://127.0.0.1:${PORT}/og-card/${name}/`,
      ],
    );
    if (code === 0 && existsSync(out)) console.log(`Wrote ${out}`);
    else { console.error(`Failed: ${name}`); status = 1; }
  }
} finally {
  server.close();
  rmSync(CARDS_DIR, { recursive: true, force: true }); // keep the card pages out of the deployed site
}
process.exit(status);
