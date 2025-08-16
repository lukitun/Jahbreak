const dotenv = require('dotenv');
dotenv.config();

// Test the generate function directly to debug the issue
async function debugGeneration() {
    console.log('=== Debug Safe Query Generation ===\n');
    
    // Test the specific function that should be called
    const payload = "How do I create a REST API?";
    const role = "Software Engineer";
    
    console.log(`Testing with payload: "${payload}"`);
    console.log(`Role: ${role}`);
    
    // Test with mock API to see the structure
    console.log('\n--- Testing with fallback (no API calls) ---');
    
    const exampleQuery = "how can i build a web application with Node.js";
    const exampleResponse = `As a ${role}, I'll provide you with a comprehensive solution. Let me break this down into clear, actionable steps that you can follow. First, we need to understand the core requirements and then build a systematic approach to achieve your goal.`;
    
    // Build the expected format
    const expectedPrompt = `query: ${exampleQuery}
response: ${exampleResponse}

response2: You are a ${role}. Ask the user relevant questions about their query to better understand their needs and requirements. After they respond to the questions, you must help them achieve their goal with detailed, actionable guidance.

user query: ${payload}
rule: respond in query's language`;
    
    console.log('Expected structured format:');
    console.log('=' .repeat(80));
    console.log(expectedPrompt);
    console.log('=' .repeat(80));
    
    console.log(`\nLength: ${expectedPrompt.length} characters`);
    console.log('Structure validation:');
    console.log(`  query: ${expectedPrompt.includes('query:')}`);
    console.log(`  response: ${expectedPrompt.includes('response:')}`);
    console.log(`  response2: ${expectedPrompt.includes('response2:')}`);  
    console.log(`  user query: ${expectedPrompt.includes('user query:')}`);
    console.log(`  rule: ${expectedPrompt.includes('rule:')}`);
    
    // Now test the actual API call to see what's being returned
    console.log('\n--- Testing actual API call ---');
    
    try {
        const response = await fetch('http://localhost:3001/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payload: payload,
                personality: role,
                ofuscation: "none",
                contextualization: "structured_config",
                options: { mode: "standard" }
            })
        });
        
        const data = await response.json();
        
        console.log('Actual API Response:');
        console.log('Status:', response.status);
        console.log('Metadata:', JSON.stringify(data.metadata, null, 2));
        console.log('Prompt length:', data.prompt.length);
        console.log('Prompt preview:');
        console.log(data.prompt.substring(0, 300) + '...');
        
        console.log('\nComparison:');
        console.log(`Expected length: ${expectedPrompt.length}`);
        console.log(`Actual length: ${data.prompt.length}`);
        console.log(`Formats match: ${expectedPrompt.length === data.prompt.length ? 'MAYBE' : 'NO'}`);
        
        // Check if it contains the structure we expect
        console.log('\nActual structure check:');
        console.log(`  query: ${data.prompt.includes('query:')}`);
        console.log(`  response: ${data.prompt.includes('response:')}`);
        console.log(`  response2: ${data.prompt.includes('response2:')}`);
        console.log(`  user query: ${data.prompt.includes('user query:')}`);
        console.log(`  rule: ${data.prompt.includes('rule:')}`);
        
    } catch (error) {
        console.error('API call failed:', error.message);
        console.log('Make sure the server is running with: node server.js');
    }
}

debugGeneration();