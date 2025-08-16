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
    return data.choices[0].message.content;
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

    const systemPrompt = `You are an expert template selector. Your job is to analyze user queries and select the most appropriate template based on the query's characteristics and user needs.

Available ${technique} templates:

${templateDescriptions}

Selection criteria:
- Match query intent with template strengths
- Consider query complexity and scope
- Evaluate user's likely needs and preferences
- Think about what approach would be most helpful

Respond with ONLY the template number (1, 2, 3, or 4). No explanation needed.`;

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
        console.log(`🔄 Falling back to default template selection`);
        
        // Fallback: simple keyword matching
        return selectTemplateFallback(technique, query);
    }
}

// Fallback template selection using keyword matching
function selectTemplateFallback(technique, query) {
    console.log(`🔄 Using fallback selection for ${technique} technique`);
    
    const templates = TEMPLATE_REGISTRY[technique];
    const queryLower = query.toLowerCase();
    
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