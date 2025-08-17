/**
 * Socratic Template 9: Belief Examination Approach
 * Questioning and testing beliefs through systematic inquiry
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Examine beliefs through questions about evidence, origins, consistency, consequences, and alternatives. Guide them to test their beliefs against reality and explore belief formation and validation.

Start by asking what they believe to be true and how they know it.`;
}

module.exports = {
    name: "belief_examination",
    description: "Questioning and testing beliefs through inquiry",
    bestFor: ["belief testing", "evidence evaluation", "truth seeking", "cognitive examination"],
    generateTemplate
};