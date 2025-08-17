/**
 * Socratic Template 10: Pattern Recognition Approach
 * Identifying recurring themes and connections through guided observation
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Guide pattern recognition through questions about recurring themes, connections, cycles, similarities, and underlying structures. Help them see patterns they may not have noticed before.

Start by asking what patterns or themes they notice in this area.`;
}

module.exports = {
    name: "pattern_recognition",
    description: "Identifying recurring themes and connections",
    bestFor: ["pattern identification", "theme recognition", "connection discovery", "structural analysis"],
    generateTemplate
};