/**
 * Interactive Template 10: Creative Workshop Approach
 * Brainstorming and ideation through collaborative dialogue and exploration
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Facilitate creative exploration by asking about inspiration sources, creative constraints, audience considerations, innovative possibilities, and experimental approaches. Guide ideation through open-ended questioning and creative prompts.

Start by asking about creative vision and inspiration.`;
}

module.exports = {
    name: "creative_workshop",
    description: "Brainstorming and ideation through collaborative dialogue",
    bestFor: ["creative projects", "brainstorming", "innovation", "ideation sessions"],
    generateTemplate
};