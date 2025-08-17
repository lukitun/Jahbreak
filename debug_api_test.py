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

print("🔍 DEBUG: Testing API response parsing...")

try:
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://jahbreak.lukitun.xyz")
    
    # Inject debug script to capture API response
    debug_script = """
    // Override fetch to capture API responses
    const originalFetch = window.fetch;
    window.apiResponse = null;
    window.apiError = null;
    
    window.fetch = function(...args) {
        console.log('🔍 Fetch called with:', args);
        return originalFetch(...args).then(response => {
            if (args[0].includes('/api/generate')) {
                return response.clone().json().then(data => {
                    window.apiResponse = data;
                    console.log('🔍 API Response captured:', data);
                    return response;
                }).catch(err => {
                    window.apiError = err;
                    console.log('🔍 API Error captured:', err);
                    return response;
                });
            }
            return response;
        });
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
    
    # Get the captured API response
    api_response = driver.execute_script("return window.apiResponse;")
    api_error = driver.execute_script("return window.apiError;")
    
    if api_error:
        print(f"❌ API Error: {api_error}")
    elif api_response:
        print("✅ API Response captured:")
        print(f"  Type: {type(api_response)}")
        print(f"  Keys: {list(api_response.keys()) if isinstance(api_response, dict) else 'Not a dict'}")
        
        if 'prompt' in api_response:
            prompt_data = api_response['prompt']
            print(f"  Prompt type: {type(prompt_data)}")
            print(f"  Prompt keys: {list(prompt_data.keys()) if isinstance(prompt_data, dict) else 'Not a dict'}")
            
            if isinstance(prompt_data, dict):
                for key in ['direct', 'interactive', 'socratic']:
                    if key in prompt_data:
                        content = prompt_data[key]
                        print(f"  {key}: {len(content)} chars - {content[:50]}...")
    else:
        print("❌ No API response captured")
    
    # Check console logs
    logs = driver.get_log('browser')
    print("\n📝 Browser console logs:")
    for log in logs:
        if 'API' in log['message'] or 'fetch' in log['message'].lower():
            print(f"  {log['level']}: {log['message']}")
        
finally:
    driver.quit()

print("🔍 Debug API test completed")