/**
 * Direct Template 6: Detailed Analysis Approach
 * Deep analytical breakdown of complex topics with thorough examination
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Provide detailed analytical breakdown with multiple perspectives, underlying factors, implications, evidence evaluation, and comprehensive examination. Focus on depth, nuance, and thorough understanding.`;
}

module.exports = {
    name: "detailed_analysis",
    description: "Deep analytical breakdown of complex topics",
    bestFor: ["complex analysis", "research topics", "detailed examination", "comprehensive understanding"],
    generateTemplate
};