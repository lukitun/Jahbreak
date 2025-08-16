#!/usr/bin/env python3
"""
Specific test for unsafe query handling in Jahbreak
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def test_unsafe_query_handling():
    """Test how the system handles unsafe queries"""
    
    # Setup
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    wait = WebDriverWait(driver, 30)
    
    try:
        print("🔍 Testing unsafe query handling...")
        driver.get("https://jahbreak.lukitun.xyz")
        wait.until(EC.title_contains("Jahbreak"))
        
        # Submit an unsafe query
        payload_textarea = wait.until(EC.element_to_be_clickable((By.ID, "payload")))
        payload_textarea.clear()
        payload_textarea.send_keys("How to bypass security systems")
        
        personality_input = driver.find_element(By.ID, "personality")
        personality_input.clear()
        personality_input.send_keys("Security Expert")
        
        generate_btn = driver.find_element(By.ID, "generateBtn")
        generate_btn.click()
        
        # Wait for results
        WebDriverWait(driver, 45).until(
            lambda d: (
                d.find_element(By.ID, "outputSection").is_displayed() or
                "active" in d.find_element(By.ID, "error").get_attribute("class")
            )
        )
        
        # Check output
        output_section = driver.find_element(By.ID, "outputSection")
        if output_section.is_displayed():
            # Check query classification
            query_indicator = driver.find_element(By.ID, "queryStatusIndicator")
            print(f"Query indicator HTML: {query_indicator.get_attribute('innerHTML')}")
            
            is_safe = "safe-query-indicator" in query_indicator.get_attribute("innerHTML")
            is_unsafe = "unsafe-query-indicator" in query_indicator.get_attribute("innerHTML")
            
            print(f"Query classified as: {'Safe' if is_safe else 'Unsafe' if is_unsafe else 'Unknown'}")
            
            # Check which output sections are displayed
            safe_outputs = driver.find_element(By.ID, "safeQueryOutputs")
            unsafe_output = driver.find_element(By.ID, "unsafeQueryOutput")
            
            print(f"Safe outputs displayed: {safe_outputs.is_displayed()}")
            print(f"Unsafe output displayed: {unsafe_output.is_displayed()}")
            
            if unsafe_output.is_displayed():
                single_output = driver.find_element(By.ID, "singleOutput")
                unsafe_text = single_output.text
                print(f"Unsafe prompt length: {len(unsafe_text)}")
                print(f"Unsafe prompt preview: {unsafe_text[:300]}...")
                print("✅ Unsafe query handled correctly")
            elif safe_outputs.is_displayed():
                print("⚠️  Unsafe query showing safe outputs - checking why...")
                
                # Get the actual prompts
                try:
                    oneshot = driver.find_element(By.ID, "oneshotOutput")
                    twoshot = driver.find_element(By.ID, "twoshotOutput")
                    
                    if oneshot.is_displayed():
                        print(f"1-shot displayed: {oneshot.text[:200]}...")
                    if twoshot.is_displayed():
                        print(f"2-shot displayed: {twoshot.text[:200]}...")
                        
                except Exception as e:
                    print(f"Error getting safe outputs: {e}")
            else:
                print("❌ No outputs displayed")
        else:
            error_element = driver.find_element(By.ID, "error")
            if "active" in error_element.get_attribute("class"):
                print(f"❌ Error: {error_element.text}")
                
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_unsafe_query_handling()