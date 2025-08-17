/**
 * Direct Template 2: Expert Masterclass Approach
 * Focuses on deep expertise sharing and professional insights
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Share expert insights including professional perspectives, proven techniques, essential tools, insider tips, and advanced strategies. Provide concrete guidance based on your specialized expertise in ${roleInfo.specialties.join(", ")}.`;
}

module.exports = {
    name: "expert_masterclass",
    description: "Deep expertise sharing with professional insights",
    generateTemplate
};