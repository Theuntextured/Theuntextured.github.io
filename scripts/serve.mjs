import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
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
createServer(async (request,response) => {
 try {
 const path = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
 const file = resolve(root,'.' + path,path.endsWith('/') ? 'index.html' : '');
 if (!file.startsWith(root + sep)) throw new Error('Invalid path');
 const body = await readFile(file);
 response.setHeader('Content-Type',contentTypes[extname(file).toLowerCase()] || 'application/octet-stream');
 response.end(body);
 } catch { response.writeHead(404).end('Not found'); }
}).listen(3000,'127.0.0.1',() => console.log('Preview: http://localhost:3000'));
