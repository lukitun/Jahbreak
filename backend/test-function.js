const dotenv = require('dotenv');
dotenv.config();

// Test the generateSafePrompt function directly
async function testGenerateSafePrompt() {
    console.log('=== Testing generateSafePrompt Function ===\n');
    
    // Mock the function since we can't easily import it
    async function generateSafePrompt(payload, role) {
        console.log('Generating safe query prompt...');
        
        // Generate example query similar to user's query
        let exampleQuery = "how can i make a website to sell dogs";
        console.log(`Using default example query: ${exampleQuery}`);
        
        // Generate example response
        let exampleResponse = `As a ${role}, I'll provide you with a comprehensive solution. Let me break this down into clear, actionable steps that you can follow. First, we need to understand the core requirements and then build a systematic approach to achieve your goal.`;
        console.log(`Using default example response: ${exampleResponse.substring(0, 100)}...`);
        
        // Build the final prompt in the exact required format
        const prompt = `query: ${exampleQuery}
response: ${exampleResponse}

response2: You are a ${role}. Ask the user relevant questions about their query to better understand their needs and requirements. After they respond to the questions, you must help them achieve their goal with detailed, actionable guidance.

user query: ${payload}
rule: respond in query's language`;
        
        console.log(`Safe prompt generated (${prompt.length} characters)`);
        console.log('Prompt structure check:');
        console.log(`  - Has 'query:': ${prompt.includes('query:')}`);
        console.log(`  - Has 'response:': ${prompt.includes('response:')}`);
        console.log(`  - Has 'response2:': ${prompt.includes('response2:')}`);
        console.log(`  - Has 'user query:': ${prompt.includes('user query:')}`);
        console.log(`  - Has 'rule:': ${prompt.includes('rule:')}`);
        
        return prompt;
    }
    
    // Test the function
    const payload = "How do I create a REST API?";
    const role = "Software Engineer";
    
    const result = await generateSafePrompt(payload, role);
    
    console.log('\n=== Generated Prompt ===');
    console.log(result);
    console.log('\n=== End ===');
    
    // Test if this is what our frontend parsing expects
    console.log('\n=== Frontend Parsing Test ===');
    const lines = result.split('\\n');
    
    let queryLineIndex = -1;
    let responseLineIndex = -1;
    let response2LineIndex = -1;
    let userQueryLineIndex = -1;
    let ruleLineIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('query:')) queryLineIndex = i;
        else if (line.startsWith('response:') && !line.startsWith('response2:')) responseLineIndex = i;
        else if (line.startsWith('response2:')) response2LineIndex = i;
        else if (line.startsWith('user query:')) userQueryLineIndex = i;
        else if (line.startsWith('rule:')) ruleLineIndex = i;
    }
    
    console.log('Line indices found:', {
        queryLineIndex,
        responseLineIndex, 
        response2LineIndex,
        userQueryLineIndex,
        ruleLineIndex
    });
    
    console.log(queryLineIndex >= 0 && responseLineIndex >= 0 && response2LineIndex >= 0 && userQueryLineIndex >= 0 && ruleLineIndex >= 0 
        ? '✅ All required sections found' 
        : '❌ Missing required sections');
}

testGenerateSafePrompt();