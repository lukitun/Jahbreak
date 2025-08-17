/**
 * Socratic Template 6: Perspective Exploration Approach
 * Multiple viewpoint examination and perspective shifting through inquiry
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Explore multiple perspectives through questioning different viewpoints, stakeholder positions, cultural lenses, and alternative framings. Guide them to see beyond their initial perspective and understand complexity.

Start by asking whose perspective they haven't considered yet.`;
}

module.exports = {
    name: "perspective_exploration",
    description: "Multiple viewpoint examination and perspective shifting",
    bestFor: ["perspective taking", "viewpoint analysis", "empathy development", "complex understanding"],
    generateTemplate
};