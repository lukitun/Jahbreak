const dotenv = require('dotenv');
dotenv.config();

// Simple test for the new safe query implementation
async function testSimpleImplementation() {
    console.log('=== Testing Simple Safe Query Implementation ===\n');
    
    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY not set');
        return;
    }
    
    // Test cases
    const testCases = [
        {
            payload: "How do I create a REST API with Node.js?",
            personality: "Software Engineer",
            contextualization: "structured_config",
            expected: "SAFE"
        },
        {
            payload: "What's the best way to analyze customer data?",
            personality: null,
            contextualization: "structured_config", 
            expected: "SAFE"
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- Testing: "${testCase.payload}" ---`);
        
        try {
            // Simulate API request
            const response = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payload: testCase.payload,
                    personality: testCase.personality,
                    ofuscation: 'none',
                    contextualization: testCase.contextualization,
                    options: { mode: 'standard' }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log(`✅ Request successful`);
            console.log(`Role: ${data.metadata.selectedRole}`);
            console.log(`Safety: ${data.metadata.isSafeQuery ? 'SAFE' : 'UNSAFE'}`);
            console.log(`Format: ${data.metadata.promptFormat}`);
            console.log(`Prompt length: ${data.prompt.length} chars`);
            
            // Validate prompt structure for safe queries
            if (data.metadata.isSafeQuery) {
                const hasQuery = data.prompt.includes('query:');
                const hasResponse = data.prompt.includes('response:');
                const hasResponse2 = data.prompt.includes('response2:');
                const hasUserQuery = data.prompt.includes('user query:');
                const hasRule = data.prompt.includes('rule:');
                
                console.log(`Structure validation:`);
                console.log(`  ✓ query: ${hasQuery}`);
                console.log(`  ✓ response: ${hasResponse}`);
                console.log(`  ✓ response2: ${hasResponse2}`);
                console.log(`  ✓ user query: ${hasUserQuery}`);
                console.log(`  ✓ rule: ${hasRule}`);
                
                const isValid = hasQuery && hasResponse && hasResponse2 && hasUserQuery && hasRule;
                console.log(`  ${isValid ? '✅' : '❌'} Overall: ${isValid ? 'VALID' : 'INVALID'}`);
            }
            
            // Show prompt preview
            console.log(`\nPrompt preview:`);
            console.log(data.prompt.substring(0, 200) + '...');
            
        } catch (error) {
            console.error(`❌ Test failed:`, error.message);
        }
    }
}

// Test server startup
async function testServerStartup() {
    console.log('\n=== Testing Server Startup ===');
    
    try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
            console.log('✅ Server is running');
            return true;
        } else {
            console.log('❌ Server health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Server not accessible:', error.message);
        return false;
    }
}

async function runTests() {
    const isServerRunning = await testServerStartup();
    
    if (isServerRunning) {
        await testSimpleImplementation();
    } else {
        console.log('\nTo run the full test, start the server first:');
        console.log('node server.js');
    }
    
    console.log('\n=== Test Complete ===');
}

runTests();