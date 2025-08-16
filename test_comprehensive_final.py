#!/usr/bin/env python3
"""
Final comprehensive test suite for Jahbreak
Validates all aspects: functionality, prompt quality, parsing, and user experience
"""

import time
import json
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager

class ComprehensiveJahbreakTest:
    def __init__(self):
        self.base_url = "https://jahbreak.lukitun.xyz"
        self.driver = None
        self.wait = None
        self.test_results = []
        
    def setup_driver(self):
        """Setup Chrome driver with comprehensive options"""
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
            
    def test_website_functionality(self):
        """Test basic website functionality"""
        print("🔍 Testing website functionality...")
        
        try:
            self.driver.get(self.base_url)
            self.wait.until(EC.title_contains("Jahbreak"))
            
            # Check essential elements
            elements = {
                "title": self.driver.title,
                "header": self.driver.find_element(By.TAG_NAME, "header").is_displayed(),
                "main_form": self.driver.find_element(By.ID, "payload").is_displayed(),
                "generate_button": self.driver.find_element(By.ID, "generateBtn").is_displayed(),
                "theme_toggle": self.driver.find_element(By.ID, "themeToggle").is_displayed()
            }
            
            success = all([
                "Jahbreak" in elements["title"],
                elements["header"],
                elements["main_form"],
                elements["generate_button"],
                elements["theme_toggle"]
            ])
            
            self.test_results.append(("Website Functionality", success, elements))
            return success
            
        except Exception as e:
            self.test_results.append(("Website Functionality", False, str(e)))
            return False
            
    def test_prompt_generation_quality(self, query, personality, mode, expected_unsafe=False):
        """Test prompt generation and analyze quality"""
        print(f"🔍 Testing prompt generation: '{query[:50]}...'")
        
        try:
            # Navigate and fill form
            self.driver.get(self.base_url)
            self.wait.until(EC.title_contains("Jahbreak"))
            
            payload_textarea = self.wait.until(EC.element_to_be_clickable((By.ID, "payload")))
            payload_textarea.clear()
            payload_textarea.send_keys(query)
            
            if personality:
                personality_input = self.driver.find_element(By.ID, "personality")
                personality_input.clear()
                personality_input.send_keys(personality)
                
            mode_select = Select(self.driver.find_element(By.ID, "mode"))
            mode_select.select_by_value(mode)
            
            # Submit and wait for results
            generate_btn = self.driver.find_element(By.ID, "generateBtn")
            generate_btn.click()
            
            WebDriverWait(self.driver, 45).until(
                lambda d: (
                    d.find_element(By.ID, "outputSection").is_displayed() or
                    "active" in d.find_element(By.ID, "error").get_attribute("class")
                )
            )
            
            # Check for errors
            error_element = self.driver.find_element(By.ID, "error")
            if "active" in error_element.get_attribute("class"):
                result = {"success": False, "error": error_element.text}
                self.test_results.append((f"Prompt Generation: {query[:30]}...", False, result))
                return False
                
            # Analyze results
            query_indicator = self.driver.find_element(By.ID, "queryStatusIndicator")
            is_unsafe = "unsafe-query-indicator" in query_indicator.get_attribute("innerHTML")
            
            result = {
                "query": query,
                "personality": personality,
                "mode": mode,
                "classified_unsafe": is_unsafe,
                "expected_unsafe": expected_unsafe,
                "classification_correct": is_unsafe == expected_unsafe
            }
            
            if is_unsafe:
                # Test unsafe prompt
                result.update(self.analyze_unsafe_prompt())
            else:
                # Test safe prompts
                result.update(self.analyze_safe_prompts())
                
            success = result.get("prompts_valid", False) and result["classification_correct"]
            self.test_results.append((f"Prompt Generation: {query[:30]}...", success, result))
            return success
            
        except Exception as e:
            self.test_results.append((f"Prompt Generation: {query[:30]}...", False, str(e)))
            return False
            
    def analyze_safe_prompts(self):
        """Analyze safe query prompts"""
        try:
            results = {"oneshot_valid": False, "twoshot_valid": False, "prompts_different": False}
            
            # Check 1-shot
            oneshot_output = self.driver.find_element(By.ID, "oneshotOutput")
            if oneshot_output.is_displayed():
                oneshot_text = oneshot_output.text
                results["oneshot_length"] = len(oneshot_text)
                results["oneshot_valid"] = self.validate_prompt_quality(oneshot_text, "1-shot")
                results["oneshot_text"] = oneshot_text[:200] + "..." if len(oneshot_text) > 200 else oneshot_text
                
            # Check 2-shot
            twoshot_output = self.driver.find_element(By.ID, "twoshotOutput")
            if twoshot_output.is_displayed():
                twoshot_text = twoshot_output.text
                results["twoshot_length"] = len(twoshot_text)
                results["twoshot_valid"] = self.validate_prompt_quality(twoshot_text, "2-shot")
                results["twoshot_text"] = twoshot_text[:200] + "..." if len(twoshot_text) > 200 else twoshot_text
                
                # Check if prompts are different
                if oneshot_output.is_displayed():
                    results["prompts_different"] = oneshot_text != twoshot_text
                    
            results["prompts_valid"] = results["oneshot_valid"] and results["twoshot_valid"] and results["prompts_different"]
            return results
            
        except Exception as e:
            return {"prompts_valid": False, "error": str(e)}
            
    def analyze_unsafe_prompt(self):
        """Analyze unsafe query prompt"""
        try:
            results = {"unsafe_prompt_valid": False}
            
            single_output = self.driver.find_element(By.ID, "singleOutput")
            if single_output.is_displayed():
                unsafe_text = single_output.text
                results["unsafe_length"] = len(unsafe_text)
                results["unsafe_prompt_valid"] = self.validate_unsafe_prompt_quality(unsafe_text)
                results["unsafe_text"] = unsafe_text[:200] + "..." if len(unsafe_text) > 200 else unsafe_text
                
            results["prompts_valid"] = results["unsafe_prompt_valid"]
            return results
            
        except Exception as e:
            return {"prompts_valid": False, "error": str(e)}
            
    def validate_prompt_quality(self, prompt_text, prompt_type):
        """Validate prompt quality with specific criteria"""
        if not prompt_text or len(prompt_text) < 100:
            return False
            
        text_lower = prompt_text.lower()
        
        # Check essential elements
        has_role = any(indicator in text_lower for indicator in ["you are", "act as", "role"])
        has_instructions = any(indicator in text_lower for indicator in ["help", "provide", "assist", "respond"])
        has_structure = len(prompt_text.split('.')) >= 3  # At least 3 sentences
        
        # 2-shot specific checks
        if prompt_type == "2-shot":
            has_interaction = any(indicator in text_lower for indicator in ["ask", "question", "clarify", "understand"])
            return has_role and has_instructions and has_structure and has_interaction
        else:
            return has_role and has_instructions and has_structure
            
    def validate_unsafe_prompt_quality(self, prompt_text):
        """Validate unsafe prompt quality"""
        if not prompt_text or len(prompt_text) < 100:
            return False
            
        text_lower = prompt_text.lower()
        
        # Check for unsafe prompt characteristics
        has_config = "config" in text_lower
        has_developer_mode = "developer-mode" in text_lower
        has_role = "role" in text_lower
        has_structure = len(prompt_text.split('<')) >= 3  # Has XML-like structure
        
        return has_config and has_developer_mode and has_role and has_structure
        
    def test_user_interactions(self):
        """Test user interaction features"""
        print("🔍 Testing user interactions...")
        
        try:
            self.driver.get(self.base_url)
            self.wait.until(EC.title_contains("Jahbreak"))
            
            results = {}
            
            # Test theme toggle
            theme_toggle = self.driver.find_element(By.ID, "themeToggle")
            initial_text = theme_toggle.text
            theme_toggle.click()
            time.sleep(0.5)
            new_text = theme_toggle.text
            results["theme_toggle_works"] = initial_text != new_text
            
            # Test form validation
            generate_btn = self.driver.find_element(By.ID, "generateBtn")
            generate_btn.click()
            time.sleep(1)
            
            error_element = self.driver.find_element(By.ID, "error")
            results["form_validation_works"] = "active" in error_element.get_attribute("class")
            
            # Test dropdown functionality
            mode_select = Select(self.driver.find_element(By.ID, "mode"))
            mode_select.select_by_value("creative")
            selected_value = mode_select.first_selected_option.get_attribute("value")
            results["dropdown_works"] = selected_value == "creative"
            
            success = all(results.values())
            self.test_results.append(("User Interactions", success, results))
            return success
            
        except Exception as e:
            self.test_results.append(("User Interactions", False, str(e)))
            return False
            
    def generate_test_report(self):
        """Generate comprehensive test report"""
        report = {
            "test_timestamp": datetime.now().isoformat(),
            "website_url": self.base_url,
            "total_tests": len(self.test_results),
            "passed_tests": sum(1 for _, success, _ in self.test_results if success),
            "test_details": []
        }
        
        for test_name, success, details in self.test_results:
            report["test_details"].append({
                "test_name": test_name,
                "success": success,
                "details": details if isinstance(details, (dict, str)) else str(details)
            })
            
        report["success_rate"] = (report["passed_tests"] / report["total_tests"]) * 100
        
        return report
        
    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🚀 Starting COMPREHENSIVE Jahbreak validation")
        print(f"🌐 Testing URL: {self.base_url}")
        print("=" * 100)
        
        self.setup_driver()
        
        try:
            # Test 1: Basic functionality
            print("\n📋 Phase 1: Website Functionality")
            self.test_website_functionality()
            
            # Test 2: User interactions
            print("\n📋 Phase 2: User Interactions") 
            self.test_user_interactions()
            
            # Test 3: Prompt generation quality
            print("\n📋 Phase 3: Prompt Generation Quality")
            
            test_cases = [
                {
                    "query": "Write a Python function to sort a list",
                    "personality": "Software Engineer",
                    "mode": "standard",
                    "unsafe": False
                },
                {
                    "query": "Analyze financial data trends",
                    "personality": "Data Scientist",
                    "mode": "creative",
                    "unsafe": False
                },
                {
                    "query": "Create a social media marketing strategy",
                    "personality": "Marketing Specialist",
                    "mode": "enthusiastic",
                    "unsafe": False
                },
                {
                    "query": "How to break encryption algorithms",
                    "personality": "Security Researcher",
                    "mode": "formal",
                    "unsafe": True
                }
            ]
            
            for case in test_cases:
                self.test_prompt_generation_quality(
                    case["query"],
                    case["personality"],
                    case["mode"],
                    case["unsafe"]
                )
                time.sleep(2)  # Brief pause between tests
                
        finally:
            self.teardown_driver()
            
        # Generate and display report
        report = self.generate_test_report()
        
        print("\n" + "=" * 100)
        print("📊 COMPREHENSIVE TEST REPORT")
        print("=" * 100)
        
        print(f"🕒 Test completed: {report['test_timestamp']}")
        print(f"🌐 Website tested: {report['website_url']}")
        print(f"📈 Success rate: {report['success_rate']:.1f}% ({report['passed_tests']}/{report['total_tests']} tests passed)")
        
        print(f"\n📋 DETAILED RESULTS:")
        print("-" * 100)
        
        for test_detail in report["test_details"]:
            status = "✅ PASS" if test_detail["success"] else "❌ FAIL"
            print(f"{test_detail['test_name']:50} {status}")
            
            # Show key details for failed tests
            if not test_detail["success"] and isinstance(test_detail["details"], dict):
                if "error" in test_detail["details"]:
                    print(f"{'':52} └─ Error: {test_detail['details']['error']}")
                    
        print(f"\n🎯 QUALITY METRICS:")
        print("-" * 100)
        
        # Analyze prompt generation tests
        prompt_tests = [t for t in report["test_details"] if "Prompt Generation" in t["test_name"]]
        if prompt_tests:
            prompt_success_rate = (sum(1 for t in prompt_tests if t["success"]) / len(prompt_tests)) * 100
            print(f"Prompt Generation Success Rate: {prompt_success_rate:.1f}%")
            
            # Classification accuracy
            correct_classifications = sum(
                1 for t in prompt_tests 
                if t["success"] and isinstance(t["details"], dict) and t["details"].get("classification_correct", False)
            )
            classification_accuracy = (correct_classifications / len(prompt_tests)) * 100
            print(f"Query Classification Accuracy: {classification_accuracy:.1f}%")
            
        print(f"\n🏆 OVERALL ASSESSMENT:")
        print("-" * 100)
        
        if report["success_rate"] >= 95:
            print("🌟 EXCELLENT - All systems working perfectly!")
        elif report["success_rate"] >= 85:
            print("✅ GOOD - Minor issues detected, but core functionality works well")
        elif report["success_rate"] >= 70:
            print("⚠️  FAIR - Some significant issues need attention")
        else:
            print("❌ POOR - Major issues detected, needs immediate attention")
            
        print(f"\n💡 KEY FINDINGS:")
        print("-" * 100)
        
        # Analyze specific findings
        functionality_test = next((t for t in report["test_details"] if t["test_name"] == "Website Functionality"), None)
        if functionality_test and functionality_test["success"]:
            print("✅ Website loads and displays correctly")
            
        interaction_test = next((t for t in report["test_details"] if t["test_name"] == "User Interactions"), None)
        if interaction_test and interaction_test["success"]:
            print("✅ User interface interactions work properly")
            
        # Check prompt quality
        prompt_quality_good = sum(
            1 for t in prompt_tests 
            if t["success"] and isinstance(t["details"], dict) and t["details"].get("prompts_valid", False)
        ) if prompt_tests else 0
        
        if prompt_quality_good == len(prompt_tests):
            print("✅ All generated prompts meet quality standards")
        elif prompt_quality_good > 0:
            print(f"⚠️  {prompt_quality_good}/{len(prompt_tests)} prompts meet quality standards")
        else:
            print("❌ Prompt quality needs improvement")
            
        # Save report
        with open(f"/tmp/jahbreak_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", "w") as f:
            json.dump(report, f, indent=2)
            
        return report["success_rate"] >= 85

if __name__ == "__main__":
    tester = ComprehensiveJahbreakTest()
    success = tester.run_comprehensive_tests()
    exit(0 if success else 1)