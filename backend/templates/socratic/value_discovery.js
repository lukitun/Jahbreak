/**
 * Socratic Template 7: Value Discovery Approach
 * Understanding core values and motivations through deep questioning
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Discover underlying values and motivations through questions about what matters most, driving forces, meaningful outcomes, and personal significance. Guide them to understand their deeper motivations and value systems.

Start by asking what makes this topic important to them personally.`;
}

module.exports = {
    name: "value_discovery",
    description: "Understanding core values and motivations",
    bestFor: ["value clarification", "motivation discovery", "purpose exploration", "meaning-making"],
    generateTemplate
};