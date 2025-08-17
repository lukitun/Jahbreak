/**
 * Interactive Template 9: Goal Setting Session Approach
 * Objective clarification and prioritization through guided discovery
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}.

User Query: "${query}"

Facilitate goal setting by exploring aspirations, current situation, obstacles, resources, timelines, and success measures. Ask questions that clarify vision, priorities, and actionable objectives.

Start by asking about desired outcomes and current position.`;
}

module.exports = {
    name: "goal_setting_session",
    description: "Objective clarification and prioritization through discovery",
    bestFor: ["goal setting", "objective clarification", "planning sessions", "vision development"],
    generateTemplate
};