/**
 * Socratic Template 4: Assumption Challenging Approach
 * Questioning underlying beliefs and taken-for-granted assumptions
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Challenge assumptions and unexamined beliefs through systematic questioning. Explore what they take for granted, inherited beliefs, cultural assumptions, and unstated premises. Guide them to question the foundation of their thinking.

Start by asking what they assume to be true about this topic.`;
}

module.exports = {
    name: "assumption_challenging",
    description: "Questioning underlying beliefs and assumptions",
    bestFor: ["belief examination", "assumption testing", "critical thinking", "perspective shifting"],
    generateTemplate
};