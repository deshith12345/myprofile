const fs = require('fs');
const content = fs.readFileSync('app/admin/dashboard/page.tsx.backup', 'utf8');

// 1. Remove any BOM
let clean = content.replace(/^\uFEFF/, '');

// 2. Normalize line endings to LF
clean = clean.replace(/\r\n/g, '\n');

// 3. Remove any non-standard whitespace/characters but keep standard ones
// This regex keeps standard ASCII, common punctuation, and some common unicode like quotes
// We'll be more aggressive and just stick to mostly ASCII and common punctuation.
clean = clean.replace(/[^\x00-\x7F\xA0\u2010-\u201F\u2026\u2022]/g, '');

// 4. Fix those specific tags with spaces I saw
clean = clean.replace(/<\/main >/g, '</main>');
clean = clean.replace(/<\/div >/g, '</div>');

fs.writeFileSync('app/admin/dashboard/page.tsx', clean, 'utf8');
console.log('File cleaned and rewritten');
