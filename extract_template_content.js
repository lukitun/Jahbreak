#!/usr/bin/env node

/**
 * Extract actual template file content for web display
 */

const fs = require('fs');
const path = require('path');

const templatesDir = '/root/jahbreak/backend/templates';
const categories = ['direct', 'interactive', 'socratic'];

const templateContent = {
    direct: {},
    interactive: {},
    socratic: {}
};

console.log('Reading all template files...\n');

categories.forEach(category => {
    const categoryDir = path.join(templatesDir, category);
    const files = fs.readdirSync(categoryDir);
    
    console.log(`\n${category.toUpperCase()} TEMPLATES:`);
    
    files.forEach(file => {
        if (file.endsWith('.js')) {
            const templateName = file.replace('.js', '');
            const filePath = path.join(categoryDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            templateContent[category][templateName] = content;
            console.log(`  ✓ ${templateName}`);
        }
    });
});

// Generate JavaScript object for embedding
const output = `// ACTUAL TEMPLATE FILE CONTENT - RAW FILES FROM /backend/templates/
const ACTUAL_TEMPLATE_FILES = ${JSON.stringify(templateContent, null, 2)};
`;

fs.writeFileSync('/root/jahbreak/actual_template_files.js', output);

console.log('\n✅ Extracted all template files to actual_template_files.js');
console.log(`Total templates: ${Object.keys(templateContent.direct).length + Object.keys(templateContent.interactive).length + Object.keys(templateContent.socratic).length}`);