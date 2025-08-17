const express = require('express');
const fs = require('fs');
const router = express.Router();
const { TEMPLATE_REGISTRY } = require('../lib/templateSelector');
const { getTemplateInfo } = require('../lib/promptTemplates');

// Function to load template content from .txt file (same as in templateSelector.js)
function loadTemplateContent(templatePath) {
    try {
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        
        if (!templateContent || templateContent.trim().length === 0) {
            throw new Error(`Template is empty or not readable`);
        }
        
        // Return a function that can substitute variables
        return (query, role, roleInfo) => {
            return templateContent
                .replace(/\$\{roleInfo\.background\}/g, roleInfo.background)
                .replace(/\$\{roleInfo\.experience\}/g, roleInfo.experience)
                .replace(/\$\{roleInfo\.specialties\.join\(", "\)\}/g, roleInfo.specialties.join(", "))
                .replace(/\$\{roleInfo\.specialties\[0\]\}/g, roleInfo.specialties[0] || roleInfo.background)
                .replace(/\$\{query\}/g, query);
        };
    } catch (error) {
        console.error(`❌ Error loading template from ${templatePath}:`, error);
        throw error;
    }
}

/**
 * GET /api/templates
 * Returns all available templates with metadata and actual content
 */
router.get('/', (req, res) => {
    try {
        console.log('📋 Fetching template information with full content');
        
        const { ROLE_EXPERTISE } = require('../lib/promptTemplates');
        const roleInfo = ROLE_EXPERTISE['General Expert'];
        
        // Get template info
        const templateInfo = getTemplateInfo();
        
        // Format templates for frontend with actual content
        const formattedTemplates = {
            direct: [],
            interactive: [],
            socratic: []
        };
        
        // Process each category and load actual template content
        for (const [category, templates] of Object.entries(TEMPLATE_REGISTRY)) {
            formattedTemplates[category] = templates.map(template => {
                try {
                    // Load the template content from .txt file
                    const templateFunction = loadTemplateContent(template.path);
                    // Generate example content with placeholder query
                    const actualContent = templateFunction(
                        "[YOUR QUERY HERE]", 
                        "General Expert", 
                        roleInfo
                    );
                    
                    return {
                        name: template.name,
                        displayName: template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        description: template.description,
                        bestFor: template.bestFor,
                        keywords: template.keywords,
                        actualContent: actualContent // The real template prompt
                    };
                } catch (err) {
                    console.error(`Error loading template ${template.name}:`, err);
                    return {
                        name: template.name,
                        displayName: template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        description: template.description,
                        bestFor: template.bestFor,
                        keywords: template.keywords,
                        actualContent: `Error loading template: ${err.message}`
                    };
                }
            });
        }
        
        res.json({
            success: true,
            templates: formattedTemplates,
            stats: templateInfo
        });
        
    } catch (error) {
        console.error('❌ Error fetching templates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch templates'
        });
    }
});

/**
 * GET /api/templates/preview
 * Returns a preview of a specific template
 */
router.post('/preview', (req, res) => {
    try {
        const { templateName, query = 'Example query', role = 'General Expert' } = req.body;
        
        console.log(`🔍 Generating preview for template: ${templateName}`);
        
        // Find the template
        let foundTemplate = null;
        let category = null;
        
        for (const [cat, templates] of Object.entries(TEMPLATE_REGISTRY)) {
            const template = templates.find(t => t.name === templateName);
            if (template) {
                foundTemplate = template;
                category = cat;
                break;
            }
        }
        
        if (!foundTemplate) {
            return res.status(404).json({
                success: false,
                error: 'Template not found'
            });
        }
        
        // Load and execute the template from .txt file
        const templateFunction = loadTemplateContent(foundTemplate.path);
        const { ROLE_EXPERTISE } = require('../lib/promptTemplates');
        const roleInfo = ROLE_EXPERTISE[role] || ROLE_EXPERTISE['General Expert'];
        
        const preview = templateFunction(query, role, roleInfo);
        
        res.json({
            success: true,
            preview,
            template: {
                name: foundTemplate.name,
                description: foundTemplate.description,
                category
            }
        });
        
    } catch (error) {
        console.error('❌ Error generating template preview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate template preview'
        });
    }
});

module.exports = router;