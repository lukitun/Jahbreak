const express = require('express');
const router = express.Router();
const { TEMPLATE_REGISTRY } = require('../lib/templateSelector');
const { getTemplateInfo } = require('../lib/promptTemplates');

/**
 * GET /api/templates
 * Returns all available templates with metadata
 */
router.get('/', (req, res) => {
    try {
        console.log('📋 Fetching template information');
        
        // Get template info
        const templateInfo = getTemplateInfo();
        
        // Format templates for frontend
        const formattedTemplates = {
            direct: [],
            interactive: [],
            socratic: []
        };
        
        // Process each category
        for (const [category, templates] of Object.entries(TEMPLATE_REGISTRY)) {
            formattedTemplates[category] = templates.map(template => ({
                name: template.name,
                displayName: template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: template.description,
                bestFor: template.bestFor,
                keywords: template.keywords
            }));
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
        
        // Load and execute the template
        const templateModule = require(foundTemplate.path);
        const { ROLE_EXPERTISE } = require('../lib/promptTemplates');
        const roleInfo = ROLE_EXPERTISE[role] || ROLE_EXPERTISE['General Expert'];
        
        const preview = templateModule.generateTemplate(query, role, roleInfo);
        
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