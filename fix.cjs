const fs = require('fs');
let c = fs.readFileSync('src/pages/Browse.jsx', 'utf8');
c = c.replace(/\u2018|\u2019/g, "'");
c = c.replace(/\u201C|\u201D/g, '"');
c = c.replace(/\u2026/g, '...');
c = c.replace(/\u2013/g, '-');
c = c.replace(/\u2014/g, '--');
fs.writeFileSync('src/pages/Browse.jsx', c, 'utf8');
console.log('Fixed!');