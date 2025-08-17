/**
 * Test script for templates functionality
 */

const { TEMPLATE_REGISTRY } = require('./lib/templateSelector');
const { getTemplateInfo } = require('./lib/promptTemplates');

console.log('Testing template system...\n');

// Test 1: Check template registry
console.log('1. Template Registry Check:');
for (const [category, templates] of Object.entries(TEMPLATE_REGISTRY)) {
    console.log(`   ${category}: ${templates.length} templates`);
    console.log(`      First template: ${templates[0].name}`);
}

// Test 2: Get template info
console.log('\n2. Template Info:');
const info = getTemplateInfo();
console.log('   Total templates:', info.totalTemplates);
console.log('   Roles available:', info.roleCount);

// Test 3: Load a specific template
console.log('\n3. Loading a specific template:');
try {
    const template = require('./templates/direct/comprehensive_framework.js');
    console.log('   comprehensive_framework loaded successfully');
    console.log('   Template type:', typeof template.generateTemplate);
    
    // Test generating with the template
    const { ROLE_EXPERTISE } = require('./lib/promptTemplates');
    const roleInfo = ROLE_EXPERTISE['General Expert'];
    const preview = template.generateTemplate('Test query', 'General Expert', roleInfo);
    console.log('   Preview length:', preview.length, 'characters');
    console.log('   Preview start:', preview.substring(0, 100) + '...');
} catch (error) {
    console.error('   Error loading template:', error.message);
}

console.log('\n✅ Template system test complete!');