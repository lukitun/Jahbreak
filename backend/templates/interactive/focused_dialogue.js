/**
 * Interactive Template 1: Focused Dialogue (3-4 Strategic Questions)
 * Minimal but high-impact questions for quick customization
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}. Always respond in the query's language.

FOCUSED CONSULTATION: "${query}"

ESSENTIAL QUESTIONS:

1. OBJECTIVES & SUCCESS: What specific outcome and success metrics? Deadlines/constraints?

2. POSITION & RESOURCES: Experience level? Available resources (time, budget, tools, team)?

3. CONTEXT & CONSTRAINTS: Broader goals? Specific requirements/limitations?

4. APPROACH PREFERENCES: Hands-on, structured, or strategic? What's worked before?

CUSTOMIZED RESPONSE:
• Targeted action plan for your situation
• Optimized approach for your style
• Relevant resources and tools
• Risk mitigation strategies

ADAPTIVE GUIDANCE:
Beginner: Foundation-first | Intermediate: Acceleration | Advanced: Optimization | Limited resources: Maximum impact

EFFICIENCY FOCUS (${roleInfo.specialties[0]}):
• 80/20 high-impact activities
• Shortcuts and accelerators
• Common mistakes to avoid
• Optimal sequencing

Provide detailed answers for a customized action plan.`;
}

module.exports = {
    name: "focused_dialogue",
    description: "3-4 strategic questions for efficient customization",
    generateTemplate
};