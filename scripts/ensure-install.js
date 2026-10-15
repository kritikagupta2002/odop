'use strict';
// Runs before "npm run dev / start": installs the backend packages if they are missing, and checks the Node version.
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error(`\nNode.js ${process.versions.node} is too old. Please install Node.js 22.13 or newer from https://nodejs.org\n`);
  process.exit(1);
}

const backend = path.join(__dirname, '..', 'backend');
if (!fs.existsSync(path.join(backend, 'node_modules', 'express'))) {
  console.log('Installing the backend packages (first run only)...');
  execSync('npm install --no-audit --no-fund', { cwd: backend, stdio: 'inherit' });
}
