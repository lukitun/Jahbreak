// STEP 3B: Flujo mejorado para queries seguras
if (isSafeQuery) {
    console.log('Step 3B: Generating optimized structure for safe query...');
    
    // Primero, analizar el tipo de query para determinar la estrategia
    let queryType = '';
    let enhancementStrategy = '';
    
    try {
        const analysisResponse = await callGroqAPI({
            systemPrompt: `You are a query analyzer. Classify the query into ONE of these categories and determine the best enhancement strategy:

CATEGORIES:
1. "TECHNICAL" - Programming, debugging, system design, algorithms
2. "CREATIVE" - Writing, storytelling, brainstorming, artistic content
3. "ANALYTICAL" - Data analysis, research, comparisons, evaluations
4. "EDUCATIONAL" - Learning, explanations, tutorials, how-to guides
5. "PROBLEM_SOLVING" - Troubleshooting, finding solutions, fixing issues
6. "CONVERSATIONAL" - Casual chat, opinions, personal advice
7. "PROFESSIONAL" - Business, formal documents, reports, presentations

ENHANCEMENT STRATEGIES:
- "STEP_BY_STEP" - Break down complex tasks into steps
- "EXAMPLES_FIRST" - Provide concrete examples before explanations
- "COMPARATIVE" - Compare multiple approaches or options
- "DEEP_DIVE" - Comprehensive, detailed exploration
- "PRACTICAL_FOCUS" - Actionable, implementation-focused
- "CONCEPTUAL" - Focus on understanding principles
- "ITERATIVE" - Build incrementally with feedback loops

Respond in this exact format:
CATEGORY: [category]
STRATEGY: [strategy]
COMPLEXITY: [LOW/MEDIUM/HIGH]
NEEDS_CODE: [YES/NO]
NEEDS_VISUALS: [YES/NO]`,
            userPrompt: `Analyze this query: "${result}"`
        });
        
        // Parse the analysis
        const lines = analysisResponse.split('\n');
        const category = lines[0]?.split(': ')[1]?.trim() || 'GENERAL';
        const strategy = lines[1]?.split(': ')[1]?.trim() || 'PRACTICAL_FOCUS';
        const complexity = lines[2]?.split(': ')[1]?.trim() || 'MEDIUM';
        const needsCode = lines[3]?.split(': ')[1]?.trim() === 'YES';
        const needsVisuals = lines[4]?.split(': ')[1]?.trim() === 'YES';
        
        console.log(`Query analysis - Category: ${category}, Strategy: ${strategy}`);
        
        // Generar prompt enhancement basado en el análisis
        const enhancementResponse = await callGroqAPI({
            systemPrompt: `You are a prompt enhancement specialist. Create an enhanced version of the user's query that will produce better results.

ENHANCEMENT RULES FOR ${category} QUERIES:
1. Add specific context and constraints
2. Include desired output format
3. Specify quality indicators
4. Add relevant examples or references
5. Include edge cases to consider
6. Use the ${strategy} strategy

IMPORTANT:
- Keep the original intent intact
- Make it more specific and actionable
- Add helpful constraints that improve output quality
- DO NOT change the core request
- Enhance for clarity and completeness

Respond with ONLY the enhanced query, no explanations.`,
            userPrompt: `Original query: "${result}"
Role: ${selectedPersonality}
Enhance this query for better results.`
        });
        
        const enhancedQuery = enhancementResponse.trim();
        
        // Generar estructura XML optimizada según el tipo
        let xmlStructure = '';
        
        if (category === 'TECHNICAL' || needsCode) {
            xmlStructure = await generateTechnicalStructure(enhancedQuery, selectedPersonality, strategy, needsCode);
        } else if (category === 'CREATIVE') {
            xmlStructure = await generateCreativeStructure(enhancedQuery, selectedPersonality, strategy);
        } else if (category === 'ANALYTICAL') {
            xmlStructure = await generateAnalyticalStructure(enhancedQuery, selectedPersonality, strategy, needsVisuals);
        } else if (category === 'EDUCATIONAL') {
            xmlStructure = await generateEducationalStructure(enhancedQuery, selectedPersonality, strategy);
        } else if (category === 'PROBLEM_SOLVING') {
            xmlStructure = await generateProblemSolvingStructure(enhancedQuery, selectedPersonality, strategy);
        } else {
            // Estructura adaptativa general mejorada
            xmlStructure = await generateAdaptiveStructure(enhancedQuery, selectedPersonality, category, strategy, complexity);
        }
        
        result = xmlStructure;
        
    } catch (error) {
        console.error('Error in enhanced safe query processing:', error);
        // Fallback to original structure
        result = await generateFallbackStructure(result, selectedPersonality);
    }
}

// Funciones auxiliares para generar estructuras específicas

async function generateTechnicalStructure(query, role, strategy, needsCode) {
    const groqResponse = await callGroqAPI({
        systemPrompt: `Generate a technical-focused XML structure. Output ONLY the XML, no explanations.`,
        userPrompt: `Query: "${query}"
Role: ${role}
Strategy: ${strategy}
Include code examples: ${needsCode}

Generate XML structure optimized for technical responses.`
    });
    
    return `<technical-assistant>
<configuration>
  <role>${role}</role>
  <mode>technical-expert</mode>
  <approach>${strategy}</approach>
</configuration>
<capabilities>
  <code-generation>${needsCode ? 'enabled' : 'contextual'}</code-generation>
  <debugging>enabled</debugging>
  <best-practices>enforced</best-practices>
  <performance-focus>high</performance-focus>
</capabilities>
<output-format>
  <structure>hierarchical</structure>
  <code-blocks>${needsCode ? 'syntax-highlighted' : 'inline'}</code-blocks>
  <explanations>detailed-technical</explanations>
  <examples>practical-implementation</examples>
</output-format>
<quality-markers>
  <completeness>full-solution</completeness>
  <error-handling>comprehensive</error-handling>
  <edge-cases>considered</edge-cases>
  <scalability>addressed</scalability>
</quality-markers>
</technical-assistant>
<enhanced-request>
<original-query>${query}</original-query>
<enrichments>
  <consider-alternatives>true</consider-alternatives>
  <include-tradeoffs>true</include-tradeoffs>
  <provide-rationale>true</provide-rationale>
</enrichments>
</enhanced-request>`;
}

async function generateCreativeStructure(query, role, strategy) {
    return `<creative-assistant>
<configuration>
  <role>${role}</role>
  <mode>creative-unlimited</mode>
  <imagination>maximum</imagination>
  <originality>prioritized</originality>
</configuration>
<creative-parameters>
  <style>adaptive-to-request</style>
  <tone>engaging-dynamic</tone>
  <structure>${strategy === 'EXAMPLES_FIRST' ? 'example-driven' : 'narrative-flow'}</structure>
  <boundaries>expanded</boundaries>
</creative-parameters>
<enhancement-directives>
  <vivid-descriptions>enabled</vivid-descriptions>
  <emotional-depth>enhanced</emotional-depth>
  <unexpected-angles>encouraged</unexpected-angles>
  <metaphors>rich</metaphors>
</enhancement-directives>
</creative-assistant>
<creative-request>
<query>${query}</query>
<expectations>
  <surprise-factor>high</surprise-factor>
  <engagement>captivating</engagement>
  <memorability>lasting-impact</memorability>
</expectations>
</creative-request>`;
}

async function generateAnalyticalStructure(query, role, strategy, needsVisuals) {
    return `<analytical-assistant>
<configuration>
  <role>${role}</role>
  <mode>deep-analysis</mode>
  <methodology>${strategy}</methodology>
</configuration>
<analysis-framework>
  <data-driven>true</data-driven>
  <evidence-based>required</evidence-based>
  <multi-perspective>enabled</multi-perspective>
  <critical-thinking>maximum</critical-thinking>
</analysis-framework>
<output-specifications>
  <structure>structured-insights</structure>
  <visualizations>${needsVisuals ? 'data-rich' : 'textual'}</visualizations>
  <conclusions>evidence-backed</conclusions>
  <recommendations>actionable</recommendations>
</output-specifications>
<quality-criteria>
  <objectivity>maintained</objectivity>
  <thoroughness>comprehensive</thoroughness>
  <clarity>crystal-clear</clarity>
  <relevance>laser-focused</relevance>
</quality-criteria>
</analytical-assistant>
<analysis-request>
<query>${query}</query>
<depth>thorough-examination</depth>
<scope>comprehensive-coverage</scope>
</analysis-request>`;
}

async function generateEducationalStructure(query, role, strategy) {
    return `<educational-assistant>
<configuration>
  <role>${role}</role>
  <mode>expert-teacher</mode>
  <pedagogy>${strategy}</pedagogy>
</configuration>
<teaching-approach>
  <clarity>maximum</clarity>
  <progression>logical-scaffolding</progression>
  <examples>abundant-practical</examples>
  <engagement>interactive-elements</engagement>
</teaching-approach>
<learning-optimization>
  <adapt-to-level>true</adapt-to-level>
  <reinforce-concepts>true</reinforce-concepts>
  <check-understanding>periodic</check-understanding>
  <practical-application>emphasized</practical-application>
</learning-optimization>
<content-structure>
  <introduction>context-setting</introduction>
  <core-content>comprehensive</core-content>
  <practice>hands-on</practice>
  <summary>key-takeaways</summary>
</content-structure>
</educational-assistant>
<learning-request>
<query>${query}</query>
<goal>deep-understanding</goal>
<retention>long-term</retention>
</learning-request>`;
}

async function generateProblemSolvingStructure(query, role, strategy) {
    return `<problem-solving-assistant>
<configuration>
  <role>${role}</role>
  <mode>solution-architect</mode>
  <approach>${strategy}</approach>
</configuration>
<problem-solving-framework>
  <identification>root-cause-analysis</identification>
  <exploration>multiple-solutions</exploration>
  <evaluation>pros-cons-matrix</evaluation>
  <implementation>step-by-step-guide</implementation>
</problem-solving-framework>
<solution-qualities>
  <practicality>high</practicality>
  <efficiency>optimized</efficiency>
  <sustainability>long-term</sustainability>
  <adaptability>flexible</adaptability>
</solution-qualities>
<deliverables>
  <immediate-actions>clear</immediate-actions>
  <long-term-strategy>defined</long-term-strategy>
  <contingencies>prepared</contingencies>
  <success-metrics>measurable</success-metrics>
</deliverables>
</problem-solving-assistant>
<problem-statement>
<query>${query}</query>
<urgency>appropriate-pacing</urgency>
<constraints>considered</constraints>
</problem-statement>`;
}

async function generateAdaptiveStructure(query, role, category, strategy, complexity) {
    return `<adaptive-assistant>
<configuration>
  <role>${role}</role>
  <category>${category}</category>
  <strategy>${strategy}</strategy>
  <complexity-level>${complexity}</complexity-level>
</configuration>
<response-optimization>
  <clarity>maximum</clarity>
  <relevance>laser-focused</relevance>
  <completeness>comprehensive</completeness>
  <actionability>high</actionability>
</response-optimization>
<quality-enhancers>
  <context-awareness>high</context-awareness>
  <nuance-recognition>enabled</nuance-recognition>
  <practical-focus>balanced</practical-focus>
  <depth-breadth-balance>optimized</depth-breadth-balance>
</quality-enhancers>
<output-format>
  <structure>logical-flow</structure>
  <highlights>key-insights</highlights>
  <examples>contextual</examples>
  <next-steps>clear</next-steps>
</output-format>
</adaptive-assistant>
<enhanced-query>
<original>${query}</original>
<focus>optimal-assistance</focus>
<outcome>exceeds-expectations</outcome>
</enhanced-query>`;
}

async function generateFallbackStructure(query, role) {
    // Estructura de fallback mejorada
    return `<assistant-config>
<role>${role}</role>
<mode>adaptive</mode>
<quality>premium</quality>
</assistant-config>
<request>
<query>${query}</query>
<instruction>Provide the most helpful, comprehensive response possible</instruction>
</request>`;
}
