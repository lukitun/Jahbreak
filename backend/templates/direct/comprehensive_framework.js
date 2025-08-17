/**
 * Direct Template 1: Comprehensive Framework Approach
 * Focuses on systematic methodology and detailed execution plans
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Create a systematic framework with three phases: Foundation, Execution, and Optimization. Include methodologies, timelines, and success metrics for comprehensive implementation.`;
}

module.exports = {
    name: "comprehensive_framework",
    description: "Systematic methodology with detailed execution plans",
    generateTemplate
};