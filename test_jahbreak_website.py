#!/usr/bin/env python3
"""
Comprehensive Selenium test suite for Jahbreak website
Tests the website at jahbreak.lukitun.xyz
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager

class JahbreakWebsiteTest:
    def __init__(self):
        self.base_url = "https://jahbreak.lukitun.xyz"
        self.driver = None
        self.wait = None
        
    def setup_driver(self):
        """Setup Chrome driver with appropriate options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def teardown_driver(self):
        """Close the driver"""
        if self.driver:
            self.driver.quit()
            
    def test_page_load(self):
        """Test that the page loads successfully"""
        print("🔍 Testing page load...")
        try:
            self.driver.get(self.base_url)
            
            # Wait for the page title
            self.wait.until(EC.title_contains("Jahbreak"))
            
            # Check if main elements are present
            header = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "header")))
            main = self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "main")))
            
            print("✅ Page loaded successfully")
            print(f"   Title: {self.driver.title}")
            return True
        except Exception as e:
            print(f"❌ Page load failed: {e}")
            return False
            
    def test_ui_elements(self):
        """Test that all UI elements are present and functional"""
        print("🔍 Testing UI elements...")
        try:
            # Check header elements
            title = self.driver.find_element(By.TAG_NAME, "h1")
            assert "Jahbreak" in title.text
            
            # Check theme toggle
            theme_toggle = self.driver.find_element(By.ID, "themeToggle")
            assert theme_toggle.is_displayed()
            
            # Check GitHub link
            github_link = self.driver.find_element(By.CSS_SELECTOR, "a.github-link")
            assert github_link.is_displayed()
            
            # Check main form elements
            payload_textarea = self.driver.find_element(By.ID, "payload")
            assert payload_textarea.is_displayed()
            
            personality_input = self.driver.find_element(By.ID, "personality")
            assert personality_input.is_displayed()
            
            obfuscation_select = self.driver.find_element(By.ID, "obfuscation")
            assert obfuscation_select.is_displayed()
            
            mode_select = self.driver.find_element(By.ID, "mode")
            assert mode_select.is_displayed()
            
            generate_btn = self.driver.find_element(By.ID, "generateBtn")
            assert generate_btn.is_displayed()
            
            print("✅ All UI elements are present and displayed")
            return True
        except Exception as e:
            print(f"❌ UI elements test failed: {e}")
            return False
            
    def test_theme_toggle(self):
        """Test theme toggle functionality"""
        print("🔍 Testing theme toggle...")
        try:
            theme_toggle = self.driver.find_element(By.ID, "themeToggle")
            initial_text = theme_toggle.text
            
            # Click theme toggle
            theme_toggle.click()
            time.sleep(0.5)
            
            # Check if text changed
            new_text = theme_toggle.text
            assert initial_text != new_text
            
            # Check if body class changed
            body = self.driver.find_element(By.TAG_NAME, "body")
            body_classes = body.get_attribute("class")
            
            print(f"✅ Theme toggle working (Text: {initial_text} → {new_text})")
            return True
        except Exception as e:
            print(f"❌ Theme toggle test failed: {e}")
            return False
            
    def test_form_interaction(self):
        """Test form input and interaction"""
        print("🔍 Testing form interaction...")
        try:
            # Fill in the form
            payload_textarea = self.driver.find_element(By.ID, "payload")
            payload_textarea.clear()
            payload_textarea.send_keys("Write a Python function to calculate fibonacci numbers")
            
            personality_input = self.driver.find_element(By.ID, "personality")
            personality_input.clear()
            personality_input.send_keys("Software Engineer")
            
            # Test select dropdowns
            obfuscation_select = Select(self.driver.find_element(By.ID, "obfuscation"))
            obfuscation_select.select_by_value("none")
            
            mode_select = Select(self.driver.find_element(By.ID, "mode"))
            mode_select.select_by_value("creative")
            
            print("✅ Form inputs working correctly")
            return True
        except Exception as e:
            print(f"❌ Form interaction test failed: {e}")
            return False
            
    def test_api_integration(self):
        """Test API integration by submitting the form"""
        print("🔍 Testing API integration...")
        try:
            # First fill the form (if not already filled)
            payload_textarea = self.driver.find_element(By.ID, "payload")
            if not payload_textarea.get_attribute("value"):
                payload_textarea.send_keys("Create a simple Hello World program")
            
            # Click generate button
            generate_btn = self.driver.find_element(By.ID, "generateBtn")
            generate_btn.click()
            
            # Wait for loading state
            loading_element = self.wait.until(EC.presence_of_element_located((By.ID, "loading")))
            
            # Wait for loading to disappear or output to appear
            try:
                # Wait for either output section to appear or error to show
                WebDriverWait(self.driver, 30).until(
                    lambda driver: (
                        driver.find_element(By.ID, "outputSection").is_displayed() or
                        driver.find_element(By.ID, "error").get_attribute("class").find("active") != -1
                    )
                )
                
                # Check if we got output or error
                output_section = self.driver.find_element(By.ID, "outputSection")
                error_element = self.driver.find_element(By.ID, "error")
                
                if output_section.is_displayed():
                    print("✅ API integration successful - Output received")
                    
                    # Check for safe/unsafe query indicators
                    try:
                        safe_indicator = self.driver.find_element(By.CSS_SELECTOR, ".safe-query-indicator")
                        print(f"   Query classified as: Safe")
                    except:
                        try:
                            unsafe_indicator = self.driver.find_element(By.CSS_SELECTOR, ".unsafe-query-indicator")
                            print(f"   Query classified as: Unsafe")
                        except:
                            print("   Query classification: Unknown")
                    
                    return True
                elif "active" in error_element.get_attribute("class"):
                    error_text = error_element.text
                    print(f"❌ API integration failed with error: {error_text}")
                    return False
                else:
                    print("❌ API integration test inconclusive")
                    return False
                    
            except Exception as timeout_e:
                print(f"❌ API request timed out: {timeout_e}")
                return False
                
        except Exception as e:
            print(f"❌ API integration test failed: {e}")
            return False
            
    def test_responsive_design(self):
        """Test responsive design by changing window size"""
        print("🔍 Testing responsive design...")
        try:
            # Test mobile size
            self.driver.set_window_size(375, 667)
            time.sleep(1)
            
            # Check if elements are still visible and properly arranged
            header = self.driver.find_element(By.TAG_NAME, "header")
            assert header.is_displayed()
            
            main = self.driver.find_element(By.TAG_NAME, "main")
            assert main.is_displayed()
            
            # Test tablet size
            self.driver.set_window_size(768, 1024)
            time.sleep(1)
            
            # Test desktop size
            self.driver.set_window_size(1920, 1080)
            time.sleep(1)
            
            print("✅ Responsive design working correctly")
            return True
        except Exception as e:
            print(f"❌ Responsive design test failed: {e}")
            return False
            
    def test_accessibility(self):
        """Test basic accessibility features"""
        print("🔍 Testing accessibility features...")
        try:
            # Check for proper heading structure
            h1_elements = self.driver.find_elements(By.TAG_NAME, "h1")
            assert len(h1_elements) == 1, "Should have exactly one H1 element"
            
            # Check for labels on form inputs
            payload_label = self.driver.find_element(By.CSS_SELECTOR, "label[for='payload']")
            assert payload_label.is_displayed()
            
            # Check for alt text on images (if any)
            images = self.driver.find_elements(By.TAG_NAME, "img")
            for img in images:
                alt_text = img.get_attribute("alt")
                if not alt_text:
                    print(f"⚠️  Image without alt text found: {img.get_attribute('src')}")
            
            print("✅ Basic accessibility checks passed")
            return True
        except Exception as e:
            print(f"❌ Accessibility test failed: {e}")
            return False
            
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting comprehensive Jahbreak website tests")
        print(f"🌐 Testing URL: {self.base_url}")
        print("=" * 60)
        
        self.setup_driver()
        
        test_results = []
        
        try:
            # Run all tests
            tests = [
                ("Page Load", self.test_page_load),
                ("UI Elements", self.test_ui_elements),
                ("Theme Toggle", self.test_theme_toggle),
                ("Form Interaction", self.test_form_interaction),
                ("API Integration", self.test_api_integration),
                ("Responsive Design", self.test_responsive_design),
                ("Accessibility", self.test_accessibility)
            ]
            
            for test_name, test_func in tests:
                print(f"\n📋 Running {test_name} test...")
                result = test_func()
                test_results.append((test_name, result))
                time.sleep(1)  # Brief pause between tests
                
        finally:
            self.teardown_driver()
            
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for _, result in test_results if result)
        total = len(test_results)
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:20} {status}")
            
        print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            print("🎉 All tests passed! Website is working correctly.")
        else:
            print("⚠️  Some tests failed. Please check the results above.")
            
        return passed == total

if __name__ == "__main__":
    tester = JahbreakWebsiteTest()
    success = tester.run_all_tests()
    exit(0 if success else 1)