#!/usr/bin/env node
/**
 * Template System Test Suite for Jahbreak
 * Tests the new AI-powered template selection system
 */

const assert = require('assert');
const { selectAndGenerateTemplate, getTemplateRegistry } = require('./backend/lib/templateSelector');
const { generateAllTechniquesWithTemplates } = require('./backend/lib/promptTemplates');

class TemplateSystemTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }
    
    logTest(testName, passed, details = "") {
        const status = passed ? "✅ PASS" : "❌ FAIL";
        console.log(`${status} ${testName}`);
        if (details) {
            console.log(`    ${details}`);
        }
        
        this.results.tests.push({
            name: testName,
            passed: passed,
            details: details
        });
        
        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
    }
    
    async testTemplateRegistry() {
        console.log("\n🔧 Testing Template Registry");
        
        try {
            const registry = getTemplateRegistry();
            
            // Test direct templates (should be 4)
            const directCount = registry.direct ? registry.direct.length : 0;
            this.logTest("Direct Templates Count", directCount === 4, 
                        `Found ${directCount} direct templates (expected 4)`);
            
            // Test interactive templates (should be 3) 
            const interactiveCount = registry.interactive ? registry.interactive.length : 0;
            this.logTest("Interactive Templates Count", interactiveCount === 3,
                        `Found ${interactiveCount} interactive templates (expected 3)`);
            
            // Test socratic templates (should be 3)
            const socraticCount = registry.socratic ? registry.socratic.length : 0;
            this.logTest("Socratic Templates Count", socraticCount === 3,
                        `Found ${socraticCount} socratic templates (expected 3)`);
            
            // Test template metadata
            if (registry.direct && registry.direct.length > 0) {
                const firstTemplate = registry.direct[0];
                const hasRequiredFields = firstTemplate.name && firstTemplate.description && firstTemplate.keywords;
                this.logTest("Template Metadata Structure", hasRequiredFields,
                            `Template has name, description, keywords: ${hasRequiredFields}`);
            }
            
        } catch (error) {
            this.logTest("Template Registry Access", false, `Error: ${error.message}`);
        }
    }
    
    async testIndividualTemplateGeneration() {
        console.log("\n🔧 Testing Individual Template Generation");
        
        const testCases = [
            { technique: 'direct', query: 'How to build a website', role: 'Software Engineer' },
            { technique: 'interactive', query: 'Learn data science', role: 'Data Analyst' },
            { technique: 'socratic', query: 'Start a business', role: 'General Expert' }
        ];
        
        for (const testCase of testCases) {
            try {
                const result = await selectAndGenerateTemplate(
                    testCase.technique, 
                    testCase.query, 
                    testCase.role, 
                    { 
                        background: `Expert ${testCase.role}`,
                        specialties: ['expertise', 'guidance'],
                        experience: 'years of experience'
                    }
                );
                
                if (result && result.content && result.content.length > 500) {
                    this.logTest(`${testCase.technique} Template Generation`, true,
                                `Generated ${result.content.length} characters using ${result.templateUsed}`);
                } else {
                    this.logTest(`${testCase.technique} Template Generation`, false,
                                `Generated only ${result ? result.content.length : 0} characters`);
                }
                
            } catch (error) {
                this.logTest(`${testCase.technique} Template Generation`, false,
                            `Error: ${error.message}`);
            }
        }
    }
    
    async testFullSystemIntegration() {
        console.log("\n🔧 Testing Full System Integration");
        
        const testQueries = [
            { query: 'How to learn machine learning?', role: 'Research Scientist' },
            { query: 'Build a mobile app', role: 'Software Engineer' },
            { query: 'Analyze market trends', role: 'Financial Analyst' }
        ];
        
        for (const testCase of testQueries) {
            try {
                const result = await generateAllTechniquesWithTemplates(testCase.query, testCase.role);
                
                // Test that all techniques are present
                const hasAllTechniques = result.direct && result.interactive && result.socratic;
                this.logTest(`Full Integration - ${testCase.query.substring(0, 20)}...`, hasAllTechniques,
                            `Has all techniques: ${hasAllTechniques}`);
                
                if (hasAllTechniques) {
                    // Test quality (length > 1000 chars each)
                    const avgLength = (result.direct.length + result.interactive.length + result.socratic.length) / 3;
                    this.logTest(`Quality Check - ${testCase.query.substring(0, 20)}...`, avgLength > 1000,
                                `Average length: ${avgLength.toFixed(0)} chars`);
                    
                    // Test template metadata
                    const hasMetadata = result.templateMetadata && 
                                      result.templateMetadata.direct && 
                                      result.templateMetadata.interactive && 
                                      result.templateMetadata.socratic;
                    this.logTest(`Metadata Check - ${testCase.query.substring(0, 20)}...`, hasMetadata,
                                `Has template metadata: ${hasMetadata}`);
                }
                
            } catch (error) {
                this.logTest(`Full Integration - ${testCase.query.substring(0, 20)}...`, false,
                            `Error: ${error.message}`);
            }
        }
    }
    
    async testQueryTypeVariations() {
        console.log("\n🔧 Testing Query Type Variations");
        
        const queryTypes = [
            { type: 'learning', query: 'How do I learn Python programming?', expectedDirect: 'expert_masterclass' },
            { type: 'building', query: 'Build a scalable web application', expectedDirect: 'practical_blueprint' },
            { type: 'strategy', query: 'Create a 5-year business plan', expectedDirect: 'strategic_roadmap' },
            { type: 'complex', query: 'Implement microservices architecture', expectedInteractive: 'comprehensive_discovery' },
            { type: 'focused', query: 'Fix this specific bug', expectedInteractive: 'focused_dialogue' }
        ];
        
        for (const testCase of queryTypes) {
            try {
                const result = await generateAllTechniquesWithTemplates(testCase.query, 'Software Engineer');
                
                if (result && result.templateMetadata) {
                    let templateMatch = false;
                    
                    // Check if expected template was used (for direct technique)
                    if (testCase.expectedDirect) {
                        templateMatch = result.templateMetadata.direct.templateUsed === testCase.expectedDirect;
                    }
                    // Check if expected template was used (for interactive technique)
                    else if (testCase.expectedInteractive) {
                        templateMatch = result.templateMetadata.interactive.templateUsed === testCase.expectedInteractive;
                    }
                    
                    this.logTest(`Query Type Selection - ${testCase.type}`, templateMatch,
                                `Expected: ${testCase.expectedDirect || testCase.expectedInteractive}, Got: ${result.templateMetadata.direct?.templateUsed || result.templateMetadata.interactive?.templateUsed}`);
                } else {
                    this.logTest(`Query Type Selection - ${testCase.type}`, false, "No template metadata returned");
                }
                
            } catch (error) {
                this.logTest(`Query Type Selection - ${testCase.type}`, false, `Error: ${error.message}`);
            }
        }
    }
    
    async testErrorHandling() {
        console.log("\n🔧 Testing Error Handling");
        
        try {
            // Test with invalid technique
            try {
                await selectAndGenerateTemplate('invalid', 'test query', 'General Expert', {});
                this.logTest("Invalid Technique Handling", false, "Should have thrown error");
            } catch (error) {
                this.logTest("Invalid Technique Handling", true, "Correctly threw error for invalid technique");
            }
            
            // Test with empty query
            try {
                const result = await generateAllTechniquesWithTemplates('', 'General Expert');
                this.logTest("Empty Query Handling", result !== null, "Handled empty query gracefully");
            } catch (error) {
                this.logTest("Empty Query Handling", false, `Error with empty query: ${error.message}`);
            }
            
            // Test with invalid role
            try {
                const result = await generateAllTechniquesWithTemplates('test query', 'Invalid Role');
                this.logTest("Invalid Role Handling", result !== null, "Handled invalid role gracefully");
            } catch (error) {
                this.logTest("Invalid Role Handling", false, `Error with invalid role: ${error.message}`);
            }
            
        } catch (error) {
            this.logTest("Error Handling Tests", false, `Unexpected error: ${error.message}`);
        }
    }
    
    async runAllTests() {
        console.log("🚀 JAHBREAK TEMPLATE SYSTEM TEST SUITE");
        console.log("=".repeat(60));
        
        await this.testTemplateRegistry();
        await this.testIndividualTemplateGeneration();
        await this.testFullSystemIntegration();
        await this.testQueryTypeVariations();
        await this.testErrorHandling();
        
        // Print summary
        console.log("\n" + "=" * 60);
        console.log("📊 TEST SUMMARY");
        console.log("=".repeat(60));
        
        const totalTests = this.results.passed + this.results.failed;
        const passRate = totalTests > 0 ? (this.results.passed / totalTests * 100) : 0;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${this.results.passed} ✅`);
        console.log(`Failed: ${this.results.failed} ❌`);
        console.log(`Pass Rate: ${passRate.toFixed(1)}%`);
        
        if (passRate >= 90) {
            console.log("🎉 EXCELLENT - Template system is working perfectly!");
        } else if (passRate >= 80) {
            console.log("👍 GOOD - Template system is mostly working with minor issues");
        } else if (passRate >= 70) {
            console.log("⚠️ FAIR - Template system has some significant issues");
        } else {
            console.log("🚨 POOR - Template system has major problems");
        }
        
        return passRate >= 80;
    }
}

async function main() {
    const tester = new TemplateSystemTester();
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { TemplateSystemTester };