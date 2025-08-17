#!/usr/bin/env python3
"""
Selenium test script for Jahbreak functionality
Tests the main page, templates page, and API functionality
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--remote-debugging-port=9222")
    chrome_options.add_argument("--disable-extensions")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.implicitly_wait(10)
        return driver
    except Exception as e:
        print(f"Failed to create Chrome driver: {e}")
        raise e

def test_main_page(driver, base_url):
    """Test main page functionality"""
    print("🧪 Testing main page...")
    
    # Navigate to main page
    driver.get(base_url)
    
    # Check page title
    assert "Jahbreak" in driver.title
    print("✅ Page title correct")
    
    # Check if Templates link exists
    templates_link = driver.find_element(By.XPATH, "//a[@href='/templates']")
    assert templates_link.is_displayed()
    print("✅ Templates link found in navigation")
    
    # Check if main elements exist
    payload_textarea = driver.find_element(By.ID, "payload")
    assert payload_textarea.is_displayed()
    print("✅ Query textarea found")
    
    generate_button = driver.find_element(By.ID, "generateBtn")
    assert generate_button.is_displayed()
    print("✅ Generate button found")
    
    # Check if option groups exist
    personality_input = driver.find_element(By.ID, "personality")
    obfuscation_select = driver.find_element(By.ID, "obfuscation")
    mode_select = driver.find_element(By.ID, "mode")
    
    assert personality_input.is_displayed()
    assert obfuscation_select.is_displayed()
    assert mode_select.is_displayed()
    print("✅ All input controls found")

def test_templates_page(driver, base_url):
    """Test templates page functionality"""
    print("🧪 Testing templates page...")
    
    # Navigate to templates page
    driver.get(f"{base_url}/templates")
    
    # Check page title
    assert "Template Explorer" in driver.title
    print("✅ Templates page title correct")
    
    # Check if back link exists
    back_link = driver.find_element(By.XPATH, "//a[@href='/']")
    assert back_link.is_displayed()
    print("✅ Back to Generator link found")
    
    # Check if template categories exist
    direct_section = driver.find_element(By.XPATH, "//h2[contains(text(), 'Direct Templates')]")
    interactive_section = driver.find_element(By.XPATH, "//h2[contains(text(), 'Interactive Templates')]")
    socratic_section = driver.find_element(By.XPATH, "//h2[contains(text(), 'Socratic Templates')]")
    
    assert direct_section.is_displayed()
    assert interactive_section.is_displayed()
    assert socratic_section.is_displayed()
    print("✅ All template categories found")
    
    # Check if template cards exist
    template_cards = driver.find_elements(By.CLASS_NAME, "template-card")
    assert len(template_cards) >= 9  # Should have at least 9 templates (3 per category)
    print(f"✅ Found {len(template_cards)} template cards")
    
    # Check key features section
    features_section = driver.find_element(By.CLASS_NAME, "key-features")
    assert features_section.is_displayed()
    print("✅ Key features section found")

def test_navigation(driver, base_url):
    """Test navigation between pages"""
    print("🧪 Testing navigation...")
    
    # Start on main page
    driver.get(base_url)
    
    # Click templates link
    templates_link = driver.find_element(By.XPATH, "//a[@href='/templates']")
    templates_link.click()
    
    # Wait for page to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Template Explorer')]"))
    )
    
    assert "Template Explorer" in driver.title
    print("✅ Navigation to templates page works")
    
    # Click back to generator
    back_link = driver.find_element(By.XPATH, "//a[@href='/']")
    back_link.click()
    
    # Wait for page to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "payload"))
    )
    
    assert "Jahbreak" in driver.title
    print("✅ Navigation back to main page works")

def test_api_functionality(driver, base_url):
    """Test API functionality by submitting a test query"""
    print("🧪 Testing API functionality...")
    
    # Navigate to main page
    driver.get(base_url)
    
    # Fill in a test query
    payload_textarea = driver.find_element(By.ID, "payload")
    payload_textarea.clear()
    payload_textarea.send_keys("How to learn Python programming?")
    
    # Fill in personality (optional)
    personality_input = driver.find_element(By.ID, "personality")
    personality_input.clear()
    personality_input.send_keys("Software Engineer")
    
    # Click generate button
    generate_button = driver.find_element(By.ID, "generateBtn")
    generate_button.click()
    
    # Wait for loading to start
    WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.CLASS_NAME, "loading"))
    )
    print("✅ Loading state activated")
    
    # Wait for results or error (with longer timeout for API call)
    try:
        # Wait for either output section or error message
        WebDriverWait(driver, 30).until(
            lambda d: (
                d.find_element(By.ID, "outputSection").is_displayed() or
                d.find_element(By.ID, "error").get_attribute("class").find("active") != -1
            )
        )
        
        # Check if we got results
        output_section = driver.find_element(By.ID, "outputSection")
        if output_section.is_displayed():
            print("✅ API call successful - results displayed")
            
            # Check if safe query outputs are shown
            safe_outputs = driver.find_element(By.ID, "safeQueryOutputs")
            if safe_outputs.is_displayed():
                print("✅ Safe query detected - multiple techniques shown")
                
                # Check if all three technique outputs exist
                direct_output = driver.find_element(By.ID, "directOutput")
                interactive_output = driver.find_element(By.ID, "interactiveOutput")
                socratic_output = driver.find_element(By.ID, "socraticOutput")
                
                assert len(direct_output.text) > 0
                assert len(interactive_output.text) > 0
                assert len(socratic_output.text) > 0
                print("✅ All three technique outputs contain content")
            else:
                print("⚠️ Unsafe query detected - single output shown")
        else:
            # Check for error message
            error_element = driver.find_element(By.ID, "error")
            if "active" in error_element.get_attribute("class"):
                print(f"❌ API call failed with error: {error_element.text}")
                return False
    
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False
    
    return True

def test_theme_toggle(driver, base_url):
    """Test theme toggle functionality"""
    print("🧪 Testing theme toggle...")
    
    # Navigate to main page
    driver.get(base_url)
    
    # Find theme toggle button
    theme_toggle = driver.find_element(By.ID, "themeToggle")
    initial_text = theme_toggle.text
    
    # Click theme toggle
    theme_toggle.click()
    
    # Wait a moment for transition
    time.sleep(1)
    
    # Check if button text changed
    new_text = theme_toggle.text
    assert new_text != initial_text
    print(f"✅ Theme toggle works: {initial_text} → {new_text}")
    
    # Check if body class changed
    body = driver.find_element(By.TAG_NAME, "body")
    body_classes = body.get_attribute("class")
    print(f"✅ Body classes after toggle: {body_classes}")

def run_tests(base_url="http://localhost:3001"):
    """Run all tests"""
    print(f"🚀 Starting Selenium tests for {base_url}")
    
    driver = setup_driver()
    
    try:
        # Test main page
        test_main_page(driver, base_url)
        
        # Test templates page
        test_templates_page(driver, base_url)
        
        # Test navigation
        test_navigation(driver, base_url)
        
        # Test theme toggle
        test_theme_toggle(driver, base_url)
        
        # Test API functionality
        api_success = test_api_functionality(driver, base_url)
        
        print("\n🎉 All tests completed!")
        print(f"✅ Main page: PASS")
        print(f"✅ Templates page: PASS")
        print(f"✅ Navigation: PASS")
        print(f"✅ Theme toggle: PASS")
        print(f"{'✅' if api_success else '❌'} API functionality: {'PASS' if api_success else 'FAIL'}")
        
        return api_success
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False
    finally:
        driver.quit()

if __name__ == "__main__":
    import sys
    
    # Default to live site, but accept URL as argument
    test_url = "https://jahbreak.lukitun.xyz"
    if len(sys.argv) > 1:
        test_url = sys.argv[1]
    
    print(f"Testing URL: {test_url}")
    success = run_tests(test_url)
    sys.exit(0 if success else 1)