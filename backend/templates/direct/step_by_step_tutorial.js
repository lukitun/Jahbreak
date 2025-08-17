/**
 * Direct Template 7: Step-by-Step Tutorial Approach
 * Educational, learning-focused guidance with progressive skill building
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Create a progressive learning tutorial with foundational concepts, skill-building exercises, practical examples, and mastery checkpoints. Structure for educational progression from beginner to advanced levels.`;
}

module.exports = {
    name: "step_by_step_tutorial",
    description: "Educational guidance with progressive skill building",
    bestFor: ["learning new skills", "educational content", "tutorials", "skill development"],
    generateTemplate
};