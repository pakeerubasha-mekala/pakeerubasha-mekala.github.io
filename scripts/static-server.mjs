// Minimal static file server for the built site (dist/). Used by make-pdf.mjs and make-og.mjs so they
// need no extra packages and leave no background process behind (unlike `astro preview`).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

/** Serves `root` on 127.0.0.1:port and resolves once it is listening. Call `.close()` when done. */
export function startServer(root, port) {
  const base = resolve(root);
  const server = createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url ?? '/', 'http://localhost');
      let file = join(base, normalize(decodeURIComponent(pathname)));
      if (file !== base && !file.startsWith(base + sep)) { res.writeHead(403).end('forbidden'); return; }
      let info = await stat(file).catch(() => null);
      if (info?.isDirectory()) { file = join(file, 'index.html'); info = await stat(file).catch(() => null); }
      if (!info) {
        // Like GitHub Pages: unknown addresses get the site's own 404 page with a 404 status.
        const notFound = await readFile(join(base, '404.html')).catch(() => null);
        res.writeHead(404, { 'content-type': notFound ? TYPES['.html'] : 'text/plain' }).end(notFound ?? 'not found');
        return;
      }
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(500).end('error');
    }
  });
  return new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, '127.0.0.1', () => ok(server));
  });
}
