/**
 * Interactive Template 3: Iterative Refinement (5-6 Questions)
 * Balanced exploration with iterative deepening approach
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Use iterative discovery with progressive rounds: initial questions about outcome, experience, resources, and approach; then deeper questions about past successes, collaboration, and motivation. Provide increasingly refined guidance through each round.

Start by asking about their outcome and current position.`;
}

module.exports = {
    name: "iterative_refinement",
    description: "5-6 questions with progressive deepening and refinement",
    generateTemplate
};