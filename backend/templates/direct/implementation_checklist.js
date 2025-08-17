/**
 * Direct Template 11: Implementation Checklist Approach
 * Systematic execution planning with detailed checklists and verification steps
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Create systematic implementation checklist with preparation steps, execution phases, quality checkpoints, verification procedures, and completion criteria. Focus on thorough execution management and progress tracking.`;
}

module.exports = {
    name: "implementation_checklist",
    description: "Systematic execution planning with detailed checklists",
    bestFor: ["project execution", "systematic implementation", "process management", "quality control"],
    generateTemplate
};