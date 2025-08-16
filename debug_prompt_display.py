#!/usr/bin/env python3
"""
Debug script to investigate the 1-shot vs 2-shot prompt display issue
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def debug_prompt_display():
    """Debug the prompt display issue"""
    
    # Setup
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    wait = WebDriverWait(driver, 30)
    
    try:
        print("🔍 Debugging prompt display issue...")
        driver.get("https://jahbreak.lukitun.xyz")
        wait.until(EC.title_contains("Jahbreak"))
        
        # Submit a test query
        payload_textarea = wait.until(EC.element_to_be_clickable((By.ID, "payload")))
        payload_textarea.clear()
        payload_textarea.send_keys("Write a Python function to calculate fibonacci numbers")
        
        personality_input = driver.find_element(By.ID, "personality")
        personality_input.clear()
        personality_input.send_keys("Software Engineer")
        
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
            print("✅ Output section is displayed")
            
            # Check query classification
            query_indicator = driver.find_element(By.ID, "queryStatusIndicator")
            print(f"Query indicator: {query_indicator.get_attribute('innerHTML')}")
            
            # Check which sections are visible
            safe_outputs = driver.find_element(By.ID, "safeQueryOutputs")
            unsafe_output = driver.find_element(By.ID, "unsafeQueryOutput")
            
            print(f"Safe outputs visible: {safe_outputs.is_displayed()}")
            print(f"Unsafe output visible: {unsafe_output.is_displayed()}")
            
            if safe_outputs.is_displayed():
                print("\n📋 DEBUGGING SAFE QUERY OUTPUTS:")
                
                # Get 1-shot output
                try:
                    oneshot_output = driver.find_element(By.ID, "oneshotOutput")
                    oneshot_text = oneshot_output.text
                    print(f"\n1-SHOT OUTPUT ({len(oneshot_text)} chars):")
                    print("="*60)
                    print(oneshot_text)
                    print("="*60)
                except Exception as e:
                    print(f"❌ Error getting 1-shot output: {e}")
                
                # Get 2-shot output  
                try:
                    twoshot_output = driver.find_element(By.ID, "twoshotOutput")
                    twoshot_text = twoshot_output.text
                    print(f"\n2-SHOT OUTPUT ({len(twoshot_text)} chars):")
                    print("="*60)
                    print(twoshot_text)
                    print("="*60)
                except Exception as e:
                    print(f"❌ Error getting 2-shot output: {e}")
                
                # Compare prompts
                if 'oneshot_text' in locals() and 'twoshot_text' in locals():
                    print(f"\n🔍 COMPARISON:")
                    print(f"Prompts are identical: {oneshot_text == twoshot_text}")
                    if oneshot_text == twoshot_text:
                        print("❌ ISSUE CONFIRMED: 1-shot and 2-shot prompts are identical!")
                    else:
                        print("✅ Prompts are different")
                        
                # Check the raw API response by looking at the network data
                print(f"\n🔍 DEBUGGING API RESPONSE:")
                
                # Execute JavaScript to get the API configuration
                api_config = driver.execute_script("return API_CONFIG;")
                print(f"API Config: {api_config}")
                
                # Check if there are any JavaScript errors
                logs = driver.get_log('browser')
                if logs:
                    print(f"\n⚠️  Browser console errors:")
                    for log in logs:
                        if log['level'] == 'SEVERE':
                            print(f"  {log['message']}")
                
        else:
            error_element = driver.find_element(By.ID, "error")
            if "active" in error_element.get_attribute("class"):
                print(f"❌ Error: {error_element.text}")
                
    except Exception as e:
        print(f"❌ Debug failed: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_prompt_display()