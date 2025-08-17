const fs = require('fs');
const path = require('path');

// Template registry from the original file
const TEMPLATE_REGISTRY = {
    direct: [
        'comprehensive_framework', 'expert_masterclass', 'practical_blueprint', 
        'strategic_roadmap', 'quick_solution', 'detailed_analysis', 
        'step_by_step_tutorial', 'troubleshooting_guide', 'best_practices_guide', 
        'resource_compilation', 'implementation_checklist'
    ],
    interactive: [
        'focused_dialogue', 'comprehensive_discovery', 'iterative_refinement',
        'diagnostic_interview', 'needs_assessment', 'collaborative_planning',
        'decision_framework', 'learning_assessment', 'goal_setting_session', 'creative_workshop'
    ],
    socratic: [
        'guided_inquiry', 'critical_thinking', 'reflective_learning',
        'assumption_challenging', 'root_cause_analysis', 'perspective_exploration',
        'value_discovery', 'wisdom_extraction', 'belief_examination', 
        'pattern_recognition', 'coding_agent'
    ]
};

function extractTemplateText(jsFilePath) {
    try {
        // Read the JavaScript file
        const content = fs.readFileSync(jsFilePath, 'utf8');
        
        // Find the return statement with the template text
        const returnMatch = content.match(/return\s+`([^`]+)`/s);
        if (returnMatch) {
            return returnMatch[1].trim();
        }
        
        // If no template literal found, try to extract from string
        const stringMatch = content.match(/return\s+"([^"]+)"/s);
        if (stringMatch) {
            return stringMatch[1].trim();
        }
        
        throw new Error('No template content found');
    } catch (error) {
        console.error(`Error extracting template from ${jsFilePath}:`, error.message);
        return null;
    }
}

function convertAllTemplates() {
    let converted = 0;
    let errors = 0;
    
    for (const [technique, templates] of Object.entries(TEMPLATE_REGISTRY)) {
        console.log(`\nConverting ${technique} templates...`);
        
        for (const templateName of templates) {
            const jsPath = path.join(__dirname, 'backend', 'templates', technique, `${templateName}.js`);
            const txtPath = path.join(__dirname, 'backend', 'templates', `${technique}_txt`, `${templateName}.txt`);
            
            if (!fs.existsSync(jsPath)) {
                console.error(`❌ JavaScript file not found: ${jsPath}`);
                errors++;
                continue;
            }
            
            const templateText = extractTemplateText(jsPath);
            if (templateText) {
                try {
                    fs.writeFileSync(txtPath, templateText, 'utf8');
                    console.log(`✅ Converted: ${templateName}`);
                    converted++;
                } catch (error) {
                    console.error(`❌ Error writing ${txtPath}:`, error.message);
                    errors++;
                }
            } else {
                errors++;
            }
        }
    }
    
    console.log(`\n📊 Conversion Summary:`);
    console.log(`✅ Converted: ${converted} templates`);
    console.log(`❌ Errors: ${errors} templates`);
}

// Run the conversion
convertAllTemplates();