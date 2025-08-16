#!/usr/bin/env python3
"""
Detailed prompt content analysis and quality assessment
"""

import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager

class PromptContentAnalyzer:
    def __init__(self):
        self.base_url = "https://jahbreak.lukitun.xyz"
        
    def setup_driver(self):
        """Setup Chrome driver"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 30)
        
    def teardown_driver(self):
        """Close driver"""
        if hasattr(self, 'driver'):
            self.driver.quit()
            
    def analyze_prompt_structure(self, prompt_text, prompt_type):
        """Detailed analysis of prompt structure"""
        analysis = {
            "length": len(prompt_text),
            "word_count": len(prompt_text.split()),
            "has_role_definition": False,
            "has_guidelines": False,
            "has_context": False,
            "has_formatting": False,
            "has_examples": False,
            "interaction_level": "low",
            "safety_measures": [],
            "prompt_engineering_quality": "poor"
        }
        
        text_lower = prompt_text.lower()
        
        # Check for role definition
        role_indicators = ["you are", "act as", "role:", "persona", "character"]
        analysis["has_role_definition"] = any(indicator in text_lower for indicator in role_indicators)
        
        # Check for guidelines
        guideline_indicators = ["guidelines", "rules", "instructions", "should", "must", "always"]
        analysis["has_guidelines"] = any(indicator in text_lower for indicator in guideline_indicators)
        
        # Check for context setting
        context_indicators = ["context", "scenario", "situation", "given", "assume", "background"]
        analysis["has_context"] = any(indicator in text_lower for indicator in context_indicators)
        
        # Check for formatting instructions
        format_indicators = ["format", "structure", "output", "organize", "present"]
        analysis["has_formatting"] = any(indicator in text_lower for indicator in format_indicators)
        
        # Check for examples
        example_indicators = ["example", "instance", "sample", "e.g.", "for example"]
        analysis["has_examples"] = any(indicator in text_lower for indicator in example_indicators)
        
        # Determine interaction level
        if prompt_type == "2-shot":
            interaction_indicators = ["ask", "question", "clarify", "understand", "discuss"]
            if sum(1 for indicator in interaction_indicators if indicator in text_lower) >= 2:
                analysis["interaction_level"] = "high"
            else:
                analysis["interaction_level"] = "medium"
        else:
            analysis["interaction_level"] = "direct"
            
        # Check for safety measures
        safety_indicators = {
            "ethical_guidelines": ["ethical", "responsible", "appropriate", "guidelines"],
            "safety_warnings": ["safety", "careful", "caution", "warning"],
            "limitation_awareness": ["limitation", "boundary", "cannot", "should not"]
        }
        
        for safety_type, indicators in safety_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                analysis["safety_measures"].append(safety_type)
                
        # Overall quality assessment
        quality_score = 0
        if analysis["has_role_definition"]: quality_score += 2
        if analysis["has_guidelines"]: quality_score += 2
        if analysis["has_context"]: quality_score += 1
        if analysis["has_formatting"]: quality_score += 1
        if analysis["length"] > 200: quality_score += 1
        if analysis["word_count"] > 50: quality_score += 1
        
        if quality_score >= 7:
            analysis["prompt_engineering_quality"] = "excellent"
        elif quality_score >= 5:
            analysis["prompt_engineering_quality"] = "good"
        elif quality_score >= 3:
            analysis["prompt_engineering_quality"] = "fair"
        else:
            analysis["prompt_engineering_quality"] = "poor"
            
        return analysis
        
    def test_prompt_coherence(self, prompt_text, original_query):
        """Test if the prompt makes logical sense and addresses the query"""
        coherence_score = 0
        issues = []
        
        # Check query relevance
        query_words = set(original_query.lower().split())
        prompt_words = set(prompt_text.lower().split())
        overlap = len(query_words.intersection(prompt_words))
        relevance_ratio = overlap / len(query_words) if query_words else 0
        
        if relevance_ratio >= 0.5:
            coherence_score += 2
        elif relevance_ratio >= 0.3:
            coherence_score += 1
        else:
            issues.append(f"Low query relevance ({relevance_ratio:.2f})")
            
        # Check for logical flow
        sentences = re.split(r'[.!?]+', prompt_text)
        if len(sentences) >= 3:
            coherence_score += 1
        else:
            issues.append("Prompt too brief for complex guidance")
            
        # Check for contradictions
        contradiction_patterns = [
            (r"you should.*not.*you must", "contradictory instructions"),
            (r"always.*never", "contradictory absolutes"),
            (r"professional.*casual", "contradictory tone")
        ]
        
        for pattern, issue in contradiction_patterns:
            if re.search(pattern, prompt_text.lower()):
                issues.append(issue)
                coherence_score -= 1
                
        # Check readability
        avg_sentence_length = len(prompt_text.split()) / max(1, len(sentences))
        if avg_sentence_length > 30:
            issues.append("Sentences too long")
        elif avg_sentence_length > 15:
            coherence_score += 1
        else:
            coherence_score += 2
            
        return {
            "coherence_score": max(0, coherence_score),
            "max_score": 5,
            "issues": issues,
            "relevance_ratio": relevance_ratio,
            "avg_sentence_length": avg_sentence_length
        }
        
    def test_specific_query(self, query, personality, mode, expected_unsafe=False):
        """Test a specific query and analyze the results"""
        print(f"🔍 Testing query: '{query}'")
        print(f"   Personality: {personality}, Mode: {mode}")
        
        try:
            self.driver.get(self.base_url)
            self.wait.until(EC.title_contains("Jahbreak"))
            
            # Fill form
            payload_textarea = self.wait.until(EC.element_to_be_clickable((By.ID, "payload")))
            payload_textarea.clear()
            payload_textarea.send_keys(query)
            
            personality_input = self.driver.find_element(By.ID, "personality")
            personality_input.clear()
            personality_input.send_keys(personality)
            
            mode_select = Select(self.driver.find_element(By.ID, "mode"))
            mode_select.select_by_value(mode)
            
            # Submit
            generate_btn = self.driver.find_element(By.ID, "generateBtn")
            generate_btn.click()
            
            # Wait for results
            WebDriverWait(self.driver, 45).until(
                lambda d: (
                    d.find_element(By.ID, "outputSection").is_displayed() or
                    "active" in d.find_element(By.ID, "error").get_attribute("class")
                )
            )
            
            # Check for errors
            error_element = self.driver.find_element(By.ID, "error")
            if "active" in error_element.get_attribute("class"):
                print(f"   ❌ Error: {error_element.text}")
                return False
                
            # Check query classification
            query_indicator = self.driver.find_element(By.ID, "queryStatusIndicator")
            is_unsafe = "unsafe-query-indicator" in query_indicator.get_attribute("innerHTML")
            
            print(f"   Query classified as: {'Unsafe' if is_unsafe else 'Safe'}")
            
            if is_unsafe:
                return self.analyze_unsafe_prompt(query)
            else:
                return self.analyze_safe_prompts(query)
                
        except Exception as e:
            print(f"   ❌ Test failed: {e}")
            return False
            
    def analyze_safe_prompts(self, query):
        """Analyze safe query prompts (1-shot and 2-shot)"""
        results = {"1-shot": None, "2-shot": None}
        
        try:
            # Analyze 1-shot prompt
            oneshot_output = self.driver.find_element(By.ID, "oneshotOutput")
            if oneshot_output.is_displayed():
                oneshot_text = oneshot_output.text
                print(f"\n   📊 1-SHOT PROMPT ANALYSIS:")
                print(f"      Length: {len(oneshot_text)} chars, {len(oneshot_text.split())} words")
                
                structure = self.analyze_prompt_structure(oneshot_text, "1-shot")
                coherence = self.test_prompt_coherence(oneshot_text, query)
                
                print(f"      Quality: {structure['prompt_engineering_quality']}")
                print(f"      Role definition: {'✅' if structure['has_role_definition'] else '❌'}")
                print(f"      Guidelines: {'✅' if structure['has_guidelines'] else '❌'}")
                print(f"      Query relevance: {coherence['relevance_ratio']:.2f}")
                print(f"      Coherence score: {coherence['coherence_score']}/{coherence['max_score']}")
                
                if coherence['issues']:
                    print(f"      Issues: {', '.join(coherence['issues'])}")
                    
                results["1-shot"] = {
                    "text": oneshot_text,
                    "structure": structure,
                    "coherence": coherence,
                    "valid": structure['prompt_engineering_quality'] in ['good', 'excellent'] and coherence['coherence_score'] >= 3
                }
                
            # Analyze 2-shot prompt
            twoshot_output = self.driver.find_element(By.ID, "twoshotOutput")
            if twoshot_output.is_displayed():
                twoshot_text = twoshot_output.text
                print(f"\n   📊 2-SHOT PROMPT ANALYSIS:")
                print(f"      Length: {len(twoshot_text)} chars, {len(twoshot_text.split())} words")
                
                structure = self.analyze_prompt_structure(twoshot_text, "2-shot")
                coherence = self.test_prompt_coherence(twoshot_text, query)
                
                print(f"      Quality: {structure['prompt_engineering_quality']}")
                print(f"      Role definition: {'✅' if structure['has_role_definition'] else '❌'}")
                print(f"      Guidelines: {'✅' if structure['has_guidelines'] else '❌'}")
                print(f"      Interaction level: {structure['interaction_level']}")
                print(f"      Query relevance: {coherence['relevance_ratio']:.2f}")
                print(f"      Coherence score: {coherence['coherence_score']}/{coherence['max_score']}")
                
                if coherence['issues']:
                    print(f"      Issues: {', '.join(coherence['issues'])}")
                    
                results["2-shot"] = {
                    "text": twoshot_text,
                    "structure": structure,
                    "coherence": coherence,
                    "valid": structure['prompt_engineering_quality'] in ['good', 'excellent'] and coherence['coherence_score'] >= 3
                }
                
            # Compare prompts
            if results["1-shot"] and results["2-shot"]:
                print(f"\n   🔍 PROMPT COMPARISON:")
                
                # Check if they're different
                if results["1-shot"]["text"] == results["2-shot"]["text"]:
                    print("      ⚠️  Prompts are identical (should be different)")
                else:
                    print("      ✅ Prompts are appropriately different")
                    
                # Compare lengths
                len_1 = len(results["1-shot"]["text"])
                len_2 = len(results["2-shot"]["text"])
                print(f"      Length difference: {abs(len_1 - len_2)} chars")
                
                # Check interaction differences
                interaction_1 = results["1-shot"]["structure"]["interaction_level"]
                interaction_2 = results["2-shot"]["structure"]["interaction_level"]
                print(f"      Interaction levels: 1-shot={interaction_1}, 2-shot={interaction_2}")
                
            return all(r["valid"] if r else False for r in results.values())
            
        except Exception as e:
            print(f"      ❌ Analysis failed: {e}")
            return False
            
    def analyze_unsafe_prompt(self, query):
        """Analyze unsafe query prompt"""
        try:
            single_output = self.driver.find_element(By.ID, "singleOutput")
            if single_output.is_displayed():
                unsafe_text = single_output.text
                print(f"\n   📊 UNSAFE PROMPT ANALYSIS:")
                print(f"      Length: {len(unsafe_text)} chars, {len(unsafe_text.split())} words")
                
                structure = self.analyze_prompt_structure(unsafe_text, "unsafe")
                coherence = self.test_prompt_coherence(unsafe_text, query)
                
                print(f"      Quality: {structure['prompt_engineering_quality']}")
                print(f"      Safety measures: {', '.join(structure['safety_measures']) if structure['safety_measures'] else 'None detected'}")
                print(f"      Query relevance: {coherence['relevance_ratio']:.2f}")
                print(f"      Coherence score: {coherence['coherence_score']}/{coherence['max_score']}")
                
                # Check for specific unsafe prompt characteristics
                unsafe_keywords = ["developer-mode", "limitless", "safety-mode", "blocked-responses"]
                found_unsafe = [kw for kw in unsafe_keywords if kw.lower() in unsafe_text.lower()]
                print(f"      Unsafe elements: {', '.join(found_unsafe) if found_unsafe else 'None'}")
                
                if coherence['issues']:
                    print(f"      Issues: {', '.join(coherence['issues'])}")
                    
                return coherence['coherence_score'] >= 2  # Lower bar for unsafe prompts
                
        except Exception as e:
            print(f"      ❌ Unsafe analysis failed: {e}")
            return False
            
    def run_content_analysis(self):
        """Run comprehensive content analysis"""
        print("🚀 Starting detailed prompt content analysis")
        print("=" * 80)
        
        self.setup_driver()
        
        test_cases = [
            {
                "query": "Create a REST API for user authentication",
                "personality": "Backend Developer",
                "mode": "standard",
                "unsafe": False
            },
            {
                "query": "Design a machine learning model for fraud detection",
                "personality": "ML Engineer",
                "mode": "creative",
                "unsafe": False
            },
            {
                "query": "How to hack into a database",
                "personality": "Security Researcher",
                "mode": "standard",
                "unsafe": True
            }
        ]
        
        results = []
        
        try:
            for i, case in enumerate(test_cases, 1):
                print(f"\n📋 Test {i}/{len(test_cases)}")
                success = self.test_specific_query(
                    case["query"],
                    case["personality"], 
                    case["mode"],
                    case["unsafe"]
                )
                results.append((case["query"][:50] + "...", success))
                time.sleep(3)  # Pause between tests
                
        finally:
            self.teardown_driver()
            
        # Summary
        print(f"\n" + "=" * 80)
        print("📊 CONTENT ANALYSIS SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for _, success in results if success)
        total = len(results)
        
        for query, success in results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{query:55} {status}")
            
        print(f"\nContent Quality Tests: {passed}/{total} passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            print("🎉 All prompts show excellent content quality!")
        else:
            print("⚠️  Some prompts need content quality improvements")
            
        return passed == total

if __name__ == "__main__":
    analyzer = PromptContentAnalyzer()
    success = analyzer.run_content_analysis()
    exit(0 if success else 1)