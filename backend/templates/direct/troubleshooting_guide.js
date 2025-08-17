/**
 * Direct Template 8: Troubleshooting Guide Approach
 * Problem diagnosis and systematic resolution methodology
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Provide systematic troubleshooting methodology with problem diagnosis, root cause identification, solution pathways, testing procedures, and prevention strategies. Focus on methodical problem resolution.`;
}

module.exports = {
    name: "troubleshooting_guide",
    description: "Systematic problem diagnosis and resolution",
    bestFor: ["technical problems", "debugging", "error resolution", "system issues"],
    generateTemplate
};