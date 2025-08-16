/**
 * Direct Template 3: Practical Blueprint Approach
 * Focuses on hands-on, step-by-step implementation with concrete examples
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}. Always respond in the query's language.

PRACTICAL BLUEPRINT: "${query}"

QUICK START:
□ Prerequisites & setup
□ Tools & environment
□ First milestone
□ Success validation

IMPLEMENTATION:
PHASE 1 (Days 1-3): Setup & foundation
PHASE 2 (Week 1-2): Core development using ${roleInfo.specialties[0]} practices
PHASE 3 (Week 3-4): Optimization & deployment

DELIVERABLES:
Day 1: Setup | Week 1: Prototype | Week 2: Refined version | Week 3: Production-ready

QUALITY GATES:
• Daily progress checks
• Weekly feedback assessment
• Launch validation

SUCCESS ACCELERATORS:
• Use proven templates
• Apply automation
• Implement quality gates
• Follow best practices

Adapt to your specific context, timeline, and requirements.`;
}

module.exports = {
    name: "practical_blueprint",
    description: "Hands-on implementation with concrete examples and templates",
    generateTemplate
};