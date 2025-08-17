const fs = require('fs');
const path = require('path');

// Read the templateSelector.js file
const filePath = path.join(__dirname, 'backend', 'lib', 'templateSelector.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all template paths
content = content.replace(
    /path\.join\(__dirname, '\.\.\/templates\/direct\/([^']+)\.js'\)/g,
    "path.join(__dirname, '../templates/direct_txt/$1.txt')"
);

content = content.replace(
    /path\.join\(__dirname, '\.\.\/templates\/interactive\/([^']+)\.js'\)/g,
    "path.join(__dirname, '../templates/interactive_txt/$1.txt')"
);

content = content.replace(
    /path\.join\(__dirname, '\.\.\/templates\/socratic\/([^']+)\.js'\)/g,
    "path.join(__dirname, '../templates/socratic_txt/$1.txt')"
);

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated all template paths to .txt files');