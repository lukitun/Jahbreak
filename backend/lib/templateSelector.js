/**
 * Groq-powered Template Selection System
 * Uses AI to analyze queries and select the best template for each technique
 */

const path = require('path');

// Template registry with metadata
const TEMPLATE_REGISTRY = {
    direct: [
        {
            name: "comprehensive_framework",
            path: path.join(__dirname, '../templates/direct/comprehensive_framework.js'),
            description: "Systematic methodology with detailed execution plans",
            bestFor: ["complex projects", "systematic implementation", "methodology-focused", "step-by-step guidance"],
            keywords: ["framework", "methodology", "systematic", "process", "implementation", "plan"]
        },
        {
            name: "expert_masterclass",
            path: path.join(__dirname, '../templates/direct/expert_masterclass.js'),
            description: "Deep expertise sharing with professional insights",
            bestFor: ["skill development", "professional growth", "industry knowledge", "expert insights"],
            keywords: ["learn", "expert", "professional", "mastery", "industry", "insights", "skills"]
        },
        {
            name: "practical_blueprint",
            path: path.join(__dirname, '../templates/direct/practical_blueprint.js'),
            description: "Hands-on implementation with concrete examples and templates",
            bestFor: ["hands-on learning", "immediate implementation", "practical guidance", "examples"],
            keywords: ["build", "create", "practical", "hands-on", "examples", "implement", "blueprint"]
        },
        {
            name: "strategic_roadmap",
            path: path.join(__dirname, '../templates/direct/strategic_roadmap.js'),
            description: "Long-term vision with strategic planning and systematic progression",
            bestFor: ["long-term planning", "strategic thinking", "vision development", "scaling"],
            keywords: ["strategy", "long-term", "vision", "roadmap", "planning", "scale", "future"]
        },
        {
            name: "quick_solution",
            path: path.join(__dirname, '../templates/direct/quick_solution.js'),
            description: "Fast, efficient solutions for urgent problems",
            bestFor: ["urgent problems", "time-sensitive issues", "quick fixes", "immediate needs"],
            keywords: ["quick", "fast", "urgent", "immediate", "emergency", "solution", "fix"]
        },
        {
            name: "detailed_analysis",
            path: path.join(__dirname, '../templates/direct/detailed_analysis.js'),
            description: "Deep analytical breakdown of complex topics",
            bestFor: ["complex analysis", "research topics", "detailed examination", "comprehensive understanding"],
            keywords: ["analysis", "research", "detailed", "deep", "examine", "understand", "breakdown"]
        },
        {
            name: "step_by_step_tutorial",
            path: path.join(__dirname, '../templates/direct/step_by_step_tutorial.js'),
            description: "Educational guidance with progressive skill building",
            bestFor: ["learning new skills", "educational content", "tutorials", "skill development"],
            keywords: ["tutorial", "learn", "teach", "education", "skill", "training", "guide"]
        },
        {
            name: "troubleshooting_guide",
            path: path.join(__dirname, '../templates/direct/troubleshooting_guide.js'),
            description: "Systematic problem diagnosis and resolution",
            bestFor: ["technical problems", "debugging", "error resolution", "system issues"],
            keywords: ["troubleshoot", "debug", "error", "problem", "fix", "diagnose", "resolve"]
        },
        {
            name: "best_practices_guide",
            path: path.join(__dirname, '../templates/direct/best_practices_guide.js'),
            description: "Industry standards and proven methodologies",
            bestFor: ["professional standards", "quality improvement", "optimization", "industry guidelines"],
            keywords: ["best", "practices", "standards", "quality", "optimize", "industry", "proven"]
        },
        {
            name: "resource_compilation",
            path: path.join(__dirname, '../templates/direct/resource_compilation.js'),
            description: "Comprehensive resource gathering and organization",
            bestFor: ["resource discovery", "learning materials", "tool recommendations", "reference gathering"],
            keywords: ["resources", "tools", "materials", "references", "collection", "list", "compilation"]
        },
        {
            name: "implementation_checklist",
            path: path.join(__dirname, '../templates/direct/implementation_checklist.js'),
            description: "Systematic execution planning with detailed checklists",
            bestFor: ["project execution", "systematic implementation", "process management", "quality control"],
            keywords: ["checklist", "implementation", "execution", "process", "steps", "workflow", "management"]
        }
    ],
    interactive: [
        {
            name: "focused_dialogue",
            path: path.join(__dirname, '../templates/interactive/focused_dialogue.js'),
            description: "3-4 strategic questions for efficient customization",
            bestFor: ["quick clarification", "focused consultation", "time-constrained", "specific needs"],
            keywords: ["quick", "focused", "specific", "targeted", "efficient", "clarification"]
        },
        {
            name: "comprehensive_discovery",
            path: path.join(__dirname, '../templates/interactive/comprehensive_discovery.js'),
            description: "7-9 questions for thorough, multi-dimensional exploration",
            bestFor: ["complex situations", "thorough understanding", "multi-faceted problems", "comprehensive planning"],
            keywords: ["complex", "comprehensive", "thorough", "detailed", "multi-dimensional", "exploration"]
        },
        {
            name: "iterative_refinement",
            path: path.join(__dirname, '../templates/interactive/iterative_refinement.js'),
            description: "5-6 questions with progressive deepening and refinement",
            bestFor: ["collaborative approach", "progressive understanding", "iterative development", "balanced exploration"],
            keywords: ["iterative", "progressive", "collaborative", "refinement", "balanced", "evolution"]
        },
        {
            name: "diagnostic_interview",
            path: path.join(__dirname, '../templates/interactive/diagnostic_interview.js'),
            description: "Problem identification through systematic questioning",
            bestFor: ["problem diagnosis", "root cause analysis", "troubleshooting", "issue identification"],
            keywords: ["diagnose", "problem", "interview", "identify", "symptoms", "cause", "troubleshoot"]
        },
        {
            name: "needs_assessment",
            path: path.join(__dirname, '../templates/interactive/needs_assessment.js'),
            description: "Understanding requirements and constraints through discovery",
            bestFor: ["requirement gathering", "project scoping", "needs analysis", "constraint identification"],
            keywords: ["needs", "requirements", "assessment", "constraints", "scope", "analysis", "discovery"]
        },
        {
            name: "collaborative_planning",
            path: path.join(__dirname, '../templates/interactive/collaborative_planning.js'),
            description: "Group-oriented planning with stakeholder consideration",
            bestFor: ["team planning", "stakeholder alignment", "group projects", "collaborative initiatives"],
            keywords: ["collaborate", "team", "group", "stakeholder", "planning", "alignment", "together"]
        },
        {
            name: "decision_framework",
            path: path.join(__dirname, '../templates/interactive/decision_framework.js'),
            description: "Choice evaluation through structured questioning",
            bestFor: ["decision making", "option evaluation", "choice analysis", "strategic decisions"],
            keywords: ["decision", "choice", "evaluate", "options", "choose", "select", "compare"]
        },
        {
            name: "learning_assessment",
            path: path.join(__dirname, '../templates/interactive/learning_assessment.js'),
            description: "Educational level and learning style discovery",
            bestFor: ["educational planning", "skill development", "learning paths", "knowledge assessment"],
            keywords: ["learning", "education", "assessment", "skill", "knowledge", "development", "training"]
        },
        {
            name: "goal_setting_session",
            path: path.join(__dirname, '../templates/interactive/goal_setting_session.js'),
            description: "Objective clarification and prioritization through discovery",
            bestFor: ["goal setting", "objective clarification", "planning sessions", "vision development"],
            keywords: ["goal", "objective", "vision", "target", "aim", "purpose", "planning"]
        },
        {
            name: "creative_workshop",
            path: path.join(__dirname, '../templates/interactive/creative_workshop.js'),
            description: "Brainstorming and ideation through collaborative dialogue",
            bestFor: ["creative projects", "brainstorming", "innovation", "ideation sessions"],
            keywords: ["creative", "brainstorm", "ideation", "innovation", "ideas", "workshop", "generate"]
        }
    ],
    socratic: [
        {
            name: "guided_inquiry",
            path: path.join(__dirname, '../templates/socratic/guided_inquiry.js'),
            description: "Classical Socratic method with guided self-discovery",
            bestFor: ["self-discovery", "philosophical exploration", "assumption challenging", "classical learning"],
            keywords: ["discover", "explore", "assumptions", "inquiry", "self-discovery", "questioning"]
        },
        {
            name: "critical_thinking",
            path: path.join(__dirname, '../templates/socratic/critical_thinking.js'),
            description: "Develops analytical and evaluative thinking skills",
            bestFor: ["analytical thinking", "problem analysis", "critical evaluation", "logical reasoning"],
            keywords: ["analyze", "critical", "thinking", "evaluate", "logic", "reasoning", "analytical"]
        },
        {
            name: "reflective_learning",
            path: path.join(__dirname, '../templates/socratic/reflective_learning.js'),
            description: "Personal growth and deep understanding through reflection",
            bestFor: ["personal development", "self-awareness", "growth mindset", "reflective learning"],
            keywords: ["growth", "personal", "reflection", "development", "learning", "self-awareness", "mindset"]
        },
        {
            name: "assumption_challenging",
            path: path.join(__dirname, '../templates/socratic/assumption_challenging.js'),
            description: "Questioning underlying beliefs and assumptions",
            bestFor: ["belief examination", "assumption testing", "critical thinking", "perspective shifting"],
            keywords: ["assumptions", "beliefs", "challenge", "question", "examine", "test", "perspective"]
        },
        {
            name: "root_cause_analysis",
            path: path.join(__dirname, '../templates/socratic/root_cause_analysis.js'),
            description: "Deep exploration of fundamental causes",
            bestFor: ["problem analysis", "system thinking", "cause identification", "deep investigation"],
            keywords: ["root", "cause", "why", "deep", "fundamental", "analysis", "investigation"]
        },
        {
            name: "perspective_exploration",
            path: path.join(__dirname, '../templates/socratic/perspective_exploration.js'),
            description: "Multiple viewpoint examination and perspective shifting",
            bestFor: ["perspective taking", "viewpoint analysis", "empathy development", "complex understanding"],
            keywords: ["perspective", "viewpoint", "multiple", "explore", "empathy", "understanding", "different"]
        },
        {
            name: "value_discovery",
            path: path.join(__dirname, '../templates/socratic/value_discovery.js'),
            description: "Understanding core values and motivations",
            bestFor: ["value clarification", "motivation discovery", "purpose exploration", "meaning-making"],
            keywords: ["values", "motivation", "purpose", "meaning", "important", "matters", "core"]
        },
        {
            name: "wisdom_extraction",
            path: path.join(__dirname, '../templates/socratic/wisdom_extraction.js'),
            description: "Drawing insights and wisdom from experience",
            bestFor: ["experience reflection", "wisdom development", "insight extraction", "learning integration"],
            keywords: ["wisdom", "experience", "insights", "lessons", "learned", "knowledge", "reflection"]
        },
        {
            name: "belief_examination",
            path: path.join(__dirname, '../templates/socratic/belief_examination.js'),
            description: "Questioning and testing beliefs through inquiry",
            bestFor: ["belief testing", "evidence evaluation", "truth seeking", "cognitive examination"],
            keywords: ["belief", "truth", "evidence", "examine", "test", "verify", "know"]
        },
        {
            name: "pattern_recognition",
            path: path.join(__dirname, '../templates/socratic/pattern_recognition.js'),
            description: "Identifying recurring themes and connections",
            bestFor: ["pattern identification", "theme recognition", "connection discovery", "structural analysis"],
            keywords: ["pattern", "theme", "connection", "recurring", "structure", "similarity", "recognize"]
        },
        {
            name: "coding_agent",
            path: path.join(__dirname, '../templates/socratic/coding_agent.js'),
            description: "Requirements gathering for programming requests, then code implementation",
            bestFor: ["programming requests", "code generation", "software development", "application building"],
            keywords: ["code", "program", "build", "create", "develop", "software", "app", "application", "script", "scraper", "write", "make", "implement", "programming"]
        }
    ]
};

// Helper function to call Groq API for template selection
async function callGroqAPI({ systemPrompt, userPrompt }) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        console.error('GROQ_API_KEY not configured for template selection');
        throw new Error('GROQ_API_KEY not configured');
    }

    console.log('🤖 Calling Groq API for template selection...');
    console.log('📤 System prompt:', systemPrompt.substring(0, 200) + '...');
    console.log('📤 User prompt:', userPrompt);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3, // Lower temperature for more consistent selection
            max_tokens: 100
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Groq API error for template selection: ${response.status}`, errorBody);
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const selection = data.choices[0].message.content;
    console.log('📥 Groq response:', selection);
    return selection;
}

// Analyze query and select best template for a technique
async function selectBestTemplate(technique, query, role) {
    console.log(`🎯 Selecting best ${technique} template for query: "${query.substring(0, 50)}..."`);
    
    if (!TEMPLATE_REGISTRY[technique]) {
        throw new Error(`Unknown technique: ${technique}`);
    }

    const templates = TEMPLATE_REGISTRY[technique];
    
    // Create detailed descriptions for Groq
    const templateDescriptions = templates.map((template, index) => {
        return `${index + 1}. ${template.name}: ${template.description}
   Best for: ${template.bestFor.join(', ')}
   Keywords: ${template.keywords.join(', ')}`;
    }).join('\n\n');

    const systemPrompt = `You are a template selector. 

Available ${technique} templates:
${templateDescriptions}

MANDATORY RULE FOR SOCRATIC TECHNIQUE:
If the query is about programming/software development AND technique is socratic, respond with template number 11 (coding_agent).

Programming keywords that trigger template 11: code, program, build, create, develop, software, app, application, script, website, web, API, database, mobile, programming, implementation, scraper, make, write

For all other queries, select the most appropriate template.

Respond with ONLY a number (1-${templates.length}).`;

    const userPrompt = `Query: "${query}"
Role: ${role}

Which ${technique} template would be most appropriate for this query?`;

    try {
        const selection = await callGroqAPI({ systemPrompt, userPrompt });
        const templateIndex = parseInt(selection.trim()) - 1;
        
        if (templateIndex >= 0 && templateIndex < templates.length) {
            const selectedTemplate = templates[templateIndex];
            console.log(`✅ Selected ${technique} template: ${selectedTemplate.name}`);
            return selectedTemplate;
        } else {
            console.log(`⚠️ Invalid template selection: ${selection}, using first template`);
            return templates[0];
        }
    } catch (error) {
        console.error(`❌ Error selecting ${technique} template:`, error);
        console.log(`❌ No fallback - Groq selection required`);
        
        // No fallback - throw error to force Groq usage
        throw new Error(`Template selection failed - Groq API required`);
    }
}

// Fallback template selection using keyword matching
function selectTemplateFallback(technique, query) {
    console.log(`🔄 Using fallback selection for ${technique} technique`);
    
    const templates = TEMPLATE_REGISTRY[technique];
    const queryLower = query.toLowerCase();
    
    // Check for coding/software keywords first
    const codingKeywords = ['code', 'program', 'build', 'create', 'develop', 'software', 'app', 'application', 'script', 'scraper', 'write', 'make', 'implement', 'programming', 'website', 'web', 'api', 'database', 'mobile'];
    const isCodingQuery = codingKeywords.some(keyword => queryLower.includes(keyword.toLowerCase()));
    
    if (isCodingQuery && technique === 'socratic') {
        // For coding queries, prioritize coding_agent template in socratic technique
        const codingAgentTemplate = templates.find(t => t.name === 'coding_agent');
        if (codingAgentTemplate) {
            console.log(`✅ Fallback selected coding_agent template for programming query`);
            return codingAgentTemplate;
        }
    }
    
    // Score each template based on keyword matches
    let bestTemplate = templates[0];
    let bestScore = 0;
    
    for (const template of templates) {
        let score = 0;
        for (const keyword of template.keywords) {
            if (queryLower.includes(keyword.toLowerCase())) {
                score++;
            }
        }
        
        // Give extra boost to coding_agent for programming queries
        if (template.name === 'coding_agent' && isCodingQuery) {
            score += 10; // Heavy boost for coding queries
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestTemplate = template;
        }
    }
    
    console.log(`✅ Fallback selected ${technique} template: ${bestTemplate.name} (score: ${bestScore})`);
    return bestTemplate;
}

// Load and execute template
function loadTemplate(templateInfo) {
    try {
        console.log(`📂 Loading template from: ${templateInfo.path}`);
        
        // Clear require cache to get fresh template
        delete require.cache[require.resolve(templateInfo.path)];
        const templateModule = require(templateInfo.path);
        
        if (!templateModule || !templateModule.generateTemplate) {
            throw new Error(`Template ${templateInfo.name} does not export generateTemplate function`);
        }
        
        return templateModule;
    } catch (error) {
        console.error(`❌ Error loading template ${templateInfo.name}:`, error);
        console.error(`❌ Path attempted: ${templateInfo.path}`);
        throw new Error(`Failed to load template: ${templateInfo.name}`);
    }
}

// Main function to select and generate template
async function selectAndGenerateTemplate(technique, query, role, roleInfo) {
    console.log(`🚀 Generating ${technique} template for role: ${role}`);
    
    try {
        // Select best template using Groq
        const selectedTemplate = await selectBestTemplate(technique, query, role);
        
        // Load and execute template
        const templateModule = loadTemplate(selectedTemplate);
        const generatedContent = templateModule.generateTemplate(query, role, roleInfo);
        
        console.log(`✅ Generated ${technique} content using ${selectedTemplate.name}: ${generatedContent.length} characters`);
        
        return {
            content: generatedContent,
            templateUsed: selectedTemplate.name,
            templateDescription: selectedTemplate.description
        };
        
    } catch (error) {
        console.error(`❌ Error in template selection and generation:`, error);
        throw error;
    }
}

// Get all available templates info (for debugging/admin)
function getTemplateRegistry() {
    return TEMPLATE_REGISTRY;
}

// Test template selection (for debugging)
async function testTemplateSelection(technique, testQueries) {
    console.log(`🧪 Testing ${technique} template selection...`);
    
    for (const query of testQueries) {
        try {
            const selected = await selectBestTemplate(technique, query, "General Expert");
            console.log(`Query: "${query.substring(0, 40)}..." → Template: ${selected.name}`);
        } catch (error) {
            console.error(`❌ Test failed for "${query}":`, error.message);
        }
    }
}

module.exports = {
    selectAndGenerateTemplate,
    selectBestTemplate,
    getTemplateRegistry,
    testTemplateSelection,
    TEMPLATE_REGISTRY
};