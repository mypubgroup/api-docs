const fs = require('fs-extra');
const http = require('node:http');
const path = require('node:path');
const { build, files } = require('./build');

const dist = path.resolve(__dirname, '..', 'dist');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const clients = new Set();

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const devClient = `
<script>
(() => {
  const source = new EventSource('/__dev/events');

  source.addEventListener('css', (event) => {
    const link = document.querySelector('link[href^="./css/custom.css"], link[href^="/css/custom.css"]');
    if (!link) return;

    const url = new URL(link.getAttribute('href'), window.location.href);
    url.searchParams.set('v', event.data || Date.now().toString());
    link.setAttribute('href', url.pathname + url.search);
  });

  source.addEventListener('reload', () => window.location.reload());
})();
</script>`;

function send(event, data = Date.now().toString()) {
  for (const client of clients) {
    client.write(`event: ${event}\n`);
    client.write(`data: ${data}\n\n`);
  }
}

function serveFile(req, res) {
  const rawPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const requestPath = rawPath === '/' ? '/index.html' : decodeURIComponent(rawPath);
  const filePath = path.normalize(path.join(dist, requestPath));

  if (!filePath.startsWith(dist)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  if (path.basename(filePath) === 'index.html') {
    const html = fs.readFileSync(filePath, 'utf8').replace('</body>', `${devClient}\n</body>`);
    res.writeHead(200, { 'Content-Type': contentTypes['.html'], 'Cache-Control': 'no-store' });
    res.end(html);
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.css' ? 'no-store' : 'public, max-age=60',
  });
  fs.createReadStream(filePath).pipe(res);
}

function watchFile(file, handler) {
  let timer;

  fs.watch(file, () => {
    clearTimeout(timer);
    timer = setTimeout(handler, 50);
  });
}

build();

watchFile(files.customCss.from, () => {
  fs.copySync(files.customCss.from, files.customCss.to);
  send('css');
  console.log('Updated custom CSS.');
});

watchFile('./src/index.html', () => {
  build();
  send('reload');
  console.log('Rebuilt HTML.');
});

const server = http.createServer((req, res) => {
  if (req.url === '/__dev/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  serveFile(req, res);
});

server.listen(port, host, () => {
  console.log(`Dev server running at http://${host}:${port}/`);
  console.log('Custom CSS hot-reloads from assets/custom.css.');
});
