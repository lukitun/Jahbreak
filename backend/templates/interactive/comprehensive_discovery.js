/**
 * Interactive Template 2: Comprehensive Discovery (7-9 Questions)
 * Thorough exploration for complex, multi-faceted guidance
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Conduct comprehensive discovery through 7-9 detailed questions covering objectives, current state, resources, context, experience, preferences, learning style, success patterns, and future vision. Then provide multi-layered response with strategic methodology, action plans, and adaptive strategies.

Start by asking about their objectives.`;
}

module.exports = {
    name: "comprehensive_discovery",
    description: "7-9 questions for thorough, multi-dimensional exploration",
    generateTemplate
};