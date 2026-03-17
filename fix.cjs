const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    // Replace all types of curly/smart quotes with straight quotes
    content = content.split('\u2018').join("'");
    content = content.split('\u2019').join("'");
    content = content.split('\u201A').join("'");
    content = content.split('\u201B').join("'");
    content = content.split('\u201C').join('"');
    content = content.split('\u201D').join('"');
    content = content.split('\u201E').join('"');
    content = content.split('\u201F').join('"');
    content = content.split('\u2026').join('...');
    content = content.split('\u2013').join('-');
    content = content.split('\u2014').join('-');
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed: ' + filePath);
    }
  } catch(e) {}
}

const srcDir = './src';
function walkDir(dir) {
  fs.readdirSync(dir).forEach(function(file) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      fixFile(full);
    }
  });
}
walkDir(srcDir);
console.log('All done!');