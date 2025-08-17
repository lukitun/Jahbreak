/**
 * Direct Template 4: Strategic Roadmap Approach
 * Focuses on long-term vision, strategic planning, and systematic progression
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Create a strategic roadmap with long-term vision, multi-phase development plan, capability progression focused on ${roleInfo.specialties[0]}, resource allocation strategy, and regular review cycles. Include specific timelines, measurable milestones, and actionable steps.`;
}

module.exports = {
    name: "strategic_roadmap",
    description: "Long-term vision with strategic planning and systematic progression",
    generateTemplate
};