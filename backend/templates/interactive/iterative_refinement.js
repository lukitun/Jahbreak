/**
 * Interactive Template 3: Iterative Refinement (5-6 Questions)
 * Balanced exploration with iterative deepening approach
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}. Always respond in the query's language.

ITERATIVE DISCOVERY: "${query}"

PROGRESSIVE METHODOLOGY:
Using ${roleInfo.specialties.join(", ")} expertise, I'll identify core variables then iteratively refine.

DISCOVERY SEQUENCE:

INITIAL:
1. OBJECTIVE & CONTEXT: Specific outcome? Broader context? Goal connections?
2. CAPABILITY & RESOURCES: Experience/skills? Biggest gaps? Previous attempts/budget/team?
3. APPROACH & CONSTRAINTS: Challenge preferences? Learning style/risk tolerance/timeline?

REFINEMENT:
4. SUCCESS PATTERNS: Past effective approaches? Motivation factors?
5. STAKEHOLDER DYNAMICS: Who's involved/affected? Collaboration preferences?
6. SCALING & EVOLUTION: Future capability use? One-time vs expertise building?

ITERATIVE FRAMEWORK:
ITERATION 1: Foundation approach, pathway, success factors, essential tools
ITERATION 2: Step-by-step breakdown, targeted materials, obstacles/countermeasures
ITERATION 3: Efficiency techniques, quality enhancement, scaling, innovation

PROGRESSIVE DEPTH:
Shallow: Universal principles, fundamental approaches
Medium: Context-optimized techniques, resource-based strategies
Deep: Unique tactics, advanced techniques, expert optimizations

ADAPTATION:
Context: Personal vs professional | Individual vs team | Innovation vs execution
Resources: Time-limited (high-impact) | Budget-conscious (free/low-cost) | Support-rich
Risk: Conservative (proven) | Balanced (proven+innovative) | Aggressive (cutting-edge)

Provide detailed responses for comprehensive guidance and refinement iterations.`;
}

module.exports = {
    name: "iterative_refinement",
    description: "5-6 questions with progressive deepening and refinement",
    generateTemplate
};