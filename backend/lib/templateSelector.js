/**
 * Groq-powered Template Selection System
 * Uses AI to analyze queries and select the best template for each technique
 */

const path = require('path');
const fs = require('fs');

// Template registry with metadata
const TEMPLATE_REGISTRY = {
    direct: [
        {
            name: "comprehensive_framework",
            path: path.join(__dirname, '../templates/direct_txt/comprehensive_framework.txt'),
            description: "Systematic methodology with detailed execution plans",
            bestFor: ["complex projects", "systematic implementation", "methodology-focused", "step-by-step guidance"],
            keywords: ["framework", "methodology", "systematic", "process", "implementation", "plan"]
        },
        {
            name: "expert_masterclass",
            path: path.join(__dirname, '../templates/direct_txt/expert_masterclass.txt'),
            description: "Deep expertise sharing with professional insights",
            bestFor: ["skill development", "professional growth", "industry knowledge", "expert insights"],
            keywords: ["learn", "expert", "professional", "mastery", "industry", "insights", "skills"]
        },
        {
            name: "practical_blueprint",
            path: path.join(__dirname, '../templates/direct_txt/practical_blueprint.txt'),
            description: "Hands-on implementation with concrete examples and templates",
            bestFor: ["hands-on learning", "immediate implementation", "practical guidance", "examples"],
            keywords: ["build", "create", "practical", "hands-on", "examples", "implement", "blueprint"]
        },
        {
            name: "strategic_roadmap",
            path: path.join(__dirname, '../templates/direct_txt/strategic_roadmap.txt'),
            description: "Long-term vision with strategic planning and systematic progression",
            bestFor: ["long-term planning", "strategic thinking", "vision development", "scaling"],
            keywords: ["strategy", "long-term", "vision", "roadmap", "planning", "scale", "future"]
        },
        {
            name: "quick_solution",
            path: path.join(__dirname, '../templates/direct_txt/quick_solution.txt'),
            description: "Fast, efficient solutions for urgent problems",
            bestFor: ["urgent problems", "time-sensitive issues", "quick fixes", "immediate needs"],
            keywords: ["quick", "fast", "urgent", "immediate", "emergency", "solution", "fix"]
        },
        {
            name: "detailed_analysis",
            path: path.join(__dirname, '../templates/direct_txt/detailed_analysis.txt'),
            description: "Deep analytical breakdown of complex topics",
            bestFor: ["complex analysis", "research topics", "detailed examination", "comprehensive understanding"],
            keywords: ["analysis", "research", "detailed", "deep", "examine", "understand", "breakdown"]
        },
        {
            name: "step_by_step_tutorial",
            path: path.join(__dirname, '../templates/direct_txt/step_by_step_tutorial.txt'),
            description: "Educational guidance with progressive skill building",
            bestFor: ["learning new skills", "educational content", "tutorials", "skill development"],
            keywords: ["tutorial", "learn", "teach", "education", "skill", "training", "guide"]
        },
        {
            name: "troubleshooting_guide",
            path: path.join(__dirname, '../templates/direct_txt/troubleshooting_guide.txt'),
            description: "Systematic problem diagnosis and resolution",
            bestFor: ["technical problems", "debugging", "error resolution", "system issues"],
            keywords: ["troubleshoot", "debug", "error", "problem", "fix", "diagnose", "resolve"]
        },
        {
            name: "best_practices_guide",
            path: path.join(__dirname, '../templates/direct_txt/best_practices_guide.txt'),
            description: "Industry standards and proven methodologies",
            bestFor: ["professional standards", "quality improvement", "optimization", "industry guidelines"],
            keywords: ["best", "practices", "standards", "quality", "optimize", "industry", "proven"]
        },
        {
            name: "resource_compilation",
            path: path.join(__dirname, '../templates/direct_txt/resource_compilation.txt'),
            description: "Comprehensive resource gathering and organization",
            bestFor: ["resource discovery", "learning materials", "tool recommendations", "reference gathering"],
            keywords: ["resources", "tools", "materials", "references", "collection", "list", "compilation"]
        },
        {
            name: "implementation_checklist",
            path: path.join(__dirname, '../templates/direct_txt/implementation_checklist.txt'),
            description: "Systematic execution planning with detailed checklists",
            bestFor: ["project execution", "systematic implementation", "process management", "quality control"],
            keywords: ["checklist", "implementation", "execution", "process", "steps", "workflow", "management"]
        },
        {
            name: "coding_implementation",
            path: path.join(__dirname, '../templates/direct_txt/coding_implementation.txt'),
            description: "Professional software development implementation with complete code solutions",
            bestFor: ["programming tasks", "code generation", "software development", "application building", "technical implementation"],
            keywords: ["code", "program", "build", "create", "develop", "software", "app", "application", "script", "website", "API", "database", "programming", "implementation", "function", "class", "algorithm"]
        }
    ],
    interactive: [
        {
            name: "focused_dialogue",
            path: path.join(__dirname, '../templates/interactive_txt/focused_dialogue.txt'),
            description: "3-4 strategic questions for efficient customization",
            bestFor: ["quick clarification", "focused consultation", "time-constrained", "specific needs"],
            keywords: ["quick", "focused", "specific", "targeted", "efficient", "clarification"]
        },
        {
            name: "comprehensive_discovery",
            path: path.join(__dirname, '../templates/interactive_txt/comprehensive_discovery.txt'),
            description: "7-9 questions for thorough, multi-dimensional exploration",
            bestFor: ["complex situations", "thorough understanding", "multi-faceted problems", "comprehensive planning"],
            keywords: ["complex", "comprehensive", "thorough", "detailed", "multi-dimensional", "exploration"]
        },
        {
            name: "iterative_refinement",
            path: path.join(__dirname, '../templates/interactive_txt/iterative_refinement.txt'),
            description: "5-6 questions with progressive deepening and refinement",
            bestFor: ["collaborative approach", "progressive understanding", "iterative development", "balanced exploration"],
            keywords: ["iterative", "progressive", "collaborative", "refinement", "balanced", "evolution"]
        },
        {
            name: "diagnostic_interview",
            path: path.join(__dirname, '../templates/interactive_txt/diagnostic_interview.txt'),
            description: "Problem identification through systematic questioning",
            bestFor: ["problem diagnosis", "root cause analysis", "troubleshooting", "issue identification"],
            keywords: ["diagnose", "problem", "interview", "identify", "symptoms", "cause", "troubleshoot"]
        },
        {
            name: "needs_assessment",
            path: path.join(__dirname, '../templates/interactive_txt/needs_assessment.txt'),
            description: "Understanding requirements and constraints through discovery",
            bestFor: ["requirement gathering", "project scoping", "needs analysis", "constraint identification"],
            keywords: ["needs", "requirements", "assessment", "constraints", "scope", "analysis", "discovery"]
        },
        {
            name: "collaborative_planning",
            path: path.join(__dirname, '../templates/interactive_txt/collaborative_planning.txt'),
            description: "Group-oriented planning with stakeholder consideration",
            bestFor: ["team planning", "stakeholder alignment", "group projects", "collaborative initiatives"],
            keywords: ["collaborate", "team", "group", "stakeholder", "planning", "alignment", "together"]
        },
        {
            name: "decision_framework",
            path: path.join(__dirname, '../templates/interactive_txt/decision_framework.txt'),
            description: "Choice evaluation through structured questioning",
            bestFor: ["decision making", "option evaluation", "choice analysis", "strategic decisions"],
            keywords: ["decision", "choice", "evaluate", "options", "choose", "select", "compare"]
        },
        {
            name: "learning_assessment",
            path: path.join(__dirname, '../templates/interactive_txt/learning_assessment.txt'),
            description: "Educational level and learning style discovery",
            bestFor: ["educational planning", "skill development", "learning paths", "knowledge assessment"],
            keywords: ["learning", "education", "assessment", "skill", "knowledge", "development", "training"]
        },
        {
            name: "goal_setting_session",
            path: path.join(__dirname, '../templates/interactive_txt/goal_setting_session.txt'),
            description: "Objective clarification and prioritization through discovery",
            bestFor: ["goal setting", "objective clarification", "planning sessions", "vision development"],
            keywords: ["goal", "objective", "vision", "target", "aim", "purpose", "planning"]
        },
        {
            name: "coding_consultation",
            path: path.join(__dirname, '../templates/interactive_txt/coding_consultation.txt'),
            description: "Technical consultation for software development projects with requirement gathering",
            bestFor: ["programming projects", "code planning", "technical requirements", "software architecture", "development consultation"],
            keywords: ["code", "program", "build", "create", "develop", "software", "app", "application", "script", "technical", "programming", "implementation", "architecture", "development"]
        },
        {
            name: "creative_workshop",
            path: path.join(__dirname, '../templates/interactive_txt/creative_workshop.txt'),
            description: "Brainstorming and ideation through collaborative dialogue",
            bestFor: ["creative projects", "brainstorming", "innovation", "ideation sessions"],
            keywords: ["creative", "brainstorm", "ideation", "innovation", "ideas", "workshop", "generate"]
        }
    ],
    socratic: [
        {
            name: "guided_inquiry",
            path: path.join(__dirname, '../templates/socratic_txt/guided_inquiry.txt'),
            description: "Classical Socratic method with guided self-discovery",
            bestFor: ["self-discovery", "philosophical exploration", "assumption challenging", "classical learning"],
            keywords: ["discover", "explore", "assumptions", "inquiry", "self-discovery", "questioning"]
        },
        {
            name: "critical_thinking",
            path: path.join(__dirname, '../templates/socratic_txt/critical_thinking.txt'),
            description: "Develops analytical and evaluative thinking skills",
            bestFor: ["analytical thinking", "problem analysis", "critical evaluation", "logical reasoning"],
            keywords: ["analyze", "critical", "thinking", "evaluate", "logic", "reasoning", "analytical"]
        },
        {
            name: "reflective_learning",
            path: path.join(__dirname, '../templates/socratic_txt/reflective_learning.txt'),
            description: "Personal growth and deep understanding through reflection",
            bestFor: ["personal development", "self-awareness", "growth mindset", "reflective learning"],
            keywords: ["growth", "personal", "reflection", "development", "learning", "self-awareness", "mindset"]
        },
        {
            name: "assumption_challenging",
            path: path.join(__dirname, '../templates/socratic_txt/assumption_challenging.txt'),
            description: "Questioning underlying beliefs and assumptions",
            bestFor: ["belief examination", "assumption testing", "critical thinking", "perspective shifting"],
            keywords: ["assumptions", "beliefs", "challenge", "question", "examine", "test", "perspective"]
        },
        {
            name: "root_cause_analysis",
            path: path.join(__dirname, '../templates/socratic_txt/root_cause_analysis.txt'),
            description: "Deep exploration of fundamental causes",
            bestFor: ["problem analysis", "system thinking", "cause identification", "deep investigation"],
            keywords: ["root", "cause", "why", "deep", "fundamental", "analysis", "investigation"]
        },
        {
            name: "perspective_exploration",
            path: path.join(__dirname, '../templates/socratic_txt/perspective_exploration.txt'),
            description: "Multiple viewpoint examination and perspective shifting",
            bestFor: ["perspective taking", "viewpoint analysis", "empathy development", "complex understanding"],
            keywords: ["perspective", "viewpoint", "multiple", "explore", "empathy", "understanding", "different"]
        },
        {
            name: "value_discovery",
            path: path.join(__dirname, '../templates/socratic_txt/value_discovery.txt'),
            description: "Understanding core values and motivations",
            bestFor: ["value clarification", "motivation discovery", "purpose exploration", "meaning-making"],
            keywords: ["values", "motivation", "purpose", "meaning", "important", "matters", "core"]
        },
        {
            name: "wisdom_extraction",
            path: path.join(__dirname, '../templates/socratic_txt/wisdom_extraction.txt'),
            description: "Drawing insights and wisdom from experience",
            bestFor: ["experience reflection", "wisdom development", "insight extraction", "learning integration"],
            keywords: ["wisdom", "experience", "insights", "lessons", "learned", "knowledge", "reflection"]
        },
        {
            name: "belief_examination",
            path: path.join(__dirname, '../templates/socratic_txt/belief_examination.txt'),
            description: "Questioning and testing beliefs through inquiry",
            bestFor: ["belief testing", "evidence evaluation", "truth seeking", "cognitive examination"],
            keywords: ["belief", "truth", "evidence", "examine", "test", "verify", "know"]
        },
        {
            name: "pattern_recognition",
            path: path.join(__dirname, '../templates/socratic_txt/pattern_recognition.txt'),
            description: "Identifying recurring themes and connections",
            bestFor: ["pattern identification", "theme recognition", "connection discovery", "structural analysis"],
            keywords: ["pattern", "theme", "connection", "recurring", "structure", "similarity", "recognize"]
        },
        {
            name: "coding_agent",
            path: path.join(__dirname, '../templates/socratic_txt/coding_agent.txt'),
            description: "Professional coding assistant for comprehensive software development projects",
            bestFor: ["programming requests", "code generation", "software development", "application building"],
            keywords: ["code", "program", "build", "create", "develop", "software", "app", "application", "script", "scraper", "write", "make", "implement", "programming"]
        }
    ]
};

// Helper function to call Groq API for template selection with retry mechanism
async function callGroqAPI({ systemPrompt, userPrompt }, retries = 3) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        console.error('GROQ_API_KEY not configured for template selection');
        throw new Error('GROQ_API_KEY not configured');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🤖 Calling Groq API for template selection (attempt ${attempt}/${retries})...`);
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
            console.log(`✅ Groq response (attempt ${attempt}):`, selection);
            return selection;
            
        } catch (error) {
            console.error(`❌ Groq API attempt ${attempt} failed:`, error.message);
            
            if (attempt === retries) {
                throw new Error(`Groq API failed after ${retries} attempts: ${error.message}`);
            }
            
            // Wait before retry (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// Helper function to detect if query is programming-related
function isProgrammingQuery(query) {
    const programmingKeywords = [
        'code', 'coding', 'program', 'programming', 'script', 'function', 'class', 
        'algorithm', 'software', 'app', 'application', 'website', 'web', 'API', 
        'database', 'backend', 'frontend', 'fullstack', 'build', 'create', 'develop', 
        'implement', 'debug', 'fix', 'error', 'bug', 'compile', 'javascript', 'python', 
        'java', 'react', 'node', 'sql', 'html', 'css', 'framework', 'library', 
        'module', 'package', 'deploy', 'server', 'client', 'mobile', 'desktop'
    ];
    
    const lowerQuery = query.toLowerCase();
    return programmingKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Analyze query and select best template for a technique
async function selectBestTemplate(technique, query, role) {
    console.log(`🎯 Selecting best ${technique} template for query: "${query.substring(0, 50)}..."`);
    
    if (!TEMPLATE_REGISTRY[technique]) {
        throw new Error(`Unknown technique: ${technique}`);
    }

    const templates = TEMPLATE_REGISTRY[technique];
    
    // Check if this is a programming query
    const isProgramming = isProgrammingQuery(query) || role === 'Software Engineer';
    
    if (isProgramming) {
        console.log('🖥️ Detected programming query - prioritizing coding templates');
        
        // Find coding-specific templates
        const codingTemplates = templates.filter(t => 
            t.name.includes('coding') || 
            t.name.includes('code') || 
            t.keywords.includes('programming') ||
            t.keywords.includes('code')
        );
        
        if (codingTemplates.length > 0) {
            console.log(`✅ Using coding template: ${codingTemplates[0].name}`);
            return codingTemplates[0];
        }
    }
    
    // Create detailed descriptions for Groq
    const templateDescriptions = templates.map((template, index) => {
        return `${index + 1}. ${template.name}: ${template.description}
   Best for: ${template.bestFor.join(', ')}
   Keywords: ${template.keywords.join(', ')}`;
    }).join('\n\n');

    const systemPrompt = `You are a template selector. Analyze the query and select the MOST APPROPRIATE template based on what the user is asking for.

Available ${technique} templates:
${templateDescriptions}

IMPORTANT RULES:
1. Match the template to the ACTUAL CONTENT of the query, not just keywords
2. For programming/coding queries, ALWAYS select templates with "coding", "code", or "programming" in their name or keywords
3. Consider the role (${role}) - if it's "Software Engineer", prioritize technical templates
4. Select based on what would be most helpful for the user's specific need
5. If the query mentions building, creating, or developing software/apps/websites, choose coding templates

${isProgramming ? 'NOTE: This appears to be a programming-related query. Strongly prefer coding/programming templates.' : ''}

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


// Load template content from .txt file
function loadTemplate(templateInfo) {
    try {
        console.log(`📂 Loading template from: ${templateInfo.path}`);
        
        // Read the template content from .txt file
        const templateContent = fs.readFileSync(templateInfo.path, 'utf8');
        
        if (!templateContent || templateContent.trim().length === 0) {
            throw new Error(`Template ${templateInfo.name} is empty or not readable`);
        }
        
        // Return an object with generateTemplate function that returns the content
        return {
            generateTemplate: (query, role) => {
                // Replace template variables with actual values
                return templateContent
                    .replace(/\$\{role\}/g, role)
                    .replace(/\$\{query\}/g, query);
            }
        };
    } catch (error) {
        console.error(`❌ Error loading template ${templateInfo.name}:`, error);
        console.error(`❌ Path attempted: ${templateInfo.path}`);
        throw new Error(`Failed to load template: ${templateInfo.name}`);
    }
}

// Main function to select and generate template
async function selectAndGenerateTemplate(technique, query, role) {
    console.log(`🚀 Generating ${technique} template for role: ${role}`);
    
    try {
        // Select best template using Groq
        const selectedTemplate = await selectBestTemplate(technique, query, role);
        
        // Load and execute template
        const templateModule = loadTemplate(selectedTemplate);
        const generatedContent = templateModule.generateTemplate(query, role);
        
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