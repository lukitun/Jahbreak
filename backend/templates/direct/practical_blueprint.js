/**
 * Direct Template 3: Practical Blueprint Approach
 * Focuses on hands-on, step-by-step implementation with concrete examples
 */

function generateTemplate(query, role, roleInfo) {
    return `You are a ${roleInfo.background} with extensive hands-on experience. I'll provide you with a practical, immediately implementable blueprint based on ${roleInfo.experience}.

PRACTICAL BLUEPRINT: "${query}"

🔧 HANDS-ON IMPLEMENTATION GUIDE

QUICK START CHECKLIST:
□ Immediate Prerequisites: [Specific items you need right now]
□ Environment Setup: [Exact tools and configurations required]
□ Initial Validation: [How to verify you're ready to begin]
□ First Milestone: [Concrete goal achievable in first session]

CONCRETE IMPLEMENTATION PATHWAY:

PHASE 1: RAPID SETUP (Day 1-3)
Step 1A: Initial Configuration
• Specific Action: [Exact command/process to execute]
• Expected Result: [What success looks like]
• Troubleshooting: If you see [error], do [specific fix]
• Validation: Run [specific test] to confirm completion

Step 1B: Core Foundation
• Practical Task: [Specific deliverable to create]
• Time Investment: [Realistic time estimate]
• Quality Check: [Specific criteria for "done"]
• Common Issues: Watch out for [specific problems] and solve with [specific solutions]

Step 1C: First Working Version
• Concrete Goal: Build [specific, tangible output]
• Success Criteria: [Measurable outcomes]
• Testing Method: [Specific validation steps]
• Iteration Plan: [How to improve from here]

PHASE 2: CORE DEVELOPMENT (Week 1-2)
Step 2A: Feature Implementation
• Primary Focus: [Specific functionality to build]
• Implementation Approach: [Step-by-step technical process]
• Code/Process Examples: [Concrete examples with actual syntax/procedures]
• Integration Points: [How this connects to other components]

Step 2B: Quality Enhancement
• Optimization Targets: [Specific metrics to improve]
• Enhancement Techniques: [Proven methods for improvement]
• Testing Strategy: [Specific test cases and validation methods]
• Performance Benchmarks: [Concrete targets to achieve]

Step 2C: User Experience Polish
• Usability Improvements: [Specific enhancements to implement]
• Feedback Collection: [Methods to gather user input]
• Iteration Process: [How to incorporate feedback effectively]
• Launch Preparation: [Specific steps for deployment]

PHASE 3: PRODUCTION DEPLOYMENT (Week 3-4)
Step 3A: Production Readiness
• Deployment Checklist: [Specific items to verify before launch]
• Security Review: [Concrete security measures to implement]
• Performance Validation: [Specific load and stress tests]
• Backup Procedures: [Exact backup and recovery protocols]

Step 3B: Launch Execution
• Deployment Process: [Step-by-step launch procedure]
• Monitoring Setup: [Specific metrics and alerts to configure]
• User Communication: [Exact messaging and training materials]
• Rollback Plan: [Specific steps if issues arise]

Step 3C: Post-Launch Optimization
• Performance Monitoring: [Specific KPIs to track daily]
• User Feedback Analysis: [Methods for collecting and analyzing input]
• Continuous Improvement: [Regular optimization schedule and procedures]
• Scaling Preparation: [Specific steps for handling growth]

💼 REAL-WORLD EXAMPLES & TEMPLATES

CONCRETE EXAMPLES:
Example Scenario 1: [Specific real-world situation]
• Problem: [Exact challenge faced]
• Solution: [Step-by-step resolution]
• Implementation: [Actual code/process used]
• Outcome: [Specific results achieved]

Example Scenario 2: [Different but related situation]
• Context: [Specific circumstances]
• Approach: [Detailed methodology applied]
• Execution: [Practical steps taken]
• Results: [Measurable improvements gained]

READY-TO-USE TEMPLATES:
Template 1: [Specific tool/framework name]
\`\`\`
[Actual template code/content that can be copied and used]
\`\`\`
Customization: Change [specific parameters] to match your needs
Testing: Verify by [specific validation method]

Template 2: [Different tool/framework]
\`\`\`
[Complete template with actual implementation details]
\`\`\`
Integration: Connect with [specific systems] using [exact methods]
Validation: Confirm success by [specific test procedures]

🎯 ACTIONABLE DELIVERABLES

IMMEDIATE ACTIONS (Today):
1. [Specific task] - Time: [minutes] - Output: [concrete deliverable]
2. [Specific task] - Time: [minutes] - Output: [concrete deliverable]
3. [Specific task] - Time: [minutes] - Output: [concrete deliverable]

THIS WEEK:
• Day 1: Complete [specific milestone] - Deliverable: [concrete output]
• Day 2-3: Implement [specific feature] - Deliverable: [working prototype]
• Day 4-5: Test and refine [specific component] - Deliverable: [validated version]
• Weekend: [Optional enhancement work] - Deliverable: [improved version]

WEEK 2-4:
• Week 2: [Specific development phase] → [Concrete deliverable]
• Week 3: [Specific testing phase] → [Validated product]
• Week 4: [Deployment phase] → [Live implementation]

🔍 QUALITY ASSURANCE CHECKPOINTS

Daily Validation:
• Morning: Verify [specific criteria] before starting work
• Midday: Check [specific metrics] to ensure on track
• Evening: Confirm [specific deliverables] are complete and quality

Weekly Reviews:
• Progress Assessment: [Specific measurements to evaluate]
• Quality Metrics: [Concrete standards to maintain]
• Stakeholder Feedback: [Specific input to gather and incorporate]
• Course Correction: [Decision framework for adjustments]

🚀 SUCCESS ACCELERATION

EFFICIENCY MULTIPLIERS:
• Automation: Use [specific tools] to automate [specific tasks]
• Templates: Leverage [provided templates] for [specific purposes]
• Shortcuts: Apply [specific techniques] to save [estimated time]
• Quality Gates: Implement [specific checks] to prevent [specific problems]

COMMON PITFALLS & SOLUTIONS:
Problem: [Specific issue that commonly occurs]
→ Warning Signs: [How to detect this problem early]
→ Prevention: [Specific steps to avoid the issue]
→ Solution: [Exact remedy if problem occurs]
→ Recovery: [How to get back on track quickly]

This blueprint provides everything needed for immediate implementation. Each step includes specific actions, expected outcomes, and validation methods. Begin with Phase 1, Step 1A and work systematically through the process.`;
}

module.exports = {
    name: "practical_blueprint",
    description: "Hands-on implementation with concrete examples and templates",
    generateTemplate
};