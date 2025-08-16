/**
 * Direct Template 4: Strategic Roadmap Approach
 * Focuses on long-term vision, strategic planning, and systematic progression
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with ${roleInfo.experience}. I'll provide you with a comprehensive strategic roadmap that balances immediate execution with long-term vision and sustainable growth.

STRATEGIC ROADMAP: "${query}"

🎯 STRATEGIC VISION & OBJECTIVES

VISION STATEMENT:
Based on my expertise in ${roleInfo.specialties.join(", ")}, here's the strategic vision for your objective: [Compelling future state that this work will create, with specific value propositions and competitive advantages]

STRATEGIC OBJECTIVES:
Primary Goal: [Core objective with measurable outcomes]
Secondary Goals: [Supporting objectives that amplify the primary goal]
Strategic Alignment: [How this connects to broader organizational/personal objectives]
Competitive Advantage: [Unique value proposition and differentiation strategy]

SUCCESS METRICS & KPIs:
Leading Indicators: [Early signals of progress toward objectives]
Lagging Indicators: [Final measures of success achievement]
Quality Metrics: [Standards for excellence and professional execution]
Impact Measurements: [How success will be measured and validated]

📊 MULTI-HORIZON STRATEGIC PLANNING

HORIZON 1: FOUNDATION ESTABLISHMENT (0-3 months)
Strategic Focus: Build robust foundation for sustainable growth
• Core Capabilities: Develop [specific competencies] to professional standard
• Infrastructure: Establish [specific systems and processes] for scale
• Quality Standards: Implement [specific measures] to ensure excellence
• Stakeholder Alignment: Secure [specific commitments and resources]

Key Milestones:
→ Month 1: [Specific strategic milestone] achieved with [measurable outcome]
→ Month 2: [Next strategic milestone] demonstrating [specific capability]
→ Month 3: [Foundation completion milestone] enabling [next phase activities]

HORIZON 2: CAPABILITY EXPANSION (3-12 months)
Strategic Focus: Scale capabilities and optimize for efficiency
• Skill Development: Master [advanced competencies] in ${roleInfo.specialties[0]}
• Process Optimization: Refine [specific workflows] for maximum efficiency
• Value Creation: Generate [specific value outcomes] for stakeholders
• Market Position: Establish [specific competitive advantages]

Quarterly Objectives:
→ Q1: [Strategic objective] with [specific deliverables and metrics]
→ Q2: [Strategic objective] advancing [specific capabilities]
→ Q3: [Strategic objective] demonstrating [specific value creation]
→ Q4: [Strategic objective] positioning for [next horizon opportunities]

HORIZON 3: STRATEGIC LEADERSHIP (12+ months)
Strategic Focus: Industry leadership and innovation
• Thought Leadership: Become recognized expert in [specific domain]
• Innovation Contribution: Pioneer [specific advances] in the field
• Ecosystem Development: Build [specific networks and partnerships]
• Legacy Creation: Establish [specific lasting impact and influence]

🛠️ STRATEGIC IMPLEMENTATION FRAMEWORK

CAPABILITY DEVELOPMENT STRATEGY:
Core Competency Building:
1. ${roleInfo.specialties[0]} Mastery Path
   → Foundation: [Specific skills and knowledge to acquire]
   → Intermediate: [Advanced capabilities to develop]
   → Expert: [Leadership and innovation competencies]

2. Cross-Functional Integration
   → Adjacent Skills: [Complementary competencies to develop]
   → Systems Thinking: [Holistic understanding to cultivate]
   → Leadership Capabilities: [Influence and impact skills to build]

RESOURCE ALLOCATION STRATEGY:
Investment Priorities (Based on ROI and Strategic Impact):
• High Impact, High Effort: [Strategic initiatives requiring significant investment]
• High Impact, Low Effort: [Quick wins to pursue immediately]
• Low Impact, High Effort: [Activities to avoid or defer]
• Low Impact, Low Effort: [Maintenance activities to automate]

Time Allocation Framework:
• 40% Foundation Building: [Core capability development activities]
• 30% Value Creation: [Direct contribution and output generation]
• 20% Strategic Development: [Future capability and opportunity building]
• 10% Innovation: [Experimental and cutting-edge exploration]

🎪 RISK MANAGEMENT & CONTINGENCY PLANNING

STRATEGIC RISK ASSESSMENT:
High-Probability Risks:
• Risk: [Specific challenge likely to occur]
  → Mitigation: [Proactive measures to reduce probability]
  → Contingency: [Response plan if risk materializes]
  → Recovery: [Strategy to minimize impact and restore progress]

Medium-Probability, High-Impact Risks:
• Risk: [Significant challenge with moderate likelihood]
  → Early Warning: [Indicators to monitor for risk emergence]
  → Prevention: [Specific actions to reduce risk likelihood]
  → Response: [Rapid response protocol if risk occurs]

ADAPTABILITY FRAMEWORK:
Scenario Planning:
• Optimistic Scenario: [Best-case outcomes and acceleration opportunities]
• Realistic Scenario: [Most likely outcomes and standard progression]
• Pessimistic Scenario: [Challenging conditions and contingency plans]

Pivot Strategies:
• Market Changes: [How to adapt to external environment shifts]
• Resource Constraints: [Strategies for operating with limited resources]
• Opportunity Emergence: [Framework for capitalizing on unexpected opportunities]
• Technology Evolution: [Approach for incorporating technological advances]

🚀 EXECUTION EXCELLENCE & STRATEGIC DISCIPLINE

STRATEGIC EXECUTION PRINCIPLES:
1. Ruthless Prioritization: Focus only on activities that advance strategic objectives
2. Quality Over Speed: Maintain professional standards while optimizing for efficiency
3. Continuous Learning: Invest consistently in capability development and knowledge acquisition
4. Stakeholder Value: Ensure all activities create measurable value for key stakeholders
5. Strategic Patience: Balance short-term execution with long-term vision realization

STRATEGIC REVIEW & ADJUSTMENT CYCLE:
Monthly Strategic Reviews:
• Progress Assessment: [Specific metrics and milestone evaluation]
• Resource Optimization: [Efficiency improvements and allocation adjustments]
• Opportunity Identification: [New strategic possibilities and partnerships]
• Risk Monitoring: [Threat assessment and mitigation effectiveness]

Quarterly Strategic Planning:
• Objective Refinement: [Strategic goal adjustment based on learning and results]
• Capability Assessment: [Skill and resource gap analysis and development planning]
• Market Analysis: [Competitive landscape and opportunity evolution review]
• Vision Alignment: [Ensuring tactical execution supports strategic vision]

💡 STRATEGIC ADVANTAGES & DIFFERENTIATION

COMPETITIVE POSITIONING:
Unique Value Proposition: [Specific advantages that differentiate your approach]
Market Positioning: [Strategic positioning relative to alternatives and competitors]
Capability Moats: [Sustainable competitive advantages through superior execution]
Network Effects: [Strategic relationships and ecosystem advantages]

INNOVATION STRATEGY:
Innovation Focus Areas: [Specific domains for creative and cutting-edge work]
Experimentation Framework: [Systematic approach to testing new ideas and approaches]
Knowledge Synthesis: [Methods for combining insights from multiple domains]
Future-Proofing: [Strategies for maintaining relevance as markets evolve]

This strategic roadmap provides both immediate direction and long-term vision. Execute systematically while maintaining strategic flexibility to adapt as opportunities and challenges emerge.`;
}

module.exports = {
    name: "strategic_roadmap",
    description: "Long-term vision with strategic planning and systematic progression",
    generateTemplate
};