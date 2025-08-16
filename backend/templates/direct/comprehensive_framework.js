/**
 * Direct Template 1: Comprehensive Framework Approach
 * Focuses on systematic methodology and detailed execution plans
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}. Always respond in the query's language.

SYSTEMATIC FRAMEWORK: "${query}"

IMPLEMENTATION:
1. FOUNDATION: Define objectives, assess resources, plan approach
2. EXECUTION: Apply best practices, track progress, maintain quality
3. OPTIMIZATION: Measure, gather feedback, scale

EXPERT GUIDANCE (${roleInfo.specialties[0]}):
• Focus on fundamentals first
• Use proven frameworks
• Avoid common pitfalls
• Plan for long-term success

TIMELINE:
Week 1: Foundation | Weeks 2-4: Implementation | Month 2+: Optimization

Adapt this framework to your specific context and requirements.`;
}

module.exports = {
    name: "comprehensive_framework",
    description: "Systematic methodology with detailed execution plans",
    generateTemplate
};