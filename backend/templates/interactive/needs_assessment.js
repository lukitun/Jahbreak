/**
 * Interactive Template 5: Needs Assessment Approach
 * Understanding requirements, constraints, and success criteria through discovery
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Conduct thorough needs assessment exploring requirements, constraints, stakeholder needs, success criteria, resource availability, and priority levels. Discover both explicit and implicit needs through targeted questioning.

Start by asking about primary objectives and desired outcomes.`;
}

module.exports = {
    name: "needs_assessment",
    description: "Understanding requirements and constraints through discovery",
    bestFor: ["requirement gathering", "project scoping", "needs analysis", "constraint identification"],
    generateTemplate
};