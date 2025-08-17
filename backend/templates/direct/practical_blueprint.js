/**
 * Direct Template 3: Practical Blueprint Approach
 * Focuses on hands-on, step-by-step implementation with concrete examples
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Provide an immediately actionable blueprint with quick start guide, step-by-step plan, required tools, templates, success checkpoints, and troubleshooting. Focus on practical implementation with specific examples and concrete next steps.`;
}

module.exports = {
    name: "practical_blueprint",
    description: "Hands-on implementation with concrete examples and templates",
    generateTemplate
};