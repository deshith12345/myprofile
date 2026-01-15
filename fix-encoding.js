const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, 'app', 'admin', 'dashboard', 'page.tsx.backup');
const outputPath = path.join(__dirname, 'app', 'admin', 'dashboard', 'page.tsx');

// Read the file with explicit UTF-8 encoding
const content = fs.readFileSync(backupPath, 'utf8');

// Write it back with UTF-8 encoding and LF line endings
const cleanContent = content.replace(/\r\n/g, '\n');

fs.writeFileSync(outputPath, cleanContent, 'utf8');

console.log('File rewritten successfully with clean encoding');
