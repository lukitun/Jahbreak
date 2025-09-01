const fetch = require('node-fetch');

async function testAPI() {
    console.log('🧪 Testing API to ensure templates are returned\n');
    
    const testQueries = [
        { query: "How to build a web scraper", expected: "programming" },
        { query: "Explain quantum physics", expected: "general" }
    ];
    
    for (const test of testQueries) {
        console.log(`\n📝 Testing: "${test.query}"`);
        
        try {
            const response = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload: test.query })
            });
            
            const data = await response.json();
            
            if (data.prompt && typeof data.prompt === 'object') {
                console.log('✅ Response structure:');
                console.log(`   - Has direct: ${'direct' in data.prompt}`);
                console.log(`   - Has interactive: ${'interactive' in data.prompt}`);
                console.log(`   - Has socratic: ${'socratic' in data.prompt}`);
                
                if (data.prompt.direct) {
                    console.log(`   - Direct prompt length: ${data.prompt.direct.length} chars`);
                    console.log(`   - Direct preview: "${data.prompt.direct.substring(0, 100)}..."`);
                }
                
                if (data.metadata && data.metadata.templatesUsed) {
                    console.log('📋 Templates used:');
                    console.log(`   - Direct: ${data.metadata.templatesUsed.direct?.templateUsed || 'N/A'}`);
                    console.log(`   - Interactive: ${data.metadata.templatesUsed.interactive?.templateUsed || 'N/A'}`);
                    console.log(`   - Socratic: ${data.metadata.templatesUsed.socratic?.templateUsed || 'N/A'}`);
                }
            } else {
                console.log('❌ Response does not contain expected prompt structure');
                console.log('   Response:', JSON.stringify(data).substring(0, 200));
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

// Run the test
testAPI().catch(console.error);