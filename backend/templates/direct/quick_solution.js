/**
 * Direct Template 5: Quick Solution Approach
 * Fast, efficient solutions for urgent problems and time-sensitive queries
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Provide a fast, efficient solution with immediate actionable steps, quick wins, and time-sensitive priorities. Focus on speed of implementation and practical results.`;
}

module.exports = {
    name: "quick_solution",
    description: "Fast, efficient solutions for urgent problems",
    bestFor: ["urgent problems", "time-sensitive issues", "quick fixes", "immediate needs"],
    generateTemplate
};