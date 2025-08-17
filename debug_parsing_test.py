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

print("🔍 DEBUG: Testing parseSafePrompt function...")

try:
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://jahbreak.lukitun.xyz")
    
    # Inject debug script to capture parsing
    debug_script = """
    // Store original functions
    window.originalParseSafePrompt = window.parseSafePrompt;
    window.originalDisplayOutput = window.displayOutput;
    window.parseResult = null;
    
    // Override parseSafePrompt to capture result
    window.parseSafePrompt = function(data) {
        console.log('🔍 parseSafePrompt called with:', data);
        const result = window.originalParseSafePrompt(data);
        window.parseResult = result;
        console.log('🔍 parseSafePrompt returned:', result);
        return result;
    };
    
    // Override displayOutput to capture what's being set
    window.displayOutput = function(data) {
        console.log('🔍 displayOutput called with:', data);
        const result = window.originalDisplayOutput(data);
        
        // Check what was actually set
        const directOutput = document.getElementById('directOutput');
        const interactiveOutput = document.getElementById('interactiveOutput');
        const socraticOutput = document.getElementById('socraticOutput');
        
        console.log('🔍 Final output content:');
        console.log('  Direct textContent:', directOutput.textContent.length, 'chars');
        console.log('  Interactive textContent:', interactiveOutput.textContent.length, 'chars');
        console.log('  Socratic textContent:', socraticOutput.textContent.length, 'chars');
        
        return result;
    };
    """
    
    driver.execute_script(debug_script)
    
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
    
    # Wait a bit more for processing
    time.sleep(3)
    
    # Get the parse result
    parse_result = driver.execute_script("return window.parseResult;")
    
    if parse_result:
        print("✅ Parse result captured:")
        print(f"  Type: {type(parse_result)}")
        print(f"  Keys: {list(parse_result.keys()) if isinstance(parse_result, dict) else 'Not a dict'}")
        
        if isinstance(parse_result, dict):
            for key in ['direct', 'interactive', 'socratic']:
                if key in parse_result:
                    content = parse_result[key]
                    print(f"  {key}: {len(content)} chars")
                    if len(content) == 0:
                        print(f"    ❌ Empty content!")
                    else:
                        print(f"    ✅ Has content: {content[:50]}...")
    else:
        print("❌ No parse result captured")
    
    # Check final DOM content
    print("\n📝 Final DOM content:")
    for technique in ['direct', 'interactive', 'socratic']:
        output_elem = driver.find_element(By.ID, f"{technique}Output")
        content = output_elem.text
        print(f"  {technique}: {len(content)} chars")
    
    # Check console logs for our debug messages
    logs = driver.get_log('browser')
    print("\n📝 Browser console debug logs:")
    for log in logs:
        if '🔍' in log['message']:
            print(f"  {log['message']}")
        
finally:
    driver.quit()

print("🔍 Debug parsing test completed")