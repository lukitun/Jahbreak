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

print("🔍 DEBUG: Testing hidden content and expanding sections...")

try:
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://jahbreak.lukitun.xyz")
    
    # Wait for page to load
    time.sleep(2)
    
    # Fill in form and generate
    query_input = driver.find_element(By.ID, "payload")
    query_input.clear()
    query_input.send_keys("How to learn Python programming?")
    
    personality_input = driver.find_element(By.ID, "personality")
    personality_input.clear()
    personality_input.send_keys("Software Engineer")
    
    # Click generate
    generate_btn = driver.find_element(By.ID, "generateBtn")
    generate_btn.click()
    
    # Wait for loading to finish
    print("⏳ Waiting for API response...")
    WebDriverWait(driver, 15).until(
        EC.invisibility_of_element_located((By.CSS_SELECTOR, "#loading.active"))
    )
    
    # Wait a bit more for processing
    time.sleep(3)
    
    print("📝 Checking content before expanding sections:")
    for technique in ['direct', 'interactive', 'socratic']:
        output_elem = driver.find_element(By.ID, f"{technique}Output")
        content = output_elem.get_attribute('textContent')
        print(f"  {technique}: {len(content) if content else 0} chars")
        if content:
            print(f"    Preview: {content[:50]}...")
    
    # Check if safeQueryOutputs is visible
    safe_outputs = driver.find_element(By.ID, "safeQueryOutputs")
    print(f"\nsafeQueryOutputs display: {safe_outputs.value_of_css_property('display')}")
    
    # Try to click on the headers to expand the sections
    print("\n🔍 Expanding prompt sections...")
    for technique in ['direct', 'interactive', 'socratic']:
        try:
            # Find the header for this technique
            header = driver.find_element(By.CSS_SELECTOR, f"#{technique}PromptSection .prompt-header")
            print(f"  Clicking {technique} header...")
            driver.execute_script("arguments[0].click();", header)
            time.sleep(0.5)
            
            # Check if content is now visible
            content_div = driver.find_element(By.ID, f"{technique}Content")
            is_visible = content_div.value_of_css_property('display') != 'none'
            print(f"    {technique} content visible: {is_visible}")
            
        except Exception as e:
            print(f"    ❌ Error expanding {technique}: {e}")
    
    print("\n📝 Checking content after expanding sections:")
    for technique in ['direct', 'interactive', 'socratic']:
        output_elem = driver.find_element(By.ID, f"{technique}Output")
        content = output_elem.text  # Use .text instead of get_attribute for visible content
        print(f"  {technique}: {len(content) if content else 0} chars")
        if content:
            print(f"    Preview: {content[:100]}...")
    
    # Get the actual textContent regardless of visibility
    print("\n📝 Checking actual textContent regardless of visibility:")
    for technique in ['direct', 'interactive', 'socratic']:
        content = driver.execute_script(f"""
            const elem = document.getElementById('{technique}Output');
            return elem ? elem.textContent : null;
        """)
        print(f"  {technique}: {len(content) if content else 0} chars")
        if content:
            print(f"    Preview: {content[:100]}...")
        
finally:
    driver.quit()

print("🔍 Debug hidden content test completed")