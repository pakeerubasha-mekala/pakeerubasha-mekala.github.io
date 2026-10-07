// Renders /resume to public/pakeeru-basha-mekala-resume.pdf using a locally installed
// Chromium-based browser (Chrome, Brave, Edge or Chromium). No extra npm packages needed.
// Run via `npm run pdf` (builds the site first). Set CHROME_PATH to override the browser.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const PORT = 4399;
const OUT = 'public/pakeeru-basha-mekala-resume.pdf';

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
if (!browser) {
  console.error('No Chromium-based browser found. Set CHROME_PATH to its executable.');
  process.exit(1);
}

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/resume/`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Preview server did not start');
}

let status = 1;
try {
  await waitForServer();
  const result = spawnSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${OUT}`,
      `http://localhost:${PORT}/resume/`,
    ],
    { stdio: 'inherit' },
  );
  status = result.status ?? 1;
  if (status === 0 && existsSync(OUT)) console.log(`Wrote ${OUT}`);
  else console.error('PDF generation failed');
} finally {
  server.kill();
}
process.exit(status);
