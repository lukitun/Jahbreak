/**
 * Direct Template 10: Resource Compilation Approach
 * Comprehensive resource gathering with tools, references, and materials
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Compile comprehensive resources including essential tools, reference materials, learning sources, communities, experts to follow, and practical resources. Organize by priority and accessibility for ${roleInfo.specialties[0]}.`;
}

module.exports = {
    name: "resource_compilation",
    description: "Comprehensive resource gathering and organization",
    bestFor: ["resource discovery", "learning materials", "tool recommendations", "reference gathering"],
    generateTemplate
};