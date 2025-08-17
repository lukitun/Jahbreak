const fs = require('fs');
const path = require('path');

// Template directories
const templateDirs = [
    'backend/templates/direct_txt',
    'backend/templates/interactive_txt', 
    'backend/templates/socratic_txt'
];

function updateTemplateRole(filePath) {
    try {
        // Read the current content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Replace complex role info with simple role placeholder
        let updatedContent = content
            .replace(/You are a \$\{roleInfo\.background\} with \$\{roleInfo\.experience\}\./g, 'You are a ${role}.')
            .replace(/\$\{roleInfo\.specialties\.join\(", "\)\}/g, '${role}')
            .replace(/\$\{roleInfo\.specialties\[0\]\}/g, '${role}')
            .replace(/\$\{roleInfo\.background\}/g, '${role}')
            .replace(/\$\{roleInfo\.experience\}/g, '${role}');
        
        // Write back to file
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated role placeholders in: ${path.basename(filePath)}`);
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

function processAllTemplates() {
    let processed = 0;
    let errors = 0;
    
    console.log('🔄 Updating role placeholders in all template files...\n');
    
    for (const dir of templateDirs) {
        const dirPath = path.join(__dirname, dir);
        
        if (!fs.existsSync(dirPath)) {
            console.error(`❌ Directory not found: ${dirPath}`);
            continue;
        }
        
        const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.txt'));
        console.log(`📁 Processing ${files.length} files in ${dir}`);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            try {
                updateTemplateRole(filePath);
                processed++;
            } catch (error) {
                console.error(`❌ Failed to process ${file}:`, error.message);
                errors++;
            }
        }
        console.log('');
    }
    
    console.log(`📊 Summary:`);
    console.log(`✅ Processed: ${processed} files`);
    console.log(`❌ Errors: ${errors} files`);
}

// Run the script
processAllTemplates();