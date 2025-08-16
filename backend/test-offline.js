// Test the prompt structure without making API calls
function testPromptStructure() {
    console.log('=== Testing Prompt Structure (Offline) ===\n');
    
    const payload = "How do I create a REST API with Node.js?";
    const role = "Software Engineer";
    const exampleQuery = "how can i make a website to sell dogs";
    const exampleResponse = `As a Software Engineer, I'll provide you with a comprehensive solution. Let me break this down into clear, actionable steps that you can follow. First, we need to understand the core requirements and then build a systematic approach to achieve your goal.`;
    
    // Build the expected prompt format
    const expectedPrompt = `query: ${exampleQuery}
response: ${exampleResponse}

response2: You are a ${role}. Ask the user relevant questions about their query to better understand their needs and requirements. After they respond to the questions, you must help them achieve their goal with detailed, actionable guidance.

user query: ${payload}
rule: respond in query's language`;
    
    console.log('Expected prompt structure:');
    console.log('=' .repeat(60));
    console.log(expectedPrompt);
    console.log('=' .repeat(60));
    
    // Test structure validation
    const structure = {
        hasQuery: expectedPrompt.includes('query:'),
        hasResponse: expectedPrompt.includes('response:'),
        hasResponse2: expectedPrompt.includes('response2:'),
        hasUserQuery: expectedPrompt.includes('user query:'),
        hasRule: expectedPrompt.includes('rule:')
    };
    
    console.log('\nStructure validation:');
    Object.entries(structure).forEach(([key, value]) => {
        console.log(`  ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const isValid = Object.values(structure).every(v => v === true);
    console.log(`\n${isValid ? '✅' : '❌'} Overall structure: ${isValid ? 'VALID' : 'INVALID'}`);
    
    // Test parsing (simulate frontend parsing)
    console.log('\n=== Testing Frontend Parsing ===');
    const lines = expectedPrompt.split('\\n');
    
    let queryLineIndex = -1;
    let responseLineIndex = -1;
    let response2LineIndex = -1;
    let userQueryLineIndex = -1;
    let ruleLineIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('query:')) queryLineIndex = i;
        else if (line.startsWith('response:')) responseLineIndex = i;
        else if (line.startsWith('response2:')) response2LineIndex = i;
        else if (line.startsWith('user query:')) userQueryLineIndex = i;
        else if (line.startsWith('rule:')) ruleLineIndex = i;
    }
    
    console.log('Line indices found:');
    console.log(`  query: ${queryLineIndex}`);
    console.log(`  response: ${responseLineIndex}`);  
    console.log(`  response2: ${response2LineIndex}`);
    console.log(`  user query: ${userQueryLineIndex}`);
    console.log(`  rule: ${ruleLineIndex}`);
    
    // Build 1-shot prompt (query + response + user query + rule)
    let oneShot = '';
    if (queryLineIndex >= 0) oneShot += lines[queryLineIndex] + '\\n';
    if (responseLineIndex >= 0) {
        oneShot += lines[responseLineIndex] + '\\n';
        // Add response content
        let endIndex = response2LineIndex >= 0 ? response2LineIndex : userQueryLineIndex;
        for (let i = responseLineIndex + 1; i < endIndex; i++) {
            if (lines[i].trim() !== '') oneShot += lines[i] + '\\n';
        }
    }
    if (userQueryLineIndex >= 0) oneShot += '\\n' + lines[userQueryLineIndex] + '\\n';
    if (ruleLineIndex >= 0) oneShot += lines[ruleLineIndex];
    
    // Build 2-shot prompt (response2 + user query + rule)
    let twoShot = '';
    if (response2LineIndex >= 0) {
        twoShot += lines[response2LineIndex] + '\\n';
        // Add response2 content
        let endIndex = userQueryLineIndex >= 0 ? userQueryLineIndex : lines.length;
        for (let i = response2LineIndex + 1; i < endIndex; i++) {
            if (lines[i].trim() !== '') twoShot += lines[i] + '\\n';
        }
    }
    if (userQueryLineIndex >= 0) twoShot += '\\n' + lines[userQueryLineIndex] + '\\n';
    if (ruleLineIndex >= 0) twoShot += lines[ruleLineIndex];
    
    console.log('\\n=== Parsed Results ===');
    console.log('\\n1-Shot Prompt:');
    console.log('-'.repeat(30));
    console.log(oneShot.trim());
    
    console.log('\\n2-Shot Prompt:');
    console.log('-'.repeat(30));
    console.log(twoShot.trim());
    
    console.log('\\n=== Test Complete ===');
}

testPromptStructure();