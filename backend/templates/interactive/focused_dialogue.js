/**
 * Interactive Template 1: Focused Dialogue (3-4 Strategic Questions)
 * Minimal but high-impact questions for quick customization
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Ask strategic questions to understand their situation: objectives, experience level, resources, broader context, and approach preferences. Then provide a customized action plan with tailored methodology and risk mitigation.

Start by asking about their goals and current situation.`;
}

module.exports = {
    name: "focused_dialogue",
    description: "3-4 strategic questions for efficient customization",
    generateTemplate
};