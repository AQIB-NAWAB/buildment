import type { FileSystemTree } from "@webcontainer/api";

export const DEFAULT_SERVER_CODE = `import { createServer } from 'node:http';

// Edit me! This Node.js server runs entirely inside your browser
// via a WebContainer. Change the message below and press "Run".
const MESSAGE = 'It runs in your browser';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(\`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>BuildMint Sandbox</title>
    <style>
      body { font-family: system-ui, sans-serif; background:#0f172a; color:#e2e8f0;
             display:flex; align-items:center; justify-content:center; height:100vh; margin:0 }
      .card { text-align:center }
      h1 { font-size:1.6rem; margin:0 0 .5rem }
      code { background:#1e293b; padding:2px 6px; border-radius:4px }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>🚀 \${MESSAGE}</h1>
      <p>This Node.js server booted inside a WebContainer.</p>
      <p>Served at <code>\${new Date().toISOString()}</code></p>
    </div>
  </body>
</html>\`);
});

const PORT = 3111;
server.listen(PORT, () => {
  console.log('Sandbox server listening on http://localhost:' + PORT);
});
`;

export const PACKAGE_JSON = `{
  "name": "buildmint-sandbox",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "node server.js"
  }
}
`;

export function buildFileTree(serverCode: string): FileSystemTree {
  return {
    "package.json": { file: { contents: PACKAGE_JSON } },
    "server.js": { file: { contents: serverCode } },
  };
}
