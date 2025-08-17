#!/usr/bin/env python3

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Setup Chrome options
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--disable-gpu')

print("🔍 DEBUG: Testing frontend prompt display...")

try:
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://jahbreak.lukitun.xyz")
    
    # Wait for page to load
    time.sleep(2)
    
    # Fill in form
    query_input = driver.find_element(By.ID, "payload")
    query_input.clear()
    query_input.send_keys("How to learn Python programming?")
    
    personality_input = driver.find_element(By.ID, "personality")
    personality_input.clear()
    personality_input.send_keys("Software Engineer")
    
    # Click generate
    generate_btn = driver.find_element(By.ID, "generateBtn")
    generate_btn.click()
    
    # Wait for loading to start and finish
    print("⏳ Waiting for API response...")
    WebDriverWait(driver, 15).until(
        EC.invisibility_of_element_located((By.CSS_SELECTOR, "#loading.active"))
    )
    
    # Wait a bit more for content to populate
    time.sleep(2)
    
    print("📊 Checking output sections...")
    
    # Check if output section is visible
    output_section = driver.find_element(By.ID, "outputSection")
    print(f"Output section display: {output_section.value_of_css_property('display')}")
    
    # Check safe query outputs
    safe_outputs = driver.find_element(By.ID, "safeQueryOutputs")
    print(f"Safe outputs display: {safe_outputs.value_of_css_property('display')}")
    
    # Check each technique content
    for technique in ['direct', 'interactive', 'socratic']:
        output_elem = driver.find_element(By.ID, f"{technique}Output")
        content = output_elem.text
        print(f"{technique.title()} content length: {len(content)} chars")
        if len(content) > 0:
            print(f"  Preview: {content[:100]}...")
        else:
            print(f"  ❌ No content found")
            
        # Check if the content div exists and is visible
        print(f"  Element tag: {output_elem.tag_name}")
        print(f"  Element display: {output_elem.value_of_css_property('display')}")
        print(f"  Element visibility: {output_elem.value_of_css_property('visibility')}")
    
    # Check for JavaScript errors
    logs = driver.get_log('browser')
    if logs:
        print("\n🚨 Browser console errors:")
        for log in logs:
            if log['level'] == 'SEVERE':
                print(f"  ERROR: {log['message']}")
    else:
        print("\n✅ No browser console errors")
        
finally:
    driver.quit()

print("🔍 Debug test completed")