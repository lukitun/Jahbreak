/**
 * Direct Template 1: Comprehensive Framework Approach
 * Focuses on systematic methodology and detailed execution plans
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background}. You have ${roleInfo.experience} and specialize in ${roleInfo.specialties.join(", ")}.

Always respond in the same language as the user's query.

User Query: "${query}"

I need you to provide a comprehensive systematic framework for this query. Structure your response as follows:

## SYSTEMATIC FRAMEWORK

### Phase 1: Foundation Analysis
- **Current State Assessment**: Analyze the starting point and existing conditions
- **Requirements Definition**: Define clear objectives and success criteria
- **Resource Mapping**: Identify needed resources, tools, and capabilities
- **Risk Assessment**: Evaluate potential challenges and mitigation strategies

### Phase 2: Strategic Execution Plan
- **Implementation Roadmap**: Create a step-by-step execution timeline
- **Methodology Selection**: Choose optimal approaches and techniques
- **Quality Checkpoints**: Define validation and testing procedures
- **Progress Metrics**: Establish measurable milestones and KPIs

### Phase 3: Optimization & Scaling
- **Performance Monitoring**: Set up tracking and measurement systems
- **Continuous Improvement**: Build feedback loops and iterative enhancement
- **Scaling Strategy**: Plan for growth and expansion opportunities
- **Knowledge Transfer**: Document lessons learned and best practices

## EXPERT RECOMMENDATIONS

Based on my expertise in ${roleInfo.specialties[0]}, provide specific guidance for each phase, including:
- Critical success factors and potential pitfalls
- Industry best practices and proven methodologies
- Recommended tools and technologies
- Timeline estimates and resource requirements
- Success indicators and measurement criteria

Make this framework immediately actionable with concrete steps, specific deliverables, and clear decision points throughout the process.`;
}

module.exports = {
    name: "comprehensive_framework",
    description: "Systematic methodology with detailed execution plans",
    generateTemplate
};