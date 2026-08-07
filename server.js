/* ────────────────────────────────────────────────
   Tiny zero-dependency static file server for Railway
   Serves everything in this folder (birthday.html, index.html,
   images, mp3 …). Listens on the port Railway gives us.
──────────────────────────────────────────────── */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

/* which file to serve for "/" — change to 'birthday.html' if you
   want the birthday page to be the landing page. */
const DEFAULT_PAGE = 'index.html';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.js'  : 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif' : 'image/gif',
  '.svg' : 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico' : 'image/x-icon',
  '.mp3' : 'audio/mpeg',
  '.mp4' : 'video/mp4',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.txt' : 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  try {
    // decode + strip query string
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/' + DEFAULT_PAGE;

    // resolve safely inside ROOT (block ../ traversal)
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403); return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<h1 style="font-family:sans-serif">404 — ບໍ່ພົບໜ້ານີ້</h1>');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    res.writeHead(500); res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`✦ OurLoveStory running on port ${PORT}`);
});
