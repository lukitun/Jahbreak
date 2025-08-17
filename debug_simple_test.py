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

print("🔍 DEBUG: Simple test to see if content gets set...")

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
    
    # Wait a bit more for processing
    time.sleep(3)
    
    # Try to directly call the parsing function with some test data
    test_data = """{
        "direct": "Test direct content",
        "interactive": "Test interactive content", 
        "socratic": "Test socratic content"
    }"""
    
    test_result = driver.execute_script(f"""
        const testData = {test_data};
        const result = parseSafePrompt(testData);
        console.log('🔍 Test parse result:', result);
        return result;
    """)
    
    print(f"✅ Test parse result: {test_result}")
    
    # Try setting content manually
    driver.execute_script("""
        const directOutput = document.getElementById('directOutput');
        const interactiveOutput = document.getElementById('interactiveOutput');
        const socraticOutput = document.getElementById('socraticOutput');
        
        console.log('🔍 Manual content setting test...');
        console.log('🔍 directOutput element:', directOutput);
        console.log('🔍 interactiveOutput element:', interactiveOutput);
        console.log('🔍 socraticOutput element:', socraticOutput);
        
        if (directOutput) {
            directOutput.textContent = 'MANUAL TEST CONTENT FOR DIRECT';
            console.log('🔍 Set direct content, now has:', directOutput.textContent.length, 'chars');
        }
        if (interactiveOutput) {
            interactiveOutput.textContent = 'MANUAL TEST CONTENT FOR INTERACTIVE';
            console.log('🔍 Set interactive content, now has:', interactiveOutput.textContent.length, 'chars');
        }
        if (socraticOutput) {
            socraticOutput.textContent = 'MANUAL TEST CONTENT FOR SOCRATIC';
            console.log('🔍 Set socratic content, now has:', socraticOutput.textContent.length, 'chars');
        }
    """)
    
    time.sleep(1)
    
    # Check final DOM content after manual setting
    print("\n📝 Final DOM content after manual setting:")
    for technique in ['direct', 'interactive', 'socratic']:
        output_elem = driver.find_element(By.ID, f"{technique}Output")
        content = output_elem.text
        print(f"  {technique}: {len(content)} chars - {content[:50]}...")
    
    # Check console logs
    logs = driver.get_log('browser')
    print("\n📝 Browser console logs:")
    for log in logs:
        if '🔍' in log['message']:
            print(f"  {log['message']}")
        
finally:
    driver.quit()

print("🔍 Debug simple test completed")