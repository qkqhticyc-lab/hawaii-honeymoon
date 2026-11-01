// Test server deliberately mounts dist at a repository subpath, as GitHub Pages does.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const prefix = '/honeymoon/';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
    const file = resolve(root, pathname.slice(prefix.length) || 'index.html');
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end(); }
});
server.listen(4173, '127.0.0.1', () => console.log('Built site: http://127.0.0.1:4173/honeymoon/'));
