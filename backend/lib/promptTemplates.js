/**
 * New Template-Based Prompt Generation System
 * Uses Groq AI to select optimal templates for each technique
 */

const { selectAndGenerateTemplate, TEMPLATE_REGISTRY } = require('./templateSelector');

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
    "Cybersecurity Specialist": {
        background: "Cybersecurity Professional with expertise in threat analysis, penetration testing, and security architecture",
        specialties: ["threat modeling", "penetration testing", "security frameworks", "incident response", "vulnerability assessment"],
        experience: "protected critical systems for government and enterprise organizations"
    },
    "General Expert": {
        background: "Multidisciplinary Expert with broad knowledge across various fields and strong analytical skills",
        specialties: ["problem-solving", "critical thinking", "research methodology", "interdisciplinary analysis", "knowledge synthesis"],
        experience: "consulted across diverse industries and solved complex interdisciplinary challenges"
    }
};

/**
 * Generate all three techniques using AI-selected templates
 */
async function generateAllTechniquesWithTemplates(query, role) {
    console.log('🤖 Generating all techniques using AI-selected templates');
    console.log(`Query: "${query.substring(0, 50)}..."`);
    console.log(`Role: ${role}`);
    
    const roleInfo = ROLE_EXPERTISE[role] || ROLE_EXPERTISE["General Expert"];
    
    try {
        // Generate all three techniques in parallel for efficiency
        const [directResult, interactiveResult, socraticResult] = await Promise.all([
            selectAndGenerateTemplate('direct', query, role, roleInfo),
            selectAndGenerateTemplate('interactive', query, role, roleInfo),
            selectAndGenerateTemplate('socratic', query, role, roleInfo)
        ]);
        
        console.log('✅ All templates generated successfully');
        console.log(`Direct: ${directResult.content.length} chars (${directResult.templateUsed})`);
        console.log(`Interactive: ${interactiveResult.content.length} chars (${interactiveResult.templateUsed})`);
        console.log(`Socratic: ${socraticResult.content.length} chars (${socraticResult.templateUsed})`);
        
        return {
            direct: directResult.content,
            interactive: interactiveResult.content,
            socratic: socraticResult.content,
            // For backwards compatibility
            oneShot: directResult.content,
            twoShot: interactiveResult.content,
            prompt: directResult.content,
            // Metadata about templates used
            templateMetadata: {
                direct: {
                    templateUsed: directResult.templateUsed,
                    description: directResult.templateDescription
                },
                interactive: {
                    templateUsed: interactiveResult.templateUsed,
                    description: interactiveResult.templateDescription
                },
                socratic: {
                    templateUsed: socraticResult.templateUsed,
                    description: socraticResult.templateDescription
                }
            }
        };
        
    } catch (error) {
        console.error('❌ Error generating templates:', error);
        
        // Fallback to simple templates if AI selection fails
        console.log('🔄 Falling back to simple template generation');
        return generateFallbackTemplates(query, role, roleInfo);
    }
}

/**
 * Fallback template generation (simpler approach if AI fails)
 */
function generateFallbackTemplates(query, role, roleInfo) {
    console.log('🔄 Using fallback template generation');
    
    const directPrompt = `You are a ${roleInfo.background}. You have ${roleInfo.experience} and specialize in ${roleInfo.specialties.join(", ")}.

COMPREHENSIVE GUIDANCE: "${query}"

I'll provide you with detailed, immediately actionable guidance based on my professional experience.

SYSTEMATIC APPROACH:
1. Foundation: [Core requirements and preparation steps]
2. Implementation: [Step-by-step execution plan]
3. Quality Assurance: [Validation and improvement methods]
4. Optimization: [Enhancement and scaling strategies]

EXPERT RECOMMENDATIONS:
Based on my expertise in ${roleInfo.specialties[0]}, here are the critical success factors and best practices that will ensure optimal outcomes.

[Detailed implementation guidance follows...]`;

    const interactivePrompt = `You are a ${roleInfo.background} who takes a collaborative consultation approach.

CONSULTATION SESSION: "${query}"

Before providing detailed guidance, I need to understand your specific situation better.

KEY QUESTIONS:
1. What's your current experience level and available resources?
2. What are your specific objectives and success criteria?
3. What constraints and preferences should guide our approach?
4. How do you prefer to learn and implement new approaches?

Based on your responses, I'll provide customized guidance that fits your exact needs and situation.

[Collaborative guidance framework follows...]`;

    const socraticPrompt = `You are a ${roleInfo.background} who uses Socratic questioning to guide discovery.

GUIDED EXPLORATION: "${query}"

Rather than providing direct answers, I'll help you discover insights through strategic questioning.

DISCOVERY QUESTIONS:
1. What assumptions are you making about this challenge?
2. How have you successfully approached similar situations before?
3. What would change if you examined this from different perspectives?
4. What insights emerge when you think more deeply about the fundamentals?

Through this questioning process, you'll develop understanding that feels authentic and personally meaningful.

[Socratic exploration continues...]`;

    return {
        direct: directPrompt,
        interactive: interactivePrompt,
        socratic: socraticPrompt,
        templateMetadata: {
            direct: { templateUsed: "error", description: "Template generation failed" },
            interactive: { templateUsed: "error", description: "Template generation failed" },
            socratic: { templateUsed: "error", description: "Template generation failed" }
        }
    };
}

/**
 * Generate specific technique using AI-selected template
 */
async function generateTechniqueWithTemplate(technique, query, role) {
    console.log(`🎯 Generating ${technique} technique using AI-selected template`);
    
    try {
        return await selectAndGenerateTemplate(technique, query, role);
    } catch (error) {
        console.error(`❌ Error generating ${technique} template:`, error);
        throw error;
    }
}

/**
 * Get template statistics and information
 */
function getTemplateInfo() {
    const stats = {};
    
    for (const [technique, templates] of Object.entries(TEMPLATE_REGISTRY)) {
        stats[technique] = {
            count: templates.length,
            templates: templates.map(t => ({
                name: t.name,
                description: t.description,
                bestFor: t.bestFor
            }))
        };
    }
    
    return {
        roleCount: Object.keys(ROLE_EXPERTISE).length,
        templateStats: stats,
        totalTemplates: Object.values(TEMPLATE_REGISTRY).reduce((sum, templates) => sum + templates.length, 0)
    };
}

module.exports = {
    generateAllTechniquesWithTemplates,
    generateTechniqueWithTemplate,
    getTemplateInfo,
    ROLE_EXPERTISE,
    // Legacy compatibility
    generateDirectPrompt: (query, role) => generateTechniqueWithTemplate('direct', query, role),
    generateInteractivePrompt: (query, role) => generateTechniqueWithTemplate('interactive', query, role),
    generateSocraticPrompt: (query, role) => generateTechniqueWithTemplate('socratic', query, role)
};