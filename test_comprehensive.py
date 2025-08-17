#!/usr/bin/env python3
"""
Comprehensive Jahbreak Test Suite
Tests everything: UI, API, prompt generation, and website display with detailed logging
"""

import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from datetime import datetime

class JahbreakTester:
    def __init__(self, base_url="https://jahbreak.lukitun.xyz", api_url="https://bando.life"):
        self.base_url = base_url
        self.api_url = api_url
        self.driver = None
        self.test_results = {
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "summary": {"total": 0, "passed": 0, "failed": 0}
        }
        
    def log(self, message, level="INFO"):
        """Enhanced logging with timestamps and levels"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        prefix = {
            "INFO": "ℹ️",
            "SUCCESS": "✅", 
            "ERROR": "❌",
            "WARNING": "⚠️",
            "DEBUG": "🔍"
        }.get(level, "ℹ️")
        
        print(f"[{timestamp}] {prefix} {message}")
        
    def add_test_result(self, test_name, passed, details="", error_msg=""):
        """Add test result to tracking"""
        result = {
            "name": test_name,
            "passed": passed,
            "details": details,
            "error": error_msg,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results["tests"].append(result)
        self.test_results["summary"]["total"] += 1
        if passed:
            self.test_results["summary"]["passed"] += 1
        else:
            self.test_results["summary"]["failed"] += 1

    def validate_prompt_quality(self, content, technique_name):
        """Validate prompt quality and relevance"""
        quality_score = 0.0
        
        # Check 1: Length (proper prompts should be substantial)
        if len(content) > 200:
            quality_score += 0.2
        elif len(content) > 100:
            quality_score += 0.1
            
        # Check 2: Contains technique-specific keywords
        technique_keywords = {
            "Direct": ["implementation", "steps", "process", "blueprint", "framework", "guide"],
            "Interactive": ["questions", "what", "how", "why", "clarify", "consultation"],
            "Socratic": ["question", "think", "consider", "analyze", "evaluate", "critical"]
        }
        
        keywords = technique_keywords.get(technique_name, [])
        keyword_count = sum(1 for keyword in keywords if keyword.lower() in content.lower())
        if keyword_count >= 2:
            quality_score += 0.3
        elif keyword_count >= 1:
            quality_score += 0.2
            
        # Check 3: Professional structure (contains formatting)
        if any(marker in content for marker in ["□", "•", ":", "1.", "2.", "PHASE", "STEP"]):
            quality_score += 0.2
            
        # Check 4: Mentions the actual query topic
        test_query = "python"  # Our test query is about learning Python
        if test_query.lower() in content.lower():
            quality_score += 0.2
            
        # Check 5: Contains professional language indicators
        professional_indicators = ["expertise", "professional", "experience", "best practices", "guidance"]
        if any(indicator in content.lower() for indicator in professional_indicators):
            quality_score += 0.1
            
        return min(quality_score, 1.0)  # Cap at 1.0

    def setup_driver(self):
        """Setup Chrome driver with comprehensive options"""
        self.log("Setting up Chrome WebDriver...")
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--remote-debugging-port=9222")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--allow-running-insecure-content")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            self.log("Chrome WebDriver setup successful", "SUCCESS")
            return True
        except Exception as e:
            self.log(f"Failed to create Chrome driver: {e}", "ERROR")
            self.add_test_result("WebDriver Setup", False, error_msg=str(e))
            return False

    def test_website_accessibility(self):
        """Test if website loads and is accessible"""
        test_name = "Website Accessibility"
        self.log(f"Testing {test_name}...")
        
        try:
            self.driver.get(self.base_url)
            self.log(f"Navigated to {self.base_url}")
            
            # Check page loads
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check title
            title = self.driver.title
            self.log(f"Page title: '{title}'")
            
            if "Jahbreak" in title:
                self.log("✓ Correct page title found", "SUCCESS")
                self.add_test_result(test_name, True, f"Title: {title}")
                return True
            else:
                self.log("✗ Incorrect page title", "ERROR")
                self.add_test_result(test_name, False, f"Expected 'Jahbreak' in title, got: {title}")
                return False
                
        except Exception as e:
            self.log(f"Website accessibility test failed: {e}", "ERROR")
            self.add_test_result(test_name, False, error_msg=str(e))
            return False

    def test_ui_elements(self):
        """Test all UI elements are present and functional"""
        test_name = "UI Elements"
        self.log(f"Testing {test_name}...")
        
        try:
            elements_to_check = [
                ("payload", "Query textarea"),
                ("generateBtn", "Generate button"),
                ("personality", "Personality input"),
                ("obfuscation", "Obfuscation select"),
                ("mode", "Mode select"),
                ("themeToggle", "Theme toggle button")
            ]
            
            missing_elements = []
            found_elements = []
            
            for element_id, description in elements_to_check:
                try:
                    element = self.driver.find_element(By.ID, element_id)
                    if element.is_displayed():
                        found_elements.append(description)
                        self.log(f"✓ {description} found and visible")
                    else:
                        missing_elements.append(f"{description} (not visible)")
                        self.log(f"✗ {description} found but not visible", "WARNING")
                except Exception as e:
                    missing_elements.append(f"{description} (not found)")
                    self.log(f"✗ {description} not found: {e}", "ERROR")
            
            if not missing_elements:
                self.log("All UI elements found and visible", "SUCCESS")
                self.add_test_result(test_name, True, f"Found: {', '.join(found_elements)}")
                return True
            else:
                self.log(f"Missing UI elements: {missing_elements}", "ERROR")
                self.add_test_result(test_name, False, f"Missing: {', '.join(missing_elements)}")
                return False
                
        except Exception as e:
            self.log(f"UI elements test failed: {e}", "ERROR")
            self.add_test_result(test_name, False, error_msg=str(e))
            return False

    def test_theme_toggle(self):
        """Test theme toggle functionality"""
        test_name = "Theme Toggle"
        self.log(f"Testing {test_name}...")
        
        try:
            theme_toggle = self.driver.find_element(By.ID, "themeToggle")
            initial_text = theme_toggle.text
            self.log(f"Initial theme toggle text: '{initial_text}'")
            
            # Click theme toggle
            theme_toggle.click()
            time.sleep(1)  # Wait for transition
            
            new_text = theme_toggle.text
            self.log(f"New theme toggle text: '{new_text}'")
            
            if new_text != initial_text:
                self.log("Theme toggle works correctly", "SUCCESS")
                self.add_test_result(test_name, True, f"Changed from '{initial_text}' to '{new_text}'")
                return True
            else:
                self.log("Theme toggle did not change text", "ERROR")
                self.add_test_result(test_name, False, "Toggle text did not change")
                return False
                
        except Exception as e:
            self.log(f"Theme toggle test failed: {e}", "ERROR")
            self.add_test_result(test_name, False, error_msg=str(e))
            return False

    def test_api_direct_call(self):
        """Test API endpoint directly"""
        test_name = "API Direct Call"
        self.log(f"Testing {test_name}...")
        
        try:
            api_endpoint = f"{self.api_url}/api/generate"
            self.log(f"Testing API endpoint: {api_endpoint}")
            
            payload = {
                "payload": "How to learn Python programming?",
                "personality": "Software Engineer",
                "mode": "professional"
            }
            
            self.log(f"Sending request with payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                api_endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            self.log(f"API Response Status: {response.status_code}")
            self.log(f"API Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    self.log("API returned valid JSON", "SUCCESS")
                    self.log(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                    
                    # Check for expected response structure
                    if isinstance(data, dict) and "prompt" in data:
                        prompt_data = data["prompt"]
                        techniques = ["direct", "interactive", "socratic"]
                        found_techniques = [t for t in techniques if t in prompt_data]
                        
                        self.log(f"Found techniques: {found_techniques}")
                        
                        if len(found_techniques) == 3:
                            self.log("All three prompt techniques generated", "SUCCESS")
                            self.add_test_result(test_name, True, f"Generated {len(found_techniques)} techniques")
                            return True
                        else:
                            self.log(f"Missing techniques: {set(techniques) - set(found_techniques)}", "WARNING")
                            self.add_test_result(test_name, False, f"Only generated {len(found_techniques)} techniques")
                            return False
                    else:
                        self.log("Response missing 'prompt' key", "ERROR")
                        self.add_test_result(test_name, False, "Invalid response structure")
                        return False
                        
                except json.JSONDecodeError as e:
                    self.log(f"API returned invalid JSON: {e}", "ERROR")
                    self.log(f"Raw response: {response.text[:500]}...")
                    self.add_test_result(test_name, False, f"Invalid JSON response: {e}")
                    return False
            else:
                self.log(f"API call failed with status {response.status_code}", "ERROR")
                self.log(f"Error response: {response.text[:500]}...")
                self.add_test_result(test_name, False, f"HTTP {response.status_code}: {response.text[:100]}")
                return False
                
        except requests.RequestException as e:
            self.log(f"API request failed: {e}", "ERROR")
            self.add_test_result(test_name, False, f"Request failed: {e}")
            return False
        except Exception as e:
            self.log(f"API direct call test failed: {e}", "ERROR")
            self.add_test_result(test_name, False, error_msg=str(e))
            return False

    def test_frontend_api_integration(self):
        """Test API integration through the frontend"""
        test_name = "Frontend API Integration"
        self.log(f"Testing {test_name}...")
        
        try:
            # Fill in test data
            payload_textarea = self.driver.find_element(By.ID, "payload")
            payload_textarea.clear()
            payload_textarea.send_keys("How to learn Python programming?")
            self.log("✓ Entered test query")
            
            personality_input = self.driver.find_element(By.ID, "personality")
            personality_input.clear()
            personality_input.send_keys("Software Engineer")
            self.log("✓ Entered personality")
            
            # Click generate button
            generate_button = self.driver.find_element(By.ID, "generateBtn")
            self.log("Clicking generate button...")
            generate_button.click()
            
            # Check if loading state activates
            try:
                loading_element = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "loading"))
                )
                if "active" in loading_element.get_attribute("class"):
                    self.log("✓ Loading state activated", "SUCCESS")
                else:
                    self.log("⚠️ Loading element found but not active", "WARNING")
            except Exception:
                self.log("⚠️ Loading state not detected", "WARNING")
            
            # Wait for results or error (longer timeout for API call)
            self.log("Waiting for API response...")
            start_time = time.time()
            
            try:
                # Wait for either success or error
                WebDriverWait(self.driver, 45).until(
                    lambda d: (
                        d.find_element(By.ID, "outputSection").is_displayed() or
                        "active" in d.find_element(By.ID, "error").get_attribute("class")
                    )
                )
                
                response_time = time.time() - start_time
                self.log(f"Response received after {response_time:.2f} seconds")
                
                # Check for successful output
                output_section = self.driver.find_element(By.ID, "outputSection")
                error_element = self.driver.find_element(By.ID, "error")
                
                if output_section.is_displayed():
                    self.log("✓ Output section displayed", "SUCCESS")
                    
                    # Check for safe query outputs
                    try:
                        safe_outputs = self.driver.find_element(By.ID, "safeQueryOutputs")
                        if safe_outputs.is_displayed():
                            self.log("✓ Safe query detected - checking all techniques")
                            
                            techniques = [
                                ("directOutput", "Direct"),
                                ("interactiveOutput", "Interactive"), 
                                ("socraticOutput", "Socratic")
                            ]
                            
                            successful_techniques = []
                            failed_techniques = []
                            
                            for output_id, technique_name in techniques:
                                try:
                                    output_element = self.driver.find_element(By.ID, output_id)
                                    content = output_element.text.strip()
                                    
                                    if content and len(content) > 50:  # Reasonable content length
                                        # Enhanced quality checks
                                        quality_score = self.validate_prompt_quality(content, technique_name)
                                        
                                        # Manual prompt evaluation - log the actual content for review
                                        self.log(f"📝 {technique_name} Prompt Content Sample:", "DEBUG")
                                        self.log(f"   {content[:200]}{'...' if len(content) > 200 else ''}", "DEBUG")
                                        
                                        if quality_score >= 0.7:  # 70% quality threshold
                                            successful_techniques.append(f"{technique_name} (Q:{quality_score:.1f})")
                                            self.log(f"✓ {technique_name} technique: {len(content)} chars, quality: {quality_score:.1f}")
                                            self.log(f"  💡 Content evaluation: Appears relevant and well-structured", "SUCCESS")
                                        else:
                                            failed_techniques.append(f"{technique_name} (low quality: {quality_score:.1f})")
                                            self.log(f"⚠️ {technique_name} technique: low quality ({quality_score:.1f})", "WARNING")
                                            self.log(f"  ❌ Content evaluation: May lack structure or relevance", "WARNING")
                                    else:
                                        failed_techniques.append(f"{technique_name} (empty/short)")
                                        self.log(f"✗ {technique_name} technique: insufficient content ({len(content)} chars)", "WARNING")
                                        
                                except Exception as e:
                                    failed_techniques.append(f"{technique_name} (not found)")
                                    self.log(f"✗ {technique_name} technique element not found: {e}", "ERROR")
                            
                            if len(successful_techniques) == 3:
                                self.log("All three techniques generated successfully", "SUCCESS")
                                self.add_test_result(test_name, True, f"Generated: {', '.join(successful_techniques)}")
                                return True
                            else:
                                self.log(f"Some techniques failed: {failed_techniques}", "ERROR")
                                self.add_test_result(test_name, False, f"Failed: {', '.join(failed_techniques)}")
                                return False
                        else:
                            self.log("Safe outputs section not displayed", "WARNING")
                            
                    except Exception as e:
                        self.log(f"Error checking safe outputs: {e}", "ERROR")
                    
                    # Check for unsafe query handling
                    try:
                        unsafe_output = self.driver.find_element(By.ID, "unsafeQueryOutput")
                        if unsafe_output.is_displayed():
                            content = unsafe_output.text.strip()
                            if content:
                                self.log("✓ Unsafe query handled with content", "SUCCESS")
                                self.add_test_result(test_name, True, "Unsafe query handled properly")
                                return True
                    except Exception:
                        pass
                    
                    self.log("Output section displayed but no content found", "ERROR")
                    self.add_test_result(test_name, False, "No prompt content generated")
                    return False
                    
                elif "active" in error_element.get_attribute("class"):
                    error_text = error_element.text
                    self.log(f"✗ Error displayed: {error_text}", "ERROR")
                    self.add_test_result(test_name, False, f"Frontend error: {error_text}")
                    return False
                    
            except Exception as e:
                self.log(f"Timeout waiting for response: {e}", "ERROR")
                
                # Check browser console for errors
                try:
                    logs = self.driver.get_log('browser')
                    if logs:
                        self.log("Browser console errors:", "ERROR")
                        for log in logs[-5:]:  # Last 5 logs
                            self.log(f"  {log['level']}: {log['message']}", "ERROR")
                except Exception:
                    pass
                
                self.add_test_result(test_name, False, f"Timeout after 45s: {e}")
                return False
                
        except Exception as e:
            self.log(f"Frontend API integration test failed: {e}", "ERROR")
            self.add_test_result(test_name, False, error_msg=str(e))
            return False

    def test_navigation(self):
        """Test navigation between pages"""
        test_name = "Navigation"
        self.log(f"Testing {test_name}...")
        
        try:
            # Test templates page navigation
            try:
                templates_link = self.driver.find_element(By.XPATH, "//a[@href='/templates']")
                templates_link.click()
                self.log("✓ Clicked templates link")
                
                # Wait for templates page
                WebDriverWait(self.driver, 10).until(
                    lambda d: "Template" in d.title or "404" in d.page_source
                )
                
                if "Template Explorer" in self.driver.title:
                    self.log("✓ Templates page loaded successfully", "SUCCESS")
                    
                    # Go back to main page
                    back_link = self.driver.find_element(By.XPATH, "//a[@href='/']")
                    back_link.click()
                    
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.ID, "payload"))
                    )
                    
                    self.log("✓ Navigation back to main page successful", "SUCCESS")
                    self.add_test_result(test_name, True, "Templates page navigation works")
                    return True
                else:
                    self.log("✗ Templates page not accessible (404 or wrong page)", "WARNING")
                    # Go back to main page anyway
                    self.driver.get(self.base_url)
                    self.add_test_result(test_name, False, "Templates page not accessible")
                    return False
                    
            except Exception as e:
                self.log(f"Templates navigation failed: {e}", "ERROR")
                # Ensure we're back on main page
                self.driver.get(self.base_url)
                self.add_test_result(test_name, False, f"Templates navigation error: {e}")
                return False
                
        except Exception as e:
            self.log(f"Navigation test failed: {e}", "ERROR")
            self.add_test_result(test_name, False, error_msg=str(e))
            return False

    def run_all_tests(self):
        """Run comprehensive test suite"""
        self.log("="*60, "INFO")
        self.log("🚀 STARTING COMPREHENSIVE JAHBREAK TEST SUITE", "INFO")
        self.log("="*60, "INFO")
        self.log(f"Frontend URL: {self.base_url}")
        self.log(f"API URL: {self.api_url}")
        self.log("")
        
        if not self.setup_driver():
            self.log("Driver setup failed, aborting tests", "ERROR")
            return False
        
        test_functions = [
            self.test_website_accessibility,
            self.test_ui_elements,
            self.test_theme_toggle,
            self.test_api_direct_call,
            self.test_navigation,
            self.test_frontend_api_integration,  # Most comprehensive test last
        ]
        
        for test_func in test_functions:
            self.log("-" * 40)
            try:
                test_func()
            except Exception as e:
                self.log(f"Test function {test_func.__name__} crashed: {e}", "ERROR")
                self.add_test_result(test_func.__name__, False, error_msg=str(e))
            self.log("")
        
        self.cleanup()
        self.print_summary()
        
        return self.test_results["summary"]["failed"] == 0

    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            try:
                self.driver.quit()
                self.log("WebDriver closed successfully")
            except Exception as e:
                self.log(f"Error closing WebDriver: {e}", "WARNING")

    def print_summary(self):
        """Print comprehensive test summary"""
        self.log("="*60, "INFO")
        self.log("📊 TEST SUMMARY", "INFO")
        self.log("="*60, "INFO")
        
        summary = self.test_results["summary"]
        self.log(f"Total Tests: {summary['total']}")
        self.log(f"Passed: {summary['passed']} ✅")
        self.log(f"Failed: {summary['failed']} ❌")
        self.log(f"Success Rate: {(summary['passed']/summary['total']*100):.1f}%" if summary['total'] > 0 else "N/A")
        self.log("")
        
        self.log("DETAILED RESULTS:", "INFO")
        for test in self.test_results["tests"]:
            status = "✅" if test["passed"] else "❌"
            self.log(f"{status} {test['name']}")
            if test["details"]:
                self.log(f"    Details: {test['details']}")
            if test["error"]:
                self.log(f"    Error: {test['error']}")
        
        self.log("")
        if summary["failed"] == 0:
            self.log("🎉 ALL TESTS PASSED! Jahbreak is fully functional.", "SUCCESS")
        else:
            self.log(f"⚠️ {summary['failed']} test(s) failed. See details above.", "ERROR")
        
        self.log("="*60, "INFO")

if __name__ == "__main__":
    import sys
    
    # Allow custom URLs via command line
    frontend_url = sys.argv[1] if len(sys.argv) > 1 else "https://jahbreak.lukitun.xyz"
    api_url = sys.argv[2] if len(sys.argv) > 2 else "https://bando.life"
    
    tester = JahbreakTester(frontend_url, api_url)
    success = tester.run_all_tests()
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2)
    
    print(f"\n📄 Test results saved to test_results.json")
    sys.exit(0 if success else 1)