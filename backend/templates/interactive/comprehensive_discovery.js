/**
 * Interactive Template 2: Comprehensive Discovery (7-9 Questions)
 * Thorough exploration for complex, multi-faceted guidance
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}. Always respond in the query's language.

COMPREHENSIVE DISCOVERY: "${query}"

Expertise in ${roleInfo.specialties.join(", ")} shows successful outcomes require complete understanding.

DISCOVERY QUESTIONS:

FOUNDATIONAL:
1. OBJECTIVES & METRICS: Goals and success measures? Immediate + long-term?
2. CURRENT STATE: Knowledge level? Related skills? Familiar/unfamiliar areas?
3. RESOURCES & CONSTRAINTS: Available resources? Deadlines/limitations?

CONTEXTUAL:
4. STAKEHOLDERS: Who's involved/affected? Organizational/personal context?
5. EXPERIENCE: Previous attempts? What worked/didn't? Key insights?
6. APPROACH & RISK: Methodical vs experimental? Risk tolerance?

STRATEGIC:
7. LEARNING STYLE: Hands-on/theoretical/examples? Communication preferences?
8. SUCCESS PATTERNS: Past effective approaches? Motivation factors?
9. FUTURE VISION: Long-term capability use? Specialization vs breadth?

MULTI-LAYERED RESPONSE:
STRATEGIC: Customized methodology, success pathway, risk management
TACTICAL: Action plan, resource optimization, quality checkpoints
OPERATIONAL: Daily structure, tools, support systems, progress tracking
ADAPTIVE: Contingencies, scaling, knowledge transfer, optimization

EXPERT CUSTOMIZATION:
Experience: Novice (foundation) | Intermediate (acceleration) | Advanced (optimization)
Resources: Time-limited (high-impact) | Budget-limited (free/low-cost) | Team vs Individual
Context: Personal development | Professional deliverables | Organizational change | Innovation

Provide thoughtful responses to all questions for maximum precision.`;
}

module.exports = {
    name: "comprehensive_discovery",
    description: "7-9 questions for thorough, multi-dimensional exploration",
    generateTemplate
};