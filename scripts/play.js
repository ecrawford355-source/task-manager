const { execSync, spawn } = require('child_process');
const { createServer } = require('http');
const { createReadStream, existsSync, statSync } = require('fs');
const { extname, join, resolve } = require('path');
const { networkInterfaces, platform } = require('os');

const root = resolve(__dirname, '..');
const buildDir = join(root, 'frontend', 'build');
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function getLocalUrls() {
  return Object.values(networkInterfaces())
    .flat()
    .filter(Boolean)
    .filter(details => details.family === 'IPv4' && !details.internal)
    .map(details => `http://${details.address}:${port}`);
}

function openBrowser(url) {
  if (process.env.NO_OPEN === '1') return;
  const commands = {
    darwin: ['open', url],
    win32: ['cmd', '/c', 'start', '', url],
    linux: ['xdg-open', url]
  };
  const command = commands[platform()];
  if (!command) return;
  const child = spawn(command[0], command.slice(1), { detached: true, stdio: 'ignore' });
  child.on('error', () => {});
  child.unref();
}

function safePath(requestUrl) {
  const cleanUrl = decodeURIComponent(requestUrl.split('?')[0]);
  const requestedPath = cleanUrl === '/' ? '/index.html' : cleanUrl;
  const filePath = resolve(buildDir, `.${requestedPath}`);
  if (!filePath.startsWith(buildDir)) return join(buildDir, 'index.html');
  if (existsSync(filePath) && statSync(filePath).isFile()) return filePath;
  return join(buildDir, 'index.html');
}

console.log('Building Neon Rift Runner...');
execSync('npm run build --prefix frontend', { cwd: root, stdio: 'inherit' });

const server = createServer((request, response) => {
  const filePath = safePath(request.url || '/');
  response.setHeader('Content-Type', mimeTypes[extname(filePath)] || 'application/octet-stream');
  if (filePath.includes(`${join('frontend', 'build', 'static')}${require('path').sep}`)) {
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    response.setHeader('Cache-Control', 'no-cache');
  }
  createReadStream(filePath)
    .on('error', () => {
      response.writeHead(500);
      response.end('Unable to load Neon Rift Runner.');
    })
    .pipe(response);
});

server.listen(port, host, () => {
  const localUrl = `http://localhost:${port}`;
  const networkUrls = getLocalUrls();
  console.log('\nNeon Rift Runner is ready to play.');
  console.log(`Computer: ${localUrl}`);
  if (networkUrls.length) {
    console.log('Phone on same Wi-Fi:');
    networkUrls.forEach(url => console.log(`  ${url}`));
  }
  console.log('\nPress Ctrl+C when you are done playing.');
  openBrowser(localUrl);
});
