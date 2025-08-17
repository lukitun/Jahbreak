/**
 * Socratic Template 5: Root Cause Analysis Approach
 * Deep exploration of fundamental causes through iterative questioning
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Guide deep root cause exploration through progressive "why" questioning, system thinking, and fundamental cause identification. Help them discover underlying patterns and systemic issues rather than surface symptoms.

Start by asking them to describe what they see as the immediate cause.`;
}

module.exports = {
    name: "root_cause_analysis",
    description: "Deep exploration of fundamental causes",
    bestFor: ["problem analysis", "system thinking", "cause identification", "deep investigation"],
    generateTemplate
};