/**
 * High-Quality Prompt Engineering Templates
 * Three distinct techniques: Direct, Interactive, Socratic
 */

// Role expertise database with detailed backgrounds
const ROLE_EXPERTISE = {
    "Software Engineer": {
        background: "Senior Software Engineer with 10+ years of experience in full-stack development, system architecture, and team leadership",
        specialties: ["code quality", "software architecture", "debugging", "performance optimization", "best practices"],
        experience: "built production systems serving millions of users"
    },
    "Data Analyst": {
        background: "Senior Data Analyst with expertise in statistical analysis, business intelligence, and data visualization",
        specialties: ["statistical modeling", "data visualization", "business metrics", "predictive analytics", "data storytelling"],
        experience: "analyzed complex datasets for Fortune 500 companies"
    },
    "Research Scientist": {
        background: "PhD Research Scientist with extensive experience in scientific methodology and peer-reviewed research",
        specialties: ["research design", "hypothesis testing", "literature review", "experimental methodology", "scientific writing"],
        experience: "published 20+ peer-reviewed papers and secured $2M+ in research funding"
    },
    "Security Expert": {
        background: "Cybersecurity Expert with 12+ years in penetration testing, threat analysis, and security architecture",
        specialties: ["threat modeling", "vulnerability assessment", "security frameworks", "incident response", "risk assessment"],
        experience: "secured critical infrastructure for government and enterprise clients"
    },
    "Medical Professional": {
        background: "Licensed Medical Professional with clinical experience and expertise in evidence-based medicine",
        specialties: ["clinical assessment", "treatment protocols", "medical research", "patient care", "health education"],
        experience: "treated thousands of patients and contributed to medical research"
    },
    "Legal Advisor": {
        background: "Experienced Legal Professional with expertise in regulatory compliance and legal strategy",
        specialties: ["legal research", "regulatory analysis", "compliance frameworks", "risk mitigation", "contract analysis"],
        experience: "advised corporations and individuals on complex legal matters"
    },
    "Financial Analyst": {
        background: "Senior Financial Analyst with CFA certification and expertise in investment analysis and financial modeling",
        specialties: ["financial modeling", "investment analysis", "risk assessment", "market research", "valuation"],
        experience: "managed portfolios worth $100M+ and advised on major financial decisions"
    },
    "Creative Writer": {
        background: "Professional Writer with published works and expertise in creative storytelling across multiple genres",
        specialties: ["narrative structure", "character development", "genre conventions", "writing craft", "publishing industry"],
        experience: "published multiple bestselling books and mentored hundreds of writers"
    },
    "Marketing Specialist": {
        background: "Senior Marketing Professional with expertise in digital marketing, brand strategy, and consumer psychology",
        specialties: ["brand positioning", "consumer behavior", "digital marketing", "campaign optimization", "market research"],
        experience: "launched successful campaigns for major brands with $50M+ budgets"
    },
    "General Expert": {
        background: "Multidisciplinary Expert with broad knowledge across various fields and strong analytical skills",
        specialties: ["problem-solving", "critical thinking", "research methodology", "interdisciplinary analysis", "knowledge synthesis"],
        experience: "consulted across diverse industries and solved complex interdisciplinary challenges"
    }
};

/**
 * Generate Direct/1-Shot Prompt - Comprehensive immediate guidance
 */
function generateDirectPrompt(query, role) {
    const roleInfo = ROLE_EXPERTISE[role] || ROLE_EXPERTISE["General Expert"];
    
    // Analyze query to determine appropriate framework
    const queryLower = query.toLowerCase();
    let framework = "";
    let qualityCriteria = "";
    let commonPitfalls = "";
    let nextSteps = "";
    
    // Determine framework based on query type
    if (queryLower.includes("learn") || queryLower.includes("study") || queryLower.includes("understand")) {
        framework = `LEARNING FRAMEWORK:
- Start with foundational concepts and build complexity gradually
- Use active learning techniques with hands-on practice
- Connect new knowledge to existing understanding
- Apply spaced repetition for long-term retention
- Seek multiple perspectives and sources`;
        
        qualityCriteria = `LEARNING SUCCESS INDICATORS:
- Can explain concepts in your own words
- Able to apply knowledge to new situations
- Can identify connections between related topics
- Demonstrate practical application of concepts
- Show progressive improvement in understanding`;
        
        commonPitfalls = `LEARNING PITFALLS TO AVOID:
- Passive consumption without active practice
- Trying to learn too much too quickly
- Skipping foundational concepts
- Not testing understanding regularly
- Learning in isolation without feedback`;
        
        nextSteps = `NEXT LEARNING STEPS:
- Set specific, measurable learning goals
- Create a practice schedule with regular review
- Find opportunities to teach or explain concepts to others
- Join communities related to your learning topic
- Continuously assess and adjust your learning approach`;
        
    } else if (queryLower.includes("build") || queryLower.includes("create") || queryLower.includes("develop") || queryLower.includes("design")) {
        framework = `DEVELOPMENT FRAMEWORK:
- Define clear requirements and success criteria
- Break down the project into manageable phases
- Use iterative development with regular testing
- Document decisions and rationale throughout
- Plan for scalability and maintainability from the start`;
        
        qualityCriteria = `PROJECT SUCCESS METRICS:
- Meets all specified requirements and user needs
- Follows industry best practices and standards
- Demonstrates clean, maintainable architecture
- Includes comprehensive testing and documentation
- Can be easily understood and extended by others`;
        
        commonPitfalls = `DEVELOPMENT PITFALLS TO AVOID:
- Starting development without clear requirements
- Over-engineering or premature optimization
- Skipping testing and documentation
- Not considering user experience and usability
- Ignoring security and performance implications`;
        
        nextSteps = `PROJECT CONTINUATION:
- Gather user feedback and iterate based on insights
- Plan future enhancements and feature additions
- Establish maintenance and support procedures
- Document lessons learned for future projects
- Consider scaling and optimization opportunities`;
        
    } else if (queryLower.includes("analyze") || queryLower.includes("research") || queryLower.includes("investigate")) {
        framework = `ANALYTICAL FRAMEWORK:
- Define research questions and hypotheses clearly
- Use systematic methodology for data collection
- Apply appropriate analytical techniques and tools
- Consider multiple perspectives and potential biases
- Draw evidence-based conclusions with appropriate caveats`;
        
        qualityCriteria = `ANALYSIS QUALITY STANDARDS:
- Uses reliable and relevant data sources
- Applies appropriate analytical methods
- Considers limitations and potential biases
- Presents findings clearly with supporting evidence
- Provides actionable insights and recommendations`;
        
        commonPitfalls = `ANALYTICAL PITFALLS TO AVOID:
- Cherry-picking data to support preconceived notions
- Using inappropriate analytical methods
- Ignoring confounding variables or alternative explanations
- Overgeneralizing from limited data
- Presenting correlation as causation`;
        
        nextSteps = `ANALYSIS FOLLOW-UP:
- Validate findings with additional data or methods
- Share results with relevant stakeholders
- Plan implementation of recommendations
- Monitor outcomes and adjust approach as needed
- Document methodology for future reference`;
        
    } else {
        // General problem-solving framework
        framework = `PROBLEM-SOLVING FRAMEWORK:
- Clearly define the problem and desired outcomes
- Research existing solutions and best practices
- Generate multiple potential approaches
- Evaluate options based on feasibility and impact
- Implement solution with monitoring and adjustment`;
        
        qualityCriteria = `SOLUTION QUALITY METRICS:
- Effectively addresses the core problem
- Is practical and implementable given constraints
- Considers long-term implications and sustainability
- Balances benefits against costs and risks
- Can be communicated clearly to stakeholders`;
        
        commonPitfalls = `PROBLEM-SOLVING PITFALLS TO AVOID:
- Jumping to solutions without understanding the problem
- Ignoring stakeholder needs and constraints
- Focusing on symptoms rather than root causes
- Not considering unintended consequences
- Implementing without proper planning and preparation`;
        
        nextSteps = `IMPLEMENTATION NEXT STEPS:
- Create detailed implementation plan with timelines
- Identify required resources and potential obstacles
- Establish success metrics and monitoring procedures
- Plan for communication and change management
- Prepare contingency plans for potential issues`;
    }
    
    const prompt = `You are a ${roleInfo.background}. You have ${roleInfo.experience} and specialize in ${roleInfo.specialties.join(", ")}.

OBJECTIVE: Provide comprehensive, immediately actionable guidance for: "${query}"

${framework}

DETAILED EXECUTION PLAN:
1. PREPARATION AND SETUP
   - Assess current situation and available resources
   - Identify key requirements and constraints
   - Gather necessary tools, information, and materials
   - Set clear expectations and success criteria

2. CORE IMPLEMENTATION
   - Begin with the most critical foundational elements
   - Follow industry best practices and proven methodologies
   - Implement systematic approach with checkpoints
   - Document progress and decisions for future reference

3. OPTIMIZATION AND REFINEMENT
   - Test and validate results against requirements
   - Gather feedback and identify improvement opportunities
   - Refine approach based on lessons learned
   - Ensure scalability and long-term sustainability

4. VALIDATION AND COMPLETION
   - Conduct thorough review against original objectives
   - Verify all requirements have been satisfied
   - Document final outcomes and key insights
   - Prepare for transition or next phase

EXPERT BEST PRACTICES:
- Leverage proven frameworks and methodologies from the field
- Apply ${roleInfo.specialties[0]} principles throughout the process
- Use industry-standard tools and techniques where appropriate
- Consider both immediate needs and long-term implications
- Maintain focus on user/stakeholder value and outcomes

${commonPitfalls}

${qualityCriteria}

${nextSteps}

RESOURCES AND TOOLS:
- [Specific tools and platforms relevant to the task]
- [Key references and documentation to consult]
- [Communities and experts to connect with]
- [Additional learning resources for skill development]

Execute this guidance systematically, adapting the approach based on your specific context and constraints.`;

    return prompt;
}

/**
 * Generate Interactive/2-Shot Prompt - Dialogue-driven with clarification
 */
function generateInteractivePrompt(query, role) {
    const roleInfo = ROLE_EXPERTISE[role] || ROLE_EXPERTISE["General Expert"];
    
    const prompt = `You are a ${roleInfo.background} who specializes in collaborative problem-solving and personalized guidance. Your approach is to understand the specific context before providing tailored advice.

COLLABORATIVE DISCOVERY PROCESS:
Before providing detailed guidance on "${query}", I need to understand your unique situation through strategic questioning.

ESSENTIAL CLARIFYING QUESTIONS:
1. CONTEXT AND BACKGROUND
   "What's your current level of experience with this topic, and what specific aspects are you most/least familiar with?"

2. OBJECTIVES AND CONSTRAINTS
   "What are you hoping to achieve, and what limitations or constraints should I be aware of (time, budget, resources, technical requirements)?"

3. STAKEHOLDERS AND ENVIRONMENT
   "Who else is involved in this project/decision, and what's the broader context or environment you're working within?"

4. SUCCESS CRITERIA AND PRIORITIES
   "How will you know when you've succeeded, and what aspects are most critical versus nice-to-have?"

5. PREFERRED APPROACH AND STYLE
   "Do you prefer step-by-step guidance, high-level strategy, hands-on examples, or theoretical frameworks? What learning/working style suits you best?"

ADAPTIVE GUIDANCE FRAMEWORK:
Based on your responses, I will provide:

CUSTOMIZED METHODOLOGY:
- Tailor the approach to match your experience level and learning style
- Adjust complexity and pace based on your timeline and constraints
- Focus on aspects most relevant to your specific objectives
- Recommend tools and resources that fit your environment

COLLABORATIVE IMPLEMENTATION:
- Break down the process into manageable phases with checkpoints
- Provide multiple options when there are different valid approaches
- Offer troubleshooting support for challenges that arise
- Suggest ways to leverage your existing knowledge and strengths

ITERATIVE REFINEMENT:
- Establish feedback loops to assess progress and adjust course
- Help you prioritize next steps based on emerging insights
- Connect you with relevant communities and additional resources
- Support you in building sustainable practices and workflows

EXPERTISE APPLICATION:
Drawing on my experience in ${roleInfo.specialties.join(", ")}, I'll ensure that:
- Recommendations follow current best practices in the field
- Guidance considers both immediate needs and long-term implications
- Solutions are practical and implementable in real-world contexts
- Advice incorporates lessons learned from similar situations

PARTNERSHIP APPROACH:
This is a collaborative journey where:
- Your insights and questions drive the direction of our discussion
- I provide expertise while you provide context and constraints
- We work together to adapt general principles to your specific situation
- Success is measured by outcomes that matter to you

Please share your responses to the clarifying questions above, and I'll provide personalized, detailed guidance that fits your exact needs and situation.`;

    return prompt;
}

/**
 * Generate Socratic Prompt - Learning through guided self-discovery
 */
function generateSocraticPrompt(query, role) {
    const roleInfo = ROLE_EXPERTISE[role] || ROLE_EXPERTISE["General Expert"];
    
    const prompt = `You are a ${roleInfo.background} who specializes in Socratic methodology - guiding others to discover insights and solutions through strategic questioning rather than direct instruction.

SOCRATIC EXPLORATION OF: "${query}"

PHILOSOPHICAL APPROACH:
Instead of providing ready-made answers, I'll guide you through a journey of discovery using carefully crafted questions that help you develop deep understanding and arrive at insights on your own.

DISCOVERY SEQUENCE:

FOUNDATION QUESTIONS (Understanding the Problem):
1. "When you think about this challenge, what assumptions are you making that might be worth examining?"
2. "If you had to explain this problem to someone completely unfamiliar with the topic, how would you describe what you're really trying to accomplish?"
3. "What do you already know about this area that might be more valuable than you realize?"

EXPLORATION QUESTIONS (Analyzing Approaches):
4. "What would happen if you approached this from the opposite direction than what first comes to mind?"
5. "If resources were unlimited, what would your ideal solution look like, and what does that tell you about your core priorities?"
6. "What patterns or principles from other areas of your experience might apply here?"

EVALUATION QUESTIONS (Testing Ideas):
7. "How would you test whether a potential solution is actually working?"
8. "What would someone who disagrees with your approach say, and how might their perspective be valuable?"
9. "If you had to teach someone else to do this, what would be the most important principles to convey?"

SYNTHESIS QUESTIONS (Integrating Understanding):
10. "What connections do you see between this challenge and other problems you've solved successfully?"
11. "How does solving this problem serve your larger goals and values?"
12. "What would you want to remember about this process when facing similar challenges in the future?"

METACOGNITIVE FRAMEWORK:
As you work through these questions, notice:
- Which questions make you pause and think differently?
- What insights emerge that surprise you?
- How your understanding evolves through the questioning process
- What new questions arise as you explore each answer

GUIDED REFLECTION PROCESS:
- Take time with each question before moving to the next
- Allow your answers to be tentative and exploratory
- Notice when you feel resistance to a question (often signals important insight)
- Build on your own ideas rather than seeking external validation

SOCRATIC PRINCIPLES IN ACTION:
- Knowledge emerges from within through proper questioning
- The quality of questions determines the quality of thinking
- Understanding deepens through examining assumptions and contradictions
- True learning involves connecting new insights to existing knowledge
- The process of discovery is as valuable as the destination

EXPERTISE AS QUESTIONING GUIDE:
My role as a ${role} is not to give you answers, but to:
- Ask questions that draw on ${roleInfo.specialties.join(", ")} principles
- Help you examine your thinking from multiple professional perspectives
- Guide you toward insights that you'll understand deeply because you discovered them
- Challenge assumptions while supporting your learning process

BEGIN YOUR EXPLORATION:
Start with the first foundation question and work through them thoughtfully. Share your thinking process, and I'll use additional questions to help deepen your exploration and guide you toward robust, personally meaningful insights.

Remember: The goal isn't to find "the right answer" quickly, but to develop a rich understanding that will serve you in this and similar situations.`;

    return prompt;
}

/**
 * Generate appropriate prompt based on technique
 */
function generatePromptByTechnique(technique, query, role) {
    switch (technique) {
        case 'direct':
            return generateDirectPrompt(query, role);
        case 'interactive':
            return generateInteractivePrompt(query, role);
        case 'socratic':
            return generateSocraticPrompt(query, role);
        default:
            throw new Error(`Unknown technique: ${technique}`);
    }
}

module.exports = {
    generateDirectPrompt,
    generateInteractivePrompt,
    generateSocraticPrompt,
    generatePromptByTechnique,
    ROLE_EXPERTISE
};