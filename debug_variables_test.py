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

print("🔍 DEBUG: Testing variable assignment in displayOutput...")

try:
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://jahbreak.lukitun.xyz")
    
    # Inject debug script to capture variable assignments
    debug_script = """
    // Store original displayOutput
    window.originalDisplayOutput = window.displayOutput;
    
    // Override displayOutput to debug variable assignment
    window.displayOutput = function(data) {
        console.log('🔍 displayOutput - START');
        console.log('🔍 data received:', data);
        
        const outputSection = document.getElementById('outputSection');
        const queryStatusIndicator = document.getElementById('queryStatusIndicator');
        const safeQueryOutputs = document.getElementById('safeQueryOutputs');
        const unsafeQueryOutput = document.getElementById('unsafeQueryOutput');
        const directOutput = document.getElementById('directOutput');
        const interactiveOutput = document.getElementById('interactiveOutput');
        const socraticOutput = document.getElementById('socraticOutput');
        
        console.log('🔍 Elements found:');
        console.log('  directOutput:', directOutput ? 'OK' : 'NULL');
        console.log('  interactiveOutput:', interactiveOutput ? 'OK' : 'NULL');
        console.log('  socraticOutput:', socraticOutput ? 'OK' : 'NULL');
        
        if (data.metadata && data.metadata.isSafeQuery) {
            console.log('🔍 Safe query detected');
            queryStatusIndicator.innerHTML = '<span class="safe-query-indicator">✓ Safe Query</span>';
            
            // Parse the prompt data
            console.log('🔍 Calling parseSafePrompt with:', data.prompt);
            const { direct, interactive, socratic } = parseSafePrompt(data.prompt);
            
            console.log('🔍 Destructured variables:');
            console.log('  direct:', typeof direct, direct ? direct.length + ' chars' : 'NULL/UNDEFINED');
            console.log('  interactive:', typeof interactive, interactive ? interactive.length + ' chars' : 'NULL/UNDEFINED');
            console.log('  socratic:', typeof socratic, socratic ? socratic.length + ' chars' : 'NULL/UNDEFINED');
            
            // Show safe query outputs
            safeQueryOutputs.style.display = 'flex';
            unsafeQueryOutput.style.display = 'none';
            
            console.log('🔍 Setting textContent...');
            
            // Set content with detailed logging
            if (directOutput) {
                console.log('🔍 Setting directOutput.textContent to:', direct ? direct.substring(0, 50) + '...' : 'NULL/UNDEFINED');
                directOutput.textContent = direct;
                console.log('🔍 directOutput.textContent after set:', directOutput.textContent.length, 'chars');
            }
            
            if (interactiveOutput) {
                console.log('🔍 Setting interactiveOutput.textContent to:', interactive ? interactive.substring(0, 50) + '...' : 'NULL/UNDEFINED');
                interactiveOutput.textContent = interactive;
                console.log('🔍 interactiveOutput.textContent after set:', interactiveOutput.textContent.length, 'chars');
            }
            
            if (socraticOutput) {
                console.log('🔍 Setting socraticOutput.textContent to:', socratic ? socratic.substring(0, 50) + '...' : 'NULL/UNDEFINED');
                socraticOutput.textContent = socratic;
                console.log('🔍 socraticOutput.textContent after set:', socraticOutput.textContent.length, 'chars');
            }
        }
        
        // Continue with rest of function
        console.log('🔍 displayOutput - calling original function');
        return window.originalDisplayOutput(data);
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

print("🔍 Debug variables test completed")