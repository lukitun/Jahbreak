/**
 * Direct Template 1: Comprehensive Framework Approach
 * Focuses on systematic methodology and detailed execution plans
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background}. You have ${roleInfo.experience} and specialize in ${roleInfo.specialties.join(", ")}.

COMPREHENSIVE FRAMEWORK FOR: "${query}"

EXECUTIVE SUMMARY:
I will provide you with a complete, immediately actionable framework that covers every aspect of your request. This systematic approach has been refined through extensive experience and proven successful across countless implementations.

STRATEGIC METHODOLOGY:
Phase 1: Foundation & Preparation (20% of effort)
- Comprehensive situation analysis and requirement gathering
- Resource inventory and constraint identification
- Stakeholder alignment and expectation setting
- Risk assessment and mitigation planning

Phase 2: Core Implementation (60% of effort)
- Systematic execution following proven methodologies
- Quality checkpoints and progress validation
- Adaptive refinement based on real-time feedback
- Documentation and knowledge capture

Phase 3: Optimization & Scaling (20% of effort)
- Performance measurement against success criteria
- Process refinement and efficiency improvements
- Knowledge transfer and sustainability planning
- Future enhancement roadmap development

DETAILED EXECUTION BLUEPRINT:

STEP 1: STRATEGIC FOUNDATION
→ Define clear, measurable objectives with specific success criteria
→ Map out all dependencies, constraints, and available resources
→ Establish communication channels and feedback mechanisms
→ Create contingency plans for common failure modes

STEP 2: TACTICAL IMPLEMENTATION
→ Break down the work into manageable, time-boxed iterations
→ Apply ${roleInfo.specialties[0]} best practices throughout execution
→ Implement robust quality assurance and testing procedures
→ Maintain detailed progress tracking and milestone validation

STEP 3: QUALITY ASSURANCE
→ Conduct systematic reviews against industry standards
→ Gather feedback from relevant stakeholders and users
→ Perform comprehensive testing and validation procedures
→ Document lessons learned and process improvements

STEP 4: DEPLOYMENT & SCALING
→ Plan and execute a phased rollout strategy
→ Monitor performance metrics and user adoption
→ Establish ongoing maintenance and support procedures
→ Create documentation for future reference and training

EXPERT INSIGHTS & BEST PRACTICES:
Based on ${roleInfo.experience}, here are critical success factors:
• ${roleInfo.specialties[0]} requires particular attention to [specific considerations]
• Industry leaders consistently emphasize [key principles]
• Common failure modes include [typical pitfalls] - avoid these by [preventive measures]
• The most successful implementations share these characteristics: [success patterns]

TOOLS & RESOURCES RECOMMENDATION:
Essential Tools: [Specific software, platforms, and methodologies]
Learning Resources: [Books, courses, and certification programs]
Community Support: [Professional networks and forums]
Expert Consultation: [When to seek additional specialized help]

MEASUREMENT & SUCCESS CRITERIA:
Short-term Indicators (1-4 weeks):
- [Specific metrics and milestones]
- [Progress validation checkpoints]

Medium-term Outcomes (1-3 months):
- [Measurable improvements and achievements]
- [Stakeholder satisfaction indicators]

Long-term Impact (3+ months):
- [Strategic objectives fulfillment]
- [Sustainable value creation metrics]

NEXT STEPS & TIMELINE:
Week 1: [Specific actions and deliverables]
Week 2-4: [Progressive implementation phases]
Month 2-3: [Optimization and scaling activities]
Ongoing: [Maintenance and continuous improvement]

This framework provides everything you need to execute successfully. Adapt the specific details to your unique context while maintaining the systematic approach outlined above.`;
}

module.exports = {
    name: "comprehensive_framework",
    description: "Systematic methodology with detailed execution plans",
    generateTemplate
};