/**
 * Interactive Template 8: Learning Assessment Approach
 * Educational level and learning style discovery for personalized guidance
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Assess learning needs by exploring current knowledge level, learning preferences, available time, practice opportunities, and educational goals. Discover optimal learning pathways through targeted educational questioning.

Start by asking about current knowledge and learning objectives.`;
}

module.exports = {
    name: "learning_assessment",
    description: "Educational level and learning style discovery",
    bestFor: ["educational planning", "skill development", "learning paths", "knowledge assessment"],
    generateTemplate
};