/**
 * Direct Template 2: Expert Masterclass Approach
 * Focuses on deep expertise sharing and professional insights
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background}. Drawing from ${roleInfo.experience}, I'll share the essential knowledge and professional insights that typically take years to develop.

EXPERT MASTERCLASS: "${query}"

PROFESSIONAL CONTEXT:
As someone who has ${roleInfo.experience}, I've seen this challenge from every angle. What I'm about to share represents distilled wisdom from countless real-world implementations, both successful and failed.

CORE EXPERTISE TRANSFER:

🎯 FUNDAMENTAL PRINCIPLES
The foundational concepts that separate novices from experts:

1. PRINCIPLE OF [CORE CONCEPT 1]
   Professional Insight: In ${roleInfo.specialties[0]}, this principle is often misunderstood. The reality is...
   Real-world Application: I've seen this applied successfully when...
   Common Misconception: Many believe... but experienced practitioners know...

2. PRINCIPLE OF [CORE CONCEPT 2]
   Expert Perspective: After years in the field, I've learned that...
   Industry Secret: What they don't teach in courses is...
   Practical Wisdom: The difference between theory and practice here is...

3. PRINCIPLE OF [CORE CONCEPT 3]
   Professional Experience: In my career spanning [relevant experience]...
   Critical Success Factor: The one thing that separates success from failure...
   Hard-earned Lesson: I learned this the hard way when...

🏆 PROFESSIONAL-GRADE IMPLEMENTATION

TIER 1: FOUNDATION (Expert-Level Basics)
→ Master these fundamentals before advancing - no shortcuts exist
→ Quality standards that professionals maintain without compromise
→ The "table stakes" that separate amateur from professional work
→ Investment in proper foundation pays exponential dividends later

TIER 2: ADVANCED EXECUTION (Industry Standard)
→ Techniques that only experienced practitioners know
→ The workflows and methodologies used by top professionals
→ Quality assurance processes that ensure consistent excellence
→ Advanced troubleshooting and optimization strategies

TIER 3: MASTERY LEVEL (Expert Distinction)
→ Insights that come only from extensive real-world experience
→ The subtle nuances that distinguish true experts
→ Advanced strategies for handling complex edge cases
→ Innovation and adaptation techniques for novel challenges

💡 INSIDER KNOWLEDGE & TRADE SECRETS

What Industry Veterans Know:
• The 80/20 rule applied to ${roleInfo.specialties[0]}: Focus 80% of effort on [specific areas]
• The critical mistakes that destroy 90% of projects: [specific pitfalls]
• The "secret sauce" that top professionals use: [specific techniques]
• Why conventional advice often fails: [industry realities]

Hard-Won Professional Insights:
• After working on [types of projects], I've learned that...
• The biggest surprise for newcomers is usually...
• What looks easy from the outside is actually complex because...
• The most valuable skill isn't technical—it's [soft skill/approach]

Battle-Tested Strategies:
• When facing [common challenge], experienced professionals...
• The approach that works 95% of the time: [specific strategy]
• How to recognize when to pivot vs. persevere: [decision framework]
• Crisis management techniques that have saved countless projects

🛠️ PROFESSIONAL TOOLKIT & ARSENAL

Essential Professional Tools:
→ Primary Platform: [specific tool] - Why professionals choose this
→ Quality Assurance: [specific methods] - Industry standard practices
→ Efficiency Multipliers: [specific techniques] - What separates fast from slow
→ Collaboration Framework: [specific approach] - How teams actually work

Advanced Practitioner Resources:
→ Specialized Knowledge: [specific resources] - Where experts continue learning
→ Professional Networks: [specific communities] - Where real knowledge is shared
→ Certification Paths: [specific credentials] - What actually matters to employers
→ Continuous Learning: [specific practices] - How to stay current in a changing field

⚡ EXECUTION EXCELLENCE

PROFESSIONAL PROJECT FLOW:
1. Discovery & Scoping (Professional Standard)
   - Comprehensive stakeholder interviews and requirement gathering
   - Risk assessment using industry-standard frameworks
   - Resource planning with realistic timelines and buffer allocation

2. Design & Architecture (Expert Level)
   - Solution design following proven architectural patterns
   - Quality gates and review processes used by top teams
   - Documentation standards that enable long-term maintenance

3. Implementation & Delivery (Mastery Grade)
   - Iterative development with continuous stakeholder feedback
   - Testing and validation procedures that ensure production readiness
   - Deployment strategies that minimize risk and maximize success

4. Optimization & Growth (Strategic Level)
   - Performance monitoring and improvement methodologies
   - Scaling strategies that accommodate future growth
   - Knowledge transfer and team capability development

SUCCESS PREDICTORS:
Based on analyzing hundreds of implementations, success correlates strongly with:
• Proper foundation work (accounts for 60% of long-term success)
• Quality process adherence (reduces failure rate by 80%)
• Stakeholder engagement (improves outcome satisfaction by 90%)
• Continuous learning mindset (separates good from great professionals)

This represents the concentrated expertise typically acquired over years of professional practice. Apply these insights systematically, and you'll achieve professional-grade results from the start.`;
}

module.exports = {
    name: "expert_masterclass",
    description: "Deep expertise sharing with professional insights",
    generateTemplate
};