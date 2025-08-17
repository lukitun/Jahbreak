/**
 * Template Content Generator
 * Generates all template content using the actual template files
 */

const path = require('path');

// ROLE_EXPERTISE from promptTemplates.js
const ROLE_EXPERTISE = {
    "General Expert": {
        background: "Multidisciplinary Expert with broad knowledge across various fields and strong analytical skills",
        specialties: ["problem-solving", "critical thinking", "research methodology", "interdisciplinary analysis", "knowledge synthesis"],
        experience: "consulted across diverse industries and solved complex interdisciplinary challenges"
    }
};

// Template paths and metadata
const TEMPLATE_REGISTRY = {
    direct: [
        { name: "best_practices_guide", path: "./backend/templates/direct/best_practices_guide.js" },
        { name: "comprehensive_framework", path: "./backend/templates/direct/comprehensive_framework.js" },
        { name: "detailed_analysis", path: "./backend/templates/direct/detailed_analysis.js" },
        { name: "expert_masterclass", path: "./backend/templates/direct/expert_masterclass.js" },
        { name: "implementation_checklist", path: "./backend/templates/direct/implementation_checklist.js" },
        { name: "practical_blueprint", path: "./backend/templates/direct/practical_blueprint.js" },
        { name: "quick_solution", path: "./backend/templates/direct/quick_solution.js" },
        { name: "resource_compilation", path: "./backend/templates/direct/resource_compilation.js" },
        { name: "step_by_step_tutorial", path: "./backend/templates/direct/step_by_step_tutorial.js" },
        { name: "strategic_roadmap", path: "./backend/templates/direct/strategic_roadmap.js" },
        { name: "troubleshooting_guide", path: "./backend/templates/direct/troubleshooting_guide.js" }
    ],
    interactive: [
        { name: "collaborative_planning", path: "./backend/templates/interactive/collaborative_planning.js" },
        { name: "comprehensive_discovery", path: "./backend/templates/interactive/comprehensive_discovery.js" },
        { name: "creative_workshop", path: "./backend/templates/interactive/creative_workshop.js" },
        { name: "decision_framework", path: "./backend/templates/interactive/decision_framework.js" },
        { name: "diagnostic_interview", path: "./backend/templates/interactive/diagnostic_interview.js" },
        { name: "focused_dialogue", path: "./backend/templates/interactive/focused_dialogue.js" },
        { name: "goal_setting_session", path: "./backend/templates/interactive/goal_setting_session.js" },
        { name: "iterative_refinement", path: "./backend/templates/interactive/iterative_refinement.js" },
        { name: "learning_assessment", path: "./backend/templates/interactive/learning_assessment.js" },
        { name: "needs_assessment", path: "./backend/templates/interactive/needs_assessment.js" }
    ],
    socratic: [
        { name: "assumption_challenging", path: "./backend/templates/socratic/assumption_challenging.js" },
        { name: "belief_examination", path: "./backend/templates/socratic/belief_examination.js" },
        { name: "coding_agent", path: "./backend/templates/socratic/coding_agent.js" },
        { name: "critical_thinking", path: "./backend/templates/socratic/critical_thinking.js" },
        { name: "guided_inquiry", path: "./backend/templates/socratic/guided_inquiry.js" },
        { name: "pattern_recognition", path: "./backend/templates/socratic/pattern_recognition.js" },
        { name: "perspective_exploration", path: "./backend/templates/socratic/perspective_exploration.js" },
        { name: "reflective_learning", path: "./backend/templates/socratic/reflective_learning.js" },
        { name: "root_cause_analysis", path: "./backend/templates/socratic/root_cause_analysis.js" },
        { name: "value_discovery", path: "./backend/templates/socratic/value_discovery.js" },
        { name: "wisdom_extraction", path: "./backend/templates/socratic/wisdom_extraction.js" }
    ]
};

function generateAllTemplates() {
    const query = "[YOUR QUERY HERE]";
    const role = "General Expert";
    const roleInfo = ROLE_EXPERTISE[role];
    
    const allTemplates = {};
    
    // Generate direct templates
    console.log('Generating direct templates...');
    allTemplates.direct = {};
    for (const template of TEMPLATE_REGISTRY.direct) {
        try {
            const templateModule = require(template.path);
            const content = templateModule.generateTemplate(query, role, roleInfo);
            allTemplates.direct[template.name] = content;
            console.log(`✓ Generated direct/${template.name}`);
        } catch (error) {
            console.error(`✗ Failed to generate direct/${template.name}:`, error.message);
            allTemplates.direct[template.name] = `Error: ${error.message}`;
        }
    }
    
    // Generate interactive templates
    console.log('\nGenerating interactive templates...');
    allTemplates.interactive = {};
    for (const template of TEMPLATE_REGISTRY.interactive) {
        try {
            const templateModule = require(template.path);
            const content = templateModule.generateTemplate(query, role, roleInfo);
            allTemplates.interactive[template.name] = content;
            console.log(`✓ Generated interactive/${template.name}`);
        } catch (error) {
            console.error(`✗ Failed to generate interactive/${template.name}:`, error.message);
            allTemplates.interactive[template.name] = `Error: ${error.message}`;
        }
    }
    
    // Generate socratic templates
    console.log('\nGenerating socratic templates...');
    allTemplates.socratic = {};
    for (const template of TEMPLATE_REGISTRY.socratic) {
        try {
            const templateModule = require(template.path);
            const content = templateModule.generateTemplate(query, role, roleInfo);
            allTemplates.socratic[template.name] = content;
            console.log(`✓ Generated socratic/${template.name}`);
        } catch (error) {
            console.error(`✗ Failed to generate socratic/${template.name}:`, error.message);
            allTemplates.socratic[template.name] = `Error: ${error.message}`;
        }
    }
    
    return allTemplates;
}

// Generate and export the templates
const generatedTemplates = generateAllTemplates();

console.log('\n=== GENERATED TEMPLATE CONTENT ===\n');
console.log('const TEMPLATE_CONTENT = ');
console.log(JSON.stringify(generatedTemplates, null, 2));
console.log(';');

// Also write to file for easy copy/paste
const fs = require('fs');
const output = `// Generated Template Content for templates.html
// Replace the simplified content with this complete object

const TEMPLATE_CONTENT = ${JSON.stringify(generatedTemplates, null, 2)};

// Usage: Replace the existing templateContent object in templates.html with TEMPLATE_CONTENT
`;

fs.writeFileSync('/root/jahbreak/generated_templates_output.js', output);
console.log('\n📁 Full output saved to: /root/jahbreak/generated_templates_output.js');