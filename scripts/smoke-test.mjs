// Browser smoke tests for the built site (dist/). Uses a locally installed Chromium-based browser through the
// DevTools protocol (Node's built-in WebSocket), so it needs no extra npm packages.
//
// Usage: npm run build && node scripts/smoke-test.mjs     (set CHROME_PATH to choose a browser)
// Exits non-zero when any check fails.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startServer } from './static-server.mjs';

const SITE_PORT = 4396;
const DEBUG_PORT = 9340;
const BASE = `http://127.0.0.1:${SITE_PORT}`;

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
if (!existsSync('dist')) { console.error('dist/ not found. Run `npm run build` first.'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profileDir = mkdtempSync(join(tmpdir(), 'smoke-'));
const server = await startServer('dist', SITE_PORT);
const chrome = spawn(browser, [
  '--headless=new', '--disable-gpu', ...(process.env.CI ? ['--no-sandbox'] : []),
  `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profileDir}`, 'about:blank',
], { stdio: 'ignore' });

let failures = 0;
const check = (name, ok, detail = '') => {
  if (ok) console.log(`  ok   ${name}`);
  else { failures += 1; console.log(`  FAIL ${name}${detail ? ` (${detail})` : ''}`); }
};

try {
  for (let i = 0; i < 60; i++) {
    try { await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).json(); break; } catch { await sleep(250); }
  }
  const tab = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pending = new Map();
  let loaded = null;
  let exceptions = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    if (d.method === 'Page.loadEventFired' && loaded) loaded();
    if (d.method === 'Runtime.exceptionThrown') exceptions.push(d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'evaluate failed');
    return r.result?.result?.value;
  };
  const go = async (path) => {
    exceptions = [];
    const done = new Promise((r) => (loaded = r));
    await send('Page.navigate', { url: BASE + path });
    await Promise.race([done, sleep(8000)]);
    await sleep(600); // let deferred scripts run
  };

  await send('Runtime.enable');
  await send('Page.enable');
  // Skip the boot animation and start from a clean theme in every test.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "sessionStorage.setItem('booted','1')" });

  console.log('Pages load without errors');
  const pages = [
    ['/', 'h1'], ['/blog/', 'h1'], ['/resume/', 'h1'], ['/resume-ats/', 'h1'], ['/work/', 'h1'],
    ['/work/waitrose/', 'h1'], ['/status/', 'h1'], ['/how-its-built/', 'h1'],
  ];
  for (const [path, selector] of pages) {
    await go(path);
    const info = await ev(`JSON.stringify({ title: document.title, h1: !!document.querySelector(${JSON.stringify(selector)}) })`);
    const { title, h1 } = JSON.parse(info);
    check(`${path} renders (title "${title.slice(0, 40)}")`, title.length > 0 && h1);
    check(`${path} has no script errors`, exceptions.length === 0, exceptions[0]?.slice(0, 120));
  }
  await go('/does-not-exist/');
  check('unknown address shows the 404 page', (await ev('document.title')) === '404 · Pakeeru Basha Mekala');

  console.log('Home page: terminal, palette, themes');
  await go('/');
  const run = (cmd) => ev(`(async()=>{const i=document.getElementById('term-input');i.value=${JSON.stringify(cmd)};document.getElementById('term-form').requestSubmit();await new Promise(r=>setTimeout(r,500));return document.getElementById('term-screen').innerText})()`);
  check('terminal answers "help"', (await run('help')).includes('Available commands'));
  check('terminal answers "whoami"', (await run('whoami')).includes('Pakeeru Basha Mekala'));
  check('terminal rejects unknown commands', (await run('definitely-not-a-command')).includes('command not found'));
  await run('theme amber');
  check('"theme amber" sets the accent', (await ev('document.documentElement.dataset.accent')) === 'amber');
  await run('theme green');
  await ev("document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}))");
  await sleep(300);
  check('Ctrl+K opens the command palette', (await ev("document.getElementById('palette').open && document.querySelectorAll('#palette-list .item').length > 3")) === true);
  await ev("document.getElementById('palette').close()");
  const before = await ev("document.documentElement.dataset.scheme ?? 'auto'");
  await ev("document.getElementById('scheme-toggle').click()");
  const after = await ev("document.documentElement.dataset.scheme ?? 'auto'");
  check('light/dark toggle changes the scheme', before !== after, `${before} -> ${after}`);
  await ev("document.getElementById('mode-toggle').click()");
  check('recruiter mode hides the terminal', (await ev("getComputedStyle(document.getElementById('terminal')).display")) === 'none');
  await ev("localStorage.clear()");

  console.log('Blog search');
  await go('/blog/');
  const search = (q) => ev(`(async()=>{const i=document.getElementById('blog-search');i.value=${JSON.stringify(q)};i.dispatchEvent(new Event('input'));await new Promise(r=>setTimeout(r,100));return [...document.querySelectorAll('#post-list>li')].filter(l=>!l.hidden).length})()`);
  check('empty search shows all posts', (await search('')) > 0);
  check('nonsense search shows none', (await search('zzzzqqqq')) === 0);
  check('"no matches" message appears', (await ev("!document.getElementById('blog-empty').hidden")) === true);

  console.log('Resume pages');
  await go('/resume/');
  check('designed resume has the sheet and a mailto link', (await ev("!!document.querySelector('.sheet') && !!document.querySelector('a[href^=\"mailto:\"]')")) === true);
  await go('/resume-ats/');
  check('ATS resume is plain text sections', (await ev("[...document.querySelectorAll('.ats h2')].map(h=>h.textContent).join('|')")).includes('Experience'));

  ws.close();
} finally {
  // Wait for the browser to exit before deleting its profile folder (it keeps writing until then).
  await new Promise((done) => { chrome.once('exit', done); chrome.kill(); setTimeout(done, 5000); });
  server.close();
  try { rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp folder, harmless */ }
}

console.log(failures === 0 ? '\nAll smoke checks passed.' : `\n${failures} smoke check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
