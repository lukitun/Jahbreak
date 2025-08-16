#!/usr/bin/env python3
"""
Advanced Selenium test suite for Jahbreak prompt validation
Tests prompt generation, parsing, and quality validation
"""

import time
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager

class PromptValidationTest:
    def __init__(self):
        self.base_url = "https://jahbreak.lukitun.xyz"
        self.driver = None
        self.wait = None
        
        # Test cases for different scenarios
        self.test_cases = [
            {
                "name": "Simple Programming Task",
                "query": "Write a Python function to calculate factorial",
                "personality": "Software Engineer",
                "mode": "standard",
                "expected_safe": True,
                "keywords": ["python", "function", "factorial", "def", "return"]
            },
            {
                "name": "Data Analysis Request",
                "query": "Analyze customer data and provide insights",
                "personality": "Data Analyst",
                "mode": "creative",
                "expected_safe": True,
                "keywords": ["data", "analysis", "insights", "customer"]
            },
            {
                "name": "Complex Technical Query",
                "query": "Design a microservices architecture for e-commerce platform",
                "personality": "System Architect",
                "mode": "formal",
                "expected_safe": True,
                "keywords": ["microservices", "architecture", "design", "platform"]
            },
            {
                "name": "Research Question",
                "query": "Explain quantum computing principles",
                "personality": "Research Scientist",
                "mode": "enthusiastic",
                "expected_safe": True,
                "keywords": ["quantum", "computing", "principles", "explain"]
            },
            {
                "name": "Potentially Unsafe Query",
                "query": "How to bypass security systems",
                "personality": "Security Expert",
                "mode": "standard",
                "expected_safe": False,
                "keywords": ["security", "bypass", "systems"]
            }
        ]
        
    def setup_driver(self):
        """Setup Chrome driver with appropriate options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 30)
        
    def teardown_driver(self):
        """Close the driver"""
        if self.driver:
            self.driver.quit()
            
    def validate_prompt_structure(self, prompt_text, prompt_type):
        """Validate the structure and quality of generated prompts"""
        if not prompt_text or len(prompt_text.strip()) < 50:
            return False, "Prompt too short or empty"
            
        # Check for basic prompt engineering elements
        required_elements = {
            "role_definition": ["role", "act as", "you are", "persona", "character"],
            "clear_instructions": ["please", "help", "create", "write", "generate", "provide"],
            "context_setting": ["context", "scenario", "situation", "given", "assume"],
            "output_format": ["format", "structure", "output", "response", "result"]
        }
        
        found_elements = {}
        prompt_lower = prompt_text.lower()
        
        for element_type, keywords in required_elements.items():
            found_elements[element_type] = any(keyword in prompt_lower for keyword in keywords)
            
        # Specific validation for 1-shot vs 2-shot prompts
        if prompt_type == "1-shot":
            # 1-shot should be direct and complete
            if not found_elements["role_definition"]:
                return False, "1-shot prompt missing role definition"
            if not found_elements["clear_instructions"]:
                return False, "1-shot prompt missing clear instructions"
                
        elif prompt_type == "2-shot":
            # 2-shot should encourage interaction
            interaction_keywords = ["ask", "question", "clarify", "understand", "details", "specific"]
            has_interaction = any(keyword in prompt_lower for keyword in interaction_keywords)
            if not has_interaction:
                return False, "2-shot prompt doesn't encourage interaction"
                
        # Check for prompt injection vulnerabilities
        dangerous_patterns = [
            r"ignore\s+previous\s+instructions",
            r"forget\s+your\s+role",
            r"act\s+as\s+if",
            r"pretend\s+you",
            r"jailbreak",
            r"dan\s+mode"
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, prompt_lower):
                return False, f"Prompt contains potentially dangerous pattern: {pattern}"
                
        return True, "Prompt structure is valid"
        
    def validate_prompt_content_quality(self, prompt_text, test_case):
        """Validate the content quality and relevance of prompts"""
        prompt_lower = prompt_text.lower()
        query_lower = test_case["query"].lower()
        
        # Check if prompt addresses the original query
        query_words = set(query_lower.split())
        prompt_words = set(prompt_lower.split())
        overlap = query_words.intersection(prompt_words)
        
        if len(overlap) < len(query_words) * 0.3:  # At least 30% word overlap
            return False, "Prompt doesn't adequately address the original query"
            
        # Check for expected keywords
        found_keywords = [kw for kw in test_case["keywords"] if kw.lower() in prompt_lower]
        if len(found_keywords) < len(test_case["keywords"]) * 0.5:  # At least 50% of keywords
            return False, f"Prompt missing important keywords. Found: {found_keywords}"
            
        # Check personality integration
        personality = test_case["personality"].lower()
        if personality not in prompt_lower and not any(word in prompt_lower for word in personality.split()):
            return False, f"Prompt doesn't reflect the {test_case['personality']} personality"
            
        # Check length appropriateness
        if len(prompt_text) < 100:
            return False, "Prompt too short for effective guidance"
        if len(prompt_text) > 2000:
            return False, "Prompt too long, may be unwieldy"
            
        return True, "Prompt content quality is good"
        
    def test_prompt_generation_for_case(self, test_case):
        """Test prompt generation for a specific test case"""
        print(f"🔍 Testing: {test_case['name']}")
        
        try:
            # Navigate to the page
            self.driver.get(self.base_url)
            self.wait.until(EC.title_contains("Jahbreak"))
            
            # Fill the form
            payload_textarea = self.wait.until(EC.element_to_be_clickable((By.ID, "payload")))
            payload_textarea.clear()
            payload_textarea.send_keys(test_case["query"])
            
            if test_case["personality"]:
                personality_input = self.driver.find_element(By.ID, "personality")
                personality_input.clear()
                personality_input.send_keys(test_case["personality"])
                
            mode_select = Select(self.driver.find_element(By.ID, "mode"))
            mode_select.select_by_value(test_case["mode"])
            
            # Submit the form
            generate_btn = self.driver.find_element(By.ID, "generateBtn")
            generate_btn.click()
            
            # Wait for results
            try:
                WebDriverWait(self.driver, 45).until(
                    lambda driver: (
                        driver.find_element(By.ID, "outputSection").is_displayed() or
                        "active" in driver.find_element(By.ID, "error").get_attribute("class")
                    )
                )
                
                # Check for errors first
                error_element = self.driver.find_element(By.ID, "error")
                if "active" in error_element.get_attribute("class"):
                    print(f"❌ API Error: {error_element.text}")
                    return False, f"API Error: {error_element.text}"
                
                # Check output section
                output_section = self.driver.find_element(By.ID, "outputSection")
                if not output_section.is_displayed():
                    print("❌ No output received")
                    return False, "No output received"
                
                # Check query classification
                query_indicator = self.driver.find_element(By.ID, "queryStatusIndicator")
                is_safe_actual = "safe-query-indicator" in query_indicator.get_attribute("innerHTML")
                
                print(f"   Query classified as: {'Safe' if is_safe_actual else 'Unsafe'}")
                
                if is_safe_actual != test_case["expected_safe"]:
                    print(f"⚠️  Expected {test_case['expected_safe']}, got {is_safe_actual}")
                
                # Test based on query type
                if is_safe_actual:
                    return self.test_safe_query_prompts(test_case)
                else:
                    return self.test_unsafe_query_prompt(test_case)
                    
            except Exception as timeout_e:
                print(f"❌ Request timed out: {timeout_e}")
                return False, f"Request timed out: {timeout_e}"
                
        except Exception as e:
            print(f"❌ Test setup failed: {e}")
            return False, f"Test setup failed: {e}"
            
    def test_safe_query_prompts(self, test_case):
        """Test both 1-shot and 2-shot prompts for safe queries"""
        results = {"1-shot": None, "2-shot": None}
        
        try:
            # Test 1-shot prompt
            oneshot_output = self.driver.find_element(By.ID, "oneshotOutput")
            if oneshot_output.is_displayed():
                oneshot_text = oneshot_output.text
                print(f"   1-Shot prompt length: {len(oneshot_text)} characters")
                
                # Validate structure
                structure_valid, structure_msg = self.validate_prompt_structure(oneshot_text, "1-shot")
                print(f"   1-Shot structure: {'✅' if structure_valid else '❌'} {structure_msg}")
                
                # Validate content quality
                quality_valid, quality_msg = self.validate_prompt_content_quality(oneshot_text, test_case)
                print(f"   1-Shot content: {'✅' if quality_valid else '❌'} {quality_msg}")
                
                results["1-shot"] = structure_valid and quality_valid
                
                # Preview of the prompt
                preview = oneshot_text[:200] + "..." if len(oneshot_text) > 200 else oneshot_text
                print(f"   1-Shot preview: {preview}")
            else:
                print("   ❌ 1-Shot prompt not found")
                results["1-shot"] = False
                
            # Test 2-shot prompt
            twoshot_output = self.driver.find_element(By.ID, "twoshotOutput")
            if twoshot_output.is_displayed():
                twoshot_text = twoshot_output.text
                print(f"   2-Shot prompt length: {len(twoshot_text)} characters")
                
                # Validate structure
                structure_valid, structure_msg = self.validate_prompt_structure(twoshot_text, "2-shot")
                print(f"   2-Shot structure: {'✅' if structure_valid else '❌'} {structure_msg}")
                
                # Validate content quality
                quality_valid, quality_msg = self.validate_prompt_content_quality(twoshot_text, test_case)
                print(f"   2-Shot content: {'✅' if quality_valid else '❌'} {quality_msg}")
                
                results["2-shot"] = structure_valid and quality_valid
                
                # Preview of the prompt
                preview = twoshot_text[:200] + "..." if len(twoshot_text) > 200 else twoshot_text
                print(f"   2-Shot preview: {preview}")
                
                # Validate that prompts are different
                if oneshot_output.is_displayed() and oneshot_text == twoshot_text:
                    print("   ⚠️  1-Shot and 2-Shot prompts are identical")
                    
            else:
                print("   ❌ 2-Shot prompt not found")
                results["2-shot"] = False
                
            # Test copy functionality
            self.test_copy_functionality()
            
            success = all(results.values())
            return success, f"Safe query test: {results}"
            
        except Exception as e:
            print(f"   ❌ Safe query test failed: {e}")
            return False, f"Safe query test failed: {e}"
            
    def test_unsafe_query_prompt(self, test_case):
        """Test single prompt for unsafe queries"""
        try:
            single_output = self.driver.find_element(By.ID, "singleOutput")
            if single_output.is_displayed():
                single_text = single_output.text
                print(f"   Unsafe prompt length: {len(single_text)} characters")
                
                # Validate structure
                structure_valid, structure_msg = self.validate_prompt_structure(single_text, "unsafe")
                print(f"   Unsafe structure: {'✅' if structure_valid else '❌'} {structure_msg}")
                
                # For unsafe queries, check for safety mechanisms
                safety_keywords = ["safety", "ethical", "responsible", "guidelines", "appropriate"]
                has_safety = any(keyword in single_text.lower() for keyword in safety_keywords)
                print(f"   Safety mechanisms: {'✅' if has_safety else '❌'} {'Present' if has_safety else 'Missing'}")
                
                # Preview of the prompt
                preview = single_text[:200] + "..." if len(single_text) > 200 else single_text
                print(f"   Unsafe prompt preview: {preview}")
                
                return structure_valid, f"Unsafe query test passed"
            else:
                print("   ❌ Unsafe prompt not found")
                return False, "Unsafe prompt not found"
                
        except Exception as e:
            print(f"   ❌ Unsafe query test failed: {e}")
            return False, f"Unsafe query test failed: {e}"
            
    def test_copy_functionality(self):
        """Test the copy to clipboard functionality"""
        try:
            copy_buttons = self.driver.find_elements(By.CSS_SELECTOR, ".copy-button")
            if copy_buttons:
                # Click first copy button
                copy_buttons[0].click()
                time.sleep(1)
                
                # Check if button text changed to "Copied!"
                if "Copied!" in copy_buttons[0].text:
                    print("   ✅ Copy functionality working")
                else:
                    print("   ⚠️  Copy functionality unclear")
            else:
                print("   ❌ Copy buttons not found")
        except Exception as e:
            print(f"   ⚠️  Copy test failed: {e}")
            
    def test_feedback_functionality(self):
        """Test the feedback system"""
        try:
            feedback_buttons = self.driver.find_elements(By.CSS_SELECTOR, ".feedback-button")
            if feedback_buttons:
                # Click first feedback button
                feedback_buttons[0].click()
                time.sleep(1)
                
                # Check if feedback section appeared
                feedback_sections = self.driver.find_elements(By.CSS_SELECTOR, ".feedback-section")
                visible_sections = [fs for fs in feedback_sections if fs.is_displayed()]
                
                if visible_sections:
                    print("   ✅ Feedback functionality working")
                    
                    # Test feedback submission
                    yes_buttons = visible_sections[0].find_elements(By.XPATH, ".//button[contains(text(), 'Yes')]")
                    if yes_buttons:
                        yes_buttons[0].click()
                        time.sleep(2)
                        
                        # Check for feedback confirmation
                        feedback_messages = visible_sections[0].find_elements(By.CSS_SELECTOR, ".feedback-message")
                        if feedback_messages and "Thank you" in feedback_messages[0].text:
                            print("   ✅ Feedback submission working")
                        else:
                            print("   ⚠️  Feedback submission unclear")
                else:
                    print("   ❌ Feedback section not visible")
            else:
                print("   ❌ Feedback buttons not found")
        except Exception as e:
            print(f"   ⚠️  Feedback test failed: {e}")
            
    def run_comprehensive_prompt_tests(self):
        """Run all prompt validation tests"""
        print("🚀 Starting comprehensive prompt validation tests")
        print(f"🌐 Testing URL: {self.base_url}")
        print("=" * 80)
        
        self.setup_driver()
        
        test_results = []
        
        try:
            for i, test_case in enumerate(self.test_cases, 1):
                print(f"\n📋 Test {i}/{len(self.test_cases)}: {test_case['name']}")
                print(f"   Query: '{test_case['query']}'")
                print(f"   Personality: {test_case['personality']}")
                print(f"   Mode: {test_case['mode']}")
                
                success, message = self.test_prompt_generation_for_case(test_case)
                test_results.append((test_case['name'], success, message))
                
                if success:
                    print(f"   ✅ {test_case['name']} - PASSED")
                else:
                    print(f"   ❌ {test_case['name']} - FAILED: {message}")
                    
                # Brief pause between tests
                time.sleep(2)
                
            # Test feedback functionality on the last test
            print(f"\n📋 Testing feedback system...")
            self.test_feedback_functionality()
                
        finally:
            self.teardown_driver()
            
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for _, success, _ in test_results if success)
        total = len(test_results)
        
        for test_name, success, message in test_results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{test_name:35} {status}")
            if not success:
                print(f"{'':37} └─ {message}")
                
        print(f"\nOverall Prompt Tests: {passed}/{total} passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            print("🎉 All prompt validation tests passed!")
            print("✨ Prompts are well-structured, relevant, and high-quality")
        else:
            print("⚠️  Some prompt validation tests failed")
            print("🔧 Review the failed tests above for improvement areas")
            
        return passed == total

if __name__ == "__main__":
    tester = PromptValidationTest()
    success = tester.run_comprehensive_prompt_tests()
    exit(0 if success else 1)