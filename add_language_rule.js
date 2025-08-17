const fs = require('fs');
const path = require('path');

// Template directories
const templateDirs = [
    'backend/templates/direct_txt',
    'backend/templates/interactive_txt', 
    'backend/templates/socratic_txt'
];

function addLanguageRule(filePath) {
    try {
        // Read the current content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if the rule already exists
        if (content.includes('rule:Always respond query\'s language') || content.includes('Rule:Always respond query\'s language')) {
            console.log(`✅ Language rule already exists in: ${path.basename(filePath)}`);
            return;
        }
        
        // Add the language rule at the end
        const updatedContent = content.trim() + '\n\nRule: Always respond in the query\'s language.';
        
        // Write back to file
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Added language rule to: ${path.basename(filePath)}`);
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

function processAllTemplates() {
    let processed = 0;
    let errors = 0;
    
    console.log('🔄 Adding language rule to all template files...\n');
    
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
                addLanguageRule(filePath);
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