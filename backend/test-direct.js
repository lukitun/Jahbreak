const dotenv = require('dotenv');
dotenv.config();

// Test the generate function directly without the HTTP layer
async function testDirectGeneration() {
    console.log('=== Testing Direct Generation Logic ===\n');
    
    // Import the route functions (we'll need to extract them)
    const fs = require('fs');
    const path = require('path');
    
    // Simulate the request that's not working
    const mockReq = {
        body: {
            payload: "How do I create a REST API with Node.js?",
            personality: "Software Engineer", 
            ofuscation: "none",
            contextualization: "structured_config",
            options: { mode: "standard" }
        }
    };
    
    const mockRes = {
        json: (data) => {
            console.log('=== API Response ===');
            console.log('Status: 200 OK');
            console.log('Response data:');
            console.log(JSON.stringify(data, null, 2));
            
            // Test the prompt structure
            if (data.prompt) {
                console.log('\\n=== Prompt Analysis ===');
                console.log(`Length: ${data.prompt.length} characters`);
                console.log('Structure check:');
                console.log(`  query: ${data.prompt.includes('query:')}`) ;
                console.log(`  response: ${data.prompt.includes('response:')}`);
                console.log(`  response2: ${data.prompt.includes('response2:')}`);
                console.log(`  user query: ${data.prompt.includes('user query:')}`);
                console.log(`  rule: ${data.prompt.includes('rule:')}`);
                
                console.log('\\nFirst 300 chars:');
                console.log(data.prompt.substring(0, 300) + '...');
            }
            
            return data;
        },
        status: (code) => ({
            json: (data) => {
                console.log(`Status: ${code}`);
                console.log('Error data:', data);
                return data;
            }
        })
    };
    
    // Test the logic step by step
    try {
        const { payload, personality, contextualization } = mockReq.body;
        
        console.log('Step 1: Input validation');
        console.log(`  Payload: "${payload}"`);
        console.log(`  Personality: "${personality}"`);
        console.log(`  Contextualization: "${contextualization}"`);
        
        if (!process.env.GROQ_API_KEY) {
            console.log('\\n⚠️  GROQ_API_KEY not set - cannot test API calls');
            console.log('Testing with mock data instead...');
            
            // Test with mock data
            const mockResult = `query: how can i build a web application with Node.js
response: As a Software Engineer, I'll help you build a web application with Node.js. First, you'll need to set up your development environment by installing Node.js and npm. Then create a new project directory and initialize it with npm init. Install Express.js as your web framework with npm install express. Create your main app.js file and set up basic routing and middleware.

response2: You are a Software Engineer. Ask the user relevant questions about their query to better understand their needs and requirements. After they respond to the questions, you must help them achieve their goal with detailed, actionable guidance.

user query: ${payload}
rule: respond in query's language`;
            
            const mockMetadata = {
                selectedRole: personality,
                isSafeQuery: true,
                promptFormat: 'safe-structured'
            };
            
            mockRes.json({
                prompt: mockResult,
                metadata: mockMetadata
            });
            
        } else {
            console.log('\\n✅ GROQ_API_KEY found - testing with real API...');
            // Would need to import and call the actual route handler here
            console.log('For full API test, run the server and use test-simple.js');
        }
        
    } catch (error) {
        console.error('Test failed:', error);
        mockRes.status(500).json({ error: error.message });
    }
}

testDirectGeneration();