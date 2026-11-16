import { createServer } from 'node:http';
import { watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const root = resolve('dist');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

const clients = new Set();
let revision = randomUUID();
let rebuildTimer;
let buildProcess;
let pending = false;
let stopping = false;

function sendRevision(response) {
  response.write(`data: ${revision}\n\n`);
}

async function rebuild() {
  if (buildProcess || stopping || !pending) {
    return;
  }
  pending = false;
  console.log('Changes detected. Rebuilding…');
  const success = await new Promise((resolve) => {
    // A fresh process also reloads imported templates and build modules.
    buildProcess = spawn(process.execPath, ['scripts/build.mjs'], {
      stdio: 'inherit',
    });
    buildProcess.on('error', (error) => {
      console.error(error);
      resolve(false);
    });
    buildProcess.on('close', (code) => resolve(code === 0));
  });
  buildProcess = undefined;
  if (stopping) {
    return;
  }
  if (!success) {
    console.error('Build failed. Fix the error and save to try again.');
  }
  if (pending) {
    scheduleRebuild();
  } else if (success) {
    revision = randomUUID();
    clients.forEach(sendRevision);
  }
}

function scheduleRebuild() {
  pending = true;
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(rebuild, 100);
}

const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    );
    response.setHeader('Cache-Control', 'no-store');
    if (path === '/__reload') {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
      });
      clients.add(response);
      sendRevision(response);
      response.on('close', () => clients.delete(response));
      return;
    }
    const file = resolve(
      root,
      '.' + path,
      path.endsWith('/') ? 'index.html' : '',
    );
    if (!file.startsWith(root + sep)) {
      throw new Error('Invalid path');
    }
    const pageRevision = revision;
    let body = await readFile(file);
    if (extname(file).toLowerCase() === '.html') {
      // Inject only in the preview response; static builds stay standalone.
      body =
        body.toString() +
        /* HTML */ `
          <script>
            new EventSource('/__reload').onmessage = (event) => {
              if (event.data !== '${pageRevision}') {
                location.reload();
              }
            };
          </script>
        `;
    }
    response.setHeader(
      'Content-Type',
      contentTypes[extname(file).toLowerCase()] || 'application/octet-stream',
    );
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

const watchers = ['src', 'scripts', 'cv'].map((directory) =>
  watch(directory, { recursive: true }, scheduleRebuild),
);
const heartbeat = setInterval(() => {
  clients.forEach((response) => response.write(': keep-alive\n\n'));
}, 15000);
heartbeat.unref();

function stop() {
  stopping = true;
  clearTimeout(rebuildTimer);
  clearInterval(heartbeat);
  watchers.forEach((watcher) => watcher.close());
  buildProcess?.kill();
  clients.forEach((response) => response.end());
  server.close();
  server.closeAllConnections();
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);

server.listen(3000, '127.0.0.1', () => {
  console.log('Preview: http://localhost:3000 (live reload enabled)');
});
