/**
 * Direct Template 9: Best Practices Guide Approach
 * Industry standards, proven methods, and optimal approaches compilation
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Share industry best practices, proven methodologies, quality standards, common pitfalls to avoid, and optimization techniques. Focus on established excellence and professional standards in ${roleInfo.specialties[0]}.`;
}

module.exports = {
    name: "best_practices_guide",
    description: "Industry standards and proven methodologies",
    bestFor: ["professional standards", "quality improvement", "optimization", "industry guidelines"],
    generateTemplate
};