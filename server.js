/* Servidor estático mínimo para probar la web en local.
   Uso:  node server.js   →   http://localhost:4321
   No hace falta para publicar en GitHub Pages; es solo para desarrollo. */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 4321;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.js'  : 'text/javascript; charset=utf-8',
  '.svg' : 'image/svg+xml',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.webp': 'image/webp',
  '.ico' : 'image/x-icon',
  '.vcf' : 'text/vcard'
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const rel     = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const file    = path.join(ROOT, rel);

  // Nunca servir fuera de la carpeta del proyecto
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 — no encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`FungaTec en http://localhost:${PORT}`));
