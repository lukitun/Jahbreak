const { selectAndGenerateTemplate } = require('./backend/lib/templateSelector');

async function testTemplateSelection() {
    console.log('🧪 Testing Template Selection Logic\n');
    
    const testQueries = [
        { query: "Build me a web scraper in Python", role: "Software Engineer", expected: "coding" },
        { query: "How do I create a React app?", role: "General Expert", expected: "coding" },
        { query: "Write a function to sort an array", role: "Software Engineer", expected: "coding" },
        { query: "Explain quantum physics", role: "Physics Professor", expected: "non-coding" },
        { query: "What's the best marketing strategy?", role: "Marketing Specialist", expected: "non-coding" }
    ];
    
    for (const test of testQueries) {
        console.log(`\n📝 Testing: "${test.query}"`);
        console.log(`   Role: ${test.role}`);
        console.log(`   Expected: ${test.expected} template`);
        
        try {
            // Test direct technique
            const directResult = await selectAndGenerateTemplate('direct', test.query, test.role);
            console.log(`   ✅ Direct template: ${directResult.templateUsed}`);
            
            // Test interactive technique  
            const interactiveResult = await selectAndGenerateTemplate('interactive', test.query, test.role);
            console.log(`   ✅ Interactive template: ${interactiveResult.templateUsed}`);
            
            // Test socratic technique
            const socraticResult = await selectAndGenerateTemplate('socratic', test.query, test.role);
            console.log(`   ✅ Socratic template: ${socraticResult.templateUsed}`);
            
            // Check if coding queries use coding templates
            if (test.expected === "coding") {
                const hasCodingTemplate = 
                    directResult.templateUsed.includes('coding') ||
                    interactiveResult.templateUsed.includes('coding') ||
                    socraticResult.templateUsed.includes('coding');
                    
                if (hasCodingTemplate) {
                    console.log(`   ✅ PASS: Coding query correctly uses coding template`);
                } else {
                    console.log(`   ❌ FAIL: Coding query did not use coding template`);
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

// Run the test
testTemplateSelection().catch(console.error);