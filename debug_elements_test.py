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

print("🔍 DEBUG: Testing element existence and properties...")

try:
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://jahbreak.lukitun.xyz")
    
    # Wait for page to load
    time.sleep(2)
    
    # Check element existence and properties
    element_info = driver.execute_script("""
        const elements = {
            directOutput: document.getElementById('directOutput'),
            interactiveOutput: document.getElementById('interactiveOutput'),
            socraticOutput: document.getElementById('socraticOutput')
        };
        
        const info = {};
        
        for (const [key, element] of Object.entries(elements)) {
            if (element) {
                info[key] = {
                    exists: true,
                    tagName: element.tagName,
                    className: element.className,
                    id: element.id,
                    innerHTML: element.innerHTML,
                    textContent: element.textContent,
                    innerText: element.innerText,
                    style_display: element.style.display,
                    computed_display: getComputedStyle(element).display,
                    computed_visibility: getComputedStyle(element).visibility,
                    offsetParent: element.offsetParent ? 'has parent' : 'no parent',
                    parentElement: element.parentElement ? element.parentElement.tagName : 'no parent'
                };
            } else {
                info[key] = { exists: false };
            }
        }
        
        return info;
    """)
    
    print("📋 Element information:")
    for key, info in element_info.items():
        print(f"\n  {key}:")
        if info.get('exists'):
            for prop, value in info.items():
                print(f"    {prop}: {value}")
        else:
            print("    ❌ Element does not exist!")
    
    # Try to find the elements using different selectors
    print("\n🔍 Trying to find elements with Selenium:")
    for technique in ['direct', 'interactive', 'socratic']:
        try:
            element = driver.find_element(By.ID, f"{technique}Output")
            print(f"  ✅ {technique}Output found via Selenium")
            print(f"    Tag: {element.tag_name}")
            print(f"    Text: '{element.text}'")
            print(f"    Get attribute innerHTML: '{element.get_attribute('innerHTML')}'")
            print(f"    Is displayed: {element.is_displayed()}")
            print(f"    Is enabled: {element.is_enabled()}")
        except Exception as e:
            print(f"  ❌ {technique}Output not found via Selenium: {e}")
    
    # Check the page HTML structure around those IDs
    html_structure = driver.execute_script("""
        const outputSection = document.getElementById('outputSection');
        if (outputSection) {
            return outputSection.innerHTML;
        }
        return 'outputSection not found';
    """)
    
    print(f"\n📄 Output section HTML structure (first 500 chars):")
    print(html_structure[:500] + "...")
        
finally:
    driver.quit()

print("🔍 Debug elements test completed")