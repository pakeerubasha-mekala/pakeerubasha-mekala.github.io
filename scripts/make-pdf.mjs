// Renders the resume pages to PDFs using a locally installed Chromium-based browser
// (Chrome, Brave, Edge or Chromium). No extra npm packages needed.
//
// Usage: node scripts/make-pdf.mjs [outputDir]     (default: public)
// `npm run pdf` builds the site first. CI passes `dist` so the deployed PDFs always match the data.
// Set CHROME_PATH to choose a browser.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { startServer } from './static-server.mjs';
import { countPages } from './pdf-pages.mjs';

const PORT = 4399;
const OUT_DIR = process.argv[2] ?? 'public';

// path on the built site -> PDF file name
const TARGETS = [
  { path: '/resume/', file: 'pakeeru-basha-mekala-resume.pdf' },
  { path: '/resume-ats/', file: 'pakeeru-basha-mekala-resume-ats.pdf' },
];

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

if (!existsSync('dist')) { console.error('dist/ not found. Run `npm run build` first.'); process.exit(1); }

// Run the browser without blocking the event loop (the static server lives in this same process).
function run(cmd, args) {
  return new Promise((done) => {
    const child = spawn(cmd, args, { stdio: 'ignore' });
    const timer = setTimeout(() => child.kill('SIGKILL'), 60_000);
    child.on('exit', (code) => { clearTimeout(timer); done(code); });
    child.on('error', () => { clearTimeout(timer); done(1); });
  });
}

mkdirSync(OUT_DIR, { recursive: true });
const server = await startServer('dist', PORT);

let status = 0;
try {
  for (const { path, file } of TARGETS) {
    const out = `${OUT_DIR}/${file}`;
    const code = await run(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        ...(process.env.CI ? ['--no-sandbox'] : []),
        '--no-pdf-header-footer',
        `--print-to-pdf=${out}`,
        `http://127.0.0.1:${PORT}${path}`,
      ],
    );
    if (code !== 0 || !existsSync(out)) { console.error(`PDF generation failed for ${path}`); status = 1; continue; }
    // Both resumes are meant to be exactly one page. Fail loudly (and fail the deploy) if one spills over.
    const pages = countPages(out);
    if (pages !== 1) {
      console.error(`${out} has ${pages} pages, expected 1. Shorten the resume highlights in src/data/experience.json.`);
      status = 1;
    } else console.log(`Wrote ${out} (1 page)`);
  }
} finally {
  server.close();
}
process.exit(status);
